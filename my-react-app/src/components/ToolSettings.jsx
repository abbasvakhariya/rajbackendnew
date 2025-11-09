import { useState, useEffect } from 'react';
import './ToolSettings.css';

const ToolSettings = () => {
  const [settings, setSettings] = useState({
    miniDomal: {
      outerFrameKg: 0.200,
      shutterFrameKg: 0.175,
      innerLockClipKg: 0.0625,
      cChannelKg: 0.0625,
      rtKg: 0.125,
      roundPipeKg: 0.0625,
      outerFrameKgWithNet: 0.26875,
      outerFrameKgWithGrill: 0.2625,
    },
    domal: {
      outerFrameKg: 0.250,
      shutterFrameKg: 0.200,
      innerLockClipKg: 0.0750,
      cChannelKg: 0.0750,
      rtKg: 0.150,
      roundPipeKg: 0.0750,
      outerFrameKgWithNet: 0.300,
      outerFrameKgWithGrill: 0.290,
    },
    ventena: {
      outerFrameKg: 0.180,
      shutterFrameKg: 0.160,
      innerLockClipKg: 0.0500,
      cChannelKg: 0.0500,
      rtKg: 0.100,
      roundPipeKg: 0.0500,
      outerFrameKgWithNet: 0.240,
      outerFrameKgWithGrill: 0.230,
    }
  });

  const [activeTab, setActiveTab] = useState('miniDomal');

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('toolSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleChange = (tool, key, value) => {
    const updatedSettings = {
      ...settings,
      [tool]: {
        ...settings[tool],
        [key]: parseFloat(value) || 0
      }
    };
    setSettings(updatedSettings);
    localStorage.setItem('toolSettings', JSON.stringify(updatedSettings));
  };

  const resetToDefault = (tool) => {
    const defaultSettings = {
      miniDomal: {
        outerFrameKg: 0.200,
        shutterFrameKg: 0.175,
        innerLockClipKg: 0.0625,
        cChannelKg: 0.0625,
        rtKg: 0.125,
        roundPipeKg: 0.0625,
        outerFrameKgWithNet: 0.26875,
        outerFrameKgWithGrill: 0.2625,
      },
      domal: {
        outerFrameKg: 0.250,
        shutterFrameKg: 0.200,
        innerLockClipKg: 0.0750,
        cChannelKg: 0.0750,
        rtKg: 0.150,
        roundPipeKg: 0.0750,
        outerFrameKgWithNet: 0.300,
        outerFrameKgWithGrill: 0.290,
      },
      ventena: {
        outerFrameKg: 0.180,
        shutterFrameKg: 0.160,
        innerLockClipKg: 0.0500,
        cChannelKg: 0.0500,
        rtKg: 0.100,
        roundPipeKg: 0.0500,
        outerFrameKgWithNet: 0.240,
        outerFrameKgWithGrill: 0.230,
      }
    };

    const updatedSettings = {
      ...settings,
      [tool]: defaultSettings[tool]
    };
    setSettings(updatedSettings);
    localStorage.setItem('toolSettings', JSON.stringify(updatedSettings));
  };

  const resetAllToDefault = () => {
    const defaultSettings = {
      miniDomal: {
        outerFrameKg: 0.200,
        shutterFrameKg: 0.175,
        innerLockClipKg: 0.0625,
        cChannelKg: 0.0625,
        rtKg: 0.125,
        roundPipeKg: 0.0625,
        outerFrameKgWithNet: 0.26875,
        outerFrameKgWithGrill: 0.2625,
      },
      domal: {
        outerFrameKg: 0.250,
        shutterFrameKg: 0.200,
        innerLockClipKg: 0.0750,
        cChannelKg: 0.0750,
        rtKg: 0.150,
        roundPipeKg: 0.0750,
        outerFrameKgWithNet: 0.300,
        outerFrameKgWithGrill: 0.290,
      },
      ventena: {
        outerFrameKg: 0.180,
        shutterFrameKg: 0.160,
        innerLockClipKg: 0.0500,
        cChannelKg: 0.0500,
        rtKg: 0.100,
        roundPipeKg: 0.0500,
        outerFrameKgWithNet: 0.240,
        outerFrameKgWithGrill: 0.230,
      }
    };
    setSettings(defaultSettings);
    localStorage.setItem('toolSettings', JSON.stringify(defaultSettings));
  };

  const getToolDisplayName = (tool) => {
    const names = {
      miniDomal: 'Mini Domal',
      domal: 'Domal',
      ventena: 'Ventena'
    };
    return names[tool] || tool;
  };

  const renderToolSettings = (tool) => {
    const toolSettings = settings[tool];
    
    return (
      <div className="tool-settings-content">
        <div className="tool-settings-header">
          <h3>{getToolDisplayName(tool)} Settings</h3>
          <button 
            onClick={() => resetToDefault(tool)} 
            className="reset-tool-btn"
          >
            Reset {getToolDisplayName(tool)}
          </button>
        </div>

        <div className="settings-grid">
          <div className="settings-section">
            <h4>Standard Frame Settings (kg per feet)</h4>
            <div className="settings-row">
              <div className="setting-item">
                <label>Outer Frame Weight (kg/ft)</label>
                <input
                  type="number"
                  value={toolSettings.outerFrameKg}
                  onChange={(e) => handleChange(tool, 'outerFrameKg', e.target.value)}
                  step="0.0001"
                  placeholder="0.2000"
                />
                <span className="setting-hint">Used in standard 2-track windows</span>
              </div>

              <div className="setting-item">
                <label>Shutter Frame Weight (kg/ft)</label>
                <input
                  type="number"
                  value={toolSettings.shutterFrameKg}
                  onChange={(e) => handleChange(tool, 'shutterFrameKg', e.target.value)}
                  step="0.0001"
                  placeholder="0.1750"
                />
                <span className="setting-hint">Weight per feet of shutter frame</span>
              </div>

              <div className="setting-item">
                <label>Inner Lock Clip Weight (kg/ft)</label>
                <input
                  type="number"
                  value={toolSettings.innerLockClipKg}
                  onChange={(e) => handleChange(tool, 'innerLockClipKg', e.target.value)}
                  step="0.0001"
                  placeholder="0.0625"
                />
                <span className="setting-hint">Weight per feet of inner lock clip</span>
              </div>

              <div className="setting-item">
                <label>C-Channel Weight (kg/ft)</label>
                <input
                  type="number"
                  value={toolSettings.cChannelKg}
                  onChange={(e) => handleChange(tool, 'cChannelKg', e.target.value)}
                  step="0.0001"
                  placeholder="0.0625"
                />
                <span className="setting-hint">Used in mosquito net windows</span>
              </div>
            </div>
          </div>

          <div className="settings-section">
            <h4>Grill & Special Components (kg per feet)</h4>
            <div className="settings-row">
              <div className="setting-item">
                <label>RT Weight (kg/ft)</label>
                <input
                  type="number"
                  value={toolSettings.rtKg}
                  onChange={(e) => handleChange(tool, 'rtKg', e.target.value)}
                  step="0.0001"
                  placeholder="0.1250"
                />
                <span className="setting-hint">RT component for grill windows</span>
              </div>

              <div className="setting-item">
                <label>Round Pipe Weight (kg/ft)</label>
                <input
                  type="number"
                  value={toolSettings.roundPipeKg}
                  onChange={(e) => handleChange(tool, 'roundPipeKg', e.target.value)}
                  step="0.0001"
                  placeholder="0.0625"
                />
                <span className="setting-hint">Weight per feet of round pipe for grill</span>
              </div>
            </div>
          </div>

          <div className="settings-section">
            <h4>Special Window Types</h4>
            <div className="settings-row">
              <div className="setting-item">
                <label>Outer Frame (with Mosquito Net) (kg/ft)</label>
                <input
                  type="number"
                  value={toolSettings.outerFrameKgWithNet}
                  onChange={(e) => handleChange(tool, 'outerFrameKgWithNet', e.target.value)}
                  step="0.0001"
                  placeholder="0.26875"
                />
                <span className="setting-hint">Outer frame weight for mosquito net windows</span>
              </div>

              <div className="setting-item">
                <label>Outer Frame (with Grill) (kg/ft)</label>
                <input
                  type="number"
                  value={toolSettings.outerFrameKgWithGrill}
                  onChange={(e) => handleChange(tool, 'outerFrameKgWithGrill', e.target.value)}
                  step="0.0001"
                  placeholder="0.2625"
                />
                <span className="setting-hint">Outer frame weight for grill windows</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="tool-settings-page">
      <div className="tool-settings-header-main">
        <div>
          <h2>Tool Settings</h2>
          <p className="tool-settings-subtitle">
            Configure material weights and calculations for each window type
          </p>
        </div>
        <button onClick={resetAllToDefault} className="reset-all-btn">
          Reset All to Default
        </button>
      </div>

      <div className="tool-settings-tabs">
        <button
          className={`tab-button ${activeTab === 'miniDomal' ? 'active' : ''}`}
          onClick={() => setActiveTab('miniDomal')}
        >
          <span className="tab-icon">🪟</span>
          Mini Domal
        </button>
        <button
          className={`tab-button ${activeTab === 'domal' ? 'active' : ''}`}
          onClick={() => setActiveTab('domal')}
        >
          <span className="tab-icon">🏠</span>
          Domal
        </button>
        <button
          className={`tab-button ${activeTab === 'ventena' ? 'active' : ''}`}
          onClick={() => setActiveTab('ventena')}
        >
          <span className="tab-icon">🌬️</span>
          Ventena
        </button>
      </div>

      <div className="tool-settings-body">
        {renderToolSettings(activeTab)}
      </div>

      <div className="settings-info-box">
        <h4>ℹ️ About Tool Settings</h4>
        <ul>
          <li><strong>Material Weights:</strong> All weights are specified in kilograms per feet (kg/ft)</li>
          <li><strong>Calculation Logic:</strong> These values are multiplied by the actual dimensions during cost calculation</li>
          <li><strong>Tool Types:</strong> Each window type (Mini Domal, Domal, Ventena) can have different material weights</li>
          <li><strong>Auto-Save:</strong> Changes are automatically saved to browser storage</li>
          <li><strong>Reset:</strong> You can reset individual tools or all tools to default values</li>
        </ul>
      </div>
    </div>
  );
};

export default ToolSettings;

