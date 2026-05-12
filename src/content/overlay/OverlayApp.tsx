import { useEffect, useState } from 'react';
import { useAuthorStore } from '../store/authorStore';
import { saveWalkthrough } from '../../shared/storage';

export function OverlayApp() {
  const [isOpen, setIsOpen] = useState(false);
  const { isRecording, steps, toggleRecording, updateStep, removeStep, reset } = useAuthorStore();

  useEffect(() => {
    const handleToggle = (e: Event) => {
      const customEvent = e as CustomEvent<{ isOpen: boolean }>;
      setIsOpen(customEvent.detail.isOpen);
    };
    window.addEventListener('MINI_APTY_TOGGLE_DRAWER', handleToggle);
    return () => window.removeEventListener('MINI_APTY_TOGGLE_DRAWER', handleToggle);
  }, []);

  const handleSave = async () => {
    try {
      await saveWalkthrough({
        id: crypto.randomUUID(),
        name: `Walkthrough for ${window.location.hostname}`,
        origin: window.location.origin, // Important for cross-origin filtering
        steps: steps,
        createdAt: Date.now()
      });
      alert('Walkthrough saved successfully!');
      reset();
      setIsOpen(false);
    } catch (e) {
      alert('Failed to save walkthrough.');
      console.error(e);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: '20px', right: '20px', width: '320px', maxHeight: '80vh',
      backgroundColor: '#1a1a2e', color: '#e0e0e0', boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      borderRadius: '12px', border: '1px solid #2a2a4a', zIndex: 2147483647,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      display: 'flex', flexDirection: 'column', overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{ padding: '16px', borderBottom: '1px solid #2a2a4a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Mini Apty Author</h2>
        <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: '#a0a0a0', cursor: 'pointer', fontSize: '18px' }}>&times;</button>
      </div>
      
      {/* Scrollable Steps Area */}
      <div style={{ padding: '16px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {steps.length === 0 ? (
          <p style={{ margin: 0, fontSize: '13px', opacity: 0.6, textAlign: 'center', padding: '20px 0' }}>
            {isRecording ? "Click an element on the page to capture it." : "Click Start Recording to begin."}
          </p>
        ) : (
          steps.map((step, idx) => (
            <div key={step.id} style={{ background: '#2a2a4a', padding: '12px', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', opacity: 0.7 }}>Step {idx + 1}: {step.target.tagName}</span>
                <button onClick={() => removeStep(step.id)} style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer' }}>&times;</button>
              </div>
              <input 
                placeholder={`Step ${idx + 1} Title`}
                value={step.title} onChange={(e) => updateStep(step.id, { title: e.target.value })}
                style={{ width: '100%', marginBottom: '8px', padding: '6px', background: '#111122', border: '1px solid #3a3a5a', color: 'white', borderRadius: '4px' }}
              />
              <textarea 
                placeholder="Describe what the user should do here..."
                value={step.description} onChange={(e) => updateStep(step.id, { description: e.target.value })} rows={2}
                style={{ width: '100%', padding: '6px', background: '#111122', border: '1px solid #3a3a5a', color: 'white', borderRadius: '4px', resize: 'vertical' }}
              />
            </div>
          ))
        )}
      </div>
      
      {/* Footer Controls */}
      <div style={{ padding: '16px', borderTop: '1px solid #2a2a4a', backgroundColor: '#111122', display: 'flex', gap: '8px' }}>
        <button 
          onClick={toggleRecording}
          style={{
            flex: 1, padding: '8px', backgroundColor: isRecording ? '#ff4757' : '#4CAF50',
            color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer'
          }}
        >
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </button>
        {steps.length > 0 && !isRecording && (
          <button 
            onClick={handleSave}
            style={{ flex: 1, padding: '8px', backgroundColor: '#3742fa', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
          >
            Save Walkthrough
          </button>
        )}
      </div>
    </div>
  );
}
