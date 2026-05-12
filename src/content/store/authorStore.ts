import { create } from 'zustand';
import { Step, SelectorMetadata } from '../../shared/types';

interface AuthorState {
  isRecording: boolean;
  steps: Step[];
  
  // Actions
  toggleRecording: () => void;
  addStep: (metadata: SelectorMetadata) => void;
  updateStep: (id: string, updates: Partial<Step>) => void;
  removeStep: (id: string) => void;
  reset: () => void;
}

export const useAuthorStore = create<AuthorState>((set) => ({
  isRecording: false,
  steps: [],

  toggleRecording: () => set((state) => ({ isRecording: !state.isRecording })),
  
  addStep: (metadata) => set((state) => {
    const newStep: Step = {
      id: crypto.randomUUID(),
      urlPattern: window.location.pathname, // Default to current path
      target: metadata,
      title: '',
      description: '',
      triggerEvent: 'click' // Default trigger
    };
    return { steps: [...state.steps, newStep] };
  }),

  updateStep: (id, updates) => set((state) => ({
    steps: state.steps.map(s => s.id === id ? { ...s, ...updates } : s)
  })),

  removeStep: (id) => set((state) => ({
    steps: state.steps.filter(s => s.id !== id)
  })),

  reset: () => set({ steps: [], isRecording: false })
}));
