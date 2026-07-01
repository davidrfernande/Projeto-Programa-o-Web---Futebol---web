"use client";

import { useEffect, useState } from "react";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";
import Stack from "react-bootstrap/Stack";
import Link from "next/link";
import LoadingPanel from "@/components/LoadingPanel";
import StatusAlert from "@/components/StatusAlert";
import { field, formatDate, list, relationName, stableKey } from "@/lib/strapi";

export default function HomePage() {
  const [jogos, setJogos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadJogos() {
      setLoading(true);
      setError("");

      try {
        setJogos(await list("jogos", "populate=*&sort=data:desc"));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadJogos();
  }, []);

  if (loading) return <LoadingPanel label="A carregar resultados..." />;

  return (
    <Stack gap={3}>
      <div className="panel">
        <div className="section-title">
          <div>
            <h1>Mundial Score</h1>
            <p>Resultados, calendario e gestao minima dos jogos do Mundial.</p>
          </div>
          <Button as={Link} href="/jogos" variant="success">
            Gerir jogos
          </Button>
        </div>

        <StatusAlert error={error} />

        <Stack gap={3}>
          {jogos.map((jogo, index) => (
            <article className="score-card" key={stableKey(jogo, "jogo", index)}>
              <div className="match-line">
                <div className="team-name">{relationName(jogo, "equipa_casa")}</div>
                <div className="score-box">
                  {field(jogo, "golos_casa", 0)} - {field(jogo, "golos_fora", 0)}
                </div>
                <div className="team-name away">{relationName(jogo, "equipa_fora")}</div>
              </div>
              <div className="meta-row">
                <span>{formatDate(field(jogo, "data"))}</span>
                <span>{relationName(jogo, "estadio")}</span>
                <span>{field(jogo, "fase", "Fase por definir")}</span>
                <Badge bg={badgeVariant(field(jogo, "estado", "Agendado"))}>
                  {field(jogo, "estado", "Agendado")}
                </Badge>
              </div>
            </article>
          ))}

          {jogos.length === 0 && (
            <div className="score-card text-center text-muted">
              Ainda nao existem jogos publicados no Strapi.
            </div>
          )}
        </Stack>
      </div>
    </Stack>
  );
}

function badgeVariant(status) {
  if (status === "Terminado") return "dark";
  if (status === "A decorrer") return "warning";
  return "secondary";
}
