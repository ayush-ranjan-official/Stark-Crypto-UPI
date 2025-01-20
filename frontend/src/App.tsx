import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import HomeScreen from './components/HomeScreen';
import ForeignerPage from './components/ForeignerPage';
import SolverPage from './components/SolverPage';
import Solver1Page from './components/Solver1Page';
import Solver2Page from './components/Solver2Page';
import QRScanner from './components/QRScanner';
import ChatAgent from './components/ChatAgent';

function App() {
  return (
    <Router>
      <div className="fixed inset-0 bg-gray-900 overflow-hidden">
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/user" element={<ForeignerPage />} />
          <Route path="/scan-qr" element={<QRScanner />} />
          <Route path="/chat-agent" element={<ChatAgent />} />
          <Route path="/solver" element={<SolverPage />} />
          <Route path="/solver1" element={<Solver1Page />} />
          <Route path="/solver2" element={<Solver2Page />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;