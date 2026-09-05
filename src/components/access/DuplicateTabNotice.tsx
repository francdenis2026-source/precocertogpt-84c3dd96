import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Copy, X } from "lucide-react";
import { getTabId } from "../../lib/deviceIdentity";
import "./DuplicateTabNotice.css";

/* Aviso de "esta página já está aberta em outra aba".
 *
 * Vale principalmente para as telas que guardam estado: a lista de compras, os
 * favoritos, o painel do lojista. Com a mesma tela aberta duas vezes, a pessoa
 * mexe numa aba, a outra continua mostrando o estado velho, e o próximo clique
 * lá desfaz o que ela acabou de fazer. Um aviso na hora custa menos que
 * descobrir depois.
 *
 * É tudo local, via BroadcastChannel: as abas do mesmo navegador conversam
 * entre si sem passar pela rede. Aba de navegação anônima não enxerga as
 * normais, o que está correto: são perfis separados.
 *
 * Não bloqueia nada. A pessoa pode ter dois motivos legítimos para abrir a
 * mesma página duas vezes; o papel do aviso é informar, não impedir.
 */

const CANAL = "precocerto:abas-abertas:v1";

/* Só as rotas em que ver duas cópias causa problema de verdade. Numa página de
   leitura, como a home ou a busca, o aviso seria ruído. */
const ROTAS_COM_ESTADO = [
  { prefixo: "/cesta", nome: "sua lista de compras" },
  { prefixo: "/favoritos", nome: "seus favoritos" },
  { prefixo: "/painel-lojista", nome: "o painel do lojista" },
  { prefixo: "/admin", nome: "o painel administrativo" },
  { prefixo: "/minha-conta", nome: "sua conta" },
  { prefixo: "/colaborar", nome: "o envio de preço" },
];

function secaoDe(pathname: string) {
  return ROTAS_COM_ESTADO.find(rota => pathname.startsWith(rota.prefixo)) || null;
}

type Mensagem =
  | { tipo: "quem-esta-ai"; de: string; rota: string }
  | { tipo: "estou-aqui"; de: string; rota: string }
  | { tipo: "sai"; de: string };

export function DuplicateTabNotice() {
  const { pathname } = useLocation();
  /* Os dois estados guardam a rota junto do valor, em vez de serem zerados por
     um efeito a cada navegação. Zerar dentro do efeito provoca uma renderização
     em cascata (o React avisa disso); guardando a rota, basta comparar na hora
     de renderizar e o dado de outra rota simplesmente não vale mais. */
  const [duplicada, setDuplicada] = useState<{ rota: string; nome: string } | null>(null);
  const [dispensadaEm, setDispensadaEm] = useState<string | null>(null);

  useEffect(() => {
    const secao = secaoDe(pathname);
    if (!secao || typeof BroadcastChannel === "undefined") return;

    const tabId = getTabId();
    const canal = new BroadcastChannel(CANAL);
    const outras = new Set<string>();

    const avaliar = () => setDuplicada(outras.size > 0 ? { rota: pathname, nome: secao.nome } : null);

    canal.onmessage = (evento: MessageEvent<Mensagem>) => {
      const msg = evento.data;
      if (!msg || msg.de === tabId) return;

      if (msg.tipo === "quem-esta-ai") {
        // Alguém chegou nesta rota: responde para ela saber que já existe uma.
        if (msg.rota === pathname) {
          canal.postMessage({ tipo: "estou-aqui", de: tabId, rota: pathname } satisfies Mensagem);
          outras.add(msg.de);
          avaliar();
        }
        return;
      }

      if (msg.tipo === "estou-aqui" && msg.rota === pathname) {
        outras.add(msg.de);
        avaliar();
        return;
      }

      if (msg.tipo === "sai") {
        outras.delete(msg.de);
        avaliar();
      }
    };

    canal.postMessage({ tipo: "quem-esta-ai", de: tabId, rota: pathname } satisfies Mensagem);

    const sair = () => canal.postMessage({ tipo: "sai", de: tabId } satisfies Mensagem);
    window.addEventListener("pagehide", sair);

    return () => {
      sair();
      window.removeEventListener("pagehide", sair);
      canal.close();
    };
  }, [pathname]);

  const nome = duplicada && duplicada.rota === pathname ? duplicada.nome : null;
  if (!nome || dispensadaEm === pathname) return null;

  return (
    <div className="pc-dup-tab" role="status" aria-live="polite">
      <span className="pc-dup-tab__icon"><Copy aria-hidden="true" /></span>
      <p>
        <strong>Esta página já está aberta em outra aba.</strong>
        <span>
          Você tem {nome} aberto em mais de um lugar. Use uma aba só, senão
          uma delas pode desfazer o que você fizer na outra.
        </span>
      </p>
      <button type="button" onClick={() => setDispensadaEm(pathname)} aria-label="Dispensar aviso">
        <X aria-hidden="true" />
      </button>
    </div>
  );
}

export default DuplicateTabNotice;
