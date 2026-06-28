import SimpleCrud from "@/components/SimpleCrud";

export default function EstadiosPage() {
  return (
    <SimpleCrud
      resource="estadios"
      title="Estadios"
      description="Gerir os estadios onde os jogos decorrem."
      fieldName="nome"
      label="Estadio"
    />
  );
}
