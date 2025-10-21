import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signup } from '../api';

const SignupPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [name, setName] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await signup(email, pwd, name);
      setResult(res ? 'Signup successful' : 'Signup failed');
      setTimeout(() => navigate('/login'), 1200);
    } catch {
      setResult('Signup failed');
    }
  };

  return (
    <main className="content-area">
      <div className="container">
        <div className="card" style={{maxWidth:420, margin:'0 auto'}}>
          <h2>Signup</h2>
          <form onSubmit={handleSignup} style={{display:'flex',flexDirection:'column',gap:12}}>
            <input className="input" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
            <input className="input" type="password" placeholder="Password" value={pwd} onChange={e => setPwd(e.target.value)} required />
            <input className="input" type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} required />
            <button className="btn" type="submit">Signup</button>
          </form>
          {result && <div style={{marginTop:12}}>{result}</div>}
        </div>
      </div>
    </main>
  );
};
export default SignupPage;
