import React, { useState } from 'react';
import { connectStrava } from '../api';
import type { ConnectPageProps } from '../types';

// const ConnectPage: React.FC<ConnectPageProps> = ({ user, thirdList }) => {
const ConnectPage: React.FC<ConnectPageProps> = ({ thirdList }) => {
  const [error, setError] = useState('');

  const handleConnect = async () => {
    try {
      await connectStrava();
    } catch (err: any) {
      setError(err.message || 'Connect failed');
    }
  };

  const isStravaConnected = thirdList.includes('strava');

  return (
    <main className="content-area">
      <div className="container">
        <div className="card">
          <h2>Connect</h2>
          <div style={{ textAlign: 'center' }}>
            <img src="/vite.svg" alt="Strava" style={{ width: 80, marginBottom: 10 }} />
            <div>
              <button className="btn" onClick={handleConnect} disabled={isStravaConnected}>
                {isStravaConnected ? 'Connected' : 'Connect to Strava'}
              </button>
            </div>
            {error && <div style={{ color: 'red' }}>{error}</div>}
          </div>
        </div>
      </div>
    </main>
  );
};
export default ConnectPage;
