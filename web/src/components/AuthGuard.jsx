"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Button from "react-bootstrap/Button";
import { isLoggedIn, onAuthChange } from "@/lib/strapi";

export default function AuthGuard({ children }) {
  const [logged, setLogged] = useState(null);

  useEffect(() => {
    function syncAuth() {
      setLogged(isLoggedIn());
    }

    syncAuth();
    return onAuthChange(syncAuth);
  }, []);

  if (logged === null) return null;

  if (!logged) {
    return (
      <div className="panel">
        <div className="section-title">
          <div>
            <h1>Acesso reservado</h1>
            <p>Precisas de iniciar sessao para gerir estes dados.</p>
          </div>
          <Button as={Link} href="/login" variant="success">
            Entrar
          </Button>
        </div>
      </div>
    );
  }

  return children;
}
