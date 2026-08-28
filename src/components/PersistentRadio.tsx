import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  LoaderCircle,
  Pause,
  Play,
  Radio,
  RotateCcw,
  Volume1,
  Volume2,
  VolumeX,
} from "lucide-react";
import {
  DEFAULT_RADIO,
  loadActiveRadio,
  type RadioStation,
} from "../lib/radioStations";
import "./PersistentRadio.css";

export const JOVEM_PAN_STREAMS = [
  DEFAULT_RADIO.stream_url,
  DEFAULT_RADIO.fallback_url!,
] as const;
export const JOVEM_PAN_METADATA = DEFAULT_RADIO.metadata_url!;
const RADIO_COORDINATION = "precocerto:radio-playback:v2";
type RadioState = {
  station: RadioStation;
  playing: boolean;
  loading: boolean;
  failed: boolean;
  volume: number;
  nowPlaying: string | null;
  toggle: () => void;
  retry: () => void;
  setVolume: (value: number) => void;
};
const RadioContext = createContext<RadioState | null>(null);

export function parseZenoMetadata(raw: string): string | null {
  const clean = (value: unknown) =>
    typeof value === "string" &&
    value.trim() &&
    !/^(unknown|undefined|null)$/i.test(value.trim())
      ? value.trim().replace(/\s+/g, " ")
      : null;
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const candidates = [
      parsed.streamTitle,
      parsed.title,
      parsed.song,
      parsed.currentSong,
      parsed.track,
      parsed.metadata,
      parsed.now_playing,
    ];
    for (const candidate of candidates) {
      const value = clean(candidate);
      if (value) return value;
      if (candidate && typeof candidate === "object") {
        const nested = candidate as Record<string, unknown>;
        const artist = clean(nested.artist ?? nested.currentArtist),
          title = clean(nested.title ?? nested.song ?? nested.currentSong);
        if (artist && title) return `${artist} — ${title}`;
        if (title) return title;
      }
    }
  } catch {
    return clean(raw);
  }
  return null;
}

export function PersistentRadioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null),
    timeoutRef = useRef<number>(),
    streamRef = useRef(0),
    wantsPlay = useRef(false),
    instanceRef = useRef(crypto.randomUUID());
  const [station, setStation] = useState(DEFAULT_RADIO),
    [playing, setPlaying] = useState(false),
    [loading, setLoading] = useState(false),
    [failed, setFailed] = useState(false),
    [volume, setVolumeState] = useState(0.78),
    [nowPlaying, setNowPlaying] = useState<string | null>(null);
  const streams = useMemo(
    () =>
      [station.stream_url, station.fallback_url].filter(Boolean) as string[],
    [station],
  );
  const clearTimer = () => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = undefined;
  };
  useEffect(() => {
    const refresh = async () => {
      const next = await loadActiveRadio();
      setStation((current) => {
        if (current.id === next.id && current.updated_at === next.updated_at)
          return current;
        wantsPlay.current = false;
        audioRef.current?.pause();
        streamRef.current = 0;
        return next;
      });
    };
    void refresh();
    window.addEventListener("pc:radio-config-changed", refresh);
    return () => window.removeEventListener("pc:radio-config-changed", refresh);
  }, []);
  useEffect(() => () => clearTimer(), []);
  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return;
    const channel = new BroadcastChannel(RADIO_COORDINATION);
    channel.onmessage = (event) => {
      if (
        event.data?.type !== "play" ||
        event.data?.instanceId === instanceRef.current
      )
        return;
      wantsPlay.current = false;
      audioRef.current?.pause();
    };
    return () => channel.close();
  }, []);
  useEffect(() => {
    if (!playing || !station.metadata_url) return;
    let source: EventSource | null = null,
      poll: number | undefined,
      closed = false;
    const update = (raw: string) => {
      const title = parseZenoMetadata(raw);
      if (title) setNowPlaying(title);
    };
    const fetchMetadata = async () => {
      try {
        const response = await fetch(station.metadata_url!, {
          headers: { Accept: "application/json" },
        });
        if (response.ok) update(await response.text());
      } catch {
        return;
      }
    };
    if (typeof EventSource !== "undefined") {
      source = new EventSource(station.metadata_url);
      source.onmessage = (event) => update(event.data);
      source.onerror = () => {
        source?.close();
        source = null;
        if (!closed) {
          void fetchMetadata();
          poll = window.setInterval(fetchMetadata, 30000);
        }
      };
    } else {
      void fetchMetadata();
      poll = window.setInterval(fetchMetadata, 30000);
    }
    return () => {
      closed = true;
      source?.close();
      if (poll) window.clearInterval(poll);
    };
  }, [playing, station.metadata_url]);
  const armTimeout = () => {
    clearTimer();
    timeoutRef.current = window.setTimeout(
      () => void tryStream(streamRef.current + 1),
      12000,
    );
  };
  const tryStream = async (index: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    clearTimer();
    if (index >= streams.length) {
      wantsPlay.current = false;
      setLoading(false);
      setPlaying(false);
      setFailed(true);
      return;
    }
    streamRef.current = index;
    audio.src = streams[index];
    audio.load();
    setFailed(false);
    setLoading(true);
    armTimeout();
    if (typeof BroadcastChannel !== "undefined") {
      const channel = new BroadcastChannel(RADIO_COORDINATION);
      channel.postMessage({ type: "play", instanceId: instanceRef.current });
      channel.close();
    }
    try {
      await audio.play();
    } catch {
      if (wantsPlay.current) void tryStream(index + 1);
      else {
        clearTimer();
        setLoading(false);
      }
    }
  };
  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!audio.paused) {
      wantsPlay.current = false;
      audio.pause();
      return;
    }
    wantsPlay.current = true;
    void tryStream(streamRef.current);
  };
  const retry = () => {
    streamRef.current = 0;
    wantsPlay.current = true;
    void tryStream(0);
  };
  const setVolume = (value: number) => {
    const next = Math.max(0, Math.min(1, value));
    setVolumeState(next);
    if (audioRef.current) audioRef.current.volume = next;
  };
  const handleFailure = () => {
    if (wantsPlay.current) void tryStream(streamRef.current + 1);
  };
  return (
    <RadioContext.Provider
      value={{
        station,
        playing,
        loading,
        failed,
        volume,
        nowPlaying,
        toggle,
        retry,
        setVolume,
      }}
    >
      {children}
      {/* Rádio ao vivo não fornece faixa de legendas sincronizada. */}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio
        ref={audioRef}
        preload="none"
        onLoadedMetadata={() => {
          if (audioRef.current) audioRef.current.volume = volume;
        }}
        onPlaying={() => {
          clearTimer();
          setPlaying(true);
          setLoading(false);
          setFailed(false);
        }}
        onCanPlay={() => {
          if (wantsPlay.current) clearTimer();
        }}
        onPause={() => {
          clearTimer();
          setPlaying(false);
          setLoading(false);
        }}
        onWaiting={() => {
          if (wantsPlay.current) {
            setLoading(true);
            armTimeout();
          }
        }}
        onStalled={handleFailure}
        onError={handleFailure}
      />
    </RadioContext.Provider>
  );
}

