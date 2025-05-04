import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AIAssistant from '../components/ai-assistant/AIAssistant';
import './styles/index.css';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AIAssistant />} />
        <Route path="/magic-tricks" element={<div>Magic Tricks</div>} />
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