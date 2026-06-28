import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import AppNavbar from "@/components/AppNavbar";

export const metadata = {
  title: "Mundial Score",
  description: "Resultados e CRUD do Mundial com Next.js e Strapi",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt">
      <body>
        <AppNavbar />
        <main className="page-shell">{children}</main>
      </body>
    </html>
  );
}
