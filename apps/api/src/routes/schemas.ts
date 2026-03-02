import { z } from 'zod';

export const poolsQuerySchema = z.object({
  tokenA: z.string().min(1).optional(),
  tokenB: z.string().min(1).optional()
});

export const quoteQuerySchema = z.object({
  tokenIn: z.string().min(1),
  tokenOut: z.string().min(1),
  amount: z.string().min(1)
});
