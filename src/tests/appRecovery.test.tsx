// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AppErrorBoundary } from "../components/AppErrorBoundary";

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe("Recuperação de páginas", () => {
  it("preserva a página quando não há erro", () => {
    render(<AppErrorBoundary><h1>Catálogo</h1></AppErrorBoundary>);
    expect(screen.getByRole("heading", { name: "Catálogo" })).toBeTruthy();
  });
  it("oferece recarregamento e início em vez de uma tela em branco", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    function BrokenPage(): never { throw new Error("Módulo indisponível"); }
    render(<AppErrorBoundary><BrokenPage /></AppErrorBoundary>);
    expect(screen.getByRole("heading", { name: "Vamos tentar de novo?" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Recarregar página" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Voltar ao início" }).getAttribute("href")).toBe("/");
  });
});
