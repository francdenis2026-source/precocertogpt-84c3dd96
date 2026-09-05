import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { LogIn, MonitorSmartphone, ShieldAlert } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../auth/AuthProvider";
import { descreverDispositivo, getDeviceId } from "../../lib/deviceIdentity";
import "./SingleSessionGuard.css";

/* Uma conta, um dispositivo por vez.
 *
 * O problema real: com a mesma conta aberta no celular e no computador, as duas
 * telas alteram favoritos e a lista de compras sem saber uma da outra, e a
 * última a gravar apaga o trabalho da outra. Pior quando envolve preço.
 *
 * A defesa tem duas camadas, e as duas importam:
 *
 *   No servidor. Ao entrar na conta, o dispositivo novo chama
 *   signOut({ scope: "others" }), que revoga os refresh tokens de todos os
 *   outros. Isso vale mesmo que o outro aparelho esteja desligado: quando ele
 *   voltar e tentar renovar o token, o Supabase recusa. É a camada que de fato
 *   garante a regra, e ela mora no AuthProvider, junto do login.
 *
 *   Aqui, no cliente. A revogação do refresh token não derruba na hora: o
 *   access token que o outro aparelho já tem continua válido até expirar (uma
 *   hora, por padrão). Nessa janela ele ainda conseguiria gravar. Este
 *   componente fecha a janela: os dispositivos da mesma conta ficam num canal
 *   de tempo real, o dispositivo novo anuncia a entrada, e quem tiver um login
 *   mais antigo sai na hora e explica o que aconteceu, em vez de descobrir
 *   depois com um erro seco.
 *
 * Só entra em jogo com sessão ativa; visitante não abre canal nenhum.
 */

const PREFIXO_CANAL = "precocerto:sessao:v1:";

type Reivindicacao = {
  deviceId: string;
  sessionId: string;
  /** Momento do login, em milissegundos. O mais recente vence. */
  claimedAt: number;
  aparelho: string;
};

export function SingleSessionGuard() {
  const { user, sessionId, signOut } = useAuth();
  const [derrubado, setDerrubado] = useState<{ aparelho: string } | null>(null);
  const derrubadoRef = useRef(false);

  useEffect(() => {
    if (!supabase || !user || !sessionId) return;

    const client = supabase;
    const deviceId = getDeviceId();
    const minhaEntrada: Reivindicacao = {
      deviceId,
      sessionId,
      claimedAt: Date.now(),
      aparelho: descreverDispositivo(),
    };

    const canal = client.channel(`${PREFIXO_CANAL}${user.id}`, {
      config: { presence: { key: deviceId } },
    });

    const perder = (aparelho: string) => {
      if (derrubadoRef.current) return;
      derrubadoRef.current = true;
      setDerrubado({ aparelho });
      // scope local: encerra só aqui. Usar o padrão global derrubaria também o
      // dispositivo que acabou de entrar, que é justamente quem deve ficar.
      void client.auth.signOut({ scope: "local" }).finally(() => void signOut());
    };

    /** Perde quem entrou antes. Empate no relógio decide pelo id, para os dois
     *  lados chegarem à mesma conclusão sem precisar conversar de novo. */
    const perdePara = (outra: Reivindicacao) => {
      if (outra.deviceId === deviceId) return false;
      if (outra.claimedAt !== minhaEntrada.claimedAt) return outra.claimedAt > minhaEntrada.claimedAt;
      return outra.deviceId > deviceId;
    };

    canal.on("broadcast", { event: "entrou" }, ({ payload }) => {
      const outra = payload as Reivindicacao;
      if (!outra?.deviceId) return;
      if (perdePara(outra)) perder(outra.aparelho || "outro dispositivo");
    });

    // Presence cobre o caso em que o outro dispositivo já estava logado antes
    // desta aba abrir: ele não vai emitir "entrou" de novo, mas está no estado
    // do canal com a data do login dele.
    canal.on("presence", { event: "sync" }, () => {
      const estado = canal.presenceState<Reivindicacao>();
      for (const entradas of Object.values(estado)) {
        for (const outra of entradas) {
          if (perdePara(outra)) {
            perder(outra.aparelho || "outro dispositivo");
            return;
          }
        }
      }
    });

    void canal.subscribe(async status => {
      if (status !== "SUBSCRIBED") return;
      await canal.track(minhaEntrada);
      await canal.send({ type: "broadcast", event: "entrou", payload: minhaEntrada });
    });

    return () => {
      void canal.untrack();
      void client.removeChannel(canal);
    };
  }, [user, sessionId, signOut]);

  if (!derrubado) return null;

  return (
    <div className="pc-session-kick" role="alertdialog" aria-modal="true" aria-labelledby="pc-session-kick-title">
      <div className="pc-session-kick__card">
        <span className="pc-session-kick__icon"><ShieldAlert aria-hidden="true" /></span>
        <h2 id="pc-session-kick-title">Sua conta foi aberta em outro dispositivo</h2>
        <p>
          Alguém entrou nesta conta em {derrubado.aparelho}. Para os seus favoritos
          e a sua lista de compras não ficarem sendo alterados em dois lugares ao
          mesmo tempo, esta sessão foi encerrada.
        </p>
        <p className="pc-session-kick__hint">
          <MonitorSmartphone aria-hidden="true" />
          Se não foi você, entre de novo e troque a sua senha.
        </p>
        <div className="pc-session-kick__actions">
          <Link className="pc-session-kick__primary" to="/login" onClick={() => setDerrubado(null)}>
            <LogIn aria-hidden="true" /> Entrar novamente
          </Link>
          <button type="button" className="pc-session-kick__ghost" onClick={() => setDerrubado(null)}>
            Continuar sem entrar
          </button>
        </div>
      </div>
    </div>
  );
}

export default SingleSessionGuard;
