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
    },
    cuttingMeasuring: {
      profiles: {}
    }
  });

  const [selectedTool, setSelectedTool] = useState(null);
  const [activeTab, setActiveTab] = useState('miniDomal');
  
  // Cutting Measuring Tool states
  const [showAddProfileModal, setShowAddProfileModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [newProfile, setNewProfile] = useState({
    name: '',
    top: 0,
    bottom: 0,
    handleInnerLock: 0,
    interLock: 0,
    bearingBottom: 0,
    glass: 0
  });

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

  // Cutting Measuring Tool functions
  const handleAddProfile = () => {
    if (!newProfile.name.trim()) {
      alert('Please enter a profile name');
      return;
    }
    
    const updatedSettings = {
      ...settings,
      cuttingMeasuring: {
        ...settings.cuttingMeasuring,
        profiles: {
          ...settings.cuttingMeasuring.profiles,
          [newProfile.name]: {
            top: parseFloat(newProfile.top) || 0,
            bottom: parseFloat(newProfile.bottom) || 0,
            handleInnerLock: parseFloat(newProfile.handleInnerLock) || 0,
            interLock: parseFloat(newProfile.interLock) || 0,
            bearingBottom: parseFloat(newProfile.bearingBottom) || 0,
            glass: parseFloat(newProfile.glass) || 0
          }
        }
      }
    };
    
    setSettings(updatedSettings);
    localStorage.setItem('toolSettings', JSON.stringify(updatedSettings));
    setShowAddProfileModal(false);
    setNewProfile({
      name: '',
      top: 0,
      bottom: 0,
      handleInnerLock: 0,
      interLock: 0,
      bearingBottom: 0,
      glass: 0
    });
  };

  const handleEditProfile = (profileName) => {
    const profile = settings.cuttingMeasuring.profiles[profileName];
    setEditingProfile(profileName);
    setNewProfile({
      name: profileName,
      ...profile
    });
    setShowAddProfileModal(true);
  };

  const handleUpdateProfile = () => {
    if (!newProfile.name.trim()) {
      alert('Please enter a profile name');
      return;
    }
    
    const updatedProfiles = { ...settings.cuttingMeasuring.profiles };
    
    // Remove old profile if name changed
    if (editingProfile && editingProfile !== newProfile.name) {
      delete updatedProfiles[editingProfile];
    }
    
    updatedProfiles[newProfile.name] = {
      top: parseFloat(newProfile.top) || 0,
      bottom: parseFloat(newProfile.bottom) || 0,
      handleInnerLock: parseFloat(newProfile.handleInnerLock) || 0,
      interLock: parseFloat(newProfile.interLock) || 0,
      bearingBottom: parseFloat(newProfile.bearingBottom) || 0,
      glass: parseFloat(newProfile.glass) || 0
    };
    
    const updatedSettings = {
      ...settings,
      cuttingMeasuring: {
        ...settings.cuttingMeasuring,
        profiles: updatedProfiles
      }
    };
    
    setSettings(updatedSettings);
    localStorage.setItem('toolSettings', JSON.stringify(updatedSettings));
    setShowAddProfileModal(false);
    setEditingProfile(null);
    setNewProfile({
      name: '',
      top: 0,
      bottom: 0,
      handleInnerLock: 0,
      interLock: 0,
      bearingBottom: 0,
      glass: 0
    });
  };

  const handleDeleteProfile = (profileName) => {
    if (window.confirm(`Are you sure you want to delete profile "${profileName}"?`)) {
      const updatedProfiles = { ...settings.cuttingMeasuring.profiles };
      delete updatedProfiles[profileName];
      
      const updatedSettings = {
        ...settings,
        cuttingMeasuring: {
          ...settings.cuttingMeasuring,
          profiles: updatedProfiles
        }
      };
      
      setSettings(updatedSettings);
      localStorage.setItem('toolSettings', JSON.stringify(updatedSettings));
    }
  };

  const handleCancelProfile = () => {
    setShowAddProfileModal(false);
    setEditingProfile(null);
    setNewProfile({
      name: '',
      top: 0,
      bottom: 0,
      handleInnerLock: 0,
      interLock: 0,
      bearingBottom: 0,
      glass: 0
    });
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
      },
      cuttingMeasuring: {
        profiles: {}
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
    },
    {
      id: 'cuttingMeasuring',
      name: 'Cutting Measuring Tool',
      icon: '📏',
      description: 'Create profiles with material cutting specifications',
      color: '#f59e0b'
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

  const renderCuttingMeasuringTool = () => {
    const profiles = settings.cuttingMeasuring.profiles;
    const profileNames = Object.keys(profiles);

    return (
      <div className="tool-settings-body">
        <div className="cutting-tool-content">
          <div className="profiles-header">
            <div>
              <h3>Material Cutting Profiles</h3>
              <p className="profiles-subtitle">Create and manage profiles with material specifications</p>
            </div>
            <button 
              onClick={() => setShowAddProfileModal(true)} 
              className="add-profile-btn"
            >
              + Create New Profile
            </button>
          </div>

          {profileNames.length === 0 ? (
            <div className="no-profiles-message">
              <span className="no-profiles-icon">📏</span>
              <h4>No Profiles Created Yet</h4>
              <p>Click "Create New Profile" to add your first material cutting profile</p>
            </div>
          ) : (
            <div className="profiles-grid">
              {profileNames.map((profileName) => {
                const profile = profiles[profileName];
                return (
                  <div key={profileName} className="profile-card">
                    <div className="profile-card-header">
                      <h4>{profileName}</h4>
                      <div className="profile-actions">
                        <button 
                          onClick={() => handleEditProfile(profileName)} 
                          className="profile-edit-btn"
                          title="Edit Profile"
                        >
                          ✏️
                        </button>
                        <button 
                          onClick={() => handleDeleteProfile(profileName)} 
                          className="profile-delete-btn"
                          title="Delete Profile"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    <div className="profile-card-body">
                      <div className="profile-spec-row">
                        <span className="spec-label">Top:</span>
                        <span className="spec-value">{profile.top}</span>
                      </div>
                      <div className="profile-spec-row">
                        <span className="spec-label">Bottom:</span>
                        <span className="spec-value">{profile.bottom}</span>
                      </div>
                      <div className="profile-spec-row">
                        <span className="spec-label">Handle Inner Lock:</span>
                        <span className="spec-value">{profile.handleInnerLock}</span>
                      </div>
                      <div className="profile-spec-row">
                        <span className="spec-label">Inter Lock:</span>
                        <span className="spec-value">{profile.interLock}</span>
                      </div>
                      <div className="profile-spec-row">
                        <span className="spec-label">Bearing Bottom:</span>
                        <span className="spec-value">{profile.bearingBottom}</span>
                      </div>
                      <div className="profile-spec-row">
                        <span className="spec-label">Glass:</span>
                        <span className="spec-value">{profile.glass}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Add/Edit Profile Modal */}
          {showAddProfileModal && (
            <div className="profile-modal-overlay" onClick={handleCancelProfile}>
              <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
                <div className="profile-modal-header">
                  <h3>{editingProfile ? 'Edit Profile' : 'Create New Profile'}</h3>
                  <button onClick={handleCancelProfile} className="modal-close-btn">×</button>
                </div>
                <div className="profile-modal-body">
                  <div className="profile-form">
                    <div className="form-group-profile">
                      <label>Profile Name *</label>
                      <input
                        type="text"
                        value={newProfile.name}
                        onChange={(e) => setNewProfile({ ...newProfile, name: e.target.value })}
                        placeholder="e.g., Standard Window Profile"
                        disabled={editingProfile ? true : false}
                      />
                    </div>

                    <div className="materials-grid">
                      <div className="form-group-profile">
                        <label>Top</label>
                        <input
                          type="number"
                          value={newProfile.top}
                          onChange={(e) => setNewProfile({ ...newProfile, top: e.target.value })}
                          step="0.01"
                          placeholder="0.00"
                        />
                      </div>

                      <div className="form-group-profile">
                        <label>Bottom</label>
                        <input
                          type="number"
                          value={newProfile.bottom}
                          onChange={(e) => setNewProfile({ ...newProfile, bottom: e.target.value })}
                          step="0.01"
                          placeholder="0.00"
                        />
                      </div>

                      <div className="form-group-profile">
                        <label>Handle Inner Lock</label>
                        <input
                          type="number"
                          value={newProfile.handleInnerLock}
                          onChange={(e) => setNewProfile({ ...newProfile, handleInnerLock: e.target.value })}
                          step="0.01"
                          placeholder="0.00"
                        />
                      </div>

                      <div className="form-group-profile">
                        <label>Inter Lock</label>
                        <input
                          type="number"
                          value={newProfile.interLock}
                          onChange={(e) => setNewProfile({ ...newProfile, interLock: e.target.value })}
                          step="0.01"
                          placeholder="0.00"
                        />
                      </div>

                      <div className="form-group-profile">
                        <label>Bearing Bottom</label>
                        <input
                          type="number"
                          value={newProfile.bearingBottom}
                          onChange={(e) => setNewProfile({ ...newProfile, bearingBottom: e.target.value })}
                          step="0.01"
                          placeholder="0.00"
                        />
                      </div>

                      <div className="form-group-profile">
                        <label>Glass</label>
                        <input
                          type="number"
                          value={newProfile.glass}
                          onChange={(e) => setNewProfile({ ...newProfile, glass: e.target.value })}
                          step="0.01"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="profile-modal-footer">
                  <button onClick={handleCancelProfile} className="modal-btn-secondary">
                    Cancel
                  </button>
                  <button 
                    onClick={editingProfile ? handleUpdateProfile : handleAddProfile} 
                    className="modal-btn-primary"
                  >
                    {editingProfile ? 'Update Profile' : 'Create Profile'}
                  </button>
                </div>
              </div>
            </div>
          )}
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

        {selectedTool === 'cuttingMeasuring' && renderCuttingMeasuringTool()}

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
