import React, { useState, useEffect } from "react";

const loadFromLocalStorage = (key, defaultValue) => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const saveToLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
};

export default function Home() {
  const [user, setUser] = useState(() => loadFromLocalStorage("user", null));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login");

  useEffect(() => {
    saveToLocalStorage("user", user);
  }, [user]);

  const handleLogin = async (e) => {
    e.preventDefault();
    const response = await fetch("/api/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (data.success) {
      setUser(data.user);
      setEmail("");
      setPassword("");
    } else {
      alert(data.message || "Erreur de connexion");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const response = await fetch("/api/users/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (data.success) {
      setUser(data.user);
      setEmail("");
      setPassword("");
    } else {
      alert(data.message || "Erreur d'inscription");
    }
  };

  const handleLogout = () => {
    setUser(null);
  };

  const updateUser = (newUserData) => {
    setUser(newUserData);
  };

  if (!user) {
    return (
      <div style={{ maxWidth: 400, margin: "40px auto", padding: 20, fontFamily: "sans-serif" }}>
        <h1 style={{ textAlign: "center" }}>{mode === "login" ? "Connexion" : "Inscription"}</h1>
        <form onSubmit={mode === "login" ? handleLogin : handleRegister} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
            style={{ padding: 8, fontSize: 16 }}
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: 8, fontSize: 16 }}
          />
          <button type="submit" style={{ padding: 10, fontSize: 16, cursor: "pointer" }}>
            {mode === "login" ? "Se connecter" : "S'inscrire"}
          </button>
        </form>
        <div style={{ marginTop: 20, textAlign: "center" }}>
          {mode === "login" ? (
            <button onClick={() => setMode("register")} style={{ color: "blue", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
              Pas de compte ? Inscrivez-vous
            </button>
          ) : (
            <button onClick={() => setMode("login")} style={{ color: "blue", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
              Déjà un compte ? Connectez-vous
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", padding: 20, fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Mon compte</h1>
        <button onClick={handleLogout} style={{ cursor: "pointer", color: "red", border: "none", background: "none", textDecoration: "underline" }}>
          Déconnexion
        </button>
      </div>

      <div style={{ marginTop: 30 }}>
        <div style={{ marginBottom: 20 }}>
          <h2>Jetons disponibles : {user.tokens}</h2>
          <button
            onClick={() => {
              const newTokens = user.tokens + 50;
              const newHistoryItem = { date: new Date().toISOString().slice(0, 10), action: "Achat de 50 tokens" };
              updateUser({ ...user, tokens: newTokens, history: [newHistoryItem, ...user.history] });
            }}
          >
            Acheter 50 jetons
          </button>
        </div>

        <div style={{ marginBottom: 20 }}>
          <h2>Abonnement actuel : {user.subscription}</h2>
          {user.subscription !== "Pro" && (
            <button
              onClick={() => {
                const newHistoryItem = { date: new Date().toISOString().slice(0, 10), action: "Abonnement passé à Pro" };
                updateUser({ ...user, subscription: "Pro", history: [newHistoryItem, ...user.history] });
              }}
            >
              Passer à Pro
            </button>
          )}
        </div>

        <div>
          <h2>Historique d'activité</h2>
          <ul style={{ maxHeight: 200, overflowY: "auto", paddingLeft: 20 }}>
            {user.history.length === 0 && <li>Aucun historique disponible.</li>}
            {user.history.map((item, i) => (
              <li key={i}>
                {item.date} – {item.action}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}