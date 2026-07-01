import AuthGuard from "@/components/AuthGuard";
import SimpleCrud from "@/components/SimpleCrud";

export default function EquipasPage() {
  return (
    <AuthGuard>
      <SimpleCrud
        resource="teams"
        title="Equipas"
        description="Gerir selecoes participantes no Mundial."
        fieldName="name"
        label="Equipa"
        hidePlaceholderTeams
      />
    </AuthGuard>
  );
}
