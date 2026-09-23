"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function AccesoPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);

    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });

    if (result?.error) {
      setError("El correo o la contraseña no son correctos.");
      setLoading(false);
      return;
    }

    window.location.href = "/inicio";
  }

  return (
    <main className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <p className="eyebrow">Paginita</p>

        <h1>Iniciar sesión</h1>

        <p className="auth-description">
          Entra en tu cuenta para continuar.
        </p>

        <label>
          Correo
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
          />
        </label>

        <label>
          Contraseña
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </label>

        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Entrando..." : "Iniciar sesión"}
        </button>

        <p className="auth-footer">
          ¿Todavía no tienes cuenta?{" "}
          <Link href="/registro">Crear una cuenta</Link>
        </p>
      </form>
    </main>
  );
}