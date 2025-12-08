import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './features/auth/pages/LoginPage';
import RegisterPage from './features/auth/pages/RegisterPage';
import DashboardPage from './features/dashboard/pages/DashboardPage';
import ChatPage from './features/chat/pages/ChatPage';
import ProfilePage from './features/profile/pages/ProfilePage';
import PartsViewerPage from './features/parts-viewer/pages/PartsViewerPage';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/chat/:chatId" element={<ChatPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/parts-viewer" element={<PartsViewerPage />} />
      </Routes>
    </Router>
  );
}

export default App;
