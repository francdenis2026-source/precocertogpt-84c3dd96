/**
 * Sanitiza destinos de redirecionamento pós-login.
 * Aceita apenas caminhos internos ("/rota"); bloqueia "//host",
 * URLs absolutas, esquemas (javascript:, data:) e valores vazios.
 */
export const DEFAULT_REDIRECT = "/";

export function sanitizeRedirect(raw: string | null | undefined, fallback = DEFAULT_REDIRECT): string {
  if (!raw) return fallback;
  let value = raw.trim();
  if (!value) return fallback;
  try {
    value = decodeURIComponent(value);
  } catch {
    /* mantém o valor original quando não é URI-encoded */
  }
  if (!value.startsWith("/")) return fallback;
  if (value.startsWith("//")) return fallback;
  if (value.startsWith("/\\")) return fallback;
  if (/^\/+\s*(https?:|javascript:|data:)/i.test(value)) return fallback;
  if (/[\u0000-\u001f]/.test(value)) return fallback;
  // Evita loop: nunca volta para as próprias telas de autenticação.
  const path = value.split(/[?#]/)[0];
  if (["/login", "/cadastro", "/registrar", "/403"].includes(path)) return fallback;
  return value;
}

export function loginPathFor(returnTo: string): string {
  const safe = sanitizeRedirect(returnTo);
  return safe === DEFAULT_REDIRECT ? "/login" : `/login?redirect=${encodeURIComponent(safe)}`;
}
