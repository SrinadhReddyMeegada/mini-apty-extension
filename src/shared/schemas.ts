import { z } from 'zod';

/**
 * Zod Schemas for Runtime Validation
 * 
 * WHY THIS IS CRITICAL FOR SENIOR ENGINEERING:
 * TypeScript types (`interface`) disappear at compile time. When we read data
 * from `chrome.storage.local`, it has an `any` type at runtime.
 * 
 * If a previous version of our extension wrote a walkthrough missing a field,
 * or if storage got corrupted, casting it as `Step[]` in TS won't stop the 
 * runtime crash when we try to render it.
 * 
 * Zod parses and validates the actual JSON object at runtime. If it fails,
 * we catch it gracefully instead of exploding the React tree.
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
