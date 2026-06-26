import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AccountTypePicker } from "./AccountTypePicker";
import { signUp, isUsernameAvailable } from "../api/auth.api";
import type { AccountType } from "@/types/database";

export function SignupForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2>(1);
  const [accountType, setAccountType] = useState<AccountType | null>(null);

  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!accountType) return;
    setError(null);
    setLoading(true);
    try {
      const available = await isUsernameAvailable(username);
      if (!available) {
        setError(t("errors.usernameTaken"));
        setLoading(false);
        return;
      }
      await signUp({
        email, password, displayName,
        username: username.toLowerCase(),
        accountType, companyName: companyName || undefined,
      });
      setSuccess(true);
    } catch {
      setError(t("errors.generic"));
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="text-center">
        <h2 className="font-display text-2xl font-600">{t("auth.signupTitle")}</h2>
        <p className="mt-3 text-sm text-muted-foreground">{t("auth.checkEmail")}</p>
        <Button className="mt-6" variant="outline" onClick={() => navigate("/login")}>
          {t("auth.signinInstead")}
        </Button>
      </div>
    );
  }

  // Passo 1 — escolher o tipo de conta
  if (step === 1) {
    return (
      <div>
        <h2 className="font-display text-3xl font-600 tracking-tight">{t("auth.signupTitle")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{t("auth.accountType")}</p>
        <div className="mt-6">
          <AccountTypePicker value={accountType} onChange={setAccountType} />
        </div>
        <Button size="lg" className="mt-6 w-full" disabled={!accountType} onClick={() => setStep(2)}>
          {t("auth.continue")}
        </Button>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          {t("auth.hasAccount")}{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            {t("auth.signinInstead")}
          </Link>
        </p>
      </div>
    );
  }

  // Passo 2 — dados da conta
  return (
    <div>
      <button onClick={() => setStep(1)} className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> {t("auth.back")}
      </button>
      <h2 className="font-display text-3xl font-600 tracking-tight">{t("auth.signupTitle")}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{t(`accountType.${accountType}`)}</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="displayName">{t("auth.displayName")}</Label>
          <Input id="displayName" required value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="username">{t("auth.username")}</Label>
          <Input id="username" required value={username}
            onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="company">{t("auth.company")}</Label>
          <Input id="company" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">{t("auth.email")}</Label>
          <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">{t("auth.password")}</Label>
          <Input id="password" type="password" autoComplete="new-password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? t("auth.loading") : t("auth.signup")}
        </Button>
      </form>
    </div>
  );
}
