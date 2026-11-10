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
};

export function FormularioEditarPerfil({ usuario }: { usuario: UsuarioInicial }) {
  const router = useRouter();

  const [displayName, setDisplayName] = useState(usuario.displayName);
  const [bio, setBio] = useState(usuario.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(usuario.avatarUrl ?? "");

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
        <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-sm flex items-center justify-between">
          <span>✓ ¡Perfil actualizado correctamente!</span>
          <Link
            href={`/perfil/${usuario.username}`}
            className="underline font-semibold hover:opacity-80"
          >
            Ver mi perfil
          </Link>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Vista previa de avatar y URL */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-xl font-bold text-zinc-600 dark:text-zinc-300 flex-shrink-0">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt="Vista previa"
              width={64}
              height={64}
              className="w-full h-full object-cover"
              unoptimized
            />
          ) : (
            displayName.charAt(0).toUpperCase() || "U"
          )}
        </div>

        <div className="flex-1">
          <label htmlFor="avatarUrl" className="block text-sm font-medium mb-1">
            URL de la foto de perfil (Avatar)
          </label>
          <input
            id="avatarUrl"
            type="url"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://ejemplo.com/tu-foto.jpg"
            className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-zinc-400 mt-1">
            Puedes pegar un enlace directo a una imagen pública.
          </p>
        </div>
      </div>

      {/* Nombre visible */}
      <div>
        <label htmlFor="displayName" className="block text-sm font-medium mb-1">
          Nombre para mostrar <span className="text-red-500">*</span>
        </label>
        <input
          id="displayName"
          type="text"
          required
          maxLength={50}
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Tu nombre o apodo"
          className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Biografía */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <label htmlFor="bio" className="block text-sm font-medium">
            Biografía
          </label>
          <span className="text-xs text-zinc-400">{bio.length} / 280</span>
        </div>
        <textarea
          id="bio"
          rows={3}
          maxLength={280}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Cuenta un poco sobre ti, tus aficiones..."
          className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Datos no editables informativos */}
      <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex flex-col gap-3">
        <div>
          <span className="block text-xs font-semibold text-zinc-400 uppercase">
            Nombre de usuario (@)
          </span>
          <p className="text-sm text-zinc-600 dark:text-zinc-300 font-mono">
            @{usuario.username}
          </p>
        </div>

        <div>
          <span className="block text-xs font-semibold text-zinc-400 uppercase">
            Correo electrónico
          </span>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            {usuario.email}
          </p>
        </div>
      </div>

      {/* Botones */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={cargando || !displayName.trim()}
          className="px-5 py-2.5 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
        >
          {cargando ? "Guardando..." : "Guardar cambios"}
        </button>

        <Link
          href={`/perfil/${usuario.username}`}
          className="px-4 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}