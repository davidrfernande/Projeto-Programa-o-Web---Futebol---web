"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";

export default function AppNavbar() {
  const router = useRouter();
  const [logged, setLogged] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    setLogged(!!token);
  }, []);

  function logout() {
    localStorage.removeItem("jwt");
    localStorage.removeItem("user");
    setLogged(false);
    router.push("/login");
  }

  return (
      <Navbar className="navbar-score" expand="lg" variant="dark">
        <Container>
          <Navbar.Brand as={Link} href="/" className="brand-mark">
            <span className="score-ball">MS</span>
            Mundial Score
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="main-nav" />

          <Navbar.Collapse id="main-nav">
            <Nav className="ms-auto">
              <Nav.Link as={Link} href="/">
                Jogos
              </Nav.Link>

              <Nav.Link as={Link} href="/equipas">
                Equipas
              </Nav.Link>

              <Nav.Link as={Link} href="/estadios">
                Estádios
              </Nav.Link>

              <Nav.Link as={Link} href="/jogos">
                CRUD Jogos
              </Nav.Link>

              <Nav.Link as={Link} href="/favoritos">
                Favoritos
              </Nav.Link>

              {!logged ? (
                  <>
                    <Nav.Link as={Link} href="/login">
                      Login
                    </Nav.Link>

                    <Nav.Link as={Link} href="/register">
                      Registar
                    </Nav.Link>
                  </>
              ) : (
                  <Nav.Link onClick={logout} style={{ cursor: "pointer" }}>
                    Logout
                  </Nav.Link>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
  );
}