import { useEffect } from 'react';
import { useReplayStore } from '../store/replayStore';
import { useElementTracker } from '../hooks/useElementTracker';

export function ReplayEngineUI() {
  const { activeWalkthrough, currentStepIndex, nextStep, stopReplay } = useReplayStore();
  const currentStep = activeWalkthrough?.steps[currentStepIndex];
  
  const { targetRect, targetElement } = useElementTracker(currentStep?.target);

  useEffect(() => {
    if (!targetElement) return;

    targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

    const clickHandler = () => {
      setTimeout(() => nextStep(), 50); 
    };
    
    targetElement.addEventListener('click', clickHandler, { once: true, capture: true });
    
    return () => {
      targetElement.removeEventListener('click', clickHandler, { capture: true });
    };
  }, [targetElement, nextStep]);

  if (!activeWalkthrough || !currentStep) return null;

  if (!targetRect) {
    return (
      <div style={{
        position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
        backgroundColor: '#f39c12', color: 'white', padding: '12px 24px',
        borderRadius: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        zIndex: 2147483647, fontFamily: 'sans-serif', fontSize: '14px',
        display: 'flex', alignItems: 'center', gap: '12px'
      }}>
        <div style={{ width: '16px', height: '16px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <span>Searching for <strong>{currentStep.title}</strong>...</span>
        <button onClick={stopReplay} style={{ background: 'rgba(0,0,0,0.2)', border: 'none', color: 'white', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', marginLeft: '8px' }}>
          Cancel
        </button>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: targetRect.bottom + 12, // 12px below the element
      left: targetRect.left,
      width: '280px',
      backgroundColor: '#2e86de',
      color: 'white',
      padding: '16px',
      borderRadius: '8px',
      boxShadow: '0 12px 32px rgba(0,0,0,0.3), 0 0 0 2px rgba(255,255,255,0.1)',
      zIndex: 2147483647, // Stay on top
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      transition: 'top 0.2s ease-out, left 0.2s ease-out', // Smooth tracking if element moves
      pointerEvents: 'auto'
    }}>
      {/* Decorative arrow pointing up to the element */}
      <div style={{
        position: 'absolute', top: '-6px', left: '24px', width: '12px', height: '12px',
        backgroundColor: '#2e86de', transform: 'rotate(45deg)'
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ fontWeight: 600, marginBottom: '8px', fontSize: '15px' }}>
          {currentStep.title}
        </div>
        <div style={{ fontSize: '13px', opacity: 0.9, marginBottom: '16px', lineHeight: '1.4' }}>
          {currentStep.description}
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', opacity: 0.8, fontWeight: 500 }}>
            Step {currentStepIndex + 1} of {activeWalkthrough.steps.length}
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={stopReplay}
              style={{ 
                background: 'rgba(0,0,0,0.2)', border: 'none', color: 'white', 
                padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 600
              }}
            >
              Quit
            </button>
            <button 
              onClick={() => {
                if (currentStepIndex < activeWalkthrough.steps.length - 1) {
                  nextStep();
                } else {
                  stopReplay();
                }
              }}
              style={{ 
                background: 'white', border: 'none', color: '#2e86de', 
                padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 600
              }}
            >
              {currentStepIndex < activeWalkthrough.steps.length - 1 ? 'Next' : 'Finish'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