export function HeaderRadioPlayer() {
  const radio = useContext(RadioContext);
  const [showTrackNotice, setShowTrackNotice] = useState(false);

  if (!radio) return null;
  const status = radio.failed
    ? "Sinal indisponível"
    : radio.loading
      ? "Conectando…"
      : radio.playing
        ? "Tocando agora"
        : radio.station.name;
  const label = radio.failed
    ? "Tentar conectar novamente"
    : radio.playing
      ? `Pausar ${radio.station.name}${radio.nowPlaying ? `, tocando ${radio.nowPlaying}` : ""}`
      : `Ouvir ${radio.station.name}`;
  return (
    <div
      className={`pc-radio${radio.playing ? " is-playing" : ""}${radio.loading ? " is-loading" : ""}${radio.failed ? " has-error" : ""}${radio.nowPlaying ? " has-track" : ""}${showTrackNotice ? " show-track-notice" : ""}`}
      onMouseEnter={() => {
        if (radio.playing) setShowTrackNotice(true);
      }}
      onMouseLeave={() => setShowTrackNotice(false)}
    >
      <button
        className="pc-radio__play"
        type="button"
        onClick={radio.failed ? radio.retry : radio.toggle}
        aria-label={label}
        title={label}
      >
        <span className="pc-radio__control" aria-hidden="true">
          {radio.loading ? (
            <LoaderCircle className="pc-radio__loader" />
          ) : radio.failed ? (
            <RotateCcw />
          ) : radio.playing ? (
            <Pause />
          ) : (
            <Play />
          )}
        </span>
        <span className="pc-radio__copy">
          <small>
            <i />
            RÁDIO AO VIVO
          </small>
          <strong>{status}</strong>
        </span>
      </button>
      <span className="pc-radio__signal" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
        <i />
      </span>
      <label className="pc-radio__volume" title="Volume da rádio">
        {radio.volume === 0 ? (
          <VolumeX />
        ) : radio.volume < 0.5 ? (
          <Volume1 />
        ) : (
          <Volume2 />
        )}
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={radio.volume}
          onChange={(event) => radio.setVolume(Number(event.target.value))}
          aria-label="Volume da rádio"
        />
      </label>
      {radio.playing ? (
        <span
          className="pc-radio__track"
          key={radio.nowPlaying || radio.station.id}
          aria-hidden="true"
        >
          <Radio />
          <span>
            <small>TOCANDO AGORA</small>
            <strong>{radio.nowPlaying || radio.station.name}</strong>
          </span>
        </span>
      ) : null}
      <span className="pc-radio__announcement" aria-live="polite">
        {radio.failed
          ? "Não foi possível conectar. Tente novamente."
          : radio.loading
            ? "Conectando à transmissão."
            : radio.playing
              ? `Tocando ${radio.nowPlaying || radio.station.name}`
              : ""}
      </span>
    </div>
  );
}
