// Lernwort UI kit — full authentication flow (Cognito / Amplify-style):
// Anmelden · Registrieren · Code-Bestätigung · Passwort vergessen · Neues Passwort.
// This is the WEB reference (design project). The React-Native implementation
// lives in the app at src/app/(auth)/sign-in.tsx (logic in useAuthFlow).
// Composes the design-system primitives. Prefers the bundled PasswordInput /
// CodeInput; falls back to local copies so the prototype renders even before the
// bundle is recompiled with the new fields.
const A = window.LernwortB1VokabeltrainerDesignSystem_bca96c;
const { useState, useEffect, useRef } = React;

const PasswordField = (A && A.PasswordInput) || LocalPasswordField;
const CodeField = (A && A.CodeInput) || LocalCodeField;

/* ---------------- small shared bits ---------------- */
function TextLink({ children, onClick, strong }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: "none", border: "none", cursor: "pointer", padding: 0,
        font: "var(--text-body)", color: "var(--text-link)", fontWeight: strong ? 600 : 500,
      }}
    >
      {children}
    </button>
  );
}

function Banner({ text }) {
  return (
    <div style={{
      display: "flex", gap: 10, alignItems: "flex-start",
      padding: "12px 14px", marginBottom: 4,
      background: "var(--status-known-bg)", border: "1px solid var(--status-known-border)",
      borderRadius: "var(--r-md)",
    }}>
      <A.Icon name="circle-check" size={18} color="var(--status-known-fg)" style={{ marginTop: 1 }} />
      <span style={{ font: "var(--text-body)", fontSize: "var(--fs-label)", color: "var(--status-known-fg)" }}>{text}</span>
    </div>
  );
}

