import { useState, useEffect } from 'react';
import './ToolSettings.css';

const ToolSettings = () => {
  const [settings, setSettings] = useState({
    windowCosting: {
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
    },
    doorCosting: {
      standard: {
        frameKg: 0.300,
        shutterKg: 0.250,
        hingesWeight: 0.150,
        lockWeight: 0.200,
      }
    }
  });

  const [selectedTool, setSelectedTool] = useState(null);
  const [activeTab, setActiveTab] = useState('miniDomal');

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('toolSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleChange = (toolType, subTool, key, value) => {
    const updatedSettings = {
      ...settings,
      [toolType]: {
        ...settings[toolType],
        [subTool]: {
          ...settings[toolType][subTool],
          [key]: parseFloat(value) || 0
        }
      }
    };
    setSettings(updatedSettings);
    localStorage.setItem('toolSettings', JSON.stringify(updatedSettings));
  };

  const resetToolToDefault = (toolType, subTool) => {
    const defaults = getDefaultSettings();
    const updatedSettings = {
      ...settings,
      [toolType]: {
        ...settings[toolType],
        [subTool]: defaults[toolType][subTool]
      }
    };
    setSettings(updatedSettings);
    localStorage.setItem('toolSettings', JSON.stringify(updatedSettings));
  };

  const resetAllToDefault = () => {
    const defaultSettings = getDefaultSettings();
    setSettings(defaultSettings);
    localStorage.setItem('toolSettings', JSON.stringify(defaultSettings));
  };

  const getDefaultSettings = () => {
    return {
      windowCosting: {
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
      },
      doorCosting: {
        standard: {
          frameKg: 0.300,
          shutterKg: 0.250,
          hingesWeight: 0.150,
          lockWeight: 0.200,
        }
      }
    };
  };

  const toolsList = [
    {
      id: 'windowCosting',
      name: 'Window Costing Calculator',
      icon: '🪟',
      description: 'Settings for window frame calculations (Mini Domal, Domal, Ventena)',
      color: '#667eea'
    },
    {
      id: 'doorCosting',
      name: 'Door Costing Calculator',
      icon: '🚪',
      description: 'Settings for door frame calculations',
      color: '#764ba2'
    }
  ];

  const getToolDisplayName = (tool) => {
    const names = {
      miniDomal: 'Mini Domal',
      domal: 'Domal',
      ventena: 'Ventena',
      standard: 'Standard Door'
    };
    return names[tool] || tool;
  };

  const renderToolsList = () => {
    return (
      <div className="tools-list-container">
        <div className="tools-list-header">
          <h2>Select a Tool to Configure</h2>
          <p>Choose a costing calculator to view and edit its settings</p>
        </div>
        
        <div className="tools-grid">
          {toolsList.map((tool) => (
            <div
              key={tool.id}
              className="tool-card"
              onClick={() => {
                setSelectedTool(tool.id);
                // Set default active tab based on tool
                if (tool.id === 'windowCosting') {
                  setActiveTab('miniDomal');
                } else if (tool.id === 'doorCosting') {
                  setActiveTab('standard');
                }
              }}
              style={{ '--tool-color': tool.color }}
            >
              <div className="tool-card-icon">{tool.icon}</div>
              <div className="tool-card-content">
                <h3>{tool.name}</h3>
                <p>{tool.description}</p>
              </div>
              <div className="tool-card-arrow">→</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderWindowCostingSettings = (subTool) => {
    const toolSettings = settings.windowCosting[subTool];
    
    return (
      <div className="tool-settings-content">
        <div className="tool-settings-header">
          <h3>{getToolDisplayName(subTool)} Settings</h3>
          <button 
            onClick={() => resetToolToDefault('windowCosting', subTool)} 
            className="reset-tool-btn"
          >
            Reset {getToolDisplayName(subTool)}
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
                  onChange={(e) => handleChange('windowCosting', subTool, 'outerFrameKg', e.target.value)}
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
                  onChange={(e) => handleChange('windowCosting', subTool, 'shutterFrameKg', e.target.value)}
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
                  onChange={(e) => handleChange('windowCosting', subTool, 'innerLockClipKg', e.target.value)}
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
                  onChange={(e) => handleChange('windowCosting', subTool, 'cChannelKg', e.target.value)}
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
                  onChange={(e) => handleChange('windowCosting', subTool, 'rtKg', e.target.value)}
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
                  onChange={(e) => handleChange('windowCosting', subTool, 'roundPipeKg', e.target.value)}
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
                  onChange={(e) => handleChange('windowCosting', subTool, 'outerFrameKgWithNet', e.target.value)}
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
                  onChange={(e) => handleChange('windowCosting', subTool, 'outerFrameKgWithGrill', e.target.value)}
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

  const renderDoorCostingSettings = (subTool) => {
    const toolSettings = settings.doorCosting[subTool];
    
    return (
      <div className="tool-settings-content">
        <div className="tool-settings-header">
          <h3>{getToolDisplayName(subTool)} Settings</h3>
          <button 
            onClick={() => resetToolToDefault('doorCosting', subTool)} 
            className="reset-tool-btn"
          >
            Reset {getToolDisplayName(subTool)}
          </button>
        </div>

        <div className="settings-grid">
          <div className="settings-section">
            <h4>Door Frame Settings (kg per unit)</h4>
            <div className="settings-row">
              <div className="setting-item">
                <label>Frame Weight (kg/ft)</label>
                <input
                  type="number"
                  value={toolSettings.frameKg}
                  onChange={(e) => handleChange('doorCosting', subTool, 'frameKg', e.target.value)}
                  step="0.001"
                  placeholder="0.300"
                />
                <span className="setting-hint">Main door frame weight</span>
              </div>

              <div className="setting-item">
                <label>Shutter Weight (kg/ft)</label>
                <input
                  type="number"
                  value={toolSettings.shutterKg}
                  onChange={(e) => handleChange('doorCosting', subTool, 'shutterKg', e.target.value)}
                  step="0.001"
                  placeholder="0.250"
                />
                <span className="setting-hint">Door shutter weight</span>
              </div>

              <div className="setting-item">
                <label>Hinges Weight (kg/unit)</label>
                <input
                  type="number"
                  value={toolSettings.hingesWeight}
                  onChange={(e) => handleChange('doorCosting', subTool, 'hingesWeight', e.target.value)}
                  step="0.001"
                  placeholder="0.150"
                />
                <span className="setting-hint">Weight of hinges per unit</span>
              </div>

              <div className="setting-item">
                <label>Lock Weight (kg/unit)</label>
                <input
                  type="number"
                  value={toolSettings.lockWeight}
                  onChange={(e) => handleChange('doorCosting', subTool, 'lockWeight', e.target.value)}
                  step="0.001"
                  placeholder="0.200"
                />
                <span className="setting-hint">Weight of door lock</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderToolSettings = () => {
    const currentTool = toolsList.find(t => t.id === selectedTool);
    
    return (
      <div className="tool-settings-page">
        <div className="tool-settings-breadcrumb">
          <button onClick={() => setSelectedTool(null)} className="breadcrumb-btn">
            ← Back to Tools
          </button>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">
            {currentTool?.icon} {currentTool?.name}
          </span>
        </div>

        <div className="tool-settings-header-main">
          <div>
            <h2>{currentTool?.name}</h2>
            <p className="tool-settings-subtitle">{currentTool?.description}</p>
          </div>
          <button onClick={resetAllToDefault} className="reset-all-btn">
            Reset All to Default
          </button>
        </div>

        {selectedTool === 'windowCosting' && (
          <>
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
              {renderWindowCostingSettings(activeTab)}
            </div>
          </>
        )}

        {selectedTool === 'doorCosting' && (
          <div className="tool-settings-body">
            {renderDoorCostingSettings('standard')}
          </div>
        )}

        <div className="settings-info-box">
          <h4>ℹ️ About Tool Settings</h4>
          <ul>
            <li><strong>Material Weights:</strong> All weights are specified in kilograms per feet (kg/ft)</li>
            <li><strong>Calculation Logic:</strong> These values are multiplied by the actual dimensions during cost calculation</li>
            <li><strong>Tool Specific:</strong> Each calculator has its own settings that don't affect others</li>
            <li><strong>Auto-Save:</strong> Changes are automatically saved to browser storage</li>
            <li><strong>Reset:</strong> You can reset individual settings or all tools to default values</li>
          </ul>
        </div>
      </div>
    );
  };

  return (
    <div className="tool-settings-container">
      {!selectedTool ? renderToolsList() : renderToolSettings()}
    </div>
  );
};

export default ToolSettings;
