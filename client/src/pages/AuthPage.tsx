// client/src/pages/AuthPage.tsx
import React, { useState } from "react";
import { register, verifyEmail, login } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<"register" | "verify" | "login">("register");

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const [code, setCode] = useState("");

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { setAuth } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    try {
      setLoading(true);
      await register(email, password, name);
      setMessage("Verification code sent to your email.");
      setMode("verify");
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
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="6-digit code from email"
            />
          </label>
          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Verifying..." : "Verify"}
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
