import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AIAssistant from '../components/ai-assistant/AIAssistant';
import GooglePeek from '../components/magic-tricks/GooglePeek';
import MindReader from '../components/magic-tricks/MindReader';
import './styles/index.css';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AIAssistant />} />
        <Route path="/magic-tricks/google-peek" element={<GooglePeek />} />
        <Route path="/magic-tricks/google-peek/magician" element={<GooglePeek role="magician" />} />
        <Route path="/magic-tricks/google-peek/spectator" element={<GooglePeek role="spectator" />} />
        <Route path="/magic-tricks/mind-reader" element={<MindReader />} />
        <Route path="/settings" element={<div>Settings</div>} />
      </Routes>
    </Router>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
); 