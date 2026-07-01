import AuthGuard from "@/components/AuthGuard";
import SimpleCrud from "@/components/SimpleCrud";

export default function EstadiosPage() {
  return (
    <AuthGuard>
      <SimpleCrud
        resource="estadios"
        title="Estadios"
        description="Gerir os estadios onde os jogos decorrem."
        fieldName="nome"
        label="Estadio"
      />
    </AuthGuard>
  );
}
