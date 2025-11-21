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
        cuttingProfiles: {
          '2_track': '',
          '2_track_mosquito': '',
          '2_track_grill': '',
          '2_track_mosquito_grill': ''
        }
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
        cuttingProfiles: {
          '2_track': '',
          '2_track_mosquito': '',
          '2_track_grill': '',
          '2_track_mosquito_grill': ''
        }
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
        cuttingProfiles: {
          '2_track': '',
          '2_track_mosquito': '',
          '2_track_grill': '',
          '2_track_mosquito_grill': ''
        }
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
    },
    customCategories: {
      sliding: {}, // Custom subcategories for sliding windows
      openable: {} // Custom subcategories for openable windows
    }
  });

  const [selectedTool, setSelectedTool] = useState(null);
  const [activeTab, setActiveTab] = useState('miniDomal');
  
  // Cutting Measuring Tool states
  const [showAddProfileModal, setShowAddProfileModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  
  // Custom Categories states
  const [showCustomCategoryModal, setShowCustomCategoryModal] = useState(false);
  const [editingCustomCategory, setEditingCustomCategory] = useState(null);
  const [customCategoryForm, setCustomCategoryForm] = useState({
    name: '',
    category: 'sliding', // 'sliding' or 'openable'
    calculationTemplate: 'miniDomal', // 'miniDomal', 'domal', or 'ventena'
    outerFrameKg: 0.200,
    shutterFrameKg: 0.175,
    innerLockClipKg: 0.0625,
    cChannelKg: 0.0625,
    rtKg: 0.125,
    roundPipeKg: 0.0625,
    outerFrameKgWithNet: 0.26875,
    outerFrameKgWithGrill: 0.2625
  });
  const [newProfile, setNewProfile] = useState({
    name: '',
    top: { length: 0, lengthDora: 0 },
    bottom: { length: 0, lengthDora: 0 },
    handleInnerLock: { length: 0, lengthDora: 0 },
    interLock: { length: 0, lengthDora: 0 },
    bearingBottom: { length: 0, lengthDora: 0 },
    glass: { length: 0, lengthDora: 0 },
    // Grill materials
    rt: { length: 0, lengthDora: 0 },
    roundPipe: { length: 0, lengthDora: 0 },
    brightBar: { length: 0, lengthDora: 0 },
    // Mosquito net materials
    shutter: { length: 0, lengthDora: 0 },
    cChannelLength: { length: 0, lengthDora: 0 },
    cChannelHeight: { length: 0, lengthDora: 0 },
    mosquitoNet: { lengthIncrease: 0, heightIncrease: 0 }
  });

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('toolSettings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      // Ensure cuttingMeasuring exists
      if (!parsed.cuttingMeasuring) {
        parsed.cuttingMeasuring = { profiles: {} };
      }
      // Add demo profile if no profiles exist
      if (Object.keys(parsed.cuttingMeasuring.profiles).length === 0) {
        parsed.cuttingMeasuring.profiles['0.75 inches'] = {
          top: { length: 0, lengthDora: 0, total: 0 },
          bottom: { length: 0, lengthDora: 0, total: 0 },
          handleInnerLock: { length: 1, lengthDora: 6, total: 1.75 },
          interLock: { length: 1, lengthDora: 6, total: 1.75 },
          bearingBottom: { length: 6, lengthDora: 4, total: 6.5 },
          glass: { length: 0, lengthDora: 0, total: 0 },
          rt: { length: 0, lengthDora: 0, total: 0 },
          roundPipe: { length: 0, lengthDora: 0, total: 0 },
          brightBar: { length: 0, lengthDora: 0, total: 0 },
          shutter: { length: 0, lengthDora: 0, total: 0 },
          cChannelLength: { length: 0, lengthDora: 0, total: 0 },
          cChannelHeight: { length: 0, lengthDora: 0, total: 0 },
          mosquitoNet: { lengthIncrease: 0, heightIncrease: 0 }
        };
        localStorage.setItem('toolSettings', JSON.stringify(parsed));
      }
      setSettings(parsed);
    } else {
      // If no settings at all, create with demo profile
      const defaultSettings = getDefaultSettings();
      defaultSettings.cuttingMeasuring.profiles['0.75 inches'] = {
        top: { length: 0, lengthDora: 0, total: 0 },
        bottom: { length: 0, lengthDora: 0, total: 0 },
        handleInnerLock: { length: 1, lengthDora: 6, total: 1.75 },
        interLock: { length: 1, lengthDora: 6, total: 1.75 },
        bearingBottom: { length: 6, lengthDora: 4, total: 6.5 },
        glass: { length: 0, lengthDora: 0, total: 0 },
        rt: { length: 0, lengthDora: 0, total: 0 },
        roundPipe: { length: 0, lengthDora: 0, total: 0 },
        brightBar: { length: 0, lengthDora: 0, total: 0 },
        shutter: { length: 0, lengthDora: 0, total: 0 },
        cChannelLength: { length: 0, lengthDora: 0, total: 0 },
        cChannelHeight: { length: 0, lengthDora: 0, total: 0 },
        mosquitoNet: { lengthIncrease: 0, heightIncrease: 0 }
      };
      setSettings(defaultSettings);
      localStorage.setItem('toolSettings', JSON.stringify(defaultSettings));
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

  const handleCuttingProfileChange = (subTool, configType, profileName) => {
    const updatedSettings = {
      ...settings,
      windowCosting: {
        ...settings.windowCosting,
        [subTool]: {
          ...settings.windowCosting[subTool],
          cuttingProfiles: {
            ...settings.windowCosting[subTool].cuttingProfiles,
            [configType]: profileName
          }
        }
      }
    };
    setSettings(updatedSettings);
    localStorage.setItem('toolSettings', JSON.stringify(updatedSettings));
  };

  // Custom Categories functions
  const handleOpenCustomCategoryModal = (categoryType = 'sliding', editCategory = null) => {
    if (editCategory) {
      const catData = settings.customCategories[categoryType][editCategory];
      setEditingCustomCategory({ name: editCategory, category: categoryType });
      setCustomCategoryForm({
        name: editCategory,
        category: categoryType,
        calculationTemplate: catData.calculationTemplate || 'miniDomal',
        outerFrameKg: catData.outerFrameKg || 0.200,
        shutterFrameKg: catData.shutterFrameKg || 0.175,
        innerLockClipKg: catData.innerLockClipKg || 0.0625,
        cChannelKg: catData.cChannelKg || 0.0625,
        rtKg: catData.rtKg || 0.125,
        roundPipeKg: catData.roundPipeKg || 0.0625,
        outerFrameKgWithNet: catData.outerFrameKgWithNet || 0.26875,
        outerFrameKgWithGrill: catData.outerFrameKgWithGrill || 0.2625
      });
    } else {
      setEditingCustomCategory(null);
      setCustomCategoryForm({
        name: '',
        category: categoryType,
        calculationTemplate: 'miniDomal',
        outerFrameKg: 0.200,
        shutterFrameKg: 0.175,
        innerLockClipKg: 0.0625,
        cChannelKg: 0.0625,
        rtKg: 0.125,
        roundPipeKg: 0.0625,
        outerFrameKgWithNet: 0.26875,
        outerFrameKgWithGrill: 0.2625
      });
    }
    setShowCustomCategoryModal(true);
  };

  const handleSaveCustomCategory = () => {
    if (!customCategoryForm.name.trim()) {
      alert('Please enter a category name');
      return;
    }

    const categoryKey = customCategoryForm.name.trim().toLowerCase().replace(/\s+/g, '');
    const categoryType = customCategoryForm.category;

    // Check if name already exists (unless editing)
    if (!editingCustomCategory || editingCustomCategory.name !== customCategoryForm.name) {
      if (settings.customCategories[categoryType][categoryKey] || 
          settings.windowCosting[categoryKey]) {
        alert('A category with this name already exists');
        return;
      }
    }

    const updatedSettings = {
      ...settings,
      customCategories: {
        ...settings.customCategories,
        [categoryType]: {
          ...settings.customCategories[categoryType],
          [categoryKey]: {
            displayName: customCategoryForm.name.trim(),
            calculationTemplate: customCategoryForm.calculationTemplate,
            outerFrameKg: parseFloat(customCategoryForm.outerFrameKg) || 0,
            shutterFrameKg: parseFloat(customCategoryForm.shutterFrameKg) || 0,
            innerLockClipKg: parseFloat(customCategoryForm.innerLockClipKg) || 0,
            cChannelKg: parseFloat(customCategoryForm.cChannelKg) || 0,
            rtKg: parseFloat(customCategoryForm.rtKg) || 0,
            roundPipeKg: parseFloat(customCategoryForm.roundPipeKg) || 0,
            outerFrameKgWithNet: parseFloat(customCategoryForm.outerFrameKgWithNet) || 0,
            outerFrameKgWithGrill: parseFloat(customCategoryForm.outerFrameKgWithGrill) || 0,
                  cuttingProfiles: editingCustomCategory && settings.customCategories[categoryType][categoryKey]?.cuttingProfiles
              ? settings.customCategories[categoryType][categoryKey].cuttingProfiles
              : {
                  '2_track': '',
                  '2_track_mosquito': '',
                  '2_track_grill': '',
                  '2_track_mosquito_grill': ''
                }
          }
        }
      }
    };

    // If editing and name changed, remove old entry
    if (editingCustomCategory && editingCustomCategory.name !== customCategoryForm.name) {
      const oldKey = editingCustomCategory.name.toLowerCase().replace(/\s+/g, '');
      delete updatedSettings.customCategories[categoryType][oldKey];
    }

    setSettings(updatedSettings);
    localStorage.setItem('toolSettings', JSON.stringify(updatedSettings));
    setShowCustomCategoryModal(false);
    setEditingCustomCategory(null);
  };

  const handleDeleteCustomCategory = (categoryType, categoryKey) => {
    if (window.confirm(`Are you sure you want to delete "${categoryKey}"? This action cannot be undone.`)) {
      const updatedSettings = {
        ...settings,
        customCategories: {
          ...settings.customCategories,
          [categoryType]: {
            ...Object.fromEntries(
              Object.entries(settings.customCategories[categoryType]).filter(([key]) => key !== categoryKey)
            )
          }
        }
      };
      setSettings(updatedSettings);
      localStorage.setItem('toolSettings', JSON.stringify(updatedSettings));
    }
  };

  const handleCustomCategoryChange = (categoryType, categoryKey, field, value) => {
    const updatedSettings = {
      ...settings,
      customCategories: {
        ...settings.customCategories,
        [categoryType]: {
          ...settings.customCategories[categoryType],
          [categoryKey]: {
            ...settings.customCategories[categoryType][categoryKey],
            [field]: parseFloat(value) || 0
          }
        }
      }
    };
    setSettings(updatedSettings);
    localStorage.setItem('toolSettings', JSON.stringify(updatedSettings));
  };

  const handleCustomCategoryCuttingProfileChange = (categoryType, categoryKey, configType, profileName) => {
    const updatedSettings = {
      ...settings,
      customCategories: {
        ...settings.customCategories,
        [categoryType]: {
          ...settings.customCategories[categoryType],
          [categoryKey]: {
            ...settings.customCategories[categoryType][categoryKey],
            cuttingProfiles: {
              ...settings.customCategories[categoryType][categoryKey].cuttingProfiles,
              [configType]: profileName
            }
          }
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

  // Helper function to calculate total inches (length + dora)
  const calculateTotalInches = (length, dora) => {
    const lengthVal = parseFloat(length) || 0;
    const doraVal = parseFloat(dora) || 0;
    return lengthVal + (doraVal * 0.125);
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
            top: {
              length: parseFloat(newProfile.top.length) || 0,
              lengthDora: parseFloat(newProfile.top.lengthDora) || 0,
              total: calculateTotalInches(newProfile.top.length, newProfile.top.lengthDora)
            },
            bottom: {
              length: parseFloat(newProfile.bottom.length) || 0,
              lengthDora: parseFloat(newProfile.bottom.lengthDora) || 0,
              total: calculateTotalInches(newProfile.bottom.length, newProfile.bottom.lengthDora)
            },
            handleInnerLock: {
              length: parseFloat(newProfile.handleInnerLock.length) || 0,
              lengthDora: parseFloat(newProfile.handleInnerLock.lengthDora) || 0,
              total: calculateTotalInches(newProfile.handleInnerLock.length, newProfile.handleInnerLock.lengthDora)
            },
            interLock: {
              length: parseFloat(newProfile.interLock.length) || 0,
              lengthDora: parseFloat(newProfile.interLock.lengthDora) || 0,
              total: calculateTotalInches(newProfile.interLock.length, newProfile.interLock.lengthDora)
            },
            bearingBottom: {
              length: parseFloat(newProfile.bearingBottom.length) || 0,
              lengthDora: parseFloat(newProfile.bearingBottom.lengthDora) || 0,
              total: calculateTotalInches(newProfile.bearingBottom.length, newProfile.bearingBottom.lengthDora)
            },
            glass: {
              length: parseFloat(newProfile.glass.length) || 0,
              lengthDora: parseFloat(newProfile.glass.lengthDora) || 0,
              total: calculateTotalInches(newProfile.glass.length, newProfile.glass.lengthDora)
            },
            // Grill materials
            rt: {
              length: parseFloat(newProfile.rt.length) || 0,
              lengthDora: parseFloat(newProfile.rt.lengthDora) || 0,
              total: calculateTotalInches(newProfile.rt.length, newProfile.rt.lengthDora)
            },
            roundPipe: {
              length: parseFloat(newProfile.roundPipe.length) || 0,
              lengthDora: parseFloat(newProfile.roundPipe.lengthDora) || 0,
              total: calculateTotalInches(newProfile.roundPipe.length, newProfile.roundPipe.lengthDora)
            },
            brightBar: {
              length: parseFloat(newProfile.brightBar.length) || 0,
              lengthDora: parseFloat(newProfile.brightBar.lengthDora) || 0,
              total: calculateTotalInches(newProfile.brightBar.length, newProfile.brightBar.lengthDora)
            },
            // Mosquito net materials
            shutter: {
              length: parseFloat(newProfile.shutter.length) || 0,
              lengthDora: parseFloat(newProfile.shutter.lengthDora) || 0,
              total: calculateTotalInches(newProfile.shutter.length, newProfile.shutter.lengthDora)
            },
            cChannelLength: {
              length: parseFloat(newProfile.cChannelLength.length) || 0,
              lengthDora: parseFloat(newProfile.cChannelLength.lengthDora) || 0,
              total: calculateTotalInches(newProfile.cChannelLength.length, newProfile.cChannelLength.lengthDora)
            },
            cChannelHeight: {
              length: parseFloat(newProfile.cChannelHeight.length) || 0,
              lengthDora: parseFloat(newProfile.cChannelHeight.lengthDora) || 0,
              total: calculateTotalInches(newProfile.cChannelHeight.length, newProfile.cChannelHeight.lengthDora)
            },
            mosquitoNet: {
              lengthIncrease: parseFloat(newProfile.mosquitoNet.lengthIncrease) || 0,
              heightIncrease: parseFloat(newProfile.mosquitoNet.heightIncrease) || 0
            }
          }
        }
      }
    };
    
    setSettings(updatedSettings);
    localStorage.setItem('toolSettings', JSON.stringify(updatedSettings));
    setShowAddProfileModal(false);
    setNewProfile({
      name: '',
      top: { length: 0, lengthDora: 0 },
      bottom: { length: 0, lengthDora: 0 },
      handleInnerLock: { length: 0, lengthDora: 0 },
      interLock: { length: 0, lengthDora: 0 },
      bearingBottom: { length: 0, lengthDora: 0 },
      glass: { length: 0, lengthDora: 0 },
      rt: { length: 0, lengthDora: 0 },
      roundPipe: { length: 0, lengthDora: 0 },
      brightBar: { length: 0, lengthDora: 0 },
      shutter: { length: 0, lengthDora: 0 },
      cChannelLength: { length: 0, lengthDora: 0 },
      cChannelHeight: { length: 0, lengthDora: 0 },
      mosquitoNet: { lengthIncrease: 0, heightIncrease: 0 }
    });
  };

  const handleEditProfile = (profileName) => {
    const profile = settings.cuttingMeasuring.profiles[profileName];
    setEditingProfile(profileName);
    
    // Convert profile to new format if needed
    const topData = getProfileValue(profile.top);
    const bottomData = getProfileValue(profile.bottom);
    const handleData = getProfileValue(profile.handleInnerLock);
    const interLockData = getProfileValue(profile.interLock);
    const bearingData = getProfileValue(profile.bearingBottom);
    const glassData = getProfileValue(profile.glass);
    const rtData = getProfileValue(profile.rt);
    const roundPipeData = getProfileValue(profile.roundPipe);
    const brightBarData = getProfileValue(profile.brightBar);
    const shutterData = getProfileValue(profile.shutter);
    const cChannelLengthData = getProfileValue(profile.cChannelLength);
    const cChannelHeightData = getProfileValue(profile.cChannelHeight);
    
    setNewProfile({
      name: profileName,
      top: { length: topData.length, lengthDora: topData.lengthDora },
      bottom: { length: bottomData.length, lengthDora: bottomData.lengthDora },
      handleInnerLock: { length: handleData.length, lengthDora: handleData.lengthDora },
      interLock: { length: interLockData.length, lengthDora: interLockData.lengthDora },
      bearingBottom: { length: bearingData.length, lengthDora: bearingData.lengthDora },
      glass: { length: glassData.length, lengthDora: glassData.lengthDora },
      rt: { length: rtData.length, lengthDora: rtData.lengthDora },
      roundPipe: { length: roundPipeData.length, lengthDora: roundPipeData.lengthDora },
      brightBar: { length: brightBarData.length, lengthDora: brightBarData.lengthDora },
      shutter: { length: shutterData.length, lengthDora: shutterData.lengthDora },
      cChannelLength: { length: cChannelLengthData.length, lengthDora: cChannelLengthData.lengthDora },
      cChannelHeight: { length: cChannelHeightData.length, lengthDora: cChannelHeightData.lengthDora },
      mosquitoNet: {
        lengthIncrease: profile.mosquitoNet?.lengthIncrease || 0,
        heightIncrease: profile.mosquitoNet?.heightIncrease || 0
      }
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
      top: {
        length: parseFloat(newProfile.top.length) || 0,
        lengthDora: parseFloat(newProfile.top.lengthDora) || 0,
        total: calculateTotalInches(newProfile.top.length, newProfile.top.lengthDora)
      },
      bottom: {
        length: parseFloat(newProfile.bottom.length) || 0,
        lengthDora: parseFloat(newProfile.bottom.lengthDora) || 0,
        total: calculateTotalInches(newProfile.bottom.length, newProfile.bottom.lengthDora)
      },
      handleInnerLock: {
        length: parseFloat(newProfile.handleInnerLock.length) || 0,
        lengthDora: parseFloat(newProfile.handleInnerLock.lengthDora) || 0,
        total: calculateTotalInches(newProfile.handleInnerLock.length, newProfile.handleInnerLock.lengthDora)
      },
      interLock: {
        length: parseFloat(newProfile.interLock.length) || 0,
        lengthDora: parseFloat(newProfile.interLock.lengthDora) || 0,
        total: calculateTotalInches(newProfile.interLock.length, newProfile.interLock.lengthDora)
      },
      bearingBottom: {
        length: parseFloat(newProfile.bearingBottom.length) || 0,
        lengthDora: parseFloat(newProfile.bearingBottom.lengthDora) || 0,
        total: calculateTotalInches(newProfile.bearingBottom.length, newProfile.bearingBottom.lengthDora)
      },
      glass: {
        length: parseFloat(newProfile.glass.length) || 0,
        lengthDora: parseFloat(newProfile.glass.lengthDora) || 0,
        total: calculateTotalInches(newProfile.glass.length, newProfile.glass.lengthDora)
      },
      // Grill materials
      rt: {
        length: parseFloat(newProfile.rt.length) || 0,
        lengthDora: parseFloat(newProfile.rt.lengthDora) || 0,
        total: calculateTotalInches(newProfile.rt.length, newProfile.rt.lengthDora)
      },
      roundPipe: {
        length: parseFloat(newProfile.roundPipe.length) || 0,
        lengthDora: parseFloat(newProfile.roundPipe.lengthDora) || 0,
        total: calculateTotalInches(newProfile.roundPipe.length, newProfile.roundPipe.lengthDora)
      },
      brightBar: {
        length: parseFloat(newProfile.brightBar.length) || 0,
        lengthDora: parseFloat(newProfile.brightBar.lengthDora) || 0,
        total: calculateTotalInches(newProfile.brightBar.length, newProfile.brightBar.lengthDora)
      },
      // Mosquito net materials
      shutter: {
        length: parseFloat(newProfile.shutter.length) || 0,
        lengthDora: parseFloat(newProfile.shutter.lengthDora) || 0,
        total: calculateTotalInches(newProfile.shutter.length, newProfile.shutter.lengthDora)
      },
      cChannelLength: {
        length: parseFloat(newProfile.cChannelLength.length) || 0,
        lengthDora: parseFloat(newProfile.cChannelLength.lengthDora) || 0,
        total: calculateTotalInches(newProfile.cChannelLength.length, newProfile.cChannelLength.lengthDora)
      },
      cChannelHeight: {
        length: parseFloat(newProfile.cChannelHeight.length) || 0,
        lengthDora: parseFloat(newProfile.cChannelHeight.lengthDora) || 0,
        total: calculateTotalInches(newProfile.cChannelHeight.length, newProfile.cChannelHeight.lengthDora)
      },
      mosquitoNet: {
        lengthIncrease: parseFloat(newProfile.mosquitoNet.lengthIncrease) || 0,
        heightIncrease: parseFloat(newProfile.mosquitoNet.heightIncrease) || 0
      }
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
      top: { length: 0, lengthDora: 0 },
      bottom: { length: 0, lengthDora: 0 },
      handleInnerLock: { length: 0, lengthDora: 0 },
      interLock: { length: 0, lengthDora: 0 },
      bearingBottom: { length: 0, lengthDora: 0 },
      glass: { length: 0, lengthDora: 0 }
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
      top: { length: 0, lengthDora: 0 },
      bottom: { length: 0, lengthDora: 0 },
      handleInnerLock: { length: 0, lengthDora: 0 },
      interLock: { length: 0, lengthDora: 0 },
      bearingBottom: { length: 0, lengthDora: 0 },
      glass: { length: 0, lengthDora: 0 },
      rt: { length: 0, lengthDora: 0 },
      roundPipe: { length: 0, lengthDora: 0 },
      brightBar: { length: 0, lengthDora: 0 },
      shutter: { length: 0, lengthDora: 0 },
      cChannelLength: { length: 0, lengthDora: 0 },
      cChannelHeight: { length: 0, lengthDora: 0 },
      mosquitoNet: { lengthIncrease: 0, heightIncrease: 0 }
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
          cuttingProfiles: {
            '2_track': '',
            '2_track_grill': '',
            '2_track_mosquito_grill': ''
          }
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
          cuttingProfiles: {
            '2_track': '',
            '2_track_grill': '',
            '2_track_mosquito_grill': ''
          }
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
          cuttingProfiles: {
            '2_track': '',
            '2_track_grill': '',
            '2_track_mosquito_grill': ''
          }
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
      },
      customCategories: {
        sliding: {},
        openable: {}
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
                // Set default active tab based on tool
                if (tool.id === 'windowCosting') {
                  setActiveTab('miniDomal');
                } else if (tool.id === 'doorCosting') {
                  setActiveTab('standard');
                } else if (tool.id === 'cuttingMeasuring') {
                  setActiveTab('profiles');
                }
                setSelectedTool(tool.id);
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

          <div className="settings-section">
            <h4>📏 Cutting Profiles</h4>
            <p style={{ marginBottom: '15px', color: '#666', fontSize: '14px' }}>
              Select cutting profiles for different window configurations. Profiles are created in <strong>Cutting Measuring Tool</strong> settings.
            </p>
            <div className="settings-row">
              <div className="setting-item">
                <label>2 Track Profile</label>
                <select
                  value={toolSettings.cuttingProfiles?.['2_track'] || ''}
                  onChange={(e) => handleCuttingProfileChange(subTool, '2_track', e.target.value)}
                  style={{ width: '100%', padding: '8px', fontSize: '14px', borderRadius: '5px', border: '1px solid #ddd' }}
                >
                  <option value="">-- No Profile Selected --</option>
                  {Object.keys(settings.cuttingMeasuring?.profiles || {}).map(profileName => (
                    <option key={profileName} value={profileName}>{profileName}</option>
                  ))}
                </select>
                <span className="setting-hint">Profile for standard 2-track windows</span>
              </div>

              <div className="setting-item">
                <label>2 Track + Mosquito Profile</label>
                <select
                  value={toolSettings.cuttingProfiles?.['2_track_mosquito'] || ''}
                  onChange={(e) => handleCuttingProfileChange(subTool, '2_track_mosquito', e.target.value)}
                  style={{ width: '100%', padding: '8px', fontSize: '14px', borderRadius: '5px', border: '1px solid #ddd' }}
                >
                  <option value="">-- No Profile Selected --</option>
                  {Object.keys(settings.cuttingMeasuring?.profiles || {}).map(profileName => (
                    <option key={profileName} value={profileName}>{profileName}</option>
                  ))}
                </select>
                <span className="setting-hint">Profile for 2-track windows with mosquito net</span>
              </div>

              <div className="setting-item">
                <label>2 Track + Grill Profile</label>
                <select
                  value={toolSettings.cuttingProfiles?.['2_track_grill'] || ''}
                  onChange={(e) => handleCuttingProfileChange(subTool, '2_track_grill', e.target.value)}
                  style={{ width: '100%', padding: '8px', fontSize: '14px', borderRadius: '5px', border: '1px solid #ddd' }}
                >
                  <option value="">-- No Profile Selected --</option>
                  {Object.keys(settings.cuttingMeasuring?.profiles || {}).map(profileName => (
                    <option key={profileName} value={profileName}>{profileName}</option>
                  ))}
                </select>
                <span className="setting-hint">Profile for 2-track windows with grill</span>
              </div>

              <div className="setting-item">
                <label>2 Track + Mosquito + Grill Profile</label>
                <select
                  value={toolSettings.cuttingProfiles?.['2_track_mosquito_grill'] || ''}
                  onChange={(e) => handleCuttingProfileChange(subTool, '2_track_mosquito_grill', e.target.value)}
                  style={{ width: '100%', padding: '8px', fontSize: '14px', borderRadius: '5px', border: '1px solid #ddd' }}
                >
                  <option value="">-- No Profile Selected --</option>
                  {Object.keys(settings.cuttingMeasuring?.profiles || {}).map(profileName => (
                    <option key={profileName} value={profileName}>{profileName}</option>
                  ))}
                </select>
                <span className="setting-hint">Profile for 2-track windows with mosquito net and grill</span>
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

  // Helper to get profile value safely (handles old and new format)
  const getProfileValue = (material) => {
    if (!material) return { length: 0, lengthDora: 0, total: 0 };
    
    // New format: object with length, lengthDora, total
    if (typeof material === 'object' && material.total !== undefined) {
      return material;
    }
    
    // Old format: just a number
    if (typeof material === 'number') {
      return { length: material, lengthDora: 0, total: material };
    }
    
    // Default
    return { length: 0, lengthDora: 0, total: 0 };
  };

  const renderCuttingMeasuringTool = () => {
    const profiles = settings.cuttingMeasuring?.profiles || {};
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
                const topData = getProfileValue(profile.top);
                const bottomData = getProfileValue(profile.bottom);
                const handleData = getProfileValue(profile.handleInnerLock);
                const interLockData = getProfileValue(profile.interLock);
                const bearingData = getProfileValue(profile.bearingBottom);
                const glassData = getProfileValue(profile.glass);
                
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
                        <span className="spec-value">
                          {topData.length}"{topData.lengthDora > 0 && ` + ${topData.lengthDora}d`} = {topData.total.toFixed(2)}"
                        </span>
                      </div>
                      <div className="profile-spec-row">
                        <span className="spec-label">Bottom:</span>
                        <span className="spec-value">
                          {bottomData.length}"{bottomData.lengthDora > 0 && ` + ${bottomData.lengthDora}d`} = {bottomData.total.toFixed(2)}"
                        </span>
                      </div>
                      <div className="profile-spec-row">
                        <span className="spec-label">Handle Inner Lock:</span>
                        <span className="spec-value">
                          {handleData.length}"{handleData.lengthDora > 0 && ` + ${handleData.lengthDora}d`} = {handleData.total.toFixed(2)}"
                        </span>
                      </div>
                      <div className="profile-spec-row">
                        <span className="spec-label">Inter Lock:</span>
                        <span className="spec-value">
                          {interLockData.length}"{interLockData.lengthDora > 0 && ` + ${interLockData.lengthDora}d`} = {interLockData.total.toFixed(2)}"
                        </span>
                      </div>
                      <div className="profile-spec-row">
                        <span className="spec-label">Bearing Bottom:</span>
                        <span className="spec-value">
                          {bearingData.length}"{bearingData.lengthDora > 0 && ` + ${bearingData.lengthDora}d`} = {bearingData.total.toFixed(2)}"
                        </span>
                      </div>
                      <div className="profile-spec-row">
                        <span className="spec-label">Glass:</span>
                        <span className="spec-value">
                          {glassData.length}"{glassData.lengthDora > 0 && ` + ${glassData.lengthDora}d`} = {glassData.total.toFixed(2)}"
                        </span>
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

                    <div className="materials-list">
                      {/* Top */}
                      <div className="material-item">
                        <h4 className="material-title">Top</h4>
                        <div className="material-inputs">
                          <div className="form-group-profile">
                            <label>Length (inches) *</label>
                            <input
                              type="number"
                              value={newProfile.top.length}
                              onChange={(e) => setNewProfile({ 
                                ...newProfile, 
                                top: { ...newProfile.top, length: e.target.value }
                              })}
                              step="1"
                              placeholder="0"
                            />
                          </div>
                          <div className="form-group-profile">
                            <label>Length Dora (0-7)</label>
                            <input
                              type="number"
                              value={newProfile.top.lengthDora}
                              onChange={(e) => setNewProfile({ 
                                ...newProfile, 
                                top: { ...newProfile.top, lengthDora: e.target.value }
                              })}
                              step="1"
                              min="0"
                              max="7"
                              placeholder="0"
                            />
                          </div>
                          <div className="total-display">
                            = {calculateTotalInches(newProfile.top.length, newProfile.top.lengthDora).toFixed(2)}"
                          </div>
                        </div>
                      </div>

                      {/* Bottom */}
                      <div className="material-item">
                        <h4 className="material-title">Bottom</h4>
                        <div className="material-inputs">
                          <div className="form-group-profile">
                            <label>Length (inches) *</label>
                            <input
                              type="number"
                              value={newProfile.bottom.length}
                              onChange={(e) => setNewProfile({ 
                                ...newProfile, 
                                bottom: { ...newProfile.bottom, length: e.target.value }
                              })}
                              step="1"
                              placeholder="0"
                            />
                          </div>
                          <div className="form-group-profile">
                            <label>Length Dora (0-7)</label>
                            <input
                              type="number"
                              value={newProfile.bottom.lengthDora}
                              onChange={(e) => setNewProfile({ 
                                ...newProfile, 
                                bottom: { ...newProfile.bottom, lengthDora: e.target.value }
                              })}
                              step="1"
                              min="0"
                              max="7"
                              placeholder="0"
                            />
                          </div>
                          <div className="total-display">
                            = {calculateTotalInches(newProfile.bottom.length, newProfile.bottom.lengthDora).toFixed(2)}"
                          </div>
                        </div>
                      </div>

                      {/* Handle Inner Lock */}
                      <div className="material-item">
                        <h4 className="material-title">Handle Inner Lock</h4>
                        <div className="material-inputs">
                          <div className="form-group-profile">
                            <label>Length (inches) *</label>
                            <input
                              type="number"
                              value={newProfile.handleInnerLock.length}
                              onChange={(e) => setNewProfile({ 
                                ...newProfile, 
                                handleInnerLock: { ...newProfile.handleInnerLock, length: e.target.value }
                              })}
                              step="1"
                              placeholder="0"
                            />
                          </div>
                          <div className="form-group-profile">
                            <label>Length Dora (0-7)</label>
                            <input
                              type="number"
                              value={newProfile.handleInnerLock.lengthDora}
                              onChange={(e) => setNewProfile({ 
                                ...newProfile, 
                                handleInnerLock: { ...newProfile.handleInnerLock, lengthDora: e.target.value }
                              })}
                              step="1"
                              min="0"
                              max="7"
                              placeholder="0"
                            />
                          </div>
                          <div className="total-display">
                            = {calculateTotalInches(newProfile.handleInnerLock.length, newProfile.handleInnerLock.lengthDora).toFixed(2)}"
                          </div>
                        </div>
                      </div>

                      {/* Inter Lock */}
                      <div className="material-item">
                        <h4 className="material-title">Inter Lock</h4>
                        <div className="material-inputs">
                          <div className="form-group-profile">
                            <label>Length (inches) *</label>
                            <input
                              type="number"
                              value={newProfile.interLock.length}
                              onChange={(e) => setNewProfile({ 
                                ...newProfile, 
                                interLock: { ...newProfile.interLock, length: e.target.value }
                              })}
                              step="1"
                              placeholder="0"
                            />
                          </div>
                          <div className="form-group-profile">
                            <label>Length Dora (0-7)</label>
                            <input
                              type="number"
                              value={newProfile.interLock.lengthDora}
                              onChange={(e) => setNewProfile({ 
                                ...newProfile, 
                                interLock: { ...newProfile.interLock, lengthDora: e.target.value }
                              })}
                              step="1"
                              min="0"
                              max="7"
                              placeholder="0"
                            />
                          </div>
                          <div className="total-display">
                            = {calculateTotalInches(newProfile.interLock.length, newProfile.interLock.lengthDora).toFixed(2)}"
                          </div>
                        </div>
                      </div>

                      {/* Bearing Bottom */}
                      <div className="material-item">
                        <h4 className="material-title">Bearing Bottom</h4>
                        <div className="material-inputs">
                          <div className="form-group-profile">
                            <label>Length (inches) *</label>
                            <input
                              type="number"
                              value={newProfile.bearingBottom.length}
                              onChange={(e) => setNewProfile({ 
                                ...newProfile, 
                                bearingBottom: { ...newProfile.bearingBottom, length: e.target.value }
                              })}
                              step="1"
                              placeholder="0"
                            />
                          </div>
                          <div className="form-group-profile">
                            <label>Length Dora (0-7)</label>
                            <input
                              type="number"
                              value={newProfile.bearingBottom.lengthDora}
                              onChange={(e) => setNewProfile({ 
                                ...newProfile, 
                                bearingBottom: { ...newProfile.bearingBottom, lengthDora: e.target.value }
                              })}
                              step="1"
                              min="0"
                              max="7"
                              placeholder="0"
                            />
                          </div>
                          <div className="total-display">
                            = {calculateTotalInches(newProfile.bearingBottom.length, newProfile.bearingBottom.lengthDora).toFixed(2)}"
                          </div>
                        </div>
                      </div>

                      {/* Glass */}
                      <div className="material-item">
                        <h4 className="material-title">Glass</h4>
                        <div className="material-inputs">
                          <div className="form-group-profile">
                            <label>Length (inches) *</label>
                            <input
                              type="number"
                              value={newProfile.glass.length}
                              onChange={(e) => setNewProfile({ 
                                ...newProfile, 
                                glass: { ...newProfile.glass, length: e.target.value }
                              })}
                              step="1"
                              placeholder="0"
                            />
                          </div>
                          <div className="form-group-profile">
                            <label>Length Dora (0-7)</label>
                            <input
                              type="number"
                              value={newProfile.glass.lengthDora}
                              onChange={(e) => setNewProfile({ 
                                ...newProfile, 
                                glass: { ...newProfile.glass, lengthDora: e.target.value }
                              })}
                              step="1"
                              min="0"
                              max="7"
                              placeholder="0"
                            />
                          </div>
                          <div className="total-display">
                            = {calculateTotalInches(newProfile.glass.length, newProfile.glass.lengthDora).toFixed(2)}"
                          </div>
                        </div>
                      </div>

                      {/* Grill Materials Section */}
                      <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '2px solid #e5e7eb' }}>
                        <h3 style={{ marginBottom: '15px', color: '#1f2937', fontSize: '16px', fontWeight: '600' }}>Grill Materials</h3>
                        
                        {/* RT */}
                        <div className="material-item">
                          <h4 className="material-title">RT</h4>
                          <div className="material-inputs">
                            <div className="form-group-profile">
                              <label>Length (inches) *</label>
                              <input
                                type="number"
                                value={newProfile.rt.length}
                                onChange={(e) => setNewProfile({ 
                                  ...newProfile, 
                                  rt: { ...newProfile.rt, length: e.target.value }
                                })}
                                step="1"
                                placeholder="0"
                              />
                            </div>
                            <div className="form-group-profile">
                              <label>Length Dora (0-7)</label>
                              <input
                                type="number"
                                value={newProfile.rt.lengthDora}
                                onChange={(e) => setNewProfile({ 
                                  ...newProfile, 
                                  rt: { ...newProfile.rt, lengthDora: e.target.value }
                                })}
                                step="1"
                                min="0"
                                max="7"
                                placeholder="0"
                              />
                            </div>
                            <div className="total-display">
                              = {calculateTotalInches(newProfile.rt.length, newProfile.rt.lengthDora).toFixed(2)}"
                            </div>
                          </div>
                        </div>

                        {/* Round Pipe */}
                        <div className="material-item">
                          <h4 className="material-title">Round Pipe</h4>
                          <div className="material-inputs">
                            <div className="form-group-profile">
                              <label>Length (inches) *</label>
                              <input
                                type="number"
                                value={newProfile.roundPipe.length}
                                onChange={(e) => setNewProfile({ 
                                  ...newProfile, 
                                  roundPipe: { ...newProfile.roundPipe, length: e.target.value }
                                })}
                                step="1"
                                placeholder="0"
                              />
                            </div>
                            <div className="form-group-profile">
                              <label>Length Dora (0-7)</label>
                              <input
                                type="number"
                                value={newProfile.roundPipe.lengthDora}
                                onChange={(e) => setNewProfile({ 
                                  ...newProfile, 
                                  roundPipe: { ...newProfile.roundPipe, lengthDora: e.target.value }
                                })}
                                step="1"
                                min="0"
                                max="7"
                                placeholder="0"
                              />
                            </div>
                            <div className="total-display">
                              = {calculateTotalInches(newProfile.roundPipe.length, newProfile.roundPipe.lengthDora).toFixed(2)}"
                            </div>
                          </div>
                        </div>

                        {/* Bright Bar */}
                        <div className="material-item">
                          <h4 className="material-title">Bright Bar</h4>
                          <div className="material-inputs">
                            <div className="form-group-profile">
                              <label>Length (inches) *</label>
                              <input
                                type="number"
                                value={newProfile.brightBar.length}
                                onChange={(e) => setNewProfile({ 
                                  ...newProfile, 
                                  brightBar: { ...newProfile.brightBar, length: e.target.value }
                                })}
                                step="1"
                                placeholder="0"
                              />
                            </div>
                            <div className="form-group-profile">
                              <label>Length Dora (0-7)</label>
                              <input
                                type="number"
                                value={newProfile.brightBar.lengthDora}
                                onChange={(e) => setNewProfile({ 
                                  ...newProfile, 
                                  brightBar: { ...newProfile.brightBar, lengthDora: e.target.value }
                                })}
                                step="1"
                                min="0"
                                max="7"
                                placeholder="0"
                              />
                            </div>
                            <div className="total-display">
                              = {calculateTotalInches(newProfile.brightBar.length, newProfile.brightBar.lengthDora).toFixed(2)}"
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Mosquito Net Materials Section */}
                      <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '2px solid #e5e7eb' }}>
                        <h3 style={{ marginBottom: '15px', color: '#1f2937', fontSize: '16px', fontWeight: '600' }}>Mosquito Net Materials</h3>
                        
                        {/* Shutter */}
                        <div className="material-item">
                          <h4 className="material-title">Shutter</h4>
                          <div className="material-inputs">
                            <div className="form-group-profile">
                              <label>Length (inches) *</label>
                              <input
                                type="number"
                                value={newProfile.shutter.length}
                                onChange={(e) => setNewProfile({ 
                                  ...newProfile, 
                                  shutter: { ...newProfile.shutter, length: e.target.value }
                                })}
                                step="1"
                                placeholder="0"
                              />
                            </div>
                            <div className="form-group-profile">
                              <label>Length Dora (0-7)</label>
                              <input
                                type="number"
                                value={newProfile.shutter.lengthDora}
                                onChange={(e) => setNewProfile({ 
                                  ...newProfile, 
                                  shutter: { ...newProfile.shutter, lengthDora: e.target.value }
                                })}
                                step="1"
                                min="0"
                                max="7"
                                placeholder="0"
                              />
                            </div>
                            <div className="total-display">
                              = {calculateTotalInches(newProfile.shutter.length, newProfile.shutter.lengthDora).toFixed(2)}"
                            </div>
                          </div>
                        </div>

                        {/* C-Channel Length */}
                        <div className="material-item">
                          <h4 className="material-title">C-Channel Length</h4>
                          <div className="material-inputs">
                            <div className="form-group-profile">
                              <label>Length (inches) *</label>
                              <input
                                type="number"
                                value={newProfile.cChannelLength.length}
                                onChange={(e) => setNewProfile({ 
                                  ...newProfile, 
                                  cChannelLength: { ...newProfile.cChannelLength, length: e.target.value }
                                })}
                                step="1"
                                placeholder="0"
                              />
                            </div>
                            <div className="form-group-profile">
                              <label>Length Dora (0-7)</label>
                              <input
                                type="number"
                                value={newProfile.cChannelLength.lengthDora}
                                onChange={(e) => setNewProfile({ 
                                  ...newProfile, 
                                  cChannelLength: { ...newProfile.cChannelLength, lengthDora: e.target.value }
                                })}
                                step="1"
                                min="0"
                                max="7"
                                placeholder="0"
                              />
                            </div>
                            <div className="total-display">
                              = {calculateTotalInches(newProfile.cChannelLength.length, newProfile.cChannelLength.lengthDora).toFixed(2)}"
                            </div>
                          </div>
                        </div>

                        {/* C-Channel Height */}
                        <div className="material-item">
                          <h4 className="material-title">C-Channel Height</h4>
                          <div className="material-inputs">
                            <div className="form-group-profile">
                              <label>Length (inches) *</label>
                              <input
                                type="number"
                                value={newProfile.cChannelHeight.length}
                                onChange={(e) => setNewProfile({ 
                                  ...newProfile, 
                                  cChannelHeight: { ...newProfile.cChannelHeight, length: e.target.value }
                                })}
                                step="1"
                                placeholder="0"
                              />
                            </div>
                            <div className="form-group-profile">
                              <label>Length Dora (0-7)</label>
                              <input
                                type="number"
                                value={newProfile.cChannelHeight.lengthDora}
                                onChange={(e) => setNewProfile({ 
                                  ...newProfile, 
                                  cChannelHeight: { ...newProfile.cChannelHeight, lengthDora: e.target.value }
                                })}
                                step="1"
                                min="0"
                                max="7"
                                placeholder="0"
                              />
                            </div>
                            <div className="total-display">
                              = {calculateTotalInches(newProfile.cChannelHeight.length, newProfile.cChannelHeight.lengthDora).toFixed(2)}"
                            </div>
                          </div>
                        </div>

                        {/* Mosquito Net (with length and height increases) */}
                        <div className="material-item">
                          <h4 className="material-title">Mosquito Net</h4>
                          <div className="material-inputs">
                            <div className="form-group-profile">
                              <label>Length Increase (inches) *</label>
                              <input
                                type="number"
                                value={newProfile.mosquitoNet.lengthIncrease}
                                onChange={(e) => setNewProfile({ 
                                  ...newProfile, 
                                  mosquitoNet: { ...newProfile.mosquitoNet, lengthIncrease: e.target.value }
                                })}
                                step="0.01"
                                placeholder="0"
                              />
                            </div>
                            <div className="form-group-profile">
                              <label>Height Increase (inches) *</label>
                              <input
                                type="number"
                                value={newProfile.mosquitoNet.heightIncrease}
                                onChange={(e) => setNewProfile({ 
                                  ...newProfile, 
                                  mosquitoNet: { ...newProfile.mosquitoNet, heightIncrease: e.target.value }
                                })}
                                step="0.01"
                                placeholder="0"
                              />
                            </div>
                          </div>
                        </div>
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

  const renderCustomCategorySettings = (categoryKey) => {
    // Find which category type this belongs to
    let categoryType = 'sliding';
    let categoryData = settings.customCategories?.sliding?.[categoryKey];
    if (!categoryData) {
      categoryType = 'openable';
      categoryData = settings.customCategories?.openable?.[categoryKey];
    }
    
    if (!categoryData) return null;
    
    return (
      <div className="custom-category-settings-detail">
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3>{categoryData.displayName || categoryKey}</h3>
            <p style={{ color: '#666', margin: '5px 0' }}>
              Template: {categoryData.calculationTemplate || 'miniDomal'} | Type: {categoryType === 'sliding' ? 'Sliding Window' : 'Openable Window'}
            </p>
          </div>
          <button 
            onClick={() => setActiveTab('custom')}
            className="modal-btn-secondary"
          >
            ← Back to Custom Categories
          </button>
        </div>
        
        {/* Same settings UI as standard categories */}
        <div className="settings-section">
          <h4>Frame Components (kg per feet)</h4>
          <div className="settings-row">
            <div className="setting-item">
              <label>Outer Frame Weight (kg/ft)</label>
              <input
                type="number"
                value={categoryData.outerFrameKg}
                onChange={(e) => handleCustomCategoryChange(categoryType, categoryKey, 'outerFrameKg', e.target.value)}
                step="0.0001"
                placeholder="0.2000"
              />
              <span className="setting-hint">Used in standard 2-track windows</span>
            </div>

            <div className="setting-item">
              <label>Shutter Frame Weight (kg/ft)</label>
              <input
                type="number"
                value={categoryData.shutterFrameKg}
                onChange={(e) => handleCustomCategoryChange(categoryType, categoryKey, 'shutterFrameKg', e.target.value)}
                step="0.0001"
                placeholder="0.1750"
              />
              <span className="setting-hint">Weight per feet of shutter frame</span>
            </div>

            <div className="setting-item">
              <label>Inner Lock Clip Weight (kg/ft)</label>
              <input
                type="number"
                value={categoryData.innerLockClipKg}
                onChange={(e) => handleCustomCategoryChange(categoryType, categoryKey, 'innerLockClipKg', e.target.value)}
                step="0.0001"
                placeholder="0.0625"
              />
              <span className="setting-hint">Weight per feet of inner lock clip</span>
            </div>

            <div className="setting-item">
              <label>C-Channel Weight (kg/ft)</label>
              <input
                type="number"
                value={categoryData.cChannelKg}
                onChange={(e) => handleCustomCategoryChange(categoryType, categoryKey, 'cChannelKg', e.target.value)}
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
                value={categoryData.rtKg}
                onChange={(e) => handleCustomCategoryChange(categoryType, categoryKey, 'rtKg', e.target.value)}
                step="0.0001"
                placeholder="0.1250"
              />
              <span className="setting-hint">RT component for grill windows</span>
            </div>

            <div className="setting-item">
              <label>Round Pipe Weight (kg/ft)</label>
              <input
                type="number"
                value={categoryData.roundPipeKg}
                onChange={(e) => handleCustomCategoryChange(categoryType, categoryKey, 'roundPipeKg', e.target.value)}
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
                value={categoryData.outerFrameKgWithNet}
                onChange={(e) => handleCustomCategoryChange(categoryType, categoryKey, 'outerFrameKgWithNet', e.target.value)}
                step="0.0001"
                placeholder="0.26875"
              />
              <span className="setting-hint">Outer frame weight for mosquito net windows</span>
            </div>

            <div className="setting-item">
              <label>Outer Frame (with Grill) (kg/ft)</label>
              <input
                type="number"
                value={categoryData.outerFrameKgWithGrill}
                onChange={(e) => handleCustomCategoryChange(categoryType, categoryKey, 'outerFrameKgWithGrill', e.target.value)}
                step="0.0001"
                placeholder="0.2625"
              />
              <span className="setting-hint">Outer frame weight for grill windows</span>
            </div>
          </div>
        </div>

        {/* Cutting Profiles Section */}
        <div className="settings-section">
          <h4>Cutting Profiles</h4>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
            Assign cutting profiles for different window configurations. These profiles are created in the Cutting Measuring Tool.
          </p>
          <div className="settings-row">
            <div className="setting-item">
              <label>2 Track Profile</label>
              <select
                value={categoryData.cuttingProfiles?.['2_track'] || ''}
                onChange={(e) => handleCustomCategoryCuttingProfileChange(categoryType, categoryKey, '2_track', e.target.value)}
              >
                <option value="">-- Select Profile --</option>
                {Object.keys(settings.cuttingMeasuring?.profiles || {}).map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>

            <div className="setting-item">
              <label>2 Track + Mosquito Profile</label>
              <select
                value={categoryData.cuttingProfiles?.['2_track_mosquito'] || ''}
                onChange={(e) => handleCustomCategoryCuttingProfileChange(categoryType, categoryKey, '2_track_mosquito', e.target.value)}
              >
                <option value="">-- Select Profile --</option>
                {Object.keys(settings.cuttingMeasuring?.profiles || {}).map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>

            <div className="setting-item">
              <label>2 Track + Grill Profile</label>
              <select
                value={categoryData.cuttingProfiles?.['2_track_grill'] || ''}
                onChange={(e) => handleCustomCategoryCuttingProfileChange(categoryType, categoryKey, '2_track_grill', e.target.value)}
              >
                <option value="">-- Select Profile --</option>
                {Object.keys(settings.cuttingMeasuring?.profiles || {}).map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>

            <div className="setting-item">
              <label>2 Track + Mosquito + Grill Profile</label>
              <select
                value={categoryData.cuttingProfiles?.['2_track_mosquito_grill'] || ''}
                onChange={(e) => handleCustomCategoryCuttingProfileChange(categoryType, categoryKey, '2_track_mosquito_grill', e.target.value)}
              >
                <option value="">-- Select Profile --</option>
                {Object.keys(settings.cuttingMeasuring?.profiles || {}).map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCustomCategoriesSettings = () => {
    const slidingCategories = settings.customCategories?.sliding || {};
    const openableCategories = settings.customCategories?.openable || {};

    return (
      <div className="custom-categories-settings">
        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f0f9ff', borderRadius: '8px', border: '1px solid #bae6fd' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#0369a1' }}>📋 Custom Categories</h3>
          <p style={{ margin: 0, fontSize: '14px', color: '#0369a1' }}>
            Create your own window categories with custom settings. Each category can use a calculation template (Mini Domal, Domal, or Ventena) and have its own material weights.
          </p>
        </div>

        {/* Sliding Window Custom Categories */}
        <div className="custom-category-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3>🪟 Sliding Window Categories</h3>
            <button 
              onClick={() => handleOpenCustomCategoryModal('sliding')}
              className="add-profile-btn"
            >
              ➕ Add Category
            </button>
          </div>
          {Object.keys(slidingCategories).length === 0 ? (
            <p style={{ color: '#666', fontStyle: 'italic', padding: '20px', textAlign: 'center' }}>
              No custom categories yet. Click "Add Category" to create one.
            </p>
          ) : (
            <div className="profiles-grid">
              {Object.entries(slidingCategories).map(([key, category]) => (
                <div key={key} className="profile-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '18px' }}>{category.displayName || key}</h4>
                      <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#666' }}>
                        Template: {category.calculationTemplate || 'miniDomal'}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button
                        onClick={() => handleOpenCustomCategoryModal('sliding', key)}
                        className="profile-edit-btn"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteCustomCategory('sliding', key)}
                        className="profile-delete-btn"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', color: '#888', marginTop: '10px' }}>
                    <div>Outer Frame: {category.outerFrameKg} kg/ft</div>
                    <div>Shutter Frame: {category.shutterFrameKg} kg/ft</div>
                  </div>
                  {/* Quick edit button */}
                  <button
                    onClick={() => {
                      setActiveTab(key);
                      setSelectedTool('windowCosting');
                    }}
                    style={{
                      marginTop: '10px',
                      padding: '5px 10px',
                      fontSize: '12px',
                      backgroundColor: '#667eea',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    ⚙️ Edit Settings
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Openable Window Custom Categories */}
        <div className="custom-category-section" style={{ marginTop: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3>🚪 Openable Window Categories</h3>
            <button 
              onClick={() => handleOpenCustomCategoryModal('openable')}
              className="add-profile-btn"
            >
              ➕ Add Category
            </button>
          </div>
          {Object.keys(openableCategories).length === 0 ? (
            <p style={{ color: '#666', fontStyle: 'italic', padding: '20px', textAlign: 'center' }}>
              No custom categories yet. Click "Add Category" to create one.
            </p>
          ) : (
            <div className="profiles-grid">
              {Object.entries(openableCategories).map(([key, category]) => (
                <div key={key} className="profile-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '18px' }}>{category.displayName || key}</h4>
                      <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#666' }}>
                        Template: {category.calculationTemplate || 'miniDomal'}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button
                        onClick={() => handleOpenCustomCategoryModal('openable', key)}
                        className="profile-edit-btn"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteCustomCategory('openable', key)}
                        className="profile-delete-btn"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', color: '#888', marginTop: '10px' }}>
                    <div>Outer Frame: {category.outerFrameKg} kg/ft</div>
                    <div>Shutter Frame: {category.shutterFrameKg} kg/ft</div>
                  </div>
                  {/* Quick edit button */}
                  <button
                    onClick={() => {
                      setActiveTab(key);
                      setSelectedTool('windowCosting');
                    }}
                    style={{
                      marginTop: '10px',
                      padding: '5px 10px',
                      fontSize: '12px',
                      backgroundColor: '#667eea',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    ⚙️ Edit Settings
                  </button>
                </div>
              ))}
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
              <button
                className={`tab-button ${activeTab === 'custom' ? 'active' : ''}`}
                onClick={() => setActiveTab('custom')}
              >
                <span className="tab-icon">➕</span>
                Custom Categories
              </button>
            </div>

            <div className="tool-settings-body">
              {activeTab === 'custom' ? renderCustomCategoriesSettings() : 
               (settings.customCategories?.sliding?.[activeTab] || settings.customCategories?.openable?.[activeTab]) 
                 ? renderCustomCategorySettings(activeTab) 
                 : renderWindowCostingSettings(activeTab)}
            </div>
          </>
        )}

        {selectedTool === 'doorCosting' && (
          <div className="tool-settings-body">
            {renderDoorCostingSettings('standard')}
          </div>
        )}

        {selectedTool === 'cuttingMeasuring' && renderCuttingMeasuringTool()}

        {/* Custom Category Modal */}
        {showCustomCategoryModal && (
          <div className="profile-modal-overlay" onClick={() => setShowCustomCategoryModal(false)}>
            <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
              <div className="profile-modal-header">
                <h2>{editingCustomCategory ? 'Edit Custom Category' : 'Add Custom Category'}</h2>
                <button onClick={() => setShowCustomCategoryModal(false)} className="modal-close-btn">×</button>
              </div>
              <div className="profile-modal-body">
                <div className="form-group-profile">
                  <label>Category Name *</label>
                  <input
                    type="text"
                    value={customCategoryForm.name}
                    onChange={(e) => setCustomCategoryForm({ ...customCategoryForm, name: e.target.value })}
                    placeholder="e.g., Premium Sliding, Standard Openable"
                    disabled={!!editingCustomCategory}
                  />
                </div>

                <div className="form-group-profile">
                  <label>Window Type *</label>
                  <select
                    value={customCategoryForm.category}
                    onChange={(e) => setCustomCategoryForm({ ...customCategoryForm, category: e.target.value })}
                    disabled={!!editingCustomCategory}
                  >
                    <option value="sliding">Sliding Window</option>
                    <option value="openable">Openable Window</option>
                  </select>
                </div>

                <div className="form-group-profile">
                  <label>Calculation Template *</label>
                  <select
                    value={customCategoryForm.calculationTemplate}
                    onChange={(e) => setCustomCategoryForm({ ...customCategoryForm, calculationTemplate: e.target.value })}
                  >
                    <option value="miniDomal">Mini Domal</option>
                    <option value="domal">Domal</option>
                    <option value="ventena">Ventena</option>
                  </select>
                  <span style={{ fontSize: '12px', color: '#666', marginTop: '5px', display: 'block' }}>
                    This determines which calculation formula to use
                  </span>
                </div>

                <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                  <h4 style={{ margin: '0 0 15px 0' }}>Material Weights (kg per feet)</h4>
                  
                  <div className="form-group-profile">
                    <label>Outer Frame Weight (kg/ft)</label>
                    <input
                      type="number"
                      value={customCategoryForm.outerFrameKg}
                      onChange={(e) => setCustomCategoryForm({ ...customCategoryForm, outerFrameKg: e.target.value })}
                      step="0.0001"
                    />
                  </div>

                  <div className="form-group-profile">
                    <label>Shutter Frame Weight (kg/ft)</label>
                    <input
                      type="number"
                      value={customCategoryForm.shutterFrameKg}
                      onChange={(e) => setCustomCategoryForm({ ...customCategoryForm, shutterFrameKg: e.target.value })}
                      step="0.0001"
                    />
                  </div>

                  <div className="form-group-profile">
                    <label>Inner Lock Clip Weight (kg/ft)</label>
                    <input
                      type="number"
                      value={customCategoryForm.innerLockClipKg}
                      onChange={(e) => setCustomCategoryForm({ ...customCategoryForm, innerLockClipKg: e.target.value })}
                      step="0.0001"
                    />
                  </div>

                  <div className="form-group-profile">
                    <label>C-Channel Weight (kg/ft)</label>
                    <input
                      type="number"
                      value={customCategoryForm.cChannelKg}
                      onChange={(e) => setCustomCategoryForm({ ...customCategoryForm, cChannelKg: e.target.value })}
                      step="0.0001"
                    />
                  </div>

                  <div className="form-group-profile">
                    <label>RT Weight (kg/ft)</label>
                    <input
                      type="number"
                      value={customCategoryForm.rtKg}
                      onChange={(e) => setCustomCategoryForm({ ...customCategoryForm, rtKg: e.target.value })}
                      step="0.0001"
                    />
                  </div>

                  <div className="form-group-profile">
                    <label>Round Pipe Weight (kg/ft)</label>
                    <input
                      type="number"
                      value={customCategoryForm.roundPipeKg}
                      onChange={(e) => setCustomCategoryForm({ ...customCategoryForm, roundPipeKg: e.target.value })}
                      step="0.0001"
                    />
                  </div>

                  <div className="form-group-profile">
                    <label>Outer Frame (with Mosquito Net) (kg/ft)</label>
                    <input
                      type="number"
                      value={customCategoryForm.outerFrameKgWithNet}
                      onChange={(e) => setCustomCategoryForm({ ...customCategoryForm, outerFrameKgWithNet: e.target.value })}
                      step="0.0001"
                    />
                  </div>

                  <div className="form-group-profile">
                    <label>Outer Frame (with Grill) (kg/ft)</label>
                    <input
                      type="number"
                      value={customCategoryForm.outerFrameKgWithGrill}
                      onChange={(e) => setCustomCategoryForm({ ...customCategoryForm, outerFrameKgWithGrill: e.target.value })}
                      step="0.0001"
                    />
                  </div>
                </div>
              </div>
              <div className="profile-modal-footer">
                <button onClick={() => setShowCustomCategoryModal(false)} className="modal-btn-secondary">
                  Cancel
                </button>
                <button onClick={handleSaveCustomCategory} className="modal-btn-primary">
                  {editingCustomCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </div>
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
