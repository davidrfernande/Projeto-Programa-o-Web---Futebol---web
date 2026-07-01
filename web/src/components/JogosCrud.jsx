"use client";

import { useEffect, useMemo, useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Table from "react-bootstrap/Table";
import LoadingPanel from "@/components/LoadingPanel";
import StatusAlert from "@/components/StatusAlert";
import useCanManage from "@/hooks/useCanManage";
import {
  createEntry,
  deleteEntry,
  entryId,
  field,
  formatDate,
  importWorldCup,
  list,
  relation,
  relationName,
  updateEntry,
} from "@/lib/strapi";

const emptyForm = {
  equipa_casa: "",
  equipa_fora: "",
  estadio: "",
  data: "",
  fase: "",
  estado: "Agendado",
  golos_casa: 0,
  golos_fora: 0,
};

export default function JogosCrud() {
  const canManage = useCanManage();
  const [jogos, setJogos] = useState([]);
  const [teams, setTeams] = useState([]);
  const [estadios, setEstadios] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const canSubmit = useMemo(
    () => form.equipa_casa && form.equipa_fora && form.estadio,
    [form],
  );

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [jogosData, teamsData, estadiosData] = await Promise.all([
        list("jogos", "populate=*"),
        list("teams", "populate=*"),
        list("estadios", "populate=*"),
      ]);
      setJogos(jogosData);
      setTeams(teamsData.filter((team) => !isPlaceholderTeamName(field(team, "name"))));
      setEstadios(estadiosData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function resetForm() {
    setEditing(null);
    setForm(emptyForm);
  }

  function startEdit(jogo) {
    setEditing(entryId(jogo));
    setSuccess("");
    setForm({
      equipa_casa: entryId(relation(jogo, "equipa_casa")) || "",
      equipa_fora: entryId(relation(jogo, "equipa_fora")) || "",
      estadio: entryId(relation(jogo, "estadio")) || "",
      data: toInputDate(field(jogo, "data", "")),
      fase: field(jogo, "fase", ""),
      estado: field(jogo, "estado", "Agendado"),
      golos_casa: field(jogo, "golos_casa", 0),
      golos_fora: field(jogo, "golos_fora", 0),
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const payload = {
      equipa_casa: form.equipa_casa,
      equipa_fora: form.equipa_fora,
      estadio: form.estadio,
      data: form.data ? new Date(form.data).toISOString() : null,
      fase: form.fase,
      estado: form.estado,
      golos_casa: Number(form.golos_casa),
      golos_fora: Number(form.golos_fora),
    };

    try {
      if (editing) {
        await updateEntry("jogos", editing, payload);
        setSuccess("Jogo atualizado com sucesso.");
      } else {
        await createEntry("jogos", payload);
        setSuccess("Jogo criado com sucesso.");
      }
      resetForm();
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(jogo) {
    setError("");
    setSuccess("");

    try {
      await deleteEntry("jogos", entryId(jogo));
      setSuccess("Jogo apagado com sucesso.");
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleImport() {
    setError("");
    setSuccess("");
    setImporting(true);

    try {
      const result = await importWorldCup();
      const imported = result.imported || {};
      setSuccess(
        `Importacao concluida: ${imported.matches || 0} jogos guardados, ${imported.teams || 0} equipas novas e ${imported.venues || 0} estadios novos.`
      );
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setImporting(false);
    }
  }

  if (loading) return <LoadingPanel />;

  return (
    <div className="panel">
      <div className="section-title">
        <div>
          <h1>Jogos</h1>
          <p>Gerir calendario, resultados e relacoes entre equipas e estadios.</p>
        </div>
        {canManage && (
          <Button variant="outline-primary" disabled={importing} onClick={handleImport}>
            {importing ? "A importar..." : "Importar Mundial"}
          </Button>
        )}
      </div>

      <StatusAlert error={error} success={success} />

      {canManage && (
        <Form className="mb-4" onSubmit={handleSubmit}>
          <div className="toolbar">
            <Form.Group>
              <Form.Label>Equipa casa</Form.Label>
              <Form.Select
                required
                value={form.equipa_casa}
                onChange={(event) => updateField("equipa_casa", event.target.value)}
              >
                <option value="">Escolher</option>
                {teams.map((team) => (
                  <option key={entryId(team)} value={entryId(team)}>
                    {field(team, "name", "Sem nome")}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group>
              <Form.Label>Equipa fora</Form.Label>
              <Form.Select
                required
                value={form.equipa_fora}
                onChange={(event) => updateField("equipa_fora", event.target.value)}
              >
                <option value="">Escolher</option>
                {teams.map((team) => (
                  <option key={entryId(team)} value={entryId(team)}>
                    {field(team, "name", "Sem nome")}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group>
              <Form.Label>Estadio</Form.Label>
              <Form.Select
                required
                value={form.estadio}
                onChange={(event) => updateField("estadio", event.target.value)}
              >
                <option value="">Escolher</option>
                {estadios.map((estadio) => (
                  <option key={entryId(estadio)} value={entryId(estadio)}>
                    {field(estadio, "nome", "Sem nome")}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group>
              <Form.Label>Data</Form.Label>
              <Form.Control
                type="datetime-local"
                value={form.data}
                onChange={(event) => updateField("data", event.target.value)}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Fase</Form.Label>
              <Form.Control
                value={form.fase}
                onChange={(event) => updateField("fase", event.target.value)}
                placeholder="Grupo A"
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Estado</Form.Label>
              <Form.Select
                value={form.estado}
                onChange={(event) => updateField("estado", event.target.value)}
              >
                <option>Agendado</option>
                <option>A decorrer</option>
                <option>Terminado</option>
              </Form.Select>
            </Form.Group>

            <Form.Group>
              <Form.Label>Golos casa</Form.Label>
              <Form.Control
                min="0"
                type="number"
                value={form.golos_casa}
                onChange={(event) => updateField("golos_casa", event.target.value)}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Golos fora</Form.Label>
              <Form.Control
                min="0"
                type="number"
                value={form.golos_fora}
                onChange={(event) => updateField("golos_fora", event.target.value)}
              />
            </Form.Group>

            <Button disabled={!canSubmit} type="submit" variant="success">
              {editing ? "Guardar" : "Criar"}
            </Button>
            {editing && (
              <Button type="button" variant="outline-secondary" onClick={resetForm}>
                Cancelar
              </Button>
            )}
          </div>
        </Form>
      )}

      <Table bordered hover responsive>
        <thead>
          <tr>
            <th>Jogo</th>
            <th>Resultado</th>
            <th>Data</th>
            <th>Estado</th>
            {canManage && <th className="text-end">Acoes</th>}
          </tr>
        </thead>
        <tbody>
          {jogos.map((jogo) => (
            <tr key={entryId(jogo)}>
              <td>
                {relationName(jogo, "equipa_casa")} vs {relationName(jogo, "equipa_fora")}
                <div className="text-muted small">{relationName(jogo, "estadio")}</div>
              </td>
              <td>
                {field(jogo, "golos_casa", 0)} - {field(jogo, "golos_fora", 0)}
              </td>
              <td>{formatDate(field(jogo, "data"))}</td>
              <td>{field(jogo, "estado", "Agendado")}</td>
              {canManage && (
                <td>
                  <div className="crud-actions">
                    <Button size="sm" variant="outline-primary" onClick={() => startEdit(jogo)}>
                      Editar
                    </Button>
                    <Button size="sm" variant="outline-danger" onClick={() => handleDelete(jogo)}>
                      Apagar
                    </Button>
                  </div>
                </td>
              )}
            </tr>
          ))}
          {jogos.length === 0 && (
            <tr>
              <td className="text-center text-muted" colSpan={canManage ? 5 : 4}>
                Sem jogos registados.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
}

function toInputDate(value) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 16);
}

function isPlaceholderTeamName(name) {
  return /^[WL]\d+$/i.test((name || "").trim());
}
