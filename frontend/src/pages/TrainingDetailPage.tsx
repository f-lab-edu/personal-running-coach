import React, { useEffect, useState, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { fetchTrainDetail, deleteTrainSession, createFeed } from '../api';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Legend,
  Tooltip,
} from 'chart.js';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Legend, Tooltip);

import type { StreamData, TrainDetail } from '../types';

const plotFields: { key: keyof StreamData; label: string; color: string }[] = [
  { key: 'heartrate', label: 'Heart Rate', color: 'red' },
  { key: 'cadence', label: 'Cadence', color: 'blue' },
  { key: 'distance', label: 'Distance', color: 'green' },
  { key: 'velocity', label: 'Velocity', color: 'orange' },
  { key: 'altitude', label: 'Altitude', color: 'purple' },
];

const TrainingDetailPage: React.FC = () => {
  const { session_id } = useParams<{ session_id: string }>();
  const location = useLocation();
  const passedSession = (location.state as any)?.session as Partial<TrainDetail> | undefined;
  const [detail, setDetail] = useState<TrainDetail | null>();
  const [loading, setLoading] = useState(!passedSession);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const noteRef = useRef<HTMLTextAreaElement>(null);
  const [sharing, setSharing] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);

  useEffect(() => {
    if (!session_id) return;
    if (passedSession && passedSession.stream) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchTrainDetail(session_id)
      .then(({status, data}) => {
        if (status !== 200) {
          setError(`API error ${status} ${data}`);
          console.log(`API error ${status} ${data}`);
        }  
        setDetail(data)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [session_id, passedSession]);

  // Delete handler
  const handleDelete = async () => {
    if (!session_id) return;
    setDeleting(true);
    try {
      const { status } = await deleteTrainSession(session_id);
      if (status === 200) {
        alert('Deleted successfully');
        window.location.href = '/training';
      } else {
        setError('Delete failed: ' + status);
      }
    } catch (e:any) {
      setError(e.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  // Share handler
  const handleShare = async () => {
    if (!detail) return;
    setSharing(true);
    setShareError(null);
    try {
      const trainDate = String(detail.train_date || passedSession?.train_date || '');
      const feedData = {
        train_date: trainDate,
        title: detail.activity_title || passedSession?.activity_title || 'Training',
        train_summary: detail.analysis_result || passedSession?.analysis_result || '',
        note: noteRef.current?.value || '',
      };
      const { status } = await createFeed(feedData);
      if (status === 200 || status === 201) {
        setShowModal(false);
        if (noteRef.current) noteRef.current.value = '';
        alert('Feed shared successfully!');
      } else {
        setShareError('Failed to share feed.');
      }
    } catch (e:any) {
      setShareError(e.message || 'Failed to share feed.');
    } finally {
      setSharing(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!detail) return <div>No data found.</div>;
  const { stream, laps } = detail;

  // Session summary (from passedSession or fetched detail)
  const summary = (
    <div style={{ position: 'relative', marginBottom: 24 }}>
      <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 8, zIndex: 2 }}>
        <button
          style={{ padding: '8px 16px', background: '#1976d2', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 600 }}
          onClick={() => setShowModal(true)}
        >
          Share
        </button>
        <button
          style={{ padding: '8px 16px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 600 }}
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
      <div style={{ background: '#f8f8f8', padding: 16, borderRadius: 8 }}>
        <h2>Training Summary</h2>
        <div><b>분석 결과:</b> {passedSession?.analysis_result || '-'}</div>
        <div><b>일자:</b> {passedSession?.train_date}</div>
        <div><b>거리:</b> {passedSession?.distance ?? '-'} m</div>
        <div><b>평균 속도:</b> {passedSession?.avg_speed ?? '-'} m/s</div>
        <div><b>총 시간:</b> {passedSession?.total_time ?? '-'} 초</div>
      </div>
      {/* Share Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 8, padding: 32, minWidth: 340, boxShadow: '0 2px 16px #aaa', position: 'relative' }}>
            <h3 style={{ marginBottom: 18 }}>Create Feed</h3>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontWeight: 500 }}>Train Date</label>
              <div style={{ padding: '8px 0', color: '#333', background: '#f5f5f5', borderRadius: 4 }}>{String(detail?.train_date || passedSession?.train_date)}</div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontWeight: 500 }}>Title</label>
              <div style={{ padding: '8px 0', color: '#333', background: '#f5f5f5', borderRadius: 4 }}>{detail?.activity_title || passedSession?.activity_title || 'Training'}</div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontWeight: 500 }}>Summary</label>
              <div style={{ padding: '8px 0', color: '#333', background: '#f5f5f5', borderRadius: 4 }}>{detail?.analysis_result || passedSession?.analysis_result || ''}</div>
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontWeight: 500 }}>Note</label>
              <textarea
                ref={noteRef}
                rows={3}
                style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc', resize: 'vertical' }}
                placeholder="Add your comments..."
              />
            </div>
            {shareError && <div style={{ color: 'red', marginBottom: 10 }}>{shareError}</div>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                onClick={() => setShowModal(false)}
                style={{ padding: '8px 16px', borderRadius: 4, background: '#eee', color: '#333', border: 'none', cursor: 'pointer' }}
                disabled={sharing}
              >Cancel</button>
              <button
                onClick={handleShare}
                style={{ padding: '8px 16px', borderRadius: 4, background: '#1976d2', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                disabled={sharing}
              >{sharing ? 'Sharing...' : 'Share'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Lap data print (if present)
  const lapSection = laps ? (
    <div style={{ marginBottom: 32 }}>
      <h3>Lap Data</h3>
      <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 4, maxHeight: 300, overflow: 'auto' }}>
        {JSON.stringify(laps, null, 2)}
      </pre>
    </div>
  ) : null;

  // Stream graphs
  const streamSection = stream ? (
    <div style={{ marginTop: 32 }}>
      <h3>Stream Data</h3>
      {plotFields.map(({ key, label, color }) =>
        stream[key] && Array.isArray(stream[key]) && stream[key]!.length > 0 ? (
          <div key={key} style={{ marginBottom: 32 }}>
            <b>{label}</b>
            <Line
              data={{
                labels: stream.time?.slice(0, stream[key]!.length) ?? stream[key]!.map((_, i) => i),
                datasets: [
                  {
                    label,
                    data: stream[key]!,
                    borderColor: color,
                    backgroundColor: color + '33',
                    fill: false,
                    tension: 0.2,
                    pointRadius: 0,
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                  x: { title: { display: true, text: stream.time ? 'Time (s)' : 'Index' } },
                  y: { title: { display: true, text: label } },
                },
              }}
              height={120}
            />
          </div>
        ) : null
      )}
    </div>
  ) : null;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
      {summary}
      {lapSection}
      {streamSection}
    </div>
  );
};

export default TrainingDetailPage;
