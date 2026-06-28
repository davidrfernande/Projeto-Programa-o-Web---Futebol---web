"use client";

import Alert from "react-bootstrap/Alert";

export default function StatusAlert({ error, success }) {
  if (!error && !success) return null;

  return (
    <Alert className="mb-3" variant={error ? "danger" : "success"}>
      {error || success}
    </Alert>
  );
}
