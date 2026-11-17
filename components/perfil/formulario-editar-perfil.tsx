"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

type UsuarioInicial = {
  displayName: string;
  username: string;
  email: string;
  avatarUrl: string | null;
  bio: string | null;
  allowMessagesFrom: string;
};

export function FormularioEditarPerfil({ usuario }: { usuario: UsuarioInicial }) {
  const router = useRouter();

  const [displayName, setDisplayName] = useState(usuario.displayName);
  const [bio, setBio] = useState(usuario.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(usuario.avatarUrl ?? "");
  const [allowMessagesFrom, setAllowMessagesFrom] = useState(
    usuario.allowMessagesFrom === "FRIENDS" ? "FRIENDS" : "EVERYONE",
  );

  const [cargando, setCargando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCargando(true);
    setError(null);
    setMensajeExito(false);

    try {
      const res = await fetch("/api/usuarios/perfil", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: displayName.trim(),
          bio: bio.trim() || null,
          avatarUrl: avatarUrl.trim() || null,
          allowMessagesFrom,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al actualizar el perfil.");
      }

      setMensajeExito(true);
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error inesperado al guardar los cambios.");
      }
    } finally {
      setCargando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-xl">
      {mensajeExito && (
        <div className="pg-alerta-ok flex items-center justify-between gap-3">
          <span>✓ Perfil actualizado correctamente.</span>
          <Link
            href={`/perfil/${usuario.username}`}
            className="underline font-semibold hover:opacity-80"
          >
            Ver mi perfil
          </Link>
        </div>
      )}

      {error && <div className="pg-alerta-error">{error}</div>}

      {/* Vista previa de avatar y URL */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full overflow-hidden border border-[var(--border)] bg-[#365543] flex items-center justify-center text-xl font-bold text-[#eaffdb] flex-shrink-0">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt="Vista previa"
              width={64}
              height={64}
              unoptimized
              className="w-full h-full object-cover"
            />
          ) : (
            displayName.charAt(0).toUpperCase() || "U"
          )}
        </div>

        <div className="flex-1">
          <label htmlFor="avatarUrl" className="block text-sm font-medium text-[var(--muted)] mb-1">
            URL de la foto de perfil (Avatar)
          </label>
          <input
            id="avatarUrl"
            type="url"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://ejemplo.com/tu-foto.jpg"
            className="pg-input"
          />
          <p className="text-xs text-[var(--muted)] mt-1">
            Puedes pegar un enlace directo a una imagen pública.
          </p>
        </div>
      </div>

      {/* Nombre visible */}
      <div>
        <label htmlFor="displayName" className="block text-sm font-medium text-[var(--muted)] mb-1">
          Nombre para mostrar <span className="text-red-400">*</span>
        </label>
        <input
          id="displayName"
          type="text"
          required
          maxLength={50}
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Tu nombre o apodo"
          className="pg-input"
        />
      </div>

      {/* Biografía */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <label htmlFor="bio" className="block text-sm font-medium text-[var(--muted)]">
            Biografía
          </label>
          <span className="text-xs text-[var(--muted)]">{bio.length} / 280</span>
        </div>
        <textarea
          id="bio"
          rows={3}
          maxLength={280}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Cuenta un poco sobre ti, tus aficiones..."
          className="pg-input"
        />
      </div>

      {/* Privacidad de mensajes */}
      <div>
        <label htmlFor="allowMessagesFrom" className="block text-sm font-medium text-[var(--muted)] mb-1">
          ¿Quién puede enviarme mensajes privados?
        </label>
        <select
          id="allowMessagesFrom"
          value={allowMessagesFrom}
          onChange={(e) => setAllowMessagesFrom(e.target.value)}
          className="pg-input"
        >
          <option value="EVERYONE">Cualquier usuario de Paginita</option>
          <option value="FRIENDS">Solo mis amistades</option>
        </select>
      </div>

      {/* Datos no editables informativos */}
      <div className="pt-4 border-t border-[var(--border)] flex flex-col gap-3">
        <div>
          <span className="block text-xs font-semibold text-[var(--muted)] uppercase">
            Nombre de usuario (@)
          </span>
          <p className="text-sm text-[var(--text)] font-mono m-0 mt-0.5">
            @{usuario.username}
          </p>
        </div>

        <div>
          <span className="block text-xs font-semibold text-[var(--muted)] uppercase">
            Correo electrónico
          </span>
          <p className="text-sm text-[var(--text)] m-0 mt-0.5">
            {usuario.email}
          </p>
        </div>
      </div>

      {/* Botones */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={cargando || !displayName.trim()}
          className="pg-btn"
        >
          {cargando ? "Guardando..." : "Guardar cambios"}
        </button>

        <Link
          href={`/perfil/${usuario.username}`}
          className="pg-btn-secundario"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}