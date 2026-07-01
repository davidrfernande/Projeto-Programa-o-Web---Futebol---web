"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [erro, setErro] = useState("");

    async function login(e) {
        e.preventDefault();
        setErro("");

        const res = await fetch("http://localhost:1338/api/auth/local", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ identifier, password }),
        });

        const data = await res.json();

        if (!res.ok) {
            setErro(data.error?.message || "Erro ao fazer login");
            return;
        }

        localStorage.setItem("jwt", data.jwt);
        localStorage.setItem("user", JSON.stringify(data.user));

        router.push("/jogos");
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
                Não tens conta? <a href="/register">Registar</a>
            </p>
        </div>
    );
}