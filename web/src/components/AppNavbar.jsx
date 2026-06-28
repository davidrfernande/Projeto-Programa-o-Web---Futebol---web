"use client";

import Link from "next/link";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";

export default function AppNavbar() {
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
              Estadios
            </Nav.Link>
            <Nav.Link as={Link} href="/jogos">
              CRUD Jogos
            </Nav.Link>
            <Nav.Link as={Link} href="/favoritos">
              Favoritos
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
