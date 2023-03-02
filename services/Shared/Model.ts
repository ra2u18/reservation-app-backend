import { z } from 'zod';

export const spaceSchema = z.object({
  spaceId: z.string(),
  location: z.string(),
  name: z.string(),

  photoUrl: z.string().optional(),
});

export type ISpace = z.infer<typeof spaceSchema>;
