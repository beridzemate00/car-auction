// client/src/pages/AuthPage.tsx
import React, { useState, useEffect } from "react";
import { register, verifyEmail, login, resendCode, checkCode } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<"register" | "verify" | "login">("register");

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const [code, setCode] = useState("");
  const [codeValid, setCodeValid] = useState<boolean | null>(null);

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const { setAuth } = useAuth();
  const navigate = useNavigate();

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Handle 6-digit code input - only allow numbers
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setCode(value);
    setCodeValid(null); // Reset validation when code changes
  };

  // Check code validity when all 6 digits are entered
  useEffect(() => {
    if (code.length === 6 && email) {
      const validateCode = async () => {
        try {
          const result = await checkCode(email, code);
          setCodeValid(result.valid);
        } catch {
          setCodeValid(false);
        }
      };
      validateCode();
    }
  }, [code, email]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    try {
      setLoading(true);
      await register(email, password, name);
      setMessage("Verification code sent to your email. Check your email or console for the code.");
      setMode("verify");
      setResendCooldown(60); // 60 second cooldown after registration
    } catch (err: any) {
      setError(err.message ?? "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    // Validate code format
    if (!/^\d{6}$/.test(code)) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    try {
      setLoading(true);
      const resp = await verifyEmail(email, code);
      setAuth(resp.token, resp.user);
      setMessage("Email verified, you are now logged in.");
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message ?? "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0 || !email) return;

    setMessage(null);
    setError(null);
    try {
      setResendLoading(true);
      await resendCode(email);
      setMessage("New verification code sent to your email.");
      setResendCooldown(60); // 60 second cooldown
      setCode(""); // Clear old code
      setCodeValid(null);
    } catch (err: any) {
      setError(err.message ?? "Failed to resend code");
    } finally {
      setResendLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    try {
      setLoading(true);
      const resp = await login(email, password);
      setAuth(resp.token, resp.user);
      setMessage("Logged in successfully.");
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page page-auth">
      <div className="auth-tabs">
        <button
          className={`auth-tab ${mode === "register" ? "active" : ""}`}
          onClick={() => setMode("register")}
        >
          Register
        </button>
        <button
          className={`auth-tab ${mode === "verify" ? "active" : ""}`}
          onClick={() => setMode("verify")}
        >
          Verify email
        </button>
        <button
          className={`auth-tab ${mode === "login" ? "active" : ""}`}
          onClick={() => setMode("login")}
        >
          Login
        </button>
      </div>

      {message && <p className="info-text">{message}</p>}
      {error && <p className="error-text">{error}</p>}

      {mode === "register" && (
        <form className="auth-form" onSubmit={handleRegister}>
          <label>
            Name
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name (optional)"
            />
          </label>
          <label>
            Email *
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label>
            Password *
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Sending..." : "Register"}
          </button>
        </form>
      )}

      {mode === "verify" && (
        <form className="auth-form" onSubmit={handleVerify}>
          <label>
            Email *
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Same email as during registration"
            />
          </label>
          <label>
            Verification code *
            <div className="code-input-wrapper">
              <input
                type="text"
                inputMode="numeric"
                pattern="\d{6}"
                required
                value={code}
                onChange={handleCodeChange}
                placeholder="000000"
                maxLength={6}
                className={`code-input ${codeValid === true ? "valid" : codeValid === false ? "invalid" : ""
                  }`}
                style={{ letterSpacing: "0.5em", fontSize: "1.5rem", textAlign: "center" }}
              />
              {code.length === 6 && (
                <span className={`code-status ${codeValid ? "valid" : "invalid"}`}>
                  {codeValid === true ? "✓" : codeValid === false ? "✗" : "..."}
                </span>
              )}
            </div>
          </label>
          <button className="btn" type="submit" disabled={loading || code.length !== 6}>
            {loading ? "Verifying..." : "Verify"}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleResendCode}
            disabled={resendLoading || resendCooldown > 0 || !email}
          >
            {resendLoading
              ? "Sending..."
              : resendCooldown > 0
                ? `Resend code (${resendCooldown}s)`
                : "Resend code"}
          </button>
        </form>
      )}

      {mode === "login" && (
        <form className="auth-form" onSubmit={handleLogin}>
          <label>
            Email *
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label>
            Password *
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      )}
    </div>
  );
};

export default AuthPage;

