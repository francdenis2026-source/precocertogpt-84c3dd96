import { useEffect, useState } from "react";
import { Check, CirclePlus, Radio, Save, Trash2, Waves } from "lucide-react";
import {
  activateAdminRadio,
  deleteAdminRadio,
  loadAdminRadios,
  saveAdminRadio,
  type RadioStation,
} from "../lib/radioStations";
import "./AdminRadioManager.css";

const empty: RadioStation = {
  id: "new",
  name: "",
  stream_url: "",
  fallback_url: null,
  metadata_url: null,
  is_active: false,
  is_enabled: true,
};

export function AdminRadioManager({
  onError,
}: {
  onError: (message: string) => void;
}) {
  const [rows, setRows] = useState<RadioStation[]>([]),
    [editing, setEditing] = useState<RadioStation>(empty),
    [busy, setBusy] = useState(false);
  const refresh = async () => {
    try {
      setRows(await loadAdminRadios());
    } catch (e: any) {
      onError(e?.message || "Falha ao carregar as rádios.");
    }
  };
  useEffect(() => {
    void refresh();
  }, []);
  const save = async () => {
    if (!editing.name.trim() || !editing.stream_url.trim())
      return onError("Informe o nome e o link principal da transmissão.");
    setBusy(true);
    const result = await saveAdminRadio(editing);
    setBusy(false);
    if (result.error) return onError(result.error);
    setEditing(empty);
    await refresh();
  };
  const activate = async (id: string) => {
    setBusy(true);
    const result = await activateAdminRadio(id);
    setBusy(false);
    if (result.error) return onError(result.error);
    await refresh();
  };
  const remove = async (station: RadioStation) => {
    if (station.is_active)
      return onError("Ative outra rádio antes de excluir esta.");
    if (!confirm(`Excluir a rádio ${station.name}?`)) return;
    setBusy(true);
    const result = await deleteAdminRadio(station.id);
    setBusy(false);
    if (result.error) return onError(result.error);
    if (editing.id === station.id) setEditing(empty);
    await refresh();
  };
  return (
    <div className="arm-layout">
      <section className="acc-panel arm-intro">
        <header>
          <div>
            <small>TRANSMISSÃO AO VIVO</small>
            <h2>Rádio do site</h2>
          </div>
          <Waves />
        </header>
        <p>
          Cadastre emissoras, altere o link do streaming ou a API que informa a
          música atual. A emissora ativa muda no player do site sem nova
          publicação.
        </p>
      </section>
      <section className="arm-grid">
        <div className="arm-list" aria-label="Rádios cadastradas">
          <div className="arm-list-head">
            <div>
              <small>EMISSORAS</small>
              <strong>{rows.length} cadastradas</strong>
            </div>
            <button onClick={() => setEditing(empty)}>
              <CirclePlus /> Nova rádio
            </button>
          </div>
          {rows.map((station) => (
            <article
              className={station.is_active ? "is-active" : ""}
              key={station.id}
            >
              <span className="arm-station-icon">
                <Radio />
              </span>
              <div>
                <strong>{station.name}</strong>
                <small>
                  {station.is_active
                    ? "No ar agora"
                    : station.is_enabled
                      ? "Disponível"
                      : "Desativada"}
                </small>
              </div>
              <div className="arm-row-actions">
                <button
                  disabled={busy || station.is_active}
                  onClick={() => void activate(station.id)}
                >
                  {station.is_active ? (
                    <>
                      <Check /> Ativa
                    </>
                  ) : (
                    "Colocar no ar"
                  )}
                </button>
                <button onClick={() => setEditing(station)}>Editar</button>
                <button
                  className="danger"
                  disabled={busy || station.is_active}
                  onClick={() => void remove(station)}
                  aria-label={`Excluir ${station.name}`}
                >
                  <Trash2 />
                </button>
              </div>
            </article>
          ))}
        </div>
        <form
          className="acc-panel arm-form"
          onSubmit={(e) => {
            e.preventDefault();
            void save();
          }}
        >
          <header>
            <div>
              <small>CONFIGURAÇÃO</small>
              <h2>
                {editing.id === "new"
                  ? "Adicionar emissora"
                  : `Editar ${editing.name}`}
              </h2>
            </div>
            <Radio />
          </header>
          <label>
            <span>Nome exibido no player</span>
            <input
              value={editing.name}
              onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              placeholder="Ex.: Rádio Feijó FM"
              required
            />
          </label>
          <label>
            <span>Link principal da rádio</span>
            <input
              type="url"
              value={editing.stream_url}
              onChange={(e) =>
                setEditing({ ...editing, stream_url: e.target.value })
              }
              placeholder="https://servidor/stream"
              required
            />
            <small>
              Use um endereço HTTPS de áudio compatível com navegador.
            </small>
          </label>
          <label>
            <span>Link reserva</span>
            <input
              type="url"
              value={editing.fallback_url ?? ""}
              onChange={(e) =>
                setEditing({ ...editing, fallback_url: e.target.value })
              }
              placeholder="https://servidor-reserva/stream"
            />
            <small>Entra automaticamente se o principal falhar.</small>
          </label>
          <label>
            <span>API da música atual</span>
            <input
              type="url"
              value={editing.metadata_url ?? ""}
              onChange={(e) =>
                setEditing({ ...editing, metadata_url: e.target.value })
              }
              placeholder="https://api.exemplo.com/metadata"
            />
            <small>
              Aceita eventos SSE ou resposta JSON com título, música e artista.
            </small>
          </label>
          <label className="arm-check">
            <input
              type="checkbox"
              checked={editing.is_enabled}
              onChange={(e) =>
                setEditing({ ...editing, is_enabled: e.target.checked })
              }
            />
            <span>Emissora disponível para ativação</span>
          </label>
          <div className="arm-form-actions">
            <button type="button" onClick={() => setEditing(empty)}>
              Limpar
            </button>
            <button className="primary" disabled={busy}>
              <Save />
              {busy ? "Salvando…" : "Salvar rádio"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
