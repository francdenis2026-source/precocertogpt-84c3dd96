import type { ReactNode } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "../../auth/AuthProvider";
import { loginPathFor, sanitizeRedirect } from "../../auth/safeRedirect";

/** Placeholder acessível exibido enquanto a sessão é resolvida (sem flash de conteúdo). */
export function AuthLoading({ label = "Verificando seu acesso" }: { label?: string }) {
  return (
    <main className="pc-route-loading" id="conteudo-principal" aria-busy="true" aria-live="polite" aria-label={label}>
      <p className="sr-only">{label}…</p>
    </main>
  );
}

/** Página 403 para papel incorreto. */
export function ForbiddenPage({ message }: { message?: string }) {
  return (
    <main className="pc-gate" id="conteudo-principal">
      <section className="pc-gate__panel" aria-labelledby="pc-403-title">
        <span className="pc-gate__tag">
          <ShieldAlert aria-hidden="true" /> Acesso restrito
        </span>
        <h1 id="pc-403-title">Você não tem permissão para esta área</h1>
        <p className="pc-gate__lead">
          {message || "Sua conta está autenticada, mas não possui o papel necessário para abrir esta página."}
        </p>
        <div className="pc-gate__actions">
          <Link className="pc-gate__cta" to="/">
            Voltar para a página inicial
          </Link>
          <Link className="pc-gate__ghost" to="/minha-conta">
            Ir para minha conta
          </Link>
        </div>
      </section>
    </main>
  );
}

/** Exige apenas sessão válida. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { loading, user } = useAuth();
  const { pathname, search } = useLocation();
  if (loading) return <AuthLoading />;
  if (!user) return <Navigate to={loginPathFor(`${pathname}${search}`)} replace />;
  return <>{children}</>;
}

/** Exige sessão + papel autorizado (fonte segura: user_roles / app_metadata). */
export function RequireRole({
  children,
  allow,
  message,
}: {
  children: ReactNode;
  allow: "admin" | "merchant";
  message?: string;
}) {
  const { loading, user, isAdmin, isMerchant } = useAuth();
  const { pathname, search } = useLocation();
  if (loading) return <AuthLoading />;
  if (!user) return <Navigate to={loginPathFor(`${pathname}${search}`)} replace />;
  const authorized = allow === "admin" ? isAdmin : isMerchant;
  if (!authorized) return <ForbiddenPage message={message} />;
  return <>{children}</>;
}

/** Impede que usuários autenticados permaneçam em login/cadastro. */
export function RedirectIfAuthenticated({ children }: { children: ReactNode }) {
  const { loading, user, isAdmin, isMerchant } = useAuth();
  const { search } = useLocation();
  if (loading) return <AuthLoading label="Carregando" />;
  if (user) {
    const requested = new URLSearchParams(search).get("redirect");
    const fallback = isAdmin ? "/admin" : isMerchant ? "/painel-lojista" : "/";
    return <Navigate to={sanitizeRedirect(requested, fallback)} replace />;
  }
  return <>{children}</>;
}
