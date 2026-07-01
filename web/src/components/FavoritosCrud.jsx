"use client";

import { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Table from "react-bootstrap/Table";
import LoadingPanel from "@/components/LoadingPanel";
import StatusAlert from "@/components/StatusAlert";
import { createFavorite, deleteFavorite, entryId, field, list, relationName } from "@/lib/strapi";

export default function FavoritosCrud() {
  const [favoritos, setFavoritos] = useState([]);
  const [teams, setTeams] = useState([]);
  const [team, setTeam] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const teamsData = await list("teams", "populate=*");
      setTeams(teamsData.filter((item) => !isPlaceholderTeamName(field(item, "name"))));

      try {
        const favoritosData = await list("favoritos", "populate=*");
        setFavoritos(uniqueFavoritesByTeam(favoritosData));
      } catch (err) {
        setFavoritos([]);
        setError(err.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      await createFavorite(team);
      setTeam("");
      setSuccess("Favorito criado com sucesso.");
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(favorito) {
    setError("");
    setSuccess("");

    try {
      await deleteFavorite(entryId(favorito));
      setSuccess("Favorito apagado com sucesso.");
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <LoadingPanel />;

  return (
    <div className="panel">
      <div className="section-title">
        <div>
          <h1>Favoritos</h1>
          <p>Marcar equipas favoritas para a versao minima sem login.</p>
        </div>
      </div>

      <StatusAlert error={error} success={success} />

      <Form className="mb-4" onSubmit={handleSubmit}>
        <div className="toolbar">
          <Form.Group>
            <Form.Label>Equipa</Form.Label>
            <Form.Select required value={team} onChange={(event) => setTeam(event.target.value)}>
              <option value="">Escolher equipa</option>
              {teams.map((item) => (
                <option key={entryId(item)} value={field(item, "id", entryId(item))}>
                  {field(item, "name", "Sem nome")}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Button type="submit" variant="success">
            Criar
          </Button>
        </div>
      </Form>

      <Table bordered hover responsive>
        <thead>
          <tr>
            <th>Equipa favorita</th>
            <th className="text-end">Acoes</th>
          </tr>
        </thead>
        <tbody>
          {favoritos.map((favorito) => (
            <tr key={`${entryId(favorito)}-${favoriteTeamId(favorito)}`}>
              <td>{relationName(favorito, "team")}</td>
              <td>
                <div className="crud-actions">
                  <Button
                    size="sm"
                    variant="outline-danger"
                    onClick={() => handleDelete(favorito)}
                  >
                    Apagar
                  </Button>
                </div>
              </td>
            </tr>
          ))}
          {favoritos.length === 0 && (
            <tr>
              <td className="text-center text-muted" colSpan="2">
                Sem favoritos.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
}

function isPlaceholderTeamName(name) {
  return /^[WL]\d+$/i.test((name || "").trim());
}

function uniqueFavoritesByTeam(favoritos) {
  const seen = new Set();

  return favoritos.filter((favorito) => {
    const teamId = favoriteTeamId(favorito);
    const key = teamId || entryId(favorito);

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function favoriteTeamId(favorito) {
  const team = favorito?.team ?? favorito?.attributes?.team?.data;
  return team?.documentId || team?.id || null;
}
