import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate} from 'react-router-dom';
import { loginWithToken, logout } from './api.ts';
import './App.css'

// Placeholder pages
import MainPage from './pages/MainPage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import SignupPage from './pages/SignupPage.tsx';
import ConnectPage from './pages/ConnectPage.tsx';
import TrainingPage from './pages/TrainingPage.tsx';
import FeedPage from './pages/FeedPage';
import CallbackPage from './pages/CallbackPage.tsx';
import StravaCallback from './pages/StravaCallbackPage.tsx';
import TrainingDetailPage from './pages/TrainingDetailPage';
import UserPage from './pages/UserPage';
import AnalysisPage from './pages/AnalysisPage';
import TrainingAddPage from './pages/TrainingAddPage';

// Top bar component
const TopBar = ({ user, onLogout, onLogin }: { user: any, onLogout: () => void , onLogin: ()=> void}) => (
    <header className="topbar">
        <div className="topbar-inner">
            <div className="brand">Personal Running Coach</div>
            <div className="topbar-actions">
                {user ? (
                    <>
                        <span className="topbar-user">{user.name}</span>
                        <button className="btn btn--ghost" onClick={onLogout}>Logout</button>
                    </>
                ) : (
                    <>
                        <button className="btn" onClick={onLogin}>Log In</button>
                    </>
                )}
            </div>
        </div>
    </header>
);

// Left nav bar component
const LeftNav = () => (
    <nav className="leftnav" aria-label="Main navigation">
        <ul className="leftnav-list">
            <li><Link className="nav-link" to="/">Main</Link></li>
            <li><Link className="nav-link" to="/user">User Profile</Link></li>
            <li><Link className="nav-link" to="/signup">Signup</Link></li>
            <li><Link className="nav-link" to="/connect">Connect</Link></li>
            <li><Link className="nav-link" to="/training">Training</Link></li>
            <li><Link className="nav-link" to="/feed">Feed</Link></li>
            <li><Link className="nav-link" to="/analysis">Analysis</Link></li>
        </ul>
    </nav>
);

const App: React.FC = () => {
    const [user, setUser] = useState<any>(null);
    const [thirdList, setThirdList] = useState<string[]>([]);

    const navigate = useNavigate();

    useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
        loginWithToken()
        .then(res => {
            setUser(res.user);
            setThirdList(res.connected);
            if (res.token){
                localStorage.setItem("access_token", res.token.access_token);
            }
        })
        .catch(() => {
            handleLogout()
        });
    }
    }, []);


    const handleLogout = async () => {
        setUser(null);
        setThirdList([]);
        const device_id = localStorage.getItem("device_id") || "";
        await logout(device_id);
        
        localStorage.removeItem("access_token");
        localStorage.removeItem("device_id");
        sessionStorage.clear();

        navigate("/");
    };

    const handleLogin = () => {
        navigate("/login");
        // Optionally clear tokens from storage
    };

    return (
        <div className="app-root">
            <TopBar user={user} onLogout={handleLogout} onLogin={handleLogin}/>
            <div className="app-body">
                <LeftNav />
                <main className="content-area">
                    <Routes>
                        <Route path="/" element={<MainPage />} />
                        <Route path="/user" element={<UserPage />} />
                        <Route path="/auth/google/callback" element={<CallbackPage setUser={setUser} 
                                                                                    setThirdList={setThirdList}/>} />
                        <Route path="/auth/strava/callback" element={<StravaCallback setThirdList={setThirdList}/>} />
                        <Route path="/login" element={<LoginPage setUser={setUser} 
                                                                setThirdList={setThirdList}/>} />
                        <Route path="/signup" element={<SignupPage />} />
                        <Route path="/connect" element={<ConnectPage thirdList={thirdList}/>} />
                        <Route path="/training" element={<TrainingPage />} />
                        <Route path="/training/add" element={<TrainingAddPage user={user} />} />
                        <Route path="/training/:session_id" element={<TrainingDetailPage />} />
                        <Route path="/feed" element={<FeedPage user={user} />} />
                        <Route path="/analysis" element={<AnalysisPage />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
};

export default App;
