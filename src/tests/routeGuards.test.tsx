// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

const state: { session: unknown; roles: string[] } = { session: null, roles: [] };
const signOutSpy = vi.fn(async () => ({ error: null }));

vi.mock("../lib/supabase", () => ({
  isSupabaseConfigured: true,
  SUPABASE_URL: "https://example.supabase.co",
  SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test",
  supabase: {
    auth: {
      getSession: async () => ({ data: { session: state.session }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signOut: signOutSpy,
      signInWithPassword: async () => ({ data: { session: state.session }, error: null }),
      signUp: async () => ({ data: { session: state.session, user: { id: "u1" } }, error: null }),
    },
    from: () => ({
      select: () => ({
        eq: async () => ({ data: state.roles.map(role => ({ role })), error: null }),
      }),
    }),
  },
}));

import { AuthProvider, useAuth } from "../auth/AuthProvider";
import { RequireAuth, RequireRole } from "../components/access/RouteGuards";
import { sanitizeRedirect } from "../auth/safeRedirect";

function LoginStub() {
  return <p>tela-de-login</p>;
}

function LogoutButton() {
  const { signOut } = useAuth();
  return <button type="button" onClick={() => void signOut()}>sair</button>;
}

function renderApp(initial: string, element: React.ReactNode) {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[initial]}>
        <Routes>
          <Route path="/login" element={<LoginStub />} />
          <Route path="/minha-conta" element={element} />
          <Route path="/painel-lojista" element={element} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  );
}

describe("rotas protegidas", () => {
  beforeEach(() => {
    state.session = null;
    state.roles = [];
    signOutSpy.mockClear();
  });
  afterEach(() => cleanup());

  it("visitante é enviado ao login preservando o destino", async () => {
    renderApp("/minha-conta", <RequireAuth><p>conteudo-privado</p></RequireAuth>);
    await waitFor(() => expect(screen.getByText("tela-de-login")).toBeTruthy());
    expect(screen.queryByText("conteudo-privado")).toBeNull();
  });

  it("usuário autenticado acessa a rota privada", async () => {
    state.session = { user: { id: "u1", app_metadata: {} } };
    renderApp("/minha-conta", <RequireAuth><p>conteudo-privado</p></RequireAuth>);
    await waitFor(() => expect(screen.getByText("conteudo-privado")).toBeTruthy());
  });

  it("papel incorreto recebe 403 em vez do painel", async () => {
    state.session = { user: { id: "u1", app_metadata: {} } };
    state.roles = ["consumer"];
    renderApp("/painel-lojista", <RequireRole allow="merchant"><p>painel-lojista</p></RequireRole>);
    await waitFor(() => expect(screen.getByText("Você não tem permissão para esta área")).toBeTruthy());
    expect(screen.queryByText("painel-lojista")).toBeNull();
  });

  it("papel de lojista libera a gestão", async () => {
    state.session = { user: { id: "u1", app_metadata: {} } };
    state.roles = ["merchant_owner"];
    renderApp("/painel-lojista", <RequireRole allow="merchant"><p>painel-lojista</p></RequireRole>);
    await waitFor(() => expect(screen.getByText("painel-lojista")).toBeTruthy());
  });

  it("logout chama supabase.auth.signOut", async () => {
    state.session = { user: { id: "u1", app_metadata: {} } };
    render(<AuthProvider><MemoryRouter><LogoutButton /></MemoryRouter></AuthProvider>);
    screen.getByText("sair").click();
    await waitFor(() => expect(signOutSpy).toHaveBeenCalledTimes(1));
  });
});

describe("retorno seguro após login", () => {
  it("aceita apenas caminhos internos", () => {
    expect(sanitizeRedirect("/favoritos")).toBe("/favoritos");
    expect(sanitizeRedirect("/cesta?foco=1")).toBe("/cesta?foco=1");
    expect(sanitizeRedirect("//evil.com")).toBe("/");
    expect(sanitizeRedirect("https://evil.com")).toBe("/");
    expect(sanitizeRedirect("javascript:alert(1)")).toBe("/");
    expect(sanitizeRedirect("/login")).toBe("/");
    expect(sanitizeRedirect(null)).toBe("/");
  });
});
