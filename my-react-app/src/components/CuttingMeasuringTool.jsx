import { useState, useEffect } from 'react';
import { convertToTotalInches, inchesToFeet } from '../utils/costCalculator';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import './CuttingMeasuringTool.css';

const CuttingMeasuringTool = () => {
  const [profiles, setProfiles] = useState({});
  const [category, setCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [windowConfig, setWindowConfig] = useState('2_track'); // '2_track', '2_track_mosquito', '2_track_grill', '2_track_mosquito_grill'
  const [selectedProfile, setSelectedProfile] = useState(''); // Manual profile override
  const [length, setLength] = useState('');
  const [lengthDora, setLengthDora] = useState('');
  const [height, setHeight] = useState('');
  const [heightDora, setHeightDora] = useState('');
  const [tracks, setTracks] = useState(2);
  const [numberOfPipes, setNumberOfPipes] = useState('');
  const [cuttingList, setCuttingList] = useState(null);
  const [customCategories, setCustomCategories] = useState({ sliding: {}, openable: {} });
  const [availableLengths] = useState([
    { feet: 12, inches: 144, label: '12 feet' },
    { feet: 15, inches: 180, label: '15 feet' },
    { feet: 16, inches: 192, label: '16 feet' }
  ]);
  
  // Batch entry states
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchConfig, setBatchConfig] = useState(null);
  const [batchRows, setBatchRows] = useState([
    { id: 1, name: '', length: '', lengthDora: '', height: '', heightDora: '', numberOfPipes: '' }
  ]);
  const [batchCuttingList, setBatchCuttingList] = useState(null);

  // Calculate best material length to minimize waste
  const calculateBestMaterial = (requiredInches) => {
    let bestOption = null;
    let minWaste = Infinity;

    availableLengths.forEach(material => {
      if (material.inches >= requiredInches) {
        const waste = material.inches - requiredInches;
        if (waste < minWaste) {
          minWaste = waste;
          bestOption = material;
        }
      }
    });

    // If no material is long enough, find how many pieces needed
    if (!bestOption) {
      const options = availableLengths.map(material => {
        const piecesNeeded = Math.ceil(requiredInches / material.inches);
        const totalLength = piecesNeeded * material.inches;
        const waste = totalLength - requiredInches;
        return {
          ...material,
          piecesNeeded,
          totalLength,
          waste
        };
      });
      
      // Find option with least waste
      bestOption = options.reduce((best, current) => 
        current.waste < best.waste ? current : best
      );
    } else {
      bestOption = {
        ...bestOption,
        piecesNeeded: 1,
        totalLength: bestOption.inches,
        waste: minWaste
      };
    }

    return bestOption;
  };

  useEffect(() => {
    // Load profiles and custom categories from Tool Settings
    const loadSettings = () => {
      const savedSettings = localStorage.getItem('toolSettings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        if (parsed.cuttingMeasuring && parsed.cuttingMeasuring.profiles) {
          setProfiles(parsed.cuttingMeasuring.profiles);
        }
        if (parsed.customCategories) {
          setCustomCategories(parsed.customCategories);
        }
      }
    };
    
    loadSettings();
    
    // Listen for storage changes
    window.addEventListener('storage', loadSettings);
    return () => window.removeEventListener('storage', loadSettings);
  }, []);

  // Reset selected profile when category/subcategory/config changes
  useEffect(() => {
    setSelectedProfile('');
  }, [category, subCategory, windowConfig]);

  // Get profile automatically from Tool Settings
  const getProfileFromSettings = () => {
    const savedSettings = localStorage.getItem('toolSettings');
    if (!savedSettings) return null;
    
    const parsed = JSON.parse(savedSettings);
    
    // Check if it's a custom category
    if (parsed.customCategories && parsed.customCategories[category] && parsed.customCategories[category][subCategory]) {
      const customCategory = parsed.customCategories[category][subCategory];
      const cuttingProfiles = customCategory.cuttingProfiles || {};
      
      // Determine which profile to use based on configuration
      let configType = '2_track';
      if (windowConfig === '2_track_mosquito_grill') {
        configType = '2_track_mosquito_grill';
      } else if (windowConfig === '2_track_grill') {
        configType = '2_track_grill';
      } else if (windowConfig === '2_track_mosquito') {
        configType = '2_track_mosquito';
      }
      
      const profileName = cuttingProfiles[configType];
      if (!profileName) return null;
      
      const allProfiles = parsed.cuttingMeasuring?.profiles || {};
      if (!allProfiles[profileName]) return null;
      
      return {
        name: profileName,
        data: allProfiles[profileName]
      };
    }
    
    // Standard category
    if (!parsed.windowCosting || !parsed.windowCosting[subCategory]) return null;
    
    const cuttingProfiles = parsed.windowCosting[subCategory].cuttingProfiles;
    if (!cuttingProfiles) return null;
    
    // Determine which profile to use based on configuration
    let profileKey = '2_track';
    if (windowConfig === '2_track_mosquito_grill') {
      profileKey = '2_track_mosquito_grill';
    } else if (windowConfig === '2_track_grill') {
      profileKey = '2_track_grill';
    } else if (windowConfig === '2_track_mosquito') {
      profileKey = '2_track_mosquito';
    }
    
    const profileName = cuttingProfiles[profileKey];
    if (!profileName) return null;
    
    // Get the actual profile data
    if (parsed.cuttingMeasuring && parsed.cuttingMeasuring.profiles && parsed.cuttingMeasuring.profiles[profileName]) {
      return {
        name: profileName,
        data: parsed.cuttingMeasuring.profiles[profileName]
      };
    }
    
    return null;
  };

  const calculateCuttingList = () => {
    if (!category || !subCategory || !length || !height) {
      alert('Please fill in all required fields');
      return;
    }

    // Validate pipes for grill configurations
    if ((windowConfig === '2_track_grill' || windowConfig === '2_track_mosquito_grill') && (!numberOfPipes || parseInt(numberOfPipes) < 1)) {
      alert('Please enter the number of pipes required for grill window');
      return;
    }

    // Get profile - use manual selection if provided, otherwise auto-select from settings
    let profileInfo = null;
    let profile = null;
    let profileName = '';

    if (selectedProfile && profiles[selectedProfile]) {
      // Use manually selected profile
      profile = profiles[selectedProfile];
      profileName = selectedProfile;
    } else {
      // Automatically get profile from Tool Settings
      profileInfo = getProfileFromSettings();
      if (!profileInfo) {
        alert('No cutting profile configured for this category/subcategory/configuration combination. Please select a profile manually or configure it in Tool Settings → Window Costing Calculator.');
        return;
      }
      profile = profileInfo.data;
      profileName = profileInfo.name;
    }

    // Convert to total inches
    const l = convertToTotalInches(parseFloat(length), parseFloat(lengthDora) || 0);
    const h = convertToTotalInches(parseFloat(height), parseFloat(heightDora) || 0);
    const t = parseInt(tracks);
    const numPipes = parseInt(numberOfPipes) || 0;

    // Get reductions from profile
    const topReduction = profile.top?.total || 0;
    const bottomReduction = profile.bottom?.total || 0;
    const handleReduction = profile.handleInnerLock?.total || 0;
    const interLockReduction = profile.interLock?.total || 0;
    const bearingReduction = profile.bearingBottom?.total || 0;
    const rtReduction = profile.rt?.total || 0;
    const roundPipeReduction = profile.roundPipe?.total || 0;
    const brightBarReduction = profile.brightBar?.total || 0;
    const shutterReduction = profile.shutter?.total || 0;
    const cChannelLengthReduction = profile.cChannelLength?.total || 0;
    const cChannelHeightReduction = profile.cChannelHeight?.total || 0;
    const mosquitoNetLengthIncrease = profile.mosquitoNet?.lengthIncrease || 0;
    const mosquitoNetHeightIncrease = profile.mosquitoNet?.heightIncrease || 0;

    // Calculate base values
    const bearingPerPiece = (l - bearingReduction) / 2;
    const handlePerPiece = h - handleReduction;
    
    // Common calculations for all configurations
    const topTotal = (2 * h) + l;
    const bottomTotal = l;
    const handleTotal = handlePerPiece * t;
    const interLockTotal = (h - interLockReduction) * t;

    const calculations = {
      // Outer Frame Materials (same for all configurations)
      top: {
        formula: '(2 × Height) + Length',
        totalInches: topTotal,
        pieces: 1,
        unit: 'inches',
        optimization: calculateBestMaterial(topTotal)
      },
      bottom: {
        formula: 'Length',
        totalInches: bottomTotal,
        pieces: 1,
        unit: 'inches',
        optimization: calculateBestMaterial(bottomTotal)
      },
      // Track Materials
      handleInnerLock: {
        formula: '(Height - Reduction) × Tracks',
        totalInches: handleTotal,
        perPiece: handlePerPiece,
        pieces: t,
        unit: 'inches',
        optimization: calculateBestMaterial(handleTotal)
      },
      interLock: {
        formula: '(Height - Reduction) × Tracks',
        totalInches: interLockTotal,
        perPiece: h - interLockReduction,
        pieces: t,
        unit: 'inches',
        optimization: calculateBestMaterial(interLockTotal)
      },
      bearingBottom: {
        formula: windowConfig === '2_track_mosquito' || windowConfig === '2_track_mosquito_grill' 
          ? '((Length - Reduction) / 2) × (Tracks × 3)'
          : '((Length - Reduction) / 2) × (Tracks × 2)',
        totalInches: bearingPerPiece * (windowConfig === '2_track_mosquito' || windowConfig === '2_track_mosquito_grill' ? 3 * t : 2 * t),
        perPiece: bearingPerPiece,
        pieces: windowConfig === '2_track_mosquito' || windowConfig === '2_track_mosquito_grill' ? 3 * t : 2 * t,
        unit: 'inches',
        optimization: calculateBestMaterial(bearingPerPiece * (windowConfig === '2_track_mosquito' || windowConfig === '2_track_mosquito_grill' ? 3 * t : 2 * t))
      },
      glass: {
        formula: '(Bearing Bottom + 0.625) × (Handle Inner Lock + 0.625)',
        length: bearingPerPiece + 0.625,
        height: handlePerPiece + 0.625,
        pieces: t,
        unit: 'dimensions',
        optimization: null
      }
    };

    // Add Grill Materials (for 2_track_grill and 2_track_mosquito_grill)
    if (windowConfig === '2_track_grill' || windowConfig === '2_track_mosquito_grill') {
      // RT: l - rtReduction, pieces needed = 1
      const rtPerPiece = l - rtReduction;
      calculations.rt = {
        formula: 'Length - RT Reduction',
        totalInches: rtPerPiece,
        perPiece: rtPerPiece,
        pieces: 1,
        unit: 'inches',
        optimization: calculateBestMaterial(rtPerPiece)
      };

      // Round Pipe: (l - roundPipeReduction) × numberOfPipes
      const roundPipePerPiece = l - roundPipeReduction;
      const roundPipeTotal = roundPipePerPiece * numPipes;
      calculations.roundPipe = {
        formula: '(Length - Reduction) × Number of Pipes',
        totalInches: roundPipeTotal,
        perPiece: roundPipePerPiece,
        pieces: numPipes,
        unit: 'inches',
        optimization: calculateBestMaterial(roundPipeTotal)
      };

      // Bright Bar: (l - brightBarReduction) × numberOfPipes
      const brightBarPerPiece = l - brightBarReduction;
      const brightBarTotal = brightBarPerPiece * numPipes;
      calculations.brightBar = {
        formula: '(Length - Reduction) × Number of Pipes',
        totalInches: brightBarTotal,
        perPiece: brightBarPerPiece,
        pieces: numPipes,
        unit: 'inches',
        optimization: calculateBestMaterial(brightBarTotal)
      };
    }

    // Add Mosquito Net Materials (for 2_track_mosquito and 2_track_mosquito_grill)
    if (windowConfig === '2_track_mosquito' || windowConfig === '2_track_mosquito_grill') {
      // Shutter: (l/2 - shutterReduction), need 2 pieces
      const shutterPerPiece = (l / 2) - shutterReduction;
      const shutterTotal = shutterPerPiece * 2;
      calculations.shutter = {
        formula: '(Length / 2 - Reduction) × 2',
        totalInches: shutterTotal,
        perPiece: shutterPerPiece,
        pieces: 2,
        unit: 'inches',
        optimization: calculateBestMaterial(shutterTotal)
      };

      // Mosquito Net: (Bearing Bottom + increase) × (Handle Inner Lock + increase)
      const mosquitoNetLength = bearingPerPiece + mosquitoNetLengthIncrease;
      const mosquitoNetHeight = handlePerPiece + mosquitoNetHeightIncrease;
      calculations.mosquitoNet = {
        formula: '(Bearing Bottom + Increase) × (Handle Inner Lock + Increase)',
        length: mosquitoNetLength,
        height: mosquitoNetHeight,
        pieces: t,
        unit: 'dimensions',
        optimization: null
      };

      // C-Channel Length: ((l/2) - cChannelLengthReduction), need 2 pieces
      const cChannelLengthPerPiece = (l / 2) - cChannelLengthReduction;
      const cChannelLengthTotal = cChannelLengthPerPiece * 2;
      calculations.cChannelLength = {
        formula: '((Length / 2) - Reduction) × 2',
        totalInches: cChannelLengthTotal,
        perPiece: cChannelLengthPerPiece,
        pieces: 2,
        unit: 'inches',
        optimization: calculateBestMaterial(cChannelLengthTotal)
      };

      // C-Channel Height: (h - cChannelHeightReduction), need 2 pieces
      const cChannelHeightPerPiece = h - cChannelHeightReduction;
      const cChannelHeightTotal = cChannelHeightPerPiece * 2;
      calculations.cChannelHeight = {
        formula: '(Height - Reduction) × 2',
        totalInches: cChannelHeightTotal,
        perPiece: cChannelHeightPerPiece,
        pieces: 2,
        unit: 'inches',
        optimization: calculateBestMaterial(cChannelHeightTotal)
      };
    }

    setCuttingList({
      profile: profileName,
      category,
      subCategory,
      windowConfig,
      dimensions: { length: l, height: h, tracks: t, numberOfPipes: numPipes },
      calculations
    });
  };

  const handleReset = () => {
    setCategory('');
    setSubCategory('');
    setWindowConfig('2_track');
    setSelectedProfile('');
    setLength('');
    setLengthDora('');
    setHeight('');
    setHeightDora('');
    setTracks(2);
    setNumberOfPipes('');
    setCuttingList(null);
  };

  // Batch mode functions
  const handleOpenBatchMode = () => {
    if (!category || !subCategory) {
      alert('Please select Category and Sub Category first');
      return;
    }

    // Capture current form configuration
    const config = {
      category,
      subCategory,
      windowConfig,
      tracks: parseInt(tracks),
      selectedProfile
    };
    
    setBatchConfig(config);
    setBatchRows([{ id: 1, name: '', length: '', lengthDora: '', height: '', heightDora: '', numberOfPipes: '' }]);
    setShowBatchModal(true);
  };

  const handleCloseBatchModal = () => {
    setShowBatchModal(false);
    setBatchConfig(null);
    setBatchRows([{ id: 1, name: '', length: '', lengthDora: '', height: '', heightDora: '', numberOfPipes: '' }]);
    setBatchCuttingList(null);
  };

  const handleAddBatchRow = () => {
    const newId = Math.max(...batchRows.map(r => r.id), 0) + 1;
    setBatchRows([...batchRows, { id: newId, name: '', length: '', lengthDora: '', height: '', heightDora: '', numberOfPipes: '' }]);
  };

  const handleRemoveBatchRow = (id) => {
    if (batchRows.length > 1) {
      setBatchRows(batchRows.filter(row => row.id !== id));
    }
  };

  const handleBatchRowChange = (id, field, value) => {
    setBatchRows(batchRows.map(row => 
      row.id === id ? { ...row, [field]: value } : row
    ));
  };

  const handleCalculateBatch = () => {
    // Validate all rows
    for (const row of batchRows) {
      if (!row.name || !row.length || !row.height) {
        alert('Please fill in Name, Length, and Height for all windows');
        return;
      }
      
      if ((batchConfig.windowConfig === '2_track_grill' || batchConfig.windowConfig === '2_track_mosquito_grill') && (!row.numberOfPipes || parseInt(row.numberOfPipes) < 1)) {
        alert(`Please enter number of pipes for window "${row.name}"`);
        return;
      }
    }

    // Get profile
    let profile = null;
    let profileName = '';

    if (batchConfig.selectedProfile && profiles[batchConfig.selectedProfile]) {
      profile = profiles[batchConfig.selectedProfile];
      profileName = batchConfig.selectedProfile;
    } else {
      // Try to get from settings
      const savedSettings = localStorage.getItem('toolSettings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        
        // Check custom category
        if (parsed.customCategories && parsed.customCategories[batchConfig.category] && parsed.customCategories[batchConfig.category][batchConfig.subCategory]) {
          const customCategory = parsed.customCategories[batchConfig.category][batchConfig.subCategory];
          const cuttingProfiles = customCategory.cuttingProfiles || {};
          let configType = '2_track';
          if (batchConfig.windowConfig === '2_track_mosquito_grill') {
            configType = '2_track_mosquito_grill';
          } else if (batchConfig.windowConfig === '2_track_grill') {
            configType = '2_track_grill';
          } else if (batchConfig.windowConfig === '2_track_mosquito') {
            configType = '2_track_mosquito';
          }
          const profileNameFromSettings = cuttingProfiles[configType];
          if (profileNameFromSettings && parsed.cuttingMeasuring?.profiles?.[profileNameFromSettings]) {
            profile = parsed.cuttingMeasuring.profiles[profileNameFromSettings];
            profileName = profileNameFromSettings;
          }
        } else if (parsed.windowCosting && parsed.windowCosting[batchConfig.subCategory]) {
          const cuttingProfiles = parsed.windowCosting[batchConfig.subCategory].cuttingProfiles;
          if (cuttingProfiles) {
            let profileKey = '2_track';
            if (batchConfig.windowConfig === '2_track_mosquito_grill') {
              profileKey = '2_track_mosquito_grill';
            } else if (batchConfig.windowConfig === '2_track_grill') {
              profileKey = '2_track_grill';
            } else if (batchConfig.windowConfig === '2_track_mosquito') {
              profileKey = '2_track_mosquito';
            }
            const profileNameFromSettings = cuttingProfiles[profileKey];
            if (profileNameFromSettings && parsed.cuttingMeasuring?.profiles?.[profileNameFromSettings]) {
              profile = parsed.cuttingMeasuring.profiles[profileNameFromSettings];
              profileName = profileNameFromSettings;
            }
          }
        }
      }
    }

    if (!profile) {
      alert('No cutting profile found. Please configure a profile in Tool Settings or select one manually.');
      return;
    }

    // Calculate cutting list for each window
    const windowsData = batchRows.map(row => {
      const l = convertToTotalInches(parseFloat(row.length), parseFloat(row.lengthDora) || 0);
      const h = convertToTotalInches(parseFloat(row.height), parseFloat(row.heightDora) || 0);
      const t = batchConfig.tracks;
      const numPipes = parseInt(row.numberOfPipes) || 0;

      // Use the same calculation logic as single window
      const topReduction = profile.top?.total || 0;
      const bottomReduction = profile.bottom?.total || 0;
      const handleReduction = profile.handleInnerLock?.total || 0;
      const interLockReduction = profile.interLock?.total || 0;
      const bearingReduction = profile.bearingBottom?.total || 0;
      const rtReduction = profile.rt?.total || 0;
      const roundPipeReduction = profile.roundPipe?.total || 0;
      const brightBarReduction = profile.brightBar?.total || 0;
      const shutterReduction = profile.shutter?.total || 0;
      const cChannelLengthReduction = profile.cChannelLength?.total || 0;
      const cChannelHeightReduction = profile.cChannelHeight?.total || 0;
      const mosquitoNetLengthIncrease = profile.mosquitoNet?.lengthIncrease || 0;
      const mosquitoNetHeightIncrease = profile.mosquitoNet?.heightIncrease || 0;

      const bearingPerPiece = (l - bearingReduction) / 2;
      const handlePerPiece = h - handleReduction;

      const topTotal = (2 * h) + l;
      const bottomTotal = l;
      const handleTotal = handlePerPiece * t;
      const interLockTotal = (h - interLockReduction) * t;

      const calculations = {
        top: {
          formula: '(2 × Height) + Length',
          totalInches: topTotal,
          pieces: 1,
          unit: 'inches',
          optimization: calculateBestMaterial(topTotal)
        },
        bottom: {
          formula: 'Length',
          totalInches: bottomTotal,
          pieces: 1,
          unit: 'inches',
          optimization: calculateBestMaterial(bottomTotal)
        },
        handleInnerLock: {
          formula: '(Height - Reduction) × Tracks',
          totalInches: handleTotal,
          perPiece: handlePerPiece,
          pieces: t,
          unit: 'inches',
          optimization: calculateBestMaterial(handleTotal)
        },
        interLock: {
          formula: '(Height - Reduction) × Tracks',
          totalInches: interLockTotal,
          perPiece: h - interLockReduction,
          pieces: t,
          unit: 'inches',
          optimization: calculateBestMaterial(interLockTotal)
        }
      };

      // Bearing Bottom calculation based on config
      let bearingMultiplier = 2;
      if (batchConfig.windowConfig === '2_track_mosquito' || batchConfig.windowConfig === '2_track_mosquito_grill') {
        bearingMultiplier = 3;
      }
      const bearingTotal = bearingPerPiece * bearingMultiplier * t;
      calculations.bearingBottom = {
        formula: `((Length - Reduction) / 2) × (Tracks × ${bearingMultiplier})`,
        totalInches: bearingTotal,
        perPiece: bearingPerPiece,
        pieces: bearingMultiplier * t,
        unit: 'inches',
        optimization: calculateBestMaterial(bearingTotal)
      };

      // Glass
      calculations.glass = {
        formula: '(Bearing Bottom + 0.625) × (Handle Inner Lock + 0.625)',
        length: bearingPerPiece + 0.625,
        height: handlePerPiece + 0.625,
        pieces: t,
        unit: 'dimensions',
        optimization: null
      };

      // Grill materials
      if (batchConfig.windowConfig === '2_track_grill' || batchConfig.windowConfig === '2_track_mosquito_grill') {
        const rtTotal = (l - rtReduction) * numPipes;
        const roundPipeTotal = (l - roundPipeReduction) * numPipes;
        const brightBarTotal = (l - brightBarReduction) * numPipes;

        calculations.rt = {
          formula: '(Length - RT Reduction) × Number of Pipes',
          totalInches: rtTotal,
          pieces: numPipes,
          unit: 'inches',
          optimization: calculateBestMaterial(rtTotal)
        };
        calculations.roundPipe = {
          formula: '(Length - Reduction) × Number of Pipes',
          totalInches: roundPipeTotal,
          pieces: numPipes,
          unit: 'inches',
          optimization: calculateBestMaterial(roundPipeTotal)
        };
        calculations.brightBar = {
          formula: '(Length - Reduction) × Number of Pipes',
          totalInches: brightBarTotal,
          pieces: numPipes,
          unit: 'inches',
          optimization: calculateBestMaterial(brightBarTotal)
        };
      }

      // Mosquito net materials
      if (batchConfig.windowConfig === '2_track_mosquito' || batchConfig.windowConfig === '2_track_mosquito_grill') {
        const shutterTotal = ((l / 2) - shutterReduction) * 2;
        const mosquitoNetLength = bearingPerPiece + mosquitoNetLengthIncrease;
        const mosquitoNetHeight = handlePerPiece + mosquitoNetHeightIncrease;
        const cChannelLengthTotal = ((l / 2) - cChannelLengthReduction) * 2;
        const cChannelHeightTotal = (h - cChannelHeightReduction) * 2;

        calculations.shutter = {
          formula: '(Length/2 - Reduction) × 2',
          totalInches: shutterTotal,
          pieces: 2,
          unit: 'inches',
          optimization: calculateBestMaterial(shutterTotal)
        };
        calculations.mosquitoNet = {
          formula: '(Bearing Bottom + increasing length) × (Handle Inner Lock + increasing length)',
          length: mosquitoNetLength,
          height: mosquitoNetHeight,
          pieces: t,
          unit: 'dimensions',
          optimization: null
        };
        calculations.cChannelLength = {
          formula: '((Length / 2) - Reduction) × 2',
          totalInches: cChannelLengthTotal,
          pieces: 2,
          unit: 'inches',
          optimization: calculateBestMaterial(cChannelLengthTotal)
        };
        calculations.cChannelHeight = {
          formula: '(Height - Reduction) × 2',
          totalInches: cChannelHeightTotal,
          pieces: 2,
          unit: 'inches',
          optimization: calculateBestMaterial(cChannelHeightTotal)
        };
      }

      return {
        name: row.name,
        dimensions: { length: l, height: h, tracks: t, numberOfPipes: numPipes },
        calculations
      };
    });

    // Aggregate totals
    const aggregatedCalculations = {};
    Object.keys(windowsData[0].calculations).forEach(material => {
      const calc = windowsData[0].calculations[material];
      if (calc.unit === 'inches' && calc.optimization) {
        const totalInches = windowsData.reduce((sum, w) => sum + (w.calculations[material]?.totalInches || 0), 0);
        aggregatedCalculations[material] = {
          ...calc,
          totalInches,
          optimization: calculateBestMaterial(totalInches),
          windows: windowsData.map(w => ({
            name: w.name,
            totalInches: w.calculations[material]?.totalInches || 0
          }))
        };
      } else if (calc.unit === 'dimensions') {
        aggregatedCalculations[material] = {
          ...calc,
          windows: windowsData.map(w => ({
            name: w.name,
            length: w.calculations[material]?.length || 0,
            height: w.calculations[material]?.height || 0,
            pieces: w.calculations[material]?.pieces || 0
          }))
        };
      }
    });

    setBatchCuttingList({
      profile: profileName,
      category: batchConfig.category,
      subCategory: batchConfig.subCategory,
      windowConfig: batchConfig.windowConfig,
      windows: windowsData,
      aggregatedCalculations
    });
  };

  const generatePDF = () => {
    if (!cuttingList) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Header
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('Material Cutting List', pageWidth / 2, 20, { align: 'center' });
    
    // Company info (you can customize)
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text('Window Management System', pageWidth / 2, 28, { align: 'center' });
    
    // Line separator
    doc.setDrawColor(200, 200, 200);
    doc.line(15, 32, pageWidth - 15, 32);
    
    // Window dimensions - prominently displayed
    const windowLength = cuttingList.dimensions.length.toFixed(2);
    const windowHeight = cuttingList.dimensions.height.toFixed(2);
    const numTracks = cuttingList.dimensions.tracks;
    
    // Project details with prominent window dimensions
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('Project Details:', 15, 42);
    
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    const categoryName = cuttingList.category === 'sliding' ? 'Sliding Window' : 'Openable Window';
    const subCategoryName = cuttingList.subCategory === 'miniDomal' ? 'Mini Domal' : 
                           cuttingList.subCategory === 'domal' ? 'Domal' : 
                           cuttingList.subCategory === 'ventena' ? 'Ventena' : cuttingList.subCategory;
    const configName = cuttingList.windowConfig === '2_track' ? '2 Track' : 
                      cuttingList.windowConfig === '2_track_mosquito' ? '2 Track + Mosquito' : 
                      cuttingList.windowConfig === '2_track_grill' ? '2 Track + Grill' : 
                      '2 Track + Mosquito + Grill';
    
    doc.text(`Category: ${categoryName}`, 15, 50);
    doc.text(`Sub Category: ${subCategoryName}`, 15, 56);
    doc.text(`Configuration: ${configName}`, 15, 62);
    doc.text(`Profile: ${cuttingList.profile}`, 15, 68);
    
    // Prominent Window Length and Height
    doc.setFont(undefined, 'bold');
    doc.setFontSize(12);
    doc.setTextColor(220, 38, 38);
    doc.text(`Window Length: ${windowLength}"`, 15, 76);
    doc.text(`Window Height: ${windowHeight}"`, 15, 84);
    
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Number of Tracks: ${numTracks}`, 15, 92);
    if (cuttingList.dimensions.numberOfPipes > 0) {
      doc.text(`Number of Pipes: ${cuttingList.dimensions.numberOfPipes}`, 15, 98);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 15, 104);
    } else {
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 15, 98);
    }
    
    // Main Cutting Details Table
    const cuttingDetailsData = [];
    
    // Helper function to get bars needed and waste
    const getBarsAndWaste = (optimization) => {
      if (!optimization) return { bars: '-', waste: '-' };
      const bars = (optimization.piecesNeeded !== undefined) ? optimization.piecesNeeded : 1;
      const waste = (optimization.waste !== undefined) ? optimization.waste.toFixed(2) + '"' : '-';
      return { bars, waste };
    };
    
    // TOP HEIGHT (2 pieces of height)
    const topHeightTotal = 2 * cuttingList.dimensions.height;
    const topHeightOpt = calculateBestMaterial(topHeightTotal);
    const topHeightBars = getBarsAndWaste(topHeightOpt);
    cuttingDetailsData.push([
      'TOP HEIGHT',
      `2 pcs × ${windowHeight}"`,
      '2',
      topHeightTotal.toFixed(2) + '"',
      topHeightOpt?.label || '-',
      topHeightBars.bars,
      topHeightBars.waste
    ]);
    
    // TOP WIDTH (1 piece of length)
    const topWidthTotal = cuttingList.dimensions.length;
    const topWidthOpt = calculateBestMaterial(topWidthTotal);
    const topWidthBars = getBarsAndWaste(topWidthOpt);
    cuttingDetailsData.push([
      'TOP WIDTH',
      `1 pc × ${windowLength}"`,
      '1',
      topWidthTotal.toFixed(2) + '"',
      topWidthOpt?.label || '-',
      topWidthBars.bars,
      topWidthBars.waste
    ]);
    
    // BOTTOM
    const bottomOpt = cuttingList.calculations.bottom.optimization;
    const bottomBars = getBarsAndWaste(bottomOpt);
    cuttingDetailsData.push([
      'BOTTOM',
      `1 pc × ${windowLength}"`,
      cuttingList.calculations.bottom.pieces,
      cuttingList.calculations.bottom.totalInches.toFixed(2) + '"',
      bottomOpt?.label || '-',
      bottomBars.bars,
      bottomBars.waste
    ]);
    
    // HANDLE INNER LOCK
    const handleOpt = cuttingList.calculations.handleInnerLock.optimization;
    const handleBars = getBarsAndWaste(handleOpt);
    cuttingDetailsData.push([
      'HANDLE INNER LOCK',
      `${numTracks} pcs × ${cuttingList.calculations.handleInnerLock.perPiece.toFixed(2)}"`,
      cuttingList.calculations.handleInnerLock.pieces,
      cuttingList.calculations.handleInnerLock.totalInches.toFixed(2) + '"',
      handleOpt?.label || '-',
      handleBars.bars,
      handleBars.waste
    ]);
    
    // INTER LOCK
    const interOpt = cuttingList.calculations.interLock.optimization;
    const interBars = getBarsAndWaste(interOpt);
    cuttingDetailsData.push([
      'INTER LOCK',
      `${numTracks} pcs × ${cuttingList.calculations.interLock.perPiece.toFixed(2)}"`,
      cuttingList.calculations.interLock.pieces,
      cuttingList.calculations.interLock.totalInches.toFixed(2) + '"',
      interOpt?.label || '-',
      interBars.bars,
      interBars.waste
    ]);
    
    // BEARING BOTTOM
    const bearingOpt = cuttingList.calculations.bearingBottom.optimization;
    const bearingBars = getBarsAndWaste(bearingOpt);
    cuttingDetailsData.push([
      'BEARING BOTTOM',
      `${cuttingList.calculations.bearingBottom.pieces} pcs × ${cuttingList.calculations.bearingBottom.perPiece.toFixed(2)}"`,
      cuttingList.calculations.bearingBottom.pieces,
      cuttingList.calculations.bearingBottom.totalInches.toFixed(2) + '"',
      bearingOpt?.label || '-',
      bearingBars.bars,
      bearingBars.waste
    ]);
    
    // GLASS
    cuttingDetailsData.push([
      'GLASS',
      `${cuttingList.calculations.glass.length.toFixed(2)}" × ${cuttingList.calculations.glass.height.toFixed(2)}"`,
      cuttingList.calculations.glass.pieces,
      `${cuttingList.calculations.glass.length.toFixed(2)}" × ${cuttingList.calculations.glass.height.toFixed(2)}"`,
      'N/A',
      'N/A',
      'N/A'
    ]);

    // Grill Materials (if exists)
    if (cuttingList.calculations.rt) {
      const rtOpt = cuttingList.calculations.rt.optimization;
      const rtBars = getBarsAndWaste(rtOpt);
      cuttingDetailsData.push([
        'RT',
        `1 pc × ${cuttingList.calculations.rt.perPiece.toFixed(2)}"`,
        cuttingList.calculations.rt.pieces,
        cuttingList.calculations.rt.totalInches.toFixed(2) + '"',
        rtOpt?.label || '-',
        rtBars.bars,
        rtBars.waste
      ]);
    }

    if (cuttingList.calculations.roundPipe) {
      const roundPipeOpt = cuttingList.calculations.roundPipe.optimization;
      const roundPipeBars = getBarsAndWaste(roundPipeOpt);
      cuttingDetailsData.push([
        'ROUND PIPE',
        `${cuttingList.calculations.roundPipe.pieces} pcs × ${cuttingList.calculations.roundPipe.perPiece.toFixed(2)}"`,
        cuttingList.calculations.roundPipe.pieces,
        cuttingList.calculations.roundPipe.totalInches.toFixed(2) + '"',
        roundPipeOpt?.label || '-',
        roundPipeBars.bars,
        roundPipeBars.waste
      ]);
    }

    if (cuttingList.calculations.brightBar) {
      const brightBarOpt = cuttingList.calculations.brightBar.optimization;
      const brightBarBars = getBarsAndWaste(brightBarOpt);
      cuttingDetailsData.push([
        'BRIGHT BAR',
        `${cuttingList.calculations.brightBar.pieces} pcs × ${cuttingList.calculations.brightBar.perPiece.toFixed(2)}"`,
        cuttingList.calculations.brightBar.pieces,
        cuttingList.calculations.brightBar.totalInches.toFixed(2) + '"',
        brightBarOpt?.label || '-',
        brightBarBars.bars,
        brightBarBars.waste
      ]);
    }

    // Mosquito Net Materials (if exists)
    if (cuttingList.calculations.shutter) {
      const shutterOpt = cuttingList.calculations.shutter.optimization;
      const shutterBars = getBarsAndWaste(shutterOpt);
      cuttingDetailsData.push([
        'SHUTTER',
        `${cuttingList.calculations.shutter.pieces} pcs × ${cuttingList.calculations.shutter.perPiece.toFixed(2)}"`,
        cuttingList.calculations.shutter.pieces,
        cuttingList.calculations.shutter.totalInches.toFixed(2) + '"',
        shutterOpt?.label || '-',
        shutterBars.bars,
        shutterBars.waste
      ]);
    }

    if (cuttingList.calculations.mosquitoNet) {
      cuttingDetailsData.push([
        'MOSQUITO NET',
        `${cuttingList.calculations.mosquitoNet.length.toFixed(2)}" × ${cuttingList.calculations.mosquitoNet.height.toFixed(2)}"`,
        cuttingList.calculations.mosquitoNet.pieces,
        `${cuttingList.calculations.mosquitoNet.length.toFixed(2)}" × ${cuttingList.calculations.mosquitoNet.height.toFixed(2)}"`,
        'N/A',
        'N/A',
        'N/A'
      ]);
    }

    if (cuttingList.calculations.cChannelLength) {
      const cChannelLengthOpt = cuttingList.calculations.cChannelLength.optimization;
      const cChannelLengthBars = getBarsAndWaste(cChannelLengthOpt);
      cuttingDetailsData.push([
        'C-CHANNEL (LENGTH)',
        `${cuttingList.calculations.cChannelLength.pieces} pcs × ${cuttingList.calculations.cChannelLength.perPiece.toFixed(2)}"`,
        cuttingList.calculations.cChannelLength.pieces,
        cuttingList.calculations.cChannelLength.totalInches.toFixed(2) + '"',
        cChannelLengthOpt?.label || '-',
        cChannelLengthBars.bars,
        cChannelLengthBars.waste
      ]);
    }

    if (cuttingList.calculations.cChannelHeight) {
      const cChannelHeightOpt = cuttingList.calculations.cChannelHeight.optimization;
      const cChannelHeightBars = getBarsAndWaste(cChannelHeightOpt);
      cuttingDetailsData.push([
        'C-CHANNEL (HEIGHT)',
        `${cuttingList.calculations.cChannelHeight.pieces} pcs × ${cuttingList.calculations.cChannelHeight.perPiece.toFixed(2)}"`,
        cuttingList.calculations.cChannelHeight.pieces,
        cuttingList.calculations.cChannelHeight.totalInches.toFixed(2) + '"',
        cChannelHeightOpt?.label || '-',
        cChannelHeightBars.bars,
        cChannelHeightBars.waste
      ]);
    }
    
    // Main table
    const startY = cuttingList.dimensions.numberOfPipes > 0 ? 110 : 104;
    autoTable(doc, {
      startY: startY,
      head: [['Material', 'Size', 'Units', 'Total', 'Which Material', 'How Much Bar', 'Wasteage']],
      body: cuttingDetailsData,
      theme: 'grid',
      headStyles: {
        fillColor: [245, 158, 11],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 9
      },
      bodyStyles: {
        fontSize: 8
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251]
      },
      columnStyles: {
        0: { cellWidth: 28, fontStyle: 'bold' },
        1: { cellWidth: 35, halign: 'left' },
        2: { cellWidth: 18, halign: 'center' },
        3: { cellWidth: 22, halign: 'right' },
        4: { cellWidth: 25, halign: 'center' },
        5: { cellWidth: 20, halign: 'center' },
        6: { cellWidth: 20, halign: 'right' }
      },
      margin: { left: 10, right: 10 }
    });
    
    // Footer
    const footerY = doc.internal.pageSize.getHeight() - 15;
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Generated on ${new Date().toLocaleString()}`, pageWidth / 2, footerY, { align: 'center' });
    
    // Save PDF
    const fileName = `Cutting_List_${cuttingList.profile.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  const generateBatchPDF = () => {
    if (!batchCuttingList) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('Batch Material Cutting List', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text('Window Management System', pageWidth / 2, 28, { align: 'center' });
    
    doc.setDrawColor(200, 200, 200);
    doc.line(15, 32, pageWidth - 15, 32);
    
    // Project details
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('Project Details:', 15, 42);
    
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    const categoryName = batchCuttingList.category === 'sliding' ? 'Sliding Window' : 'Openable Window';
    const subCategoryName = batchCuttingList.subCategory === 'miniDomal' ? 'Mini Domal' : 
                           batchCuttingList.subCategory === 'domal' ? 'Domal' : 
                           batchCuttingList.subCategory === 'ventena' ? 'Ventena' : batchCuttingList.subCategory;
    const configName = batchCuttingList.windowConfig === '2_track' ? '2 Track' : 
                      batchCuttingList.windowConfig === '2_track_mosquito' ? '2 Track + Mosquito' : 
                      batchCuttingList.windowConfig === '2_track_grill' ? '2 Track + Grill' : 
                      '2 Track + Mosquito + Grill';
    
    doc.text(`Category: ${categoryName}`, 15, 50);
    doc.text(`Sub Category: ${subCategoryName}`, 15, 56);
    doc.text(`Configuration: ${configName}`, 15, 62);
    doc.text(`Profile: ${batchCuttingList.profile}`, 15, 68);
    doc.text(`Total Windows: ${batchCuttingList.windows.length}`, 15, 74);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 15, 80);
    
    // Windows list
    let startY = 90;
    doc.setFont(undefined, 'bold');
    doc.setFontSize(11);
    doc.text('Windows:', 15, startY);
    startY += 8;
    
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    batchCuttingList.windows.forEach((window, idx) => {
      if (startY > 270) {
        doc.addPage();
        startY = 20;
      }
      doc.text(`${idx + 1}. ${window.name}: ${window.dimensions.length.toFixed(2)}" × ${window.dimensions.height.toFixed(2)}"`, 20, startY);
      startY += 6;
    });
    
    startY += 5;
    
    // Aggregated materials table
    const cuttingDetailsData = [];
    
    Object.entries(batchCuttingList.aggregatedCalculations).forEach(([material, calc]) => {
      if (calc.unit === 'inches' && calc.optimization) {
        const materialName = material.replace(/([A-Z])/g, ' $1').trim().toUpperCase();
        cuttingDetailsData.push([
          materialName,
          calc.totalInches.toFixed(2) + '"',
          'Total',
          calc.totalInches.toFixed(2) + '"',
          calc.optimization.label || '-',
          calc.optimization.piecesNeeded || 1,
          calc.optimization.waste.toFixed(2) + '"'
        ]);
      } else if (calc.unit === 'dimensions') {
        const materialName = material.replace(/([A-Z])/g, ' $1').trim().toUpperCase();
        const dimensions = calc.windows.map(w => `${w.length.toFixed(2)}" × ${w.height.toFixed(2)}"`).join(', ');
        cuttingDetailsData.push([
          materialName,
          dimensions,
          `${calc.windows.length} windows`,
          '-',
          '-',
          '-',
          '-'
        ]);
      }
    });
    
    if (startY > 250) {
      doc.addPage();
      startY = 20;
    }
    
    autoTable(doc, {
      startY: startY,
      head: [['Material', 'Size', 'Units', 'Total Length', 'Best Bar Length', 'Bars Needed', 'Waste']],
      body: cuttingDetailsData,
      theme: 'grid',
      headStyles: {
        fillColor: [245, 158, 11],
        textColor: [0, 0, 0],
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 8,
        cellPadding: 3
      },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 40 },
        2: { cellWidth: 20 },
        3: { cellWidth: 25 },
        4: { cellWidth: 25 },
        5: { cellWidth: 20 },
        6: { cellWidth: 20 }
      }
    });
    
    doc.save(`batch-cutting-list-${batchCuttingList.windows.length}-windows.pdf`);
  };

  const profileNames = Object.keys(profiles);

  return (
    <div className="cutting-tool-page">
      <div className="cutting-tool-header">
        <h1>📏 Cutting Measuring Tool</h1>
        <p className="cutting-subtitle">Calculate exact cutting lengths for materials</p>
      </div>

      <div className="cutting-form-container">
        <div className="cutting-form">
          <h2>Input Specifications</h2>
          
          {profileNames.length === 0 ? (
            <div className="no-profiles-warning">
              <span className="warning-icon">⚠️</span>
              <p>No profiles found. Please create a profile in <strong>Tool Settings → Cutting Measuring Tool</strong> first.</p>
            </div>
          ) : (
            <>
              <div className="form-group">
                <label>Main Category *</label>
                <div className="button-group">
                  <button
                    type="button"
                    className={`option-button ${category === 'sliding' ? 'active' : ''}`}
                    onClick={() => {
                      setCategory('sliding');
                      setSubCategory('');
                      setWindowConfig('2_track');
                    }}
                  >
                    Sliding Window
                  </button>
                  <button
                    type="button"
                    className={`option-button ${category === 'openable' ? 'active' : ''}`}
                    onClick={() => {
                      setCategory('openable');
                      setSubCategory('');
                      setWindowConfig('2_track');
                    }}
                  >
                    Openable Window
                  </button>
                </div>
              </div>

              {category === 'sliding' && (
                <div className="form-group">
                  <label>Sub Category *</label>
                  <div className="button-group">
                    <button
                      type="button"
                      className={`option-button ${subCategory === 'miniDomal' ? 'active' : ''}`}
                      onClick={() => setSubCategory('miniDomal')}
                    >
                      Mini Domal
                    </button>
                    <button
                      type="button"
                      className={`option-button ${subCategory === 'domal' ? 'active' : ''}`}
                      onClick={() => setSubCategory('domal')}
                    >
                      Domal
                    </button>
                    <button
                      type="button"
                      className={`option-button ${subCategory === 'ventena' ? 'active' : ''}`}
                      onClick={() => setSubCategory('ventena')}
                    >
                      Ventena
                    </button>
                    {/* Custom Categories */}
                    {Object.entries(customCategories.sliding || {}).map(([key, cat]) => (
                      <button
                        key={key}
                        type="button"
                        className={`option-button ${subCategory === key ? 'active' : ''}`}
                        onClick={() => setSubCategory(key)}
                      >
                        {cat.displayName || key}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {category === 'openable' && (
                <div className="form-group">
                  <label>Sub Category *</label>
                  <div className="button-group">
                    {Object.entries(customCategories.openable || {}).length === 0 ? (
                      <p style={{ color: '#666', fontStyle: 'italic', padding: '10px' }}>
                        No custom categories available. Create one in <strong>Tool Settings → Window Costing Calculator → Custom Categories</strong>
                      </p>
                    ) : (
                      Object.entries(customCategories.openable || {}).map(([key, cat]) => (
                        <button
                          key={key}
                          type="button"
                          className={`option-button ${subCategory === key ? 'active' : ''}`}
                          onClick={() => setSubCategory(key)}
                        >
                          {cat.displayName || key}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}

              {subCategory && (
                <>
                  <div className="form-group">
                    <label>Window Configuration *</label>
                    <div className="button-group">
                      <button
                        type="button"
                        className={`option-button ${windowConfig === '2_track' ? 'active' : ''}`}
                        onClick={() => {
                          setWindowConfig('2_track');
                          setNumberOfPipes('');
                        }}
                      >
                        2 Track
                      </button>
                      <button
                        type="button"
                        className={`option-button ${windowConfig === '2_track_mosquito' ? 'active' : ''}`}
                        onClick={() => {
                          setWindowConfig('2_track_mosquito');
                          setNumberOfPipes('');
                        }}
                      >
                        2 Track + Mosquito
                      </button>
                      <button
                        type="button"
                        className={`option-button ${windowConfig === '2_track_grill' ? 'active' : ''}`}
                        onClick={() => {
                          setWindowConfig('2_track_grill');
                        }}
                      >
                        2 Track + Grill
                      </button>
                      <button
                        type="button"
                        className={`option-button ${windowConfig === '2_track_mosquito_grill' ? 'active' : ''}`}
                        onClick={() => {
                          setWindowConfig('2_track_mosquito_grill');
                        }}
                      >
                        2 Track + Mosquito + Grill
                      </button>
                    </div>
                  </div>

                  {/* Profile Selection */}
                  <div className="form-group">
                    <label>Select Profile (Optional - Override Auto Selection)</label>
                    <select 
                      value={selectedProfile}
                      onChange={(e) => setSelectedProfile(e.target.value)}
                      className="profile-select"
                    >
                      <option value="">-- Auto Select from Tool Settings --</option>
                      {Object.keys(profiles).map(name => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>
                    {(() => {
                      const profileInfo = getProfileFromSettings();
                      if (selectedProfile) {
                        return (
                          <div style={{ padding: '8px', backgroundColor: '#fef3c7', borderRadius: '6px', border: '1px solid #fbbf24', marginTop: '8px', fontSize: '12px', color: '#92400e' }}>
                            <strong>⚠️ Using Manual Selection:</strong> {selectedProfile}
                          </div>
                        );
                      } else if (profileInfo) {
                        return (
                          <div style={{ padding: '8px', backgroundColor: '#f0f9ff', borderRadius: '6px', border: '1px solid #bae6fd', marginTop: '8px', fontSize: '12px', color: '#0369a1' }}>
                            <strong>📏 Auto Selected:</strong> {profileInfo.name} (from Tool Settings)
                          </div>
                        );
                      } else {
                        return (
                          <div style={{ padding: '8px', backgroundColor: '#fef2f2', borderRadius: '6px', border: '1px solid #fecaca', marginTop: '8px', fontSize: '12px', color: '#dc2626' }}>
                            <strong>⚠️ No Auto Profile:</strong> Please select a profile manually or configure in Tool Settings
                          </div>
                        );
                      }
                    })()}
                  </div>

                  <div className="dimensions-group-cutting">
                    <div className="form-group">
                      <label>Length (inches) *</label>
                      <input
                        type="number"
                        value={length}
                        onChange={(e) => setLength(e.target.value)}
                        onWheel={(e) => e.target.blur()}
                        step="1"
                        placeholder="Enter length"
                      />
                    </div>

                    <div className="form-group">
                      <label>Length Dora (0-7)</label>
                      <input
                        type="number"
                        value={lengthDora}
                        onChange={(e) => setLengthDora(e.target.value)}
                        onWheel={(e) => e.target.blur()}
                        step="1"
                        min="0"
                        max="7"
                        placeholder="0"
                      />
                    </div>

                    <div className="form-group">
                      <label>Height (inches) *</label>
                      <input
                        type="number"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        onWheel={(e) => e.target.blur()}
                        step="1"
                        placeholder="Enter height"
                      />
                    </div>

                    <div className="form-group">
                      <label>Height Dora (0-7)</label>
                      <input
                        type="number"
                        value={heightDora}
                        onChange={(e) => setHeightDora(e.target.value)}
                        onWheel={(e) => e.target.blur()}
                        step="1"
                        min="0"
                        max="7"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Number of Tracks *</label>
                    <div className="tracks-buttons">
                      {[2, 3, 4].map(num => (
                        <button
                          key={num}
                          type="button"
                          className={`track-button ${tracks === num ? 'active' : ''}`}
                          onClick={() => setTracks(num)}
                        >
                          {num} Tracks
                        </button>
                      ))}
                    </div>
                  </div>

                  {(windowConfig === '2_track_grill' || windowConfig === '2_track_mosquito_grill') && (
                    <div className="form-group">
                      <label>Number of Pipes Required *</label>
                      <input
                        type="number"
                        value={numberOfPipes}
                        onChange={(e) => setNumberOfPipes(e.target.value)}
                        onWheel={(e) => e.target.blur()}
                        step="1"
                        min="1"
                        placeholder="Enter number of pipes"
                      />
                    </div>
                  )}

                  <div className="form-actions-cutting">
                    <button onClick={calculateCuttingList} className="calculate-btn-cutting">
                      Calculate Cutting List
                    </button>
                    <button onClick={handleReset} className="reset-btn-cutting">
                      Reset
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Cutting List Results */}
      {cuttingList && (
        <div className="cutting-results">
          <div className="results-header">
            <div>
              <h2>Cutting List</h2>
              <div className="results-info">
                <span>Category: <strong>{category === 'sliding' ? 'Sliding Window' : 'Openable Window'}</strong></span>
                <span>Sub Category: <strong>{subCategory === 'miniDomal' ? 'Mini Domal' : subCategory === 'domal' ? 'Domal' : subCategory === 'ventena' ? 'Ventena' : (customCategories[category]?.[subCategory]?.displayName || subCategory)}</strong></span>
                <span>Configuration: <strong>{windowConfig === '2_track' ? '2 Track' : windowConfig === '2_track_mosquito' ? '2 Track + Mosquito' : windowConfig === '2_track_grill' ? '2 Track + Grill' : '2 Track + Mosquito + Grill'}</strong></span>
                <span>Profile: <strong>{cuttingList.profile}</strong></span>
                <span>Dimensions: <strong>{cuttingList.dimensions.length.toFixed(2)}" × {cuttingList.dimensions.height.toFixed(2)}"</strong></span>
                <span>Tracks: <strong>{cuttingList.dimensions.tracks}</strong></span>
                {(windowConfig === '2_track_grill' || windowConfig === '2_track_mosquito_grill') && (
                  <span>Pipes: <strong>{cuttingList.dimensions.numberOfPipes}</strong></span>
                )}
              </div>
            </div>
            <button onClick={generatePDF} className="download-pdf-btn">
              📥 Download PDF
            </button>
          </div>

          <div className="cutting-list-grid">
            {/* Top */}
            <div className="cutting-item">
              <div className="cutting-item-header">
                <h3>🔹 Top</h3>
              </div>
              <div className="cutting-item-body">
                <div className="cutting-result">
                  <span className="result-label">Total Length to Cut:</span>
                  <span className="result-value">{cuttingList.calculations.top.totalInches.toFixed(2)}"</span>
                </div>
                <div className="cutting-result">
                  <span className="result-label">Pieces Required:</span>
                  <span className="result-value">{cuttingList.calculations.top.pieces}</span>
                </div>
                <div className="cutting-result">
                  <span className="result-label">In Feet:</span>
                  <span className="result-value">{inchesToFeet(cuttingList.calculations.top.totalInches).toFixed(2)} ft</span>
                </div>
                {cuttingList.calculations.top.optimization && (
                  <div className="optimization-result">
                    <div className="optimization-header">
                      <span className="optimization-icon">💡</span>
                      <span className="optimization-title">Best Material:</span>
                    </div>
                    <div className="optimization-details">
                      <span className="material-label">Use: <strong>{cuttingList.calculations.top.optimization.label}</strong></span>
                      <span className="waste-label">Waste: <strong>{cuttingList.calculations.top.optimization.waste.toFixed(2)}"</strong></span>
                      {cuttingList.calculations.top.optimization.piecesNeeded > 1 && (
                        <span className="pieces-label">Bars needed: <strong>{cuttingList.calculations.top.optimization.piecesNeeded}</strong></span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom */}
            <div className="cutting-item">
              <div className="cutting-item-header">
                <h3>🔹 Bottom</h3>
              </div>
              <div className="cutting-item-body">
                <div className="cutting-result">
                  <span className="result-label">Total Length to Cut:</span>
                  <span className="result-value">{cuttingList.calculations.bottom.totalInches.toFixed(2)}"</span>
                </div>
                <div className="cutting-result">
                  <span className="result-label">Pieces Required:</span>
                  <span className="result-value">{cuttingList.calculations.bottom.pieces}</span>
                </div>
                <div className="cutting-result">
                  <span className="result-label">In Feet:</span>
                  <span className="result-value">{inchesToFeet(cuttingList.calculations.bottom.totalInches).toFixed(2)} ft</span>
                </div>
                {cuttingList.calculations.bottom.optimization && (
                  <div className="optimization-result">
                    <div className="optimization-header">
                      <span className="optimization-icon">💡</span>
                      <span className="optimization-title">Best Material:</span>
                    </div>
                    <div className="optimization-details">
                      <span className="material-label">Use: <strong>{cuttingList.calculations.bottom.optimization.label}</strong></span>
                      <span className="waste-label">Waste: <strong>{cuttingList.calculations.bottom.optimization.waste.toFixed(2)}"</strong></span>
                      {cuttingList.calculations.bottom.optimization.piecesNeeded > 1 && (
                        <span className="pieces-label">Bars needed: <strong>{cuttingList.calculations.bottom.optimization.piecesNeeded}</strong></span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Handle Inner Lock */}
            <div className="cutting-item">
              <div className="cutting-item-header">
                <h3>🔹 Handle Inner Lock</h3>
              </div>
              <div className="cutting-item-body">
                <div className="cutting-result">
                  <span className="result-label">Per Piece:</span>
                  <span className="result-value">{cuttingList.calculations.handleInnerLock.perPiece.toFixed(2)}"</span>
                </div>
                <div className="cutting-result">
                  <span className="result-label">Pieces Required:</span>
                  <span className="result-value">{cuttingList.calculations.handleInnerLock.pieces}</span>
                </div>
                <div className="cutting-result highlight">
                  <span className="result-label">Total Length to Cut:</span>
                  <span className="result-value">{cuttingList.calculations.handleInnerLock.totalInches.toFixed(2)}"</span>
                </div>
                <div className="cutting-result">
                  <span className="result-label">In Feet:</span>
                  <span className="result-value">{inchesToFeet(cuttingList.calculations.handleInnerLock.totalInches).toFixed(2)} ft</span>
                </div>
                {cuttingList.calculations.handleInnerLock.optimization && (
                  <div className="optimization-result">
                    <div className="optimization-header">
                      <span className="optimization-icon">💡</span>
                      <span className="optimization-title">Best Material:</span>
                    </div>
                    <div className="optimization-details">
                      <span className="material-label">Use: <strong>{cuttingList.calculations.handleInnerLock.optimization.label}</strong></span>
                      <span className="waste-label">Waste: <strong>{cuttingList.calculations.handleInnerLock.optimization.waste.toFixed(2)}"</strong></span>
                      {cuttingList.calculations.handleInnerLock.optimization.piecesNeeded > 1 && (
                        <span className="pieces-label">Bars needed: <strong>{cuttingList.calculations.handleInnerLock.optimization.piecesNeeded}</strong></span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Inter Lock */}
            <div className="cutting-item">
              <div className="cutting-item-header">
                <h3>🔹 Inter Lock</h3>
              </div>
              <div className="cutting-item-body">
                <div className="cutting-result">
                  <span className="result-label">Per Piece:</span>
                  <span className="result-value">{cuttingList.calculations.interLock.perPiece.toFixed(2)}"</span>
                </div>
                <div className="cutting-result">
                  <span className="result-label">Pieces Required:</span>
                  <span className="result-value">{cuttingList.calculations.interLock.pieces}</span>
                </div>
                <div className="cutting-result highlight">
                  <span className="result-label">Total Length to Cut:</span>
                  <span className="result-value">{cuttingList.calculations.interLock.totalInches.toFixed(2)}"</span>
                </div>
                <div className="cutting-result">
                  <span className="result-label">In Feet:</span>
                  <span className="result-value">{inchesToFeet(cuttingList.calculations.interLock.totalInches).toFixed(2)} ft</span>
                </div>
                {cuttingList.calculations.interLock.optimization && (
                  <div className="optimization-result">
                    <div className="optimization-header">
                      <span className="optimization-icon">💡</span>
                      <span className="optimization-title">Best Material:</span>
                    </div>
                    <div className="optimization-details">
                      <span className="material-label">Use: <strong>{cuttingList.calculations.interLock.optimization.label}</strong></span>
                      <span className="waste-label">Waste: <strong>{cuttingList.calculations.interLock.optimization.waste.toFixed(2)}"</strong></span>
                      {cuttingList.calculations.interLock.optimization.piecesNeeded > 1 && (
                        <span className="pieces-label">Bars needed: <strong>{cuttingList.calculations.interLock.optimization.piecesNeeded}</strong></span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bearing Bottom */}
            <div className="cutting-item">
              <div className="cutting-item-header">
                <h3>🔹 Bearing Bottom</h3>
              </div>
              <div className="cutting-item-body">
                <div className="cutting-result">
                  <span className="result-label">Per Piece:</span>
                  <span className="result-value">{cuttingList.calculations.bearingBottom.perPiece.toFixed(2)}"</span>
                </div>
                <div className="cutting-result">
                  <span className="result-label">Pieces Required:</span>
                  <span className="result-value">{cuttingList.calculations.bearingBottom.pieces}</span>
                </div>
                <div className="cutting-result highlight">
                  <span className="result-label">Total Length to Cut:</span>
                  <span className="result-value">{cuttingList.calculations.bearingBottom.totalInches.toFixed(2)}"</span>
                </div>
                <div className="cutting-result">
                  <span className="result-label">In Feet:</span>
                  <span className="result-value">{inchesToFeet(cuttingList.calculations.bearingBottom.totalInches).toFixed(2)} ft</span>
                </div>
                {cuttingList.calculations.bearingBottom.optimization && (
                  <div className="optimization-result">
                    <div className="optimization-header">
                      <span className="optimization-icon">💡</span>
                      <span className="optimization-title">Best Material:</span>
                    </div>
                    <div className="optimization-details">
                      <span className="material-label">Use: <strong>{cuttingList.calculations.bearingBottom.optimization.label}</strong></span>
                      <span className="waste-label">Waste: <strong>{cuttingList.calculations.bearingBottom.optimization.waste.toFixed(2)}"</strong></span>
                      {cuttingList.calculations.bearingBottom.optimization.piecesNeeded > 1 && (
                        <span className="pieces-label">Bars needed: <strong>{cuttingList.calculations.bearingBottom.optimization.piecesNeeded}</strong></span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Glass */}
            <div className="cutting-item glass-item">
              <div className="cutting-item-header">
                <h3>🔹 Glass</h3>
              </div>
              <div className="cutting-item-body">
                <div className="cutting-result">
                  <span className="result-label">Length per Piece:</span>
                  <span className="result-value">{cuttingList.calculations.glass.length.toFixed(2)}"</span>
                </div>
                <div className="cutting-result">
                  <span className="result-label">Height per Piece:</span>
                  <span className="result-value">{cuttingList.calculations.glass.height.toFixed(2)}"</span>
                </div>
                <div className="cutting-result">
                  <span className="result-label">Pieces Required:</span>
                  <span className="result-value">{cuttingList.calculations.glass.pieces}</span>
                </div>
                <div className="cutting-result highlight">
                  <span className="result-label">Dimensions:</span>
                  <span className="result-value">
                    {cuttingList.calculations.glass.length.toFixed(2)}" × {cuttingList.calculations.glass.height.toFixed(2)}"
                  </span>
                </div>
              </div>
            </div>

            {/* Grill Materials */}
            {cuttingList.calculations.rt && (
              <div className="cutting-item">
                <div className="cutting-item-header">
                  <h3>🔹 RT</h3>
                </div>
                <div className="cutting-item-body">
                  <div className="cutting-result">
                    <span className="result-label">Per Piece:</span>
                    <span className="result-value">{cuttingList.calculations.rt.perPiece.toFixed(2)}"</span>
                  </div>
                  <div className="cutting-result">
                    <span className="result-label">Pieces Required:</span>
                    <span className="result-value">{cuttingList.calculations.rt.pieces}</span>
                  </div>
                  <div className="cutting-result highlight">
                    <span className="result-label">Total Length to Cut:</span>
                    <span className="result-value">{cuttingList.calculations.rt.totalInches.toFixed(2)}"</span>
                  </div>
                  {cuttingList.calculations.rt.optimization && (
                    <div className="optimization-result">
                      <div className="optimization-header">
                        <span className="optimization-icon">💡</span>
                        <span className="optimization-title">Best Material:</span>
                      </div>
                      <div className="optimization-details">
                        <span className="material-label">Use: <strong>{cuttingList.calculations.rt.optimization.label}</strong></span>
                        <span className="waste-label">Waste: <strong>{cuttingList.calculations.rt.optimization.waste.toFixed(2)}"</strong></span>
                        {cuttingList.calculations.rt.optimization.piecesNeeded > 1 && (
                          <span className="pieces-label">Bars needed: <strong>{cuttingList.calculations.rt.optimization.piecesNeeded}</strong></span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {cuttingList.calculations.roundPipe && (
              <div className="cutting-item">
                <div className="cutting-item-header">
                  <h3>🔹 Round Pipe</h3>
                </div>
                <div className="cutting-item-body">
                  <div className="cutting-result">
                    <span className="result-label">Per Piece:</span>
                    <span className="result-value">{cuttingList.calculations.roundPipe.perPiece.toFixed(2)}"</span>
                  </div>
                  <div className="cutting-result">
                    <span className="result-label">Pieces Required:</span>
                    <span className="result-value">{cuttingList.calculations.roundPipe.pieces}</span>
                  </div>
                  <div className="cutting-result highlight">
                    <span className="result-label">Total Length to Cut:</span>
                    <span className="result-value">{cuttingList.calculations.roundPipe.totalInches.toFixed(2)}"</span>
                  </div>
                  {cuttingList.calculations.roundPipe.optimization && (
                    <div className="optimization-result">
                      <div className="optimization-header">
                        <span className="optimization-icon">💡</span>
                        <span className="optimization-title">Best Material:</span>
                      </div>
                      <div className="optimization-details">
                        <span className="material-label">Use: <strong>{cuttingList.calculations.roundPipe.optimization.label}</strong></span>
                        <span className="waste-label">Waste: <strong>{cuttingList.calculations.roundPipe.optimization.waste.toFixed(2)}"</strong></span>
                        {cuttingList.calculations.roundPipe.optimization.piecesNeeded > 1 && (
                          <span className="pieces-label">Bars needed: <strong>{cuttingList.calculations.roundPipe.optimization.piecesNeeded}</strong></span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {cuttingList.calculations.brightBar && (
              <div className="cutting-item">
                <div className="cutting-item-header">
                  <h3>🔹 Bright Bar</h3>
                </div>
                <div className="cutting-item-body">
                  <div className="cutting-result">
                    <span className="result-label">Per Piece:</span>
                    <span className="result-value">{cuttingList.calculations.brightBar.perPiece.toFixed(2)}"</span>
                  </div>
                  <div className="cutting-result">
                    <span className="result-label">Pieces Required:</span>
                    <span className="result-value">{cuttingList.calculations.brightBar.pieces}</span>
                  </div>
                  <div className="cutting-result highlight">
                    <span className="result-label">Total Length to Cut:</span>
                    <span className="result-value">{cuttingList.calculations.brightBar.totalInches.toFixed(2)}"</span>
                  </div>
                  {cuttingList.calculations.brightBar.optimization && (
                    <div className="optimization-result">
                      <div className="optimization-header">
                        <span className="optimization-icon">💡</span>
                        <span className="optimization-title">Best Material:</span>
                      </div>
                      <div className="optimization-details">
                        <span className="material-label">Use: <strong>{cuttingList.calculations.brightBar.optimization.label}</strong></span>
                        <span className="waste-label">Waste: <strong>{cuttingList.calculations.brightBar.optimization.waste.toFixed(2)}"</strong></span>
                        {cuttingList.calculations.brightBar.optimization.piecesNeeded > 1 && (
                          <span className="pieces-label">Bars needed: <strong>{cuttingList.calculations.brightBar.optimization.piecesNeeded}</strong></span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Mosquito Net Materials */}
            {cuttingList.calculations.shutter && (
              <div className="cutting-item">
                <div className="cutting-item-header">
                  <h3>🔹 Shutter</h3>
                </div>
                <div className="cutting-item-body">
                  <div className="cutting-result">
                    <span className="result-label">Per Piece:</span>
                    <span className="result-value">{cuttingList.calculations.shutter.perPiece.toFixed(2)}"</span>
                  </div>
                  <div className="cutting-result">
                    <span className="result-label">Pieces Required:</span>
                    <span className="result-value">{cuttingList.calculations.shutter.pieces}</span>
                  </div>
                  <div className="cutting-result highlight">
                    <span className="result-label">Total Length to Cut:</span>
                    <span className="result-value">{cuttingList.calculations.shutter.totalInches.toFixed(2)}"</span>
                  </div>
                  {cuttingList.calculations.shutter.optimization && (
                    <div className="optimization-result">
                      <div className="optimization-header">
                        <span className="optimization-icon">💡</span>
                        <span className="optimization-title">Best Material:</span>
                      </div>
                      <div className="optimization-details">
                        <span className="material-label">Use: <strong>{cuttingList.calculations.shutter.optimization.label}</strong></span>
                        <span className="waste-label">Waste: <strong>{cuttingList.calculations.shutter.optimization.waste.toFixed(2)}"</strong></span>
                        {cuttingList.calculations.shutter.optimization.piecesNeeded > 1 && (
                          <span className="pieces-label">Bars needed: <strong>{cuttingList.calculations.shutter.optimization.piecesNeeded}</strong></span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {cuttingList.calculations.mosquitoNet && (
              <div className="cutting-item glass-item">
                <div className="cutting-item-header">
                  <h3>🔹 Mosquito Net</h3>
                </div>
                <div className="cutting-item-body">
                  <div className="cutting-result">
                    <span className="result-label">Length per Piece:</span>
                    <span className="result-value">{cuttingList.calculations.mosquitoNet.length.toFixed(2)}"</span>
                  </div>
                  <div className="cutting-result">
                    <span className="result-label">Height per Piece:</span>
                    <span className="result-value">{cuttingList.calculations.mosquitoNet.height.toFixed(2)}"</span>
                  </div>
                  <div className="cutting-result">
                    <span className="result-label">Pieces Required:</span>
                    <span className="result-value">{cuttingList.calculations.mosquitoNet.pieces}</span>
                  </div>
                  <div className="cutting-result highlight">
                    <span className="result-label">Dimensions:</span>
                    <span className="result-value">
                      {cuttingList.calculations.mosquitoNet.length.toFixed(2)}" × {cuttingList.calculations.mosquitoNet.height.toFixed(2)}"
                    </span>
                  </div>
                </div>
              </div>
            )}

            {cuttingList.calculations.cChannelLength && (
              <div className="cutting-item">
                <div className="cutting-item-header">
                  <h3>🔹 C-Channel (Length)</h3>
                </div>
                <div className="cutting-item-body">
                  <div className="cutting-result">
                    <span className="result-label">Per Piece:</span>
                    <span className="result-value">{cuttingList.calculations.cChannelLength.perPiece.toFixed(2)}"</span>
                  </div>
                  <div className="cutting-result">
                    <span className="result-label">Pieces Required:</span>
                    <span className="result-value">{cuttingList.calculations.cChannelLength.pieces}</span>
                  </div>
                  <div className="cutting-result highlight">
                    <span className="result-label">Total Length to Cut:</span>
                    <span className="result-value">{cuttingList.calculations.cChannelLength.totalInches.toFixed(2)}"</span>
                  </div>
                  {cuttingList.calculations.cChannelLength.optimization && (
                    <div className="optimization-result">
                      <div className="optimization-header">
                        <span className="optimization-icon">💡</span>
                        <span className="optimization-title">Best Material:</span>
                      </div>
                      <div className="optimization-details">
                        <span className="material-label">Use: <strong>{cuttingList.calculations.cChannelLength.optimization.label}</strong></span>
                        <span className="waste-label">Waste: <strong>{cuttingList.calculations.cChannelLength.optimization.waste.toFixed(2)}"</strong></span>
                        {cuttingList.calculations.cChannelLength.optimization.piecesNeeded > 1 && (
                          <span className="pieces-label">Bars needed: <strong>{cuttingList.calculations.cChannelLength.optimization.piecesNeeded}</strong></span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {cuttingList.calculations.cChannelHeight && (
              <div className="cutting-item">
                <div className="cutting-item-header">
                  <h3>🔹 C-Channel (Height)</h3>
                </div>
                <div className="cutting-item-body">
                  <div className="cutting-result">
                    <span className="result-label">Per Piece:</span>
                    <span className="result-value">{cuttingList.calculations.cChannelHeight.perPiece.toFixed(2)}"</span>
                  </div>
                  <div className="cutting-result">
                    <span className="result-label">Pieces Required:</span>
                    <span className="result-value">{cuttingList.calculations.cChannelHeight.pieces}</span>
                  </div>
                  <div className="cutting-result highlight">
                    <span className="result-label">Total Length to Cut:</span>
                    <span className="result-value">{cuttingList.calculations.cChannelHeight.totalInches.toFixed(2)}"</span>
                  </div>
                  {cuttingList.calculations.cChannelHeight.optimization && (
                    <div className="optimization-result">
                      <div className="optimization-header">
                        <span className="optimization-icon">💡</span>
                        <span className="optimization-title">Best Material:</span>
                      </div>
                      <div className="optimization-details">
                        <span className="material-label">Use: <strong>{cuttingList.calculations.cChannelHeight.optimization.label}</strong></span>
                        <span className="waste-label">Waste: <strong>{cuttingList.calculations.cChannelHeight.optimization.waste.toFixed(2)}"</strong></span>
                        {cuttingList.calculations.cChannelHeight.optimization.piecesNeeded > 1 && (
                          <span className="pieces-label">Bars needed: <strong>{cuttingList.calculations.cChannelHeight.optimization.piecesNeeded}</strong></span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Batch Entry Modal */}
      {showBatchModal && batchConfig && (
        <div className="modal-overlay" onClick={handleCloseBatchModal}>
          <div className="batch-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px', maxHeight: '90vh', overflow: 'auto' }}>
            <div className="batch-modal-header">
              <h2>Add Multiple Windows</h2>
              <button onClick={handleCloseBatchModal} className="close-modal-btn">×</button>
            </div>
            <div className="batch-modal-body">
              <div className="batch-config-display" style={{ padding: '10px', backgroundColor: '#f0f9ff', borderRadius: '8px', marginBottom: '15px' }}>
                <strong>Configuration:</strong> {batchConfig.category} → {batchConfig.subCategory} → {batchConfig.windowConfig.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} ({batchConfig.tracks} Tracks)
              </div>
              
              <div className="batch-table-container" style={{ overflowX: 'auto' }}>
                <table className="batch-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f3f4f6' }}>
                      <th style={{ padding: '8px', textAlign: 'center', minWidth: '40px' }}>#</th>
                      <th style={{ padding: '8px', textAlign: 'left', minWidth: '150px' }}>Window Name *</th>
                      <th style={{ padding: '8px', textAlign: 'center', minWidth: '100px' }}>Length (inches) *</th>
                      <th style={{ padding: '8px', textAlign: 'center', minWidth: '80px' }}>L-Dora</th>
                      <th style={{ padding: '8px', textAlign: 'center', minWidth: '100px' }}>Height (inches) *</th>
                      <th style={{ padding: '8px', textAlign: 'center', minWidth: '80px' }}>H-Dora</th>
                      {(batchConfig.windowConfig === '2_track_grill' || batchConfig.windowConfig === '2_track_mosquito_grill') && (
                        <th style={{ padding: '8px', textAlign: 'center', minWidth: '100px' }}>No. of Pipes *</th>
                      )}
                      <th style={{ padding: '8px', textAlign: 'center', minWidth: '60px' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batchRows.map((row, index) => (
                      <tr key={row.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '8px', textAlign: 'center' }}>{index + 1}</td>
                        <td style={{ padding: '8px' }}>
                          <input
                            type="text"
                            value={row.name}
                            onChange={(e) => handleBatchRowChange(row.id, 'name', e.target.value)}
                            placeholder="e.g., Window 1"
                            style={{ width: '100%', padding: '6px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                          />
                        </td>
                        <td style={{ padding: '8px' }}>
                          <input
                            type="number"
                            value={row.length}
                            onChange={(e) => handleBatchRowChange(row.id, 'length', e.target.value)}
                            onWheel={(e) => e.target.blur()}
                            step="0.01"
                            placeholder="0.00"
                            style={{ width: '100%', padding: '6px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                          />
                        </td>
                        <td style={{ padding: '8px' }}>
                          <input
                            type="number"
                            value={row.lengthDora}
                            onChange={(e) => handleBatchRowChange(row.id, 'lengthDora', e.target.value)}
                            onWheel={(e) => e.target.blur()}
                            step="1"
                            min="0"
                            max="7"
                            placeholder="0-7"
                            style={{ width: '100%', padding: '6px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                          />
                        </td>
                        <td style={{ padding: '8px' }}>
                          <input
                            type="number"
                            value={row.height}
                            onChange={(e) => handleBatchRowChange(row.id, 'height', e.target.value)}
                            onWheel={(e) => e.target.blur()}
                            step="0.01"
                            placeholder="0.00"
                            style={{ width: '100%', padding: '6px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                          />
                        </td>
                        <td style={{ padding: '8px' }}>
                          <input
                            type="number"
                            value={row.heightDora}
                            onChange={(e) => handleBatchRowChange(row.id, 'heightDora', e.target.value)}
                            onWheel={(e) => e.target.blur()}
                            step="1"
                            min="0"
                            max="7"
                            placeholder="0-7"
                            style={{ width: '100%', padding: '6px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                          />
                        </td>
                        {(batchConfig.windowConfig === '2_track_grill' || batchConfig.windowConfig === '2_track_mosquito_grill') && (
                          <td style={{ padding: '8px' }}>
                            <input
                              type="number"
                              value={row.numberOfPipes}
                              onChange={(e) => handleBatchRowChange(row.id, 'numberOfPipes', e.target.value)}
                              onWheel={(e) => e.target.blur()}
                              step="1"
                              min="1"
                              placeholder="Pipes"
                              style={{ width: '100%', padding: '6px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                            />
                          </td>
                        )}
                        <td style={{ padding: '8px', textAlign: 'center' }}>
                          <button
                            onClick={() => handleRemoveBatchRow(row.id)}
                            className="batch-remove-btn"
                            title="Remove this row"
                            disabled={batchRows.length === 1}
                            style={{ 
                              padding: '4px 8px', 
                              backgroundColor: batchRows.length === 1 ? '#d1d5db' : '#ef4444', 
                              color: 'white', 
                              border: 'none', 
                              borderRadius: '4px', 
                              cursor: batchRows.length === 1 ? 'not-allowed' : 'pointer' 
                            }}
                          >
                            ×
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div style={{ marginTop: '15px', display: 'flex', gap: '10px', justifyContent: 'space-between', alignItems: 'center' }}>
                <button 
                  onClick={handleAddBatchRow} 
                  style={{ 
                    padding: '8px 16px', 
                    backgroundColor: '#3b82f6', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '6px', 
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  + Add Row
                </button>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={handleCalculateBatch} 
                    style={{ 
                      padding: '10px 20px', 
                      backgroundColor: '#22c55e', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '6px', 
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    Calculate Cutting List
                  </button>
                  <button 
                    onClick={handleCloseBatchModal} 
                    style={{ 
                      padding: '10px 20px', 
                      backgroundColor: '#6b7280', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '6px', 
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Batch Cutting List Results */}
      {batchCuttingList && (
        <div className="cutting-results" style={{ marginTop: '20px', padding: '20px', backgroundColor: '#f9fafb', borderRadius: '12px' }}>
          <div className="results-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Batch Cutting List ({batchCuttingList.windows.length} Windows)</h2>
            <button 
              onClick={() => generateBatchPDF()}
              style={{ 
                padding: '10px 20px', 
                backgroundColor: '#dc2626', 
                color: 'white', 
                border: 'none', 
                borderRadius: '6px', 
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Download PDF
            </button>
          </div>
          
          <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: 'white', borderRadius: '8px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              <div>
                <strong>Category:</strong> {batchCuttingList.category}
              </div>
              <div>
                <strong>Sub Category:</strong> {batchCuttingList.subCategory}
              </div>
              <div>
                <strong>Configuration:</strong> {batchCuttingList.windowConfig.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </div>
              <div>
                <strong>Profile:</strong> {batchCuttingList.profile}
              </div>
            </div>
          </div>

          {/* Aggregated Materials */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ marginBottom: '15px', color: '#1f2937' }}>Aggregated Materials</h3>
            <div style={{ display: 'grid', gap: '10px' }}>
              {Object.entries(batchCuttingList.aggregatedCalculations).map(([material, calc]) => (
                <div key={material} style={{ padding: '15px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h4 style={{ margin: 0, textTransform: 'capitalize' }}>{material.replace(/([A-Z])/g, ' $1').trim()}</h4>
                    {calc.optimization && (
                      <div style={{ fontSize: '14px', color: '#059669' }}>
                        <strong>Total: {calc.totalInches.toFixed(2)}"</strong> | 
                        Best: {calc.optimization.label} | 
                        Bars: {calc.optimization.piecesNeeded} | 
                        Waste: {calc.optimization.waste.toFixed(2)}"
                      </div>
                    )}
                  </div>
                  {calc.windows && (
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      {calc.windows.map((w, idx) => (
                        <span key={idx} style={{ marginRight: '10px' }}>
                          {w.name}: {calc.unit === 'inches' ? `${w.totalInches.toFixed(2)}"` : `${w.length.toFixed(2)}" × ${w.height.toFixed(2)}"`}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CuttingMeasuringTool;

