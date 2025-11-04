import { useState, useEffect } from 'react';
import CostingPage from './components/CostingPage';
import RateConfiguration from './components/RateConfiguration';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('costing');
  const [rates, setRates] = useState({
    materialPerKg: 345,
    coatingPerKg: 60,
    glassPlane: 45,
    glassReflective: 75,
    lockPerTrack: 100,
    bearingPerUnit: 20,
    clampPerUnit: 20,
    glassRubberPerFeet: 8,
    woolfilePerFeet: 2,
    labourPerSqft: 50,
    fixedCharge: 30,
    mosquitoNetPerSqft: 20,
    brightBarPerUnit: 2.25,
    coverPerUnit: 1
  });

  useEffect(() => {
    // Load rates from localStorage if available
    const savedRates = localStorage.getItem('windowRates');
    if (savedRates) {
      setRates(JSON.parse(savedRates));
    }
  }, []);

  const handleRatesUpdate = (updatedRates) => {
    setRates(updatedRates);
  };

  return (
    <div className="app">
      <nav className="app-nav">
        <div className="nav-brand">
          <h1>Window Management System</h1>
        </div>
        <div className="nav-tabs">
          <button
            className={activeTab === 'costing' ? 'nav-tab active' : 'nav-tab'}
            onClick={() => setActiveTab('costing')}
          >
            Costing
          </button>
          <button
            className={activeTab === 'rates' ? 'nav-tab active' : 'nav-tab'}
            onClick={() => setActiveTab('rates')}
          >
            Rate Configuration
          </button>
        </div>
      </nav>

      <main className="app-main">
        {activeTab === 'costing' && <CostingPage rates={rates} />}
        {activeTab === 'rates' && <RateConfiguration onRatesUpdate={handleRatesUpdate} />}
      </main>
    </div>
  );
}

export default App;