function Resend() {
  const [left, setLeft] = useState(30);
  useEffect(() => {
    if (left <= 0) return;
    const t = setTimeout(() => setLeft((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);
  return (
    <div style={{ textAlign: "center", font: "var(--text-label)", color: "var(--text-tertiary)" }}>
      {left > 0
        ? <span>Keinen Code erhalten? Erneut senden in {left} s</span>
        : <TextLink onClick={() => setLeft(30)}>Code erneut senden</TextLink>}
    </div>
  );
}

function AuthLayout({ onBack, title, subtitle, children, footer, showMark = true }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "0 26px", overflowY: "auto" }}>
      {onBack
        ? <div style={{ paddingTop: 4, marginLeft: -8 }}><A.IconButton icon="chevron-left" label="Zurück" variant="ghost" onClick={onBack} /></div>
        : <div style={{ height: 8 }} />}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", paddingBottom: 8 }}>
        {showMark && <img src="../../assets/mark.svg" width="52" alt="" style={{ marginBottom: 20 }} />}
        <div style={{ font: "var(--text-lemma)", fontSize: 30, color: "var(--text-primary)", letterSpacing: "var(--ls-tight)" }}>{title}</div>
        {subtitle
          ? <div style={{ font: "var(--text-body-lg)", color: "var(--text-secondary)", marginTop: 6, marginBottom: 26, lineHeight: "var(--lh-normal)" }}>{subtitle}</div>
          : <div style={{ height: 26 }} />}
        {children}
      </div>
      {footer && <div style={{ paddingBottom: 28, paddingTop: 12, textAlign: "center", font: "var(--text-body)", color: "var(--text-secondary)" }}>{footer}</div>}
    </div>
  );
}

function SegmentedTop({ mode, onMode }) {
  return (
    <A.SegmentedControl
      options={[{ value: "signIn", label: "Anmelden" }, { value: "signUp", label: "Registrieren" }]}
      value={mode}
      onChange={onMode}
    />
  );
}

/* ---------------- AuthScreen ---------------- */
function AuthScreen({ onAuthed, initialMode = "signIn" }) {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState(initialMode === "signUp" || initialMode === "forgot" ? "" : "mara@beispiel.de");
  const [password, setPassword] = useState(
    initialMode === "signIn" ? "Lernen2026!" : initialMode === "resetPassword" ? "NeuesPass9!" : ""
  );
  const [name, setName] = useState(initialMode === "signUp" ? "Mara" : "");
  const [code, setCode] = useState(
    initialMode === "confirmSignUp" ? "304" : initialMode === "resetPassword" ? "4820" : ""
  );
  const [notice, setNotice] = useState("");

  const authed = onAuthed || (() => {});
  const switchMode = (m) => { setNotice(""); setMode(m); };

  if (mode === "signUp") {
    return (
      <AuthLayout
        title="Konto erstellen"
        subtitle="Leg los und lerne dein erstes Kapitel."
        footer={<span style={{ font: "var(--text-label)", color: "var(--text-tertiary)", lineHeight: "var(--lh-normal)" }}>Mit der Registrierung stimmst du den Nutzungsbedingungen und der Datenschutzerklärung zu.</span>}
      >
        <SegmentedTop mode={mode} onMode={switchMode} />
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 18 }}>
          <A.Input label="Name" iconLeft="user" placeholder="Wie heißt du?" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
          <A.Input label="E-Mail" iconLeft="mail" type="email" placeholder="du@beispiel.de" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          <PasswordField label="Passwort" value={password} onChange={(e) => setPassword(e.target.value)} showStrength autoComplete="new-password" hint="Mindestens 8 Zeichen." />
          <A.Button variant="primary" size="lg" fullWidth iconRight="arrow-right" onClick={() => setMode("confirmSignUp")} style={{ marginTop: 4 }}>Konto erstellen</A.Button>
        </div>
      </AuthLayout>
    );
  }

  if (mode === "confirmSignUp") {
    return (
      <AuthLayout
        onBack={() => setMode("signUp")}
        title="Bestätige deine E-Mail"
        subtitle={<>Wir haben dir einen 6-stelligen Code an <b style={{ color: "var(--text-primary)", fontWeight: 600 }}>{email || "deine E-Mail"}</b> geschickt.</>}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <CodeField length={6} value={code} onChange={setCode} autoFocus />
          <A.Button variant="primary" size="lg" fullWidth iconRight="check" onClick={() => authed()}>Bestätigen</A.Button>
          <Resend />
        </div>
      </AuthLayout>
    );
  }

  if (mode === "forgot") {
    return (
      <AuthLayout
        onBack={() => setMode("signIn")}
        title="Passwort vergessen?"
        subtitle="Gib deine E-Mail ein — wir schicken dir einen Code zum Zurücksetzen."
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <A.Input label="E-Mail" iconLeft="mail" type="email" placeholder="du@beispiel.de" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          <A.Button variant="primary" size="lg" fullWidth iconRight="arrow-right" onClick={() => setMode("resetPassword")} style={{ marginTop: 4 }}>Code senden</A.Button>
        </div>
      </AuthLayout>
    );
  }

  if (mode === "resetPassword") {
    return (
      <AuthLayout
        onBack={() => setMode("forgot")}
        title="Neues Passwort"
        subtitle={<>Gib den Code aus der E-Mail an <b style={{ color: "var(--text-primary)", fontWeight: 600 }}>{email || "deine E-Mail"}</b> und dein neues Passwort ein.</>}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <span style={{ display: "block", font: "var(--text-label)", color: "var(--text-secondary)", marginBottom: 8 }}>Bestätigungscode</span>
            <CodeField length={6} value={code} onChange={setCode} />
          </div>
          <PasswordField label="Neues Passwort" value={password} onChange={(e) => setPassword(e.target.value)} showStrength autoComplete="new-password" />
          <A.Button variant="primary" size="lg" fullWidth iconRight="check" onClick={() => { setNotice("Passwort geändert. Melde dich mit deinem neuen Passwort an."); setMode("signIn"); }}>Passwort ändern</A.Button>
          <Resend />
        </div>
      </AuthLayout>
    );
  }

  // signIn (default)
  return (
    <AuthLayout
      title="Willkommen zurück"
      subtitle="Melde dich an, um weiterzulernen."
    >
      {notice ? <Banner text={notice} /> : null}
      <SegmentedTop mode={mode} onMode={switchMode} />
      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 18 }}>
        <A.Input label="E-Mail" iconLeft="mail" type="email" placeholder="du@beispiel.de" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        <PasswordField label="Passwort" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: -4 }}>
          <TextLink onClick={() => switchMode("forgot")}>Passwort vergessen?</TextLink>
        </div>
        <A.Button variant="primary" size="lg" fullWidth iconRight="arrow-right" onClick={() => authed()} style={{ marginTop: 4 }}>Anmelden</A.Button>
      </div>
    </AuthLayout>
  );
}

