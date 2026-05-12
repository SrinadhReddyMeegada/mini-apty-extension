import { z } from 'zod';
import { Walkthrough, WalkthroughSchema } from './schemas';

/**
 * Retrieves all walkthroughs, guaranteeing type safety and data integrity via Zod.
 */
export async function getWalkthroughs(): Promise<Walkthrough[]> {
  return new Promise((resolve) => {
    chrome.storage.local.get(['walkthroughs'], (result) => {
      const data = result.walkthroughs;
      
      if (!data || !Array.isArray(data)) {
        return resolve([]);
      }

      // RUNTIME VALIDATION
      const parsed = z.array(WalkthroughSchema).safeParse(data);
      
      if (!parsed.success) {
        console.error('[Mini Apty] Storage corruption detected!', parsed.error);
        
        // Defensive Programming: We don't crash. We try to salvage any valid walkthroughs.
        const validWalkthroughs = data.filter(w => WalkthroughSchema.safeParse(w).success);
        return resolve(validWalkthroughs as Walkthrough[]);
      }

      resolve(parsed.data);
    });
  });
}

/**
 * Saves a new walkthrough. Validates before writing to prevent storage poisoning.
 */
export async function saveWalkthrough(walkthrough: Walkthrough): Promise<void> {
  // Validate incoming data
  const validWalkthrough = WalkthroughSchema.parse(walkthrough);
  
  const existing = await getWalkthroughs();
  
  // If we are updating an existing walkthrough, replace it. Otherwise, append it.
  const updated = [
    ...existing.filter(w => w.id !== validWalkthrough.id), 
    validWalkthrough
  ];
  
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ walkthroughs: updated }, () => {
      if (chrome.runtime.lastError) {
        return reject(new Error(chrome.runtime.lastError.message));
      }
      resolve();
    });
  });
}

/**
 * Clears all walkthroughs (useful for testing/resetting)
 */
export async function clearWalkthroughs(): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.remove('walkthroughs', resolve);
  });
}
