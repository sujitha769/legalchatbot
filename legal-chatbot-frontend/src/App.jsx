import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Header from './components/Header';
import ChatWindow from './components/ChatWindow';
import FIRDrafterPage from './components/FIRDrafterPage'; // Add this import
import './App.css';

const ChatPage = () => {
  return (
    <div className="app">
      <Header />
      <ChatWindow />
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/fir-drafter" element={<FIRDrafterPage />} /> {/* Add this route */}
      </Routes>
    </Router>
  );
};

export default App;