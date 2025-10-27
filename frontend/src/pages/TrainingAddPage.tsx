import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { postNewSchedule } from '../api';

interface TrainingAddPageProps {
  user: any;
}


const TrainingAddPage: React.FC<TrainingAddPageProps> = ({ user }) => {
  const navigate = useNavigate();
  // helper to get local datetime-local string (YYYY-MM-DDTHH:mm)
  const toLocalDatetimeInput = (d: Date) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const [form, setForm] = useState({
    provider: 'local',
    train_date: toLocalDatetimeInput(new Date()), // local 'YYYY-MM-DDTHH:mm' for datetime-local
  distance: '', // integer only
  hour: '', // integer only
  minute: '', // integer only
  second: '', // integer only
    activity_title: '',
    detail: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Only allow integer for distance, hour, minute, second
    if (["distance", "hour", "minute", "second"].includes(name)) {
      if (value === '' || /^\d+$/.test(value)) {
        setForm({ ...form, [name]: value });
      }
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      // Prepare data for backend (convert to correct types)
      const h = form.hour && form.hour !== '' ? parseInt(form.hour) : 0;
      const m = form.minute && form.minute !== '' ? parseInt(form.minute) : 0;
      const s = form.second && form.second !== '' ? parseInt(form.second) : 0;
      const totalSeconds = h * 3600 + m * 60 + s;
      // const distanceNum = form.distance ? parseInt(form.distance) : undefined;
      const distanceNum = parseInt(form.distance);
      let avgSpeed: number | undefined = undefined;
      let paceStr: string | undefined = undefined;
      if (distanceNum && totalSeconds && totalSeconds > 0) {
        avgSpeed = distanceNum / (totalSeconds / 3600); // km/h
        // Calculate pace (min/km)
        const paceSecPerKm = totalSeconds / distanceNum;
        const paceMin = Math.floor(paceSecPerKm / 60);
        const paceSec = Math.round(paceSecPerKm % 60);
        paceStr = `${paceMin}:${paceSec.toString().padStart(2, '0')}/km`;
      }
      // Prepare request body
      const reqBody = {
        user_id: user?.id,
        provider: form.provider,
        // convert local datetime-local string to UTC ISO before sending
        train_date: new Date(form.train_date).toISOString(),
        avg_speed: avgSpeed,
        distance: distanceNum * 1000,
        total_time: totalSeconds,
        activity_title: form.activity_title,
        analysis_result: form.detail,
      };
      const {status, data} = await postNewSchedule(reqBody);
      if (status !== 200) setError(`failed adding new schedule ${data?.detail}`);
      else { 
        alert('Added successfully.');
        navigate('/training');
      
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to add training session');
    }
  };

  return (
    <main className="content-area">
      <div className="container">
        <div className="card" style={{maxWidth:700, margin:'0 auto'}}>
          <h2>Add Training Session</h2>
          <form onSubmit={handleSubmit}>
        {/* <div>
          <label>User ID</label>
          <input name="user_id" value={user?.id || ''} disabled style={{ width: '100%' }} />
        </div>
        <div>
          <label>Provider</label>
          <input name="provider" value={form.provider} disabled style={{ width: '100%' }} />
        </div> */}
        <div>
          <label>Train Date</label>
          <input
            className="input"
            type="datetime-local"
            name="train_date"
            value={form.train_date}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Distance (km)</label>
          <input
            className="input"
            name="distance"
            value={form.distance}
            onChange={handleChange}
            required
            inputMode="numeric"
            pattern="\d*"
            placeholder="e.g. 5"
          />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1 }}>
            <label>Hour</label>
            <input
              className="input"
              name="hour"
              value={form.hour}
              onChange={handleChange}
              inputMode="numeric"
              pattern="\d*"
              placeholder="0"
            />
          </div>
          <div style={{ flex: 1 }}>
            <label>Minute</label>
            <input
              className="input"
              name="minute"
              value={form.minute}
              onChange={handleChange}
              inputMode="numeric"
              pattern="\d*"
              placeholder="0"
            />
          </div>
          <div style={{ flex: 1 }}>
            <label>Second</label>
            <input
              className="input"
              name="second"
              value={form.second}
              onChange={handleChange}
              inputMode="numeric"
              pattern="\d*"
              placeholder="0"
            />
          </div>
        </div>
        <div>
          <label>Activity Title</label>
          <input className="input" name="activity_title" value={form.activity_title} onChange={handleChange} />
        </div>
        <div>
          <label>Detail</label>
          <textarea className="input" name="detail" value={form.detail} onChange={handleChange} />
        </div>
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <div style={{display:'flex', gap:8, marginTop:12}}>
          <button className="btn" type="submit">Add</button>
          <button className="btn btn--ghost" type="button" onClick={() => navigate('/training')}>Cancel</button>
        </div>
          </form>
        </div>
      </div>
    </main>
  );
}

export default TrainingAddPage;
