
import { z } from "zod";

export const createPostSchema = z.object({
  content: z
    .string({
      error: "El contenido debe ser un texto.",
    })
    .trim()
    .min(1, "La publicación no puede estar vacía.")
    .max(5000, "La publicación no puede superar los 5000 caracteres."),
});
