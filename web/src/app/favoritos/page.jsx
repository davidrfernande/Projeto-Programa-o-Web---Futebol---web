import AuthGuard from "@/components/AuthGuard";
import FavoritosCrud from "@/components/FavoritosCrud";

export default function FavoritosPage() {
  return (
    <AuthGuard>
      <FavoritosCrud />
    </AuthGuard>
  );
}
