import { useEffect, useState } from 'react';
import { sendExtensionMessage, sendTabMessage } from '../shared/messaging';
import { getWalkthroughs, clearWalkthroughs } from '../shared/storage';
import { Walkthrough } from '../shared/types';

export function App() {
  const [swStatus, setSwStatus] = useState<string>('Checking...');
  const [csStatus, setCsStatus] = useState<string>('Checking...');
  const [walkthroughs, setWalkthroughs] = useState<Walkthrough[]>([]);

  useEffect(() => {
    async function init() {
      // 1. Check Connections
      try {
        const swResponse = await sendExtensionMessage({ type: 'PING' });
        setSwStatus(swResponse.ok ? `Connected` : 'Error');
      } catch (e) {
        setSwStatus('Unreachable');
      }

      chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        const tab = tabs[0];
        if (tab?.url && tab.id) {
          try {
            const csResponse = await sendTabMessage(tab.id, { type: 'PING' });
            setCsStatus(csResponse.ok ? `Connected` : 'Error');
          } catch (e) {
            setCsStatus('Not Injected');
          }
        }
      });

      // 2. Load Walkthroughs
      const saved = await getWalkthroughs();
      setWalkthroughs(saved);
    }

    init();
  }, []);

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', width: '300px' }}>
      <div>
        <h1 style={{ fontSize: '18px', margin: '0 0 4px 0' }}>Mini Apty</h1>
        <p style={{ margin: 0, fontSize: '13px', opacity: 0.6 }}>Author & Replay Engine</p>
      </div>
      
      <div style={{ fontSize: '12px', background: '#2a2a4a', padding: '12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
        <div><strong>SW:</strong> {swStatus}</div>
        <div><strong>Tab:</strong> {csStatus}</div>
      </div>

      <button 
        disabled={csStatus !== 'Connected'}
        onClick={() => {
          chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
            const tab = tabs[0];
            if (tab?.id) {
              try {
                await sendTabMessage(tab.id, { type: 'TOGGLE_DRAWER' });
                window.close();
              } catch (e) {
                console.error(e);
              }
            }
          });
        }}
        style={{
          width: '100%', padding: '12px', backgroundColor: csStatus === 'Connected' ? '#4CAF50' : '#2a2a4a', color: 'white',
          border: 'none', borderRadius: '6px', fontWeight: 600, cursor: csStatus === 'Connected' ? 'pointer' : 'not-allowed',
          opacity: csStatus === 'Connected' ? 1 : 0.5
        }}
      >
        {csStatus === 'Connected' ? 'Open Author Mode' : 'Go to a website to Author'}
      </button>

      <div style={{ borderTop: '1px solid #2a2a4a', paddingTop: '16px' }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>Saved Walkthroughs</h3>
        {walkthroughs.length === 0 ? (
          <p style={{ fontSize: '13px', opacity: 0.5, margin: 0 }}>No walkthroughs saved yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {walkthroughs.map(w => (
              <div key={w.id} style={{ background: '#2a2a4a', padding: '12px', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>{w.name}</div>
                  <div style={{ fontSize: '11px', opacity: 0.6, wordBreak: 'break-all' }}>{w.origin}</div>
                  <div style={{ fontSize: '11px', opacity: 0.8, marginTop: '4px', color: '#4CAF50' }}>{w.steps.length} Steps</div>
                </div>
                <button 
                  disabled={csStatus !== 'Connected'}
                  onClick={() => {
                    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
                      const tab = tabs[0];
                      if (tab?.id) {
                        try {
                          await sendTabMessage(tab.id, { type: 'PLAY_WALKTHROUGH', walkthroughId: w.id });
                          window.close();
                        } catch (e) {
                          alert("Content script not found! Please REFRESH this webpage (F5) so the extension can inject the latest code.");
                          console.error(e);
                        }
                      }
                    });
                  }}
                  style={{
                    padding: '6px', backgroundColor: csStatus === 'Connected' ? '#3742fa' : '#2a2a4a', color: 'white',
                    border: 'none', borderRadius: '4px', cursor: csStatus === 'Connected' ? 'pointer' : 'not-allowed', 
                    fontSize: '12px', fontWeight: 600, opacity: csStatus === 'Connected' ? 1 : 0.5
                  }}
                >
                  ▶ Play Walkthrough
                </button>
              </div>
            ))}
            <button 
              onClick={async () => {
                await clearWalkthroughs();
                setWalkthroughs([]);
              }}
              style={{
                marginTop: '8px', padding: '8px', backgroundColor: 'transparent', color: 'white',
                border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', cursor: 'pointer', fontSize: '12px'
              }}
            >
              Clear Storage
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
