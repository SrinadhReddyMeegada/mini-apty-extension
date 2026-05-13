import { z } from 'zod';

/**
 * Zod Schemas for Runtime Validation
 * 
 * Enforces strict runtime type-checking when reading/writing to chrome.storage.local
 * to prevent application crashes from corrupt or legacy payload schemas.
 */

export const SelectorMetadataSchema = z.object({
  tagName: z.string(),
  testId: z.string().optional(),
  id: z.string().optional(),
  ariaLabel: z.string().optional(),
  role: z.string().optional(),
  textContent: z.string().optional(),
  classList: z.array(z.string()),
  cssPath: z.string(),
  xpath: z.string(),
});

export const StepSchema = z.object({
  id: z.string(),
  urlPattern: z.string(),
  target: SelectorMetadataSchema,
  title: z.string(),
  description: z.string(),
  triggerEvent: z.enum(['click', 'input', 'next-button']).optional(),
});

export const WalkthroughSchema = z.object({
  id: z.string(),
  name: z.string(),
  origin: z.string(), // Critical for cross-origin matching (app.example.com)
  steps: z.array(StepSchema),
  createdAt: z.number(),
});

// We infer the TS types directly from Zod to guarantee they stay perfectly in sync
export type SelectorMetadata = z.infer<typeof SelectorMetadataSchema>;
export type Step = z.infer<typeof StepSchema>;
export type Walkthrough = z.infer<typeof WalkthroughSchema>;
