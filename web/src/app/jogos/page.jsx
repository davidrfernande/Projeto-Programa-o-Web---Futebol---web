import AuthGuard from "@/components/AuthGuard";
import JogosCrud from "@/components/JogosCrud";

export default function JogosPage() {
  return (
    <AuthGuard>
      <JogosCrud />
    </AuthGuard>
  );
}
