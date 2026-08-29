// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { SingleBrowserTabGate } from "../components/SingleBrowserTabGate";

const LEASE_KEY = "precocerto:active-browser-tab:v1";

describe("renderização sem trava de aba", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("renderiza a aplicação normalmente", () => {
    render(<SingleBrowserTabGate><p>Aplicação ativa</p></SingleBrowserTabGate>);
    expect(screen.getByText("Aplicação ativa")).toBeTruthy();
  });

  it("não bloqueia quando existe outra aba registrada", () => {
    window.localStorage.setItem(LEASE_KEY, JSON.stringify({ tabId: "outra-aba", expiresAt: Date.now() + 7000 }));
    render(<SingleBrowserTabGate><p>Aplicação ativa</p></SingleBrowserTabGate>);
    expect(screen.getByText("Aplicação ativa")).toBeTruthy();
    expect(screen.queryByText("Continue com segurança nesta aba.")).toBeNull();
  });
});