/* ---------------- local fallbacks (used only until the bundle ships the real ones) ---------------- */
function LocalPasswordField({ label, value, onChange, error, hint, showStrength, autoComplete, placeholder = "Dein Passwort", style }) {
  const [focus, setFocus] = useState(false);
  const [reveal, setReveal] = useState(false);
  const bc = error ? "var(--danger)" : focus ? "var(--primary-500)" : "var(--border-strong)";
  const pw = value || "";
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
  const strength = [
    { label: "Zu kurz", color: "var(--status-new-solid)" },
    { label: "Schwach", color: "var(--status-unknown-solid)" },
    { label: "Okay", color: "var(--status-hard-solid)" },
    { label: "Gut", color: "var(--status-known-solid)" },
    { label: "Stark", color: "var(--status-secure-solid)" },
  ][score];
  return (
    <label style={{ display: "block", ...style }}>
      {label && <span style={{ display: "block", font: "var(--text-label)", color: "var(--text-secondary)", marginBottom: 6 }}>{label}</span>}
      <span style={{ display: "flex", alignItems: "center", gap: 10, height: 50, padding: "0 6px 0 14px", background: "var(--surface)", border: `1.5px solid ${bc}`, borderRadius: "var(--r-md)", boxShadow: focus ? "var(--ring)" : "none", transition: "border-color .15s ease, box-shadow .15s ease" }}>
        <A.Icon name="lock" size={18} color="var(--text-tertiary)" />
        <input value={value} onChange={onChange} placeholder={placeholder} type={reveal ? "text" : "password"} autoComplete={autoComplete} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} style={{ flex: 1, border: "none", outline: "none", background: "transparent", font: "var(--text-body)", fontSize: "var(--fs-body-lg)", color: "var(--text-primary)", minWidth: 0 }} />
        <button type="button" aria-label={reveal ? "Passwort verbergen" : "Passwort anzeigen"} onMouseDown={(e) => e.preventDefault()} onClick={() => setReveal((r) => !r)} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 38, height: 38, flex: "none", border: "none", background: "transparent", borderRadius: "var(--r-sm)", color: "var(--text-tertiary)", cursor: "pointer" }}>
          <A.Icon name={reveal ? "eye-off" : "eye"} size={18} />
        </button>
      </span>
      {showStrength && pw.length > 0 && (
        <span style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
          <span style={{ display: "flex", gap: 4, flex: 1 }}>
            {[0, 1, 2, 3].map((i) => <span key={i} style={{ flex: 1, height: 4, borderRadius: "var(--r-full)", background: i < score ? strength.color : "var(--surface-inset)", transition: "background .2s ease" }} />)}
          </span>
          <span style={{ font: "var(--text-label)", fontSize: "var(--fs-micro)", color: strength.color, minWidth: 44, textAlign: "right" }}>{strength.label}</span>
        </span>
      )}
      {(error || hint) && <span style={{ display: "block", font: "var(--text-label)", fontSize: "var(--fs-micro)", color: error ? "var(--danger)" : "var(--text-tertiary)", marginTop: 6 }}>{error || hint}</span>}
    </label>
  );
}

function LocalCodeField({ length = 6, value = "", onChange, onComplete, error, autoFocus, style }) {
  const refs = useRef([]);
  const [fi, setFi] = useState(autoFocus ? 0 : -1);
  const chars = Array.from({ length }, (_, i) => value[i] || "");
  useEffect(() => { if (autoFocus && refs.current[0]) refs.current[0].focus(); }, [autoFocus]);
  const emit = (next) => { const j = next.join("").slice(0, length); if (onChange) onChange(j); if (j.length === length && onComplete) onComplete(j); };
  const onCh = (i, raw) => {
    const digits = (raw.match(/\d/g) || []).join("");
    if (!digits) { const n = chars.slice(); n[i] = ""; emit(n); return; }
    const n = chars.slice(); let p = i;
    for (const d of digits) { if (p >= length) break; n[p] = d; p++; }
    emit(n);
    const last = Math.min(i + digits.length, length - 1);
    if (refs.current[last]) refs.current[last].focus();
  };
  const onKey = (i, e) => {
    if (e.key === "Backspace" && !chars[i] && i > 0 && refs.current[i - 1]) refs.current[i - 1].focus();
    else if (e.key === "ArrowLeft" && i > 0) refs.current[i - 1].focus();
    else if (e.key === "ArrowRight" && i < length - 1) refs.current[i + 1].focus();
  };
  return (
    <div>
      <div style={{ display: "flex", gap: 8, ...style }}>
        {chars.map((c, i) => {
          const active = fi === i;
          const bc = error ? "var(--danger)" : active ? "var(--primary-500)" : "var(--border-strong)";
          return (
            <input key={i} ref={(el) => (refs.current[i] = el)} value={c} inputMode="numeric" maxLength={1} autoComplete={i === 0 ? "one-time-code" : "off"} aria-label={`Ziffer ${i + 1}`}
              onChange={(e) => onCh(i, e.target.value)} onKeyDown={(e) => onKey(i, e)} onFocus={(e) => { setFi(i); e.target.select(); }} onBlur={() => setFi(-1)}
              style={{ flex: 1, minWidth: 0, height: 56, textAlign: "center", font: "var(--fw-bold) var(--fs-title)/1 var(--font-mono)", color: "var(--text-primary)", background: "var(--surface)", border: `1.5px solid ${bc}`, borderRadius: "var(--r-md)", boxShadow: active ? "var(--ring)" : "none", outline: "none", transition: "border-color .15s ease, box-shadow .15s ease" }} />
          );
        })}
      </div>
      {error && <span style={{ display: "block", font: "var(--text-label)", fontSize: "var(--fs-micro)", color: "var(--danger)", marginTop: 6 }}>{error}</span>}
    </div>
  );
}

Object.assign(window, { AuthScreen });
