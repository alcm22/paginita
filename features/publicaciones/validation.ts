import { z } from "zod";

export const createPostSchema = z
  .object({
    content: z
      .string({
        error: "El contenido debe ser un texto.",
      })
      .trim()
      .max(5000, "La publicación no puede superar los 5000 caracteres.")
      .default(""),
    imageUrl: z
      .string()
      .trim()
      .url("La imagen debe ser una URL válida (ej. https://...).")
      .optional()
      .nullable()
      .or(z.literal("")),
  })
  .refine((data) => data.content.length > 0 || Boolean(data.imageUrl), {
    message: "La publicación debe tener texto o una imagen.",
    path: ["content"],
  });