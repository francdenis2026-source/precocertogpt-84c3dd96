import { Component, type ReactNode } from "react";

/** Evita uma tela em branco quando um módulo ou componente falha. */
export class AppErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return <main className="pc-recovery" id="conteudo-principal">
      <img src="/preco-certo-mark.svg" width="48" height="48" alt="Preço Certo" />
      <h1>Vamos tentar de novo?</h1>
      <p>Não foi possível abrir esta página. Suas informações salvas não foram apagadas.</p>
      <button type="button" onClick={() => window.location.reload()}>Recarregar página</button>
      <a href="/">Voltar ao início</a>
    </main>;
  }
}
