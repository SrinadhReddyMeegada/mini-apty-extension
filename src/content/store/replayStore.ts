import { create } from 'zustand';
import { Walkthrough } from '../../shared/types';

interface ReplayState {
  activeWalkthrough: Walkthrough | null;
  currentStepIndex: number;
  
  startReplay: (walkthrough: Walkthrough) => void;
  nextStep: () => void;
  stopReplay: () => void;
}

export const useReplayStore = create<ReplayState>((set) => ({
  activeWalkthrough: null,
  currentStepIndex: 0,

  startReplay: (walkthrough) => {
    console.log('[Mini Apty] Starting replay for:', walkthrough.name);
    set({ activeWalkthrough: walkthrough, currentStepIndex: 0 });
  },

  nextStep: () => set((state) => {
    if (!state.activeWalkthrough) return state;
    
    const nextIndex = state.currentStepIndex + 1;
    if (nextIndex >= state.activeWalkthrough.steps.length) {
      console.log('[Mini Apty] Walkthrough complete!');
      return { activeWalkthrough: null, currentStepIndex: 0 };
    }
    
    console.log('[Mini Apty] Advancing to step', nextIndex + 1);
    return { currentStepIndex: nextIndex };
  }),

  stopReplay: () => set({ activeWalkthrough: null, currentStepIndex: 0 })
}));
