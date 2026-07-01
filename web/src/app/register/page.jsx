"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [erro, setErro] = useState("");

    async function register(e) {
        e.preventDefault();
        setErro("");

        const res = await fetch("http://localhost:1338/api/auth/local/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
            setErro(data.error?.message || "Erro ao criar conta");
            return;
        }

        localStorage.setItem("jwt", data.jwt);
        localStorage.setItem("user", JSON.stringify(data.user));

        router.push("/jogos");
    }

    return (
        <div className="container mt-5" style={{ maxWidth: "500px" }}>
            <h1>Registar</h1>

            {erro && <div className="alert alert-danger">{erro}</div>}

            <form onSubmit={register}>
                <div className="mb-3">
                    <label>Username</label>
                    <input
                        className="form-control"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label>Email</label>
                    <input
                        className="form-control"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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
                        minLength={6}
                    />
                </div>

                <button className="btn btn-success w-100">Criar conta</button>
            </form>

            <p className="mt-3">
                Já tens conta? <a href="/login">Entrar</a>
            </p>
        </div>
    );
}