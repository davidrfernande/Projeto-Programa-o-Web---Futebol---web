"use client";

import { useCallback, useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Table from "react-bootstrap/Table";
import StatusAlert from "@/components/StatusAlert";
import LoadingPanel from "@/components/LoadingPanel";
import useCanManage from "@/hooks/useCanManage";
import { createEntry, deleteEntry, entryId, field, list, updateEntry } from "@/lib/strapi";

export default function SimpleCrud({ resource, title, description, fieldName, label }) {
  const emptyForm = { [fieldName]: "" };
  const canManage = useCanManage();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setItems(await list(resource, "populate=*"));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [resource]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  function startEdit(item) {
    setEditing(entryId(item));
    setForm({ [fieldName]: field(item, fieldName) });
    setSuccess("");
  }

  function resetForm() {
    setEditing(null);
    setForm(emptyForm);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      if (editing) {
        await updateEntry(resource, editing, form);
        setSuccess(`${label} atualizado com sucesso.`);
      } else {
        await createEntry(resource, form);
        setSuccess(`${label} criado com sucesso.`);
      }
      resetForm();
      await loadItems();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(item) {
    const id = entryId(item);
    setError("");
    setSuccess("");

    try {
      await deleteEntry(resource, id);
      setSuccess(`${label} apagado com sucesso.`);
      await loadItems();
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <LoadingPanel />;

  return (
    <div className="panel">
      <div className="section-title">
        <div>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
      </div>

      <StatusAlert error={error} success={success} />

      {canManage && (
        <Form className="mb-4" onSubmit={handleSubmit}>
          <div className="toolbar">
            <Form.Group className="grid-wide">
              <Form.Label>{label}</Form.Label>
              <Form.Control
                required
                value={form[fieldName]}
                onChange={(event) => setForm({ [fieldName]: event.target.value })}
                placeholder={`Nome do ${label.toLowerCase()}`}
              />
            </Form.Group>
            <Button type="submit" variant="success">
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
            <th>{label}</th>
            {canManage && <th className="text-end">Acoes</th>}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={entryId(item)}>
              <td>{field(item, fieldName, "Sem nome")}</td>
              {canManage && (
                <td>
                  <div className="crud-actions">
                    <Button size="sm" variant="outline-primary" onClick={() => startEdit(item)}>
                      Editar
                    </Button>
                    <Button size="sm" variant="outline-danger" onClick={() => handleDelete(item)}>
                      Apagar
                    </Button>
                  </div>
                </td>
              )}
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td className="text-center text-muted" colSpan={canManage ? 2 : 1}>
                Sem registos.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
}
