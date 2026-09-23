import Link from "next/link";

export function Logo() {
  return (
    <Link className="logo" href="/inicio" aria-label="Paginita, ir a Inicio">
      <span className="logo-mark" aria-hidden="true">p</span>
      <span>paginita</span>
    </Link>
  );
}
