import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, KeyRound, Loader2, LockKeyhole, LogOut, ShieldCheck } from "lucide-react";
import { loadSessionProfile, signIn, signOut, supabase, type SessionProfile } from "../lib/roles";
import "./AdminAuthGate.css";

type GateState = "checking" | "anonymous" | "denied" | "authorized";

/**
 * Portão de acesso do painel administrativo.
 *
 * Exibe um login com e-mail e senha dentro da própria rota /admin: nenhuma
 * credencial fica no código público e a permissão continua sendo validada no
 * backend (tabela `user_roles` + RLS). O painel só monta quando o perfil
 * autenticado possui papel administrativo.
 */
export function AdminAuthGate({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GateState>("checking");
  const [profile, setProfile] = useState<SessionProfile | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const evaluate = useCallback(async (force = false) => {
    if (!supabase) {
      setState("anonymous");
      setError("Autenticação indisponível: banco não configurado.");
      return;
    }
    const next = await loadSessionProfile(force);
    setProfile(next);
    setState(!next ? "anonymous" : next.isAdmin ? "authorized" : "denied");
  }, []);

  useEffect(() => {
    void evaluate();
    const onAuthChange = () => void evaluate(true);
    window.addEventListener("pc:auth-changed", onAuthChange);
    return () => window.removeEventListener("pc:auth-changed", onAuthChange);
  }, [evaluate]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy) return;
    const cleanEmail = email.trim();
    if (!cleanEmail || password.length < 6) {
      setError("Informe o e-mail administrativo e a senha (mínimo de 6 caracteres).");
      return;
    }
    setBusy(true);
    setError("");
    const result = await signIn(cleanEmail, password);
    if (result.error) {
      setError(result.error);
      setBusy(false);
      return;
    }
    setPassword("");
    await evaluate(true);
    setBusy(false);
  };

  const leave = async () => {
    setBusy(true);
    await signOut();
    setProfile(null);
    setState("anonymous");
    setBusy(false);
  };

  if (state === "authorized") return <>{children}</>;

  if (state === "checking") {
    return (
      <main className="adm-gate" aria-busy="true">
        <div className="adm-gate-card">
          <Loader2 className="adm-gate-spin" aria-hidden="true" />
          <p>Verificando permissão administrativa…</p>
        </div>
      </main>
    );
  }

  if (state === "denied") {
    return (
      <main className="adm-gate">
        <section className="adm-gate-card" aria-labelledby="adm-gate-title">
          <span className="adm-gate-badge">
            <LockKeyhole aria-hidden="true" />
            Acesso restrito
          </span>
          <h1 id="adm-gate-title">Esta conta não tem permissão de administrador</h1>
          <p>
            Você entrou como <strong>{profile?.email || profile?.name}</strong>, mas o painel exige um papel
            administrativo concedido no banco de dados. Saia e entre com a conta administrativa.
          </p>
          <div className="adm-gate-actions">
            <button type="button" className="adm-gate-primary" onClick={() => void leave()} disabled={busy}>
              <LogOut aria-hidden="true" />
              Sair desta conta
            </button>
            <Link className="adm-gate-ghost" to="/">
              Voltar para a homepage
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="adm-gate">
      <section className="adm-gate-card" aria-labelledby="adm-gate-title">
        <span className="adm-gate-badge">
          <ShieldCheck aria-hidden="true" />
          Painel administrativo
        </span>
        <h1 id="adm-gate-title">Entrar no painel do Preço Certo</h1>
        <p>
          Acesso exclusivo da administração para cadastrar produtos, preços por loja e ofertas. As credenciais são
          validadas no servidor — nada fica salvo no código do site.
        </p>

        <form className="adm-gate-form" onSubmit={submit} noValidate>
          <label htmlFor="adm-gate-email">E-mail administrativo</label>
          <input
            id="adm-gate-email"
            type="email"
            autoComplete="username"
            inputMode="email"
            value={email}
            onChange={event => setEmail(event.target.value)}
            placeholder="voce@precocerto.live"
            maxLength={255}
            required
          />

          <label htmlFor="adm-gate-password">Senha</label>
          <div className="adm-gate-password">
            <input
              id="adm-gate-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={event => setPassword(event.target.value)}
              placeholder="Sua senha"
              maxLength={128}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(value => !value)}
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPassword ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
            </button>
          </div>

          {error && (
            <p className="adm-gate-error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="adm-gate-primary" disabled={busy}>
            {busy ? <Loader2 className="adm-gate-spin" aria-hidden="true" /> : <KeyRound aria-hidden="true" />}
            {busy ? "Validando…" : "Entrar no painel"}
          </button>
        </form>

        <div className="adm-gate-foot">
          <Link to="/login">Recuperar senha ou entrar como cliente</Link>
          <Link to="/">Voltar para a homepage</Link>
        </div>
      </section>
    </main>
  );
}
