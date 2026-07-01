"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login as loginUser } from "@/lib/strapi";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState("");

  async function login(e) {
    e.preventDefault();
    setErro("");

    try {
      await loginUser(identifier, password);
      router.push("/jogos");
    } catch (err) {
      setErro(err.message || "Erro ao fazer login");
    }
  }

  return (
    <div className="container mt-5" style={{ maxWidth: "500px" }}>
      <h1>Login</h1>

      {erro && <div className="alert alert-danger">{erro}</div>}

      <form onSubmit={login}>
        <div className="mb-3">
          <label>Email ou username</label>
          <input
            className="form-control"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label>Password</label>
          <input
            className="form-control"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button className="btn btn-primary w-100">Entrar</button>
      </form>

      <p className="mt-3">
        Nao tens conta? <a href="/register">Registar</a>
      </p>
    </div>
  );
}
