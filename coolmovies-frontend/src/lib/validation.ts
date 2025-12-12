import { z } from 'zod';

export const reviewSchema = z.object({
  title: z.string()
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(100, 'Máximo 100 caracteres'),
  body: z.string()
    .min(10, 'La reseña debe tener al menos 10 caracteres')
    .max(5000, 'Máximo 5000 caracteres'),
  rating: z.number().min(1).max(5),
});

export const commentSchema = z.object({
  title: z.string().optional(),
  body: z.string()
    .min(1, 'El comentario no puede estar vacío')
    .max(1000, 'Máximo 1000 caracteres'),
});

export type ReviewSchema = z.infer<typeof reviewSchema>;
export type CommentSchema = z.infer<typeof commentSchema>;
