// We now derive our types directly from the Zod schemas in schemas.ts
// This guarantees that our compile-time types always perfectly match 
// our runtime validation rules.
export type { SelectorMetadata, Step, Walkthrough } from './schemas';
