import { useEffect, useState, type FormEvent } from "react";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Brand } from "./PublicChrome";
import "./ReferencePages.css";

/**
 * Destino do link enviado por requestPasswordReset (ver lib/roles.ts).
 * O Supabase já processa o token da URL sozinho (detectSessionInUrl) e
 * cria uma sessão temporária de recuperação antes desta página montar —
 * aqui só falta pedir a senha nova e confirmar com supabase.auth.updateUser.
 */
export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setInvalid(true);
      setReady(true);
      return;
    }
    let active = true;
    let resolved = false;

    const markReady = () => {
      if (!active || resolved) return;
      resolved = true;
      setReady(true);
    };

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") markReady();
    });

    // Se o link já foi processado antes deste componente montar, o evento
    // PASSWORD_RECOVERY não dispara de novo — checamos a sessão atual.
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) markReady();
    });

    const timeout = window.setTimeout(() => {
      if (active && !resolved) setInvalid(true);
    }, 4000);

    return () => {
      active = false;
      sub.subscription.unsubscribe();
      window.clearTimeout(timeout);
    };
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setMessage("");
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      setMessage(/password/i.test(error.message) ? "A senha precisa ter 6 números." : "Não foi possível salvar a nova senha. Peça um novo link e tente de novo.");
      return;
    }
    setDone(true);
    window.setTimeout(() => navigate("/", { replace: true }), 1800);
  };

  return (
    <div className="ref-auth ref-auth--single">
      <main className="ref-auth__form">
        <Link className="ref-auth__back" to="/"><Brand /></Link>
        <div className="ref-auth__card">
          <span className="ref-auth__eyebrow">NOVA SENHA</span>
          <h2>Crie sua nova senha</h2>

          {!ready && !invalid && <p>Confirmando seu link de recuperação…</p>}

          {invalid && (
            <>
              <p>Este link expirou ou já foi usado. Peça um novo pelo login em "Esqueci minha senha".</p>
              <Link className="ref-auth__submit" to="/login">Voltar ao login<ArrowRight /></Link>
            </>
          )}

          {ready && !invalid && !done && (
            <form onSubmit={submit}>
              <label>
                Nova senha
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  minLength={6}
                  placeholder="6 números"
                  title="Use exatamente 6 números."
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </label>
              <small className="ref-auth__hint">Sua senha são só 6 números — só isso, sem letras nem símbolos.</small>
              {message && <p className="ref-auth__message" role="status">{message}</p>}
              <button className="ref-auth__submit" type="submit" disabled={busy}>
                {busy ? "Salvando…" : "Salvar nova senha"}<ArrowRight />
              </button>
            </form>
          )}

          {done && (
            <p className="ref-auth__message" role="status">Senha atualizada! Levando você para o PreçoCerto…</p>
          )}

          <p className="ref-auth__safe"><LockKeyhole /> Só você vê e define essa senha.</p>
        </div>
      </main>
    </div>
  );
}
