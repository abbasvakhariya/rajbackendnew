import { useState, useEffect } from 'react';
import './RateConfiguration.css';

const RateConfiguration = ({ onRatesUpdate }) => {
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
      const parsedRates = JSON.parse(savedRates);
      setRates(parsedRates);
      if (onRatesUpdate) {
        onRatesUpdate(parsedRates);
      }
    }
  }, [onRatesUpdate]);

  const handleChange = (key, value) => {
    const updatedRates = {
      ...rates,
      [key]: parseFloat(value) || 0
    };
    setRates(updatedRates);
    localStorage.setItem('windowRates', JSON.stringify(updatedRates));
    if (onRatesUpdate) {
      onRatesUpdate(updatedRates);
    }
  };

  const resetToDefault = () => {
    const defaultRates = {
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
    };
    setRates(defaultRates);
    localStorage.setItem('windowRates', JSON.stringify(defaultRates));
    if (onRatesUpdate) {
      onRatesUpdate(defaultRates);
    }
  };

  return (
    <div className="rate-configuration">
      <div className="rate-header">
        <h2>Rate Configuration</h2>
        <button onClick={resetToDefault} className="reset-btn">
          Reset to Default
        </button>
      </div>
      
      <div className="rate-section">
        <h3>Material Rates</h3>
        <div className="rate-grid">
          <div className="rate-item">
            <label>Material per Kg (Rs)</label>
            <input
              type="number"
              value={rates.materialPerKg}
              onChange={(e) => handleChange('materialPerKg', e.target.value)}
              step="0.01"
            />
          </div>
          <div className="rate-item">
            <label>Coating per Kg (Rs)</label>
            <input
              type="number"
              value={rates.coatingPerKg}
              onChange={(e) => handleChange('coatingPerKg', e.target.value)}
              step="0.01"
            />
          </div>
        </div>
      </div>

      <div className="rate-section">
        <h3>Glass Rates</h3>
        <div className="rate-grid">
          <div className="rate-item">
            <label>Plane Glass per Sqft (Rs)</label>
            <input
              type="number"
              value={rates.glassPlane}
              onChange={(e) => handleChange('glassPlane', e.target.value)}
              step="0.01"
            />
          </div>
          <div className="rate-item">
            <label>Reflective Glass per Sqft (Rs)</label>
            <input
              type="number"
              value={rates.glassReflective}
              onChange={(e) => handleChange('glassReflective', e.target.value)}
              step="0.01"
            />
          </div>
        </div>
      </div>

      <div className="rate-section">
        <h3>Component Rates</h3>
        <div className="rate-grid">
          <div className="rate-item">
            <label>Lock per Track (Rs)</label>
            <input
              type="number"
              value={rates.lockPerTrack}
              onChange={(e) => handleChange('lockPerTrack', e.target.value)}
              step="0.01"
            />
          </div>
          <div className="rate-item">
            <label>Bearing per Unit (Rs)</label>
            <input
              type="number"
              value={rates.bearingPerUnit}
              onChange={(e) => handleChange('bearingPerUnit', e.target.value)}
              step="0.01"
            />
          </div>
          <div className="rate-item">
            <label>Clamp per Unit (Rs)</label>
            <input
              type="number"
              value={rates.clampPerUnit}
              onChange={(e) => handleChange('clampPerUnit', e.target.value)}
              step="0.01"
            />
          </div>
          <div className="rate-item">
            <label>Glass Rubber per Feet (Rs)</label>
            <input
              type="number"
              value={rates.glassRubberPerFeet}
              onChange={(e) => handleChange('glassRubberPerFeet', e.target.value)}
              step="0.01"
            />
          </div>
          <div className="rate-item">
            <label>Woolfile per Feet (Rs)</label>
            <input
              type="number"
              value={rates.woolfilePerFeet}
              onChange={(e) => handleChange('woolfilePerFeet', e.target.value)}
              step="0.01"
            />
          </div>
          <div className="rate-item">
            <label>Labour per Sqft (Rs)</label>
            <input
              type="number"
              value={rates.labourPerSqft}
              onChange={(e) => handleChange('labourPerSqft', e.target.value)}
              step="0.01"
            />
          </div>
        </div>
      </div>

      <div className="rate-section">
        <h3>Additional Charges</h3>
        <div className="rate-grid">
          <div className="rate-item">
            <label>Fixed Charge per Window (Rs)</label>
            <input
              type="number"
              value={rates.fixedCharge || 30}
              onChange={(e) => handleChange('fixedCharge', e.target.value)}
              step="0.01"
            />
          </div>
          <div className="rate-item">
            <label>Mosquito Net per Sqft (Rs)</label>
            <input
              type="number"
              value={rates.mosquitoNetPerSqft || 20}
              onChange={(e) => handleChange('mosquitoNetPerSqft', e.target.value)}
              step="0.01"
            />
          </div>
          <div className="rate-item">
            <label>Bright Bar per Unit (Rs)</label>
            <input
              type="number"
              value={rates.brightBarPerUnit || 2.25}
              onChange={(e) => handleChange('brightBarPerUnit', e.target.value)}
              step="0.01"
            />
          </div>
          <div className="rate-item">
            <label>Cover per Unit (Rs)</label>
            <input
              type="number"
              value={rates.coverPerUnit || 1}
              onChange={(e) => handleChange('coverPerUnit', e.target.value)}
              step="0.01"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RateConfiguration;

