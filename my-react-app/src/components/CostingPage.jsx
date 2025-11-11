import { useState, useEffect } from 'react';
import { calculateWindowCost, convertToTotalInches } from '../utils/costCalculator';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import './CostingPage.css';

const CostingPage = ({ rates = {} }) => {
  const [category, setCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [lengthDora, setLengthDora] = useState('');
  const [widthDora, setWidthDora] = useState('');
  const [unit, setUnit] = useState('feet');
  const [tracks, setTracks] = useState(2);
  const [hasMosquitoNet, setHasMosquitoNet] = useState(false);
  const [hasGrill, setHasGrill] = useState(false);
  const [numberOfPipes, setNumberOfPipes] = useState('');
  const [windowConfig, setWindowConfig] = useState('2_track'); // '2_track', '2_track_mosquito', '2_track_grill', '2_track_mosquito_grill'
  const [glassType, setGlassType] = useState('plane');
  const [windowName, setWindowName] = useState('');
  const [windowsList, setWindowsList] = useState([]);
  const [selectedWindowForBreakdown, setSelectedWindowForBreakdown] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [expandedWindows, setExpandedWindows] = useState([]);
  
  // Batch entry states
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchConfig, setBatchConfig] = useState(null);
  const [batchRows, setBatchRows] = useState([
    { id: 1, name: '', length: '', width: '', lengthDora: '', widthDora: '' }
  ]);
  
  // Cutting list states
  const [showCuttingListModal, setShowCuttingListModal] = useState(false);
  const [selectedWindowsForCutting, setSelectedWindowsForCutting] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState('');
  const [cuttingProfiles, setCuttingProfiles] = useState({});
  
  // Custom categories state
  const [customCategories, setCustomCategories] = useState({ sliding: {}, openable: {} });

  const handleCalculate = () => {
    if (!category || !subCategory || !length || !width) {
      alert('Please fill in all required fields');
      return;
    }
    
    if ((windowConfig === '2_track_grill' || windowConfig === '2_track_mosquito_grill') && (!numberOfPipes || parseInt(numberOfPipes) < 1)) {
      alert('Please enter the number of pipes required for grill window');
      return;
    }

    const dimensions = {
      length: parseFloat(length),
      width: parseFloat(width),
      lengthDora: unit === 'inches' ? (lengthDora ? parseFloat(lengthDora) : 0) : 0,
      widthDora: unit === 'inches' ? (widthDora ? parseFloat(widthDora) : 0) : 0,
      unit
    };

    // Determine options based on windowConfig
    let hasMosquitoNetConfig = false;
    let hasGrillConfig = false;
    
    if (windowConfig === '2_track_mosquito') {
      hasMosquitoNetConfig = true;
    } else if (windowConfig === '2_track_grill') {
      hasGrillConfig = true;
    } else if (windowConfig === '2_track_mosquito_grill') {
      hasMosquitoNetConfig = true;
      hasGrillConfig = true;
    }

    const options = {
      tracks: parseInt(tracks),
      hasMosquitoNet: hasMosquitoNetConfig,
      hasGrill: hasGrillConfig,
      numberOfPipes: hasGrillConfig ? parseInt(numberOfPipes) : 0,
      glassType,
      windowConfig
    };

    const result = calculateWindowCost(category, subCategory, dimensions, options, rates);
    
    if (result) {
      // Get cutting profile and calculate cutting list
      const cuttingProfile = getCuttingProfileForWindow(category, subCategory, hasGrill, hasMosquitoNet);
      let cuttingList = null;
      
      if (cuttingProfile) {
        cuttingList = calculateWindowCuttingList({
          dimensions: {
            length: parseFloat(length),
            width: parseFloat(width),
            lengthDora: unit === 'inches' ? (lengthDora ? parseFloat(lengthDora) : 0) : 0,
            widthDora: unit === 'inches' ? (widthDora ? parseFloat(widthDora) : 0) : 0,
            unit
          },
          options: {
            tracks: parseInt(tracks),
            hasMosquitoNet,
            hasGrill,
            numberOfPipes: hasGrill ? parseInt(numberOfPipes) : 0,
            glassType
          }
        }, cuttingProfile.data);
        cuttingList.profile = cuttingProfile.name;
      }

      const windowData = {
        id: Date.now(),
        name: windowName.trim() || null,
        category,
        subCategory,
        dimensions: {
          length: parseFloat(length),
          width: parseFloat(width),
          lengthDora: unit === 'inches' ? (lengthDora ? parseFloat(lengthDora) : 0) : 0,
          widthDora: unit === 'inches' ? (widthDora ? parseFloat(widthDora) : 0) : 0,
          unit
        },
        options: {
          tracks: parseInt(tracks),
          hasMosquitoNet,
          hasGrill,
          numberOfPipes: hasGrill ? parseInt(numberOfPipes) : 0,
          glassType
        },
        result: result,
        cuttingList: cuttingList,
        timestamp: new Date().toLocaleString()
      };

      setWindowsList([...windowsList, windowData]);
      
      // Reset form after adding
      setCategory('');
      setSubCategory('');
      setLength('');
      setWidth('');
      setLengthDora('');
      setWidthDora('');
      setUnit('feet');
      setTracks(2);
      setHasMosquitoNet(false);
      setHasGrill(false);
      setNumberOfPipes('');
      setGlassType('plane');
      setWindowName('');
      setWindowConfig('2_track');
    } else {
      alert('Calculation not available for selected category/subcategory');
    }
  };

  const handleRemoveWindow = (id) => {
    setWindowsList(windowsList.filter(window => window.id !== id));
    setExpandedWindows(expandedWindows.filter(windowId => windowId !== id));
  };

  const toggleWindowExpand = (id, e) => {
    e.stopPropagation();
    if (expandedWindows.includes(id)) {
      setExpandedWindows(expandedWindows.filter(windowId => windowId !== id));
    } else {
      setExpandedWindows([...expandedWindows, id]);
    }
  };

  const handleClearAll = () => {
    if (windowsList.length === 0) return;
    if (window.confirm('Are you sure you want to clear all windows?')) {
      setWindowsList([]);
    }
  };

  const handleWindowClick = (windowData, index) => {
    setSelectedWindowForBreakdown({ window: windowData, index });
    if (!isAuthenticated) {
      setShowPasswordModal(true);
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (password === 'rajwindows') {
      setIsAuthenticated(true);
      setShowPasswordModal(false);
      setPassword('');
    } else {
      alert('Incorrect password!');
      setPassword('');
    }
  };

  const handleCloseBreakdown = () => {
    setSelectedWindowForBreakdown(null);
  };

  const handlePasswordCancel = () => {
    setShowPasswordModal(false);
    setPassword('');
    setSelectedWindowForBreakdown(null);
  };

  const handleReset = () => {
    setCategory('');
    setSubCategory('');
    setLength('');
    setWidth('');
    setLengthDora('');
    setWidthDora('');
    setUnit('feet');
    setTracks(2);
    setHasMosquitoNet(false);
    setHasGrill(false);
    setNumberOfPipes('');
    setGlassType('plane');
    setWindowName('');
  };

  // Batch entry handlers
  const handleOpenBatchMode = () => {
    if (!category || !subCategory) {
      alert('Please select Category and Sub Category first');
      return;
    }
    
    if ((windowConfig === '2_track_grill' || windowConfig === '2_track_mosquito_grill') && (!numberOfPipes || parseInt(numberOfPipes) < 1)) {
      alert('Please enter the number of pipes required for grill window');
      return;
    }

    // Determine options based on windowConfig
    let hasMosquitoNetConfig = false;
    let hasGrillConfig = false;
    
    if (windowConfig === '2_track_mosquito') {
      hasMosquitoNetConfig = true;
    } else if (windowConfig === '2_track_grill') {
      hasGrillConfig = true;
    } else if (windowConfig === '2_track_mosquito_grill') {
      hasMosquitoNetConfig = true;
      hasGrillConfig = true;
    }

    // Capture current form configuration
    const config = {
      category,
      subCategory,
      unit,
      tracks: parseInt(tracks),
      hasMosquitoNet: hasMosquitoNetConfig,
      hasGrill: hasGrillConfig,
      numberOfPipes: hasGrillConfig ? parseInt(numberOfPipes) : 0,
      glassType,
      windowConfig
    };
    
    setBatchConfig(config);
    setBatchRows([{ id: 1, name: '', length: '', width: '', lengthDora: '', widthDora: '' }]);
    setShowBatchModal(true);
  };

  const handleCloseBatchModal = () => {
    setShowBatchModal(false);
    setBatchConfig(null);
    setBatchRows([{ id: 1, name: '', length: '', width: '', lengthDora: '', widthDora: '' }]);
  };

  // Load cutting profiles and window costing settings
  useEffect(() => {
    const loadProfiles = () => {
      const savedSettings = localStorage.getItem('toolSettings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        if (parsed.cuttingMeasuring && parsed.cuttingMeasuring.profiles) {
          setCuttingProfiles(parsed.cuttingMeasuring.profiles);
        }
      }
    };
    
    loadProfiles();
    window.addEventListener('storage', loadProfiles);
    return () => window.removeEventListener('storage', loadProfiles);
  }, []);

  // Get cutting profile based on window configuration
  // Load custom categories on mount and when storage changes
  useEffect(() => {
    const loadCustomCategories = () => {
      const savedSettings = localStorage.getItem('toolSettings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        if (parsed.customCategories) {
          setCustomCategories(parsed.customCategories);
        }
      }
    };
    
    loadCustomCategories();
    window.addEventListener('storage', loadCustomCategories);
    return () => window.removeEventListener('storage', loadCustomCategories);
  }, []);

  const getCuttingProfileForWindow = (category, subCategory, hasGrill, hasMosquitoNet) => {
    const savedSettings = localStorage.getItem('toolSettings');
    if (!savedSettings) return null;
    
    const parsed = JSON.parse(savedSettings);
    
    // Check if it's a custom category
    if (parsed.customCategories && parsed.customCategories[category] && parsed.customCategories[category][subCategory]) {
      const customCategory = parsed.customCategories[category][subCategory];
      const cuttingProfiles = customCategory.cuttingProfiles || {};
      
      let configType = '2_track';
      if (hasGrill && hasMosquitoNet) {
        configType = '2_track_mosquito_grill';
      } else if (hasGrill) {
        configType = '2_track_grill';
      } else if (hasMosquitoNet) {
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
    if (hasGrill && hasMosquitoNet) {
      profileKey = '2_track_mosquito_grill';
    } else if (hasGrill) {
      profileKey = '2_track_grill';
    } else if (hasMosquitoNet) {
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

  // Open cutting list modal
  const handleOpenCuttingList = () => {
    if (windowsList.length === 0) {
      alert('Please add at least one window first');
      return;
    }
    setSelectedWindowsForCutting(windowsList.map(w => w.id));
    setShowCuttingListModal(true);
  };

  // Toggle window selection for cutting
  const handleToggleWindowSelection = (windowId) => {
    setSelectedWindowsForCutting(prev => 
      prev.includes(windowId) 
        ? prev.filter(id => id !== windowId)
        : [...prev, windowId]
    );
  };

  // Select/Deselect all windows
  const handleSelectAllWindows = () => {
    if (selectedWindowsForCutting.length === windowsList.length) {
      setSelectedWindowsForCutting([]);
    } else {
      setSelectedWindowsForCutting(windowsList.map(w => w.id));
    }
  };

  // Available material lengths for optimization
  const availableLengths = [
    { feet: 12, inches: 144, label: '12 feet' },
    { feet: 15, inches: 180, label: '15 feet' },
    { feet: 16, inches: 192, label: '16 feet' }
  ];

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

  // Calculate cutting list for a single window
  const calculateWindowCuttingList = (window, profile) => {
    // Convert dimensions to inches
    let l, h;
    if (window.dimensions.unit === 'feet') {
      l = window.dimensions.length * 12;
      h = window.dimensions.width * 12; // width is height in window context
    } else {
      l = convertToTotalInches(window.dimensions.length, window.dimensions.lengthDora || 0);
      h = convertToTotalInches(window.dimensions.width, window.dimensions.widthDora || 0);
    }
    
    const t = window.options.tracks || 2;
    const numPipes = window.options.numberOfPipes || 0;
    const hasGrill = window.options.hasGrill || false;
    const hasMosquitoNet = window.options.hasMosquitoNet || false;

    // Get reductions from profile
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

    // Calculate cutting lengths
    const bearingPerPiece = (l - bearingReduction) / 2;
    const handlePerPiece = h - handleReduction;
    
    const topTotal = (2 * h) + l;
    const bottomTotal = l;
    const handleTotal = handlePerPiece * t;
    const interLockTotal = (h - interLockReduction) * t;
    
    // Bearing Bottom calculation based on configuration
    let bearingMultiplier = 2;
    if (hasMosquitoNet) {
      bearingMultiplier = 3;
    }
    const bearingTotal = bearingPerPiece * bearingMultiplier * t;

    const calculations = {
      top: {
        totalInches: topTotal,
        pieces: 1,
        optimization: calculateBestMaterial(topTotal)
      },
      bottom: {
        totalInches: bottomTotal,
        pieces: 1,
        optimization: calculateBestMaterial(bottomTotal)
      },
      handleInnerLock: {
        totalInches: handleTotal,
        perPiece: handlePerPiece,
        pieces: t,
        optimization: calculateBestMaterial(handleTotal)
      },
      interLock: {
        totalInches: interLockTotal,
        perPiece: h - interLockReduction,
        pieces: t,
        optimization: calculateBestMaterial(interLockTotal)
      },
      bearingBottom: {
        totalInches: bearingTotal,
        perPiece: bearingPerPiece,
        pieces: bearingMultiplier * t,
        optimization: calculateBestMaterial(bearingTotal)
      },
      glass: {
        length: bearingPerPiece + 0.625,
        height: handlePerPiece + 0.625,
        pieces: t
      }
    };

    // Grill materials
    if (hasGrill && numPipes > 0) {
      const rtTotal = (l - rtReduction) * numPipes;
      const roundPipeTotal = (l - roundPipeReduction) * numPipes;
      const brightBarTotal = (l - brightBarReduction) * numPipes;

      calculations.rt = {
        totalInches: rtTotal,
        perPiece: l - rtReduction,
        pieces: numPipes,
        optimization: calculateBestMaterial(rtTotal)
      };
      calculations.roundPipe = {
        totalInches: roundPipeTotal,
        perPiece: l - roundPipeReduction,
        pieces: numPipes,
        optimization: calculateBestMaterial(roundPipeTotal)
      };
      calculations.brightBar = {
        totalInches: brightBarTotal,
        perPiece: l - brightBarReduction,
        pieces: numPipes,
        optimization: calculateBestMaterial(brightBarTotal)
      };
    }

    // Mosquito net materials
    if (hasMosquitoNet) {
      const shutterTotal = ((l / 2) - shutterReduction) * 2;
      const mosquitoNetLength = bearingPerPiece + mosquitoNetLengthIncrease;
      const mosquitoNetHeight = handlePerPiece + mosquitoNetHeightIncrease;
      const cChannelLengthTotal = ((l / 2) - cChannelLengthReduction) * 2;
      const cChannelHeightTotal = (h - cChannelHeightReduction) * 2;

      calculations.shutter = {
        totalInches: shutterTotal,
        perPiece: (l / 2) - shutterReduction,
        pieces: 2,
        optimization: calculateBestMaterial(shutterTotal)
      };
      calculations.mosquitoNet = {
        length: mosquitoNetLength,
        height: mosquitoNetHeight,
        pieces: t
      };
      calculations.cChannelLength = {
        totalInches: cChannelLengthTotal,
        perPiece: (l / 2) - cChannelLengthReduction,
        pieces: 2,
        optimization: calculateBestMaterial(cChannelLengthTotal)
      };
      calculations.cChannelHeight = {
        totalInches: cChannelHeightTotal,
        perPiece: h - cChannelHeightReduction,
        pieces: 2,
        optimization: calculateBestMaterial(cChannelHeightTotal)
      };
    }

    return {
      windowName: window.name || 'Unnamed Window',
      dimensions: { length: l, height: h, tracks: t, numberOfPipes: numPipes },
      calculations
    };
  };

  // Generate combined cutting list PDF
  const handleGenerateCuttingListPDF = () => {
    if (selectedWindowsForCutting.length === 0) {
      alert('Please select at least one window');
      return;
    }

    // Get selected windows
    const selectedWindows = windowsList.filter(w => selectedWindowsForCutting.includes(w.id));
    
    // Calculate cutting list for each window using their configured profiles
    const cuttingLists = [];
    const windowsWithoutProfile = [];
    
    for (const window of selectedWindows) {
      // Get the profile for this window based on its configuration
      const cuttingProfile = getCuttingProfileForWindow(
        window.category, 
        window.subCategory, 
        window.options.hasGrill, 
        window.options.hasMosquitoNet
      );
      
      if (cuttingProfile) {
        const cuttingList = calculateWindowCuttingList(window, cuttingProfile.data);
        cuttingList.profile = cuttingProfile.name;
        cuttingList.windowName = window.name || 'Unnamed Window';
        cuttingList.category = window.category;
        cuttingList.subCategory = window.subCategory;
        cuttingLists.push(cuttingList);
      } else {
        windowsWithoutProfile.push(window.name || `Window #${selectedWindows.indexOf(window) + 1}`);
      }
    }
    
    if (cuttingLists.length === 0) {
      alert('No cutting profiles configured for the selected windows. Please configure profiles in Tool Settings → Window Costing Calculator.');
      return;
    }
    
    if (windowsWithoutProfile.length > 0) {
      alert(`Warning: ${windowsWithoutProfile.length} window(s) don't have profiles configured: ${windowsWithoutProfile.join(', ')}. They will be skipped.`);
    }

    // Generate PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    let currentY = 20;

    // Generate table for each window
    cuttingLists.forEach((cuttingList, index) => {
      // Check if we need a new page
      if (currentY > pageHeight - 100) {
        doc.addPage();
        currentY = 20;
      }

      // Header
      doc.setFontSize(20);
      doc.setFont(undefined, 'bold');
      doc.text('Material Cutting List', pageWidth / 2, currentY, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text('Window Management System', pageWidth / 2, currentY + 8, { align: 'center' });
      
      doc.setDrawColor(200, 200, 200);
      doc.line(15, currentY + 12, pageWidth - 15, currentY + 12);
      
      currentY += 22;

      const windowLength = cuttingList.dimensions.length.toFixed(2);
      const windowHeight = cuttingList.dimensions.height.toFixed(2);
      const numTracks = cuttingList.dimensions.tracks;
      
      // Project details with prominent window dimensions
      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.text('Project Details:', 15, currentY);
      
      doc.setFont(undefined, 'normal');
      doc.setFontSize(10);
      
      // Get category and subcategory names
      const categoryName = cuttingList.category === 'sliding' ? 'Sliding Window' : 'Openable Window';
      let subCategoryName = cuttingList.subCategory;
      if (cuttingList.subCategory === 'miniDomal') {
        subCategoryName = 'Mini Domal';
      } else if (cuttingList.subCategory === 'domal') {
        subCategoryName = 'Domal';
      } else if (cuttingList.subCategory === 'ventena') {
        subCategoryName = 'Ventena';
      }
      
      // Get configuration name from window
      const selectedWindow = selectedWindows.find(w => (w.name || 'Unnamed Window') === cuttingList.windowName);
      let configName = '2 Track';
      if (selectedWindow) {
        if (selectedWindow.options.hasGrill && selectedWindow.options.hasMosquitoNet) {
          configName = '2 Track + Mosquito + Grill';
        } else if (selectedWindow.options.hasGrill) {
          configName = '2 Track + Grill';
        } else if (selectedWindow.options.hasMosquitoNet) {
          configName = '2 Track + Mosquito';
        }
      }
      
      doc.text(`Category: ${categoryName}`, 15, currentY + 8);
      doc.text(`Sub Category: ${subCategoryName}`, 15, currentY + 14);
      doc.text(`Configuration: ${configName}`, 15, currentY + 20);
      doc.text(`Profile: ${cuttingList.profile}`, 15, currentY + 26);
      
      // Prominent Window Length and Height
      doc.setFont(undefined, 'bold');
      doc.setFontSize(12);
      doc.setTextColor(220, 38, 38);
      doc.text(`Window Length: ${windowLength}"`, 15, currentY + 34);
      doc.text(`Window Height: ${windowHeight}"`, 15, currentY + 42);
      
      doc.setFont(undefined, 'normal');
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(`Number of Tracks: ${numTracks}`, 15, currentY + 50);
      
      let infoY = currentY + 56;
      if (selectedWindow && selectedWindow.options.hasGrill && selectedWindow.options.numberOfPipes > 0) {
        doc.text(`Number of Pipes: ${selectedWindow.options.numberOfPipes}`, 15, infoY);
        infoY += 6;
      }
      doc.text(`Window Name: ${cuttingList.windowName}`, 15, infoY);
      infoY += 6;
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 15, infoY);
      
      currentY = infoY + 10;

      // Helper function
      const getBarsAndWaste = (optimization) => {
        if (!optimization) return { bars: '-', waste: '-' };
        const bars = (optimization.piecesNeeded !== undefined) ? optimization.piecesNeeded : 1;
        const waste = (optimization.waste !== undefined) ? optimization.waste.toFixed(2) + '"' : '-';
        return { bars, waste };
      };

      // Prepare table data
      const tableData = [];
      
      // TOP HEIGHT
      const topHeightTotal = 2 * cuttingList.dimensions.height;
      const topHeightOpt = calculateBestMaterial(topHeightTotal);
      const topHeightBars = getBarsAndWaste(topHeightOpt);
      tableData.push([
        'TOP HEIGHT',
        `2 pcs × ${windowHeight}"`,
        '2',
        topHeightTotal.toFixed(2) + '"',
        topHeightOpt?.label || '-',
        topHeightBars.bars,
        topHeightBars.waste
      ]);
      
      // TOP WIDTH
      const topWidthTotal = cuttingList.dimensions.length;
      const topWidthOpt = calculateBestMaterial(topWidthTotal);
      const topWidthBars = getBarsAndWaste(topWidthOpt);
      tableData.push([
        'TOP WIDTH',
        `1 pc × ${windowLength}"`,
        '1',
        topWidthTotal.toFixed(2) + '"',
        topWidthOpt?.label || '-',
        topWidthBars.bars,
        topWidthBars.waste
      ]);
      
      // Other materials
      const bottomBars = getBarsAndWaste(cuttingList.calculations.bottom.optimization);
      tableData.push([
        'BOTTOM',
        `1 pc × ${windowLength}"`,
        cuttingList.calculations.bottom.pieces,
        cuttingList.calculations.bottom.totalInches.toFixed(2) + '"',
        cuttingList.calculations.bottom.optimization?.label || '-',
        bottomBars.bars,
        bottomBars.waste
      ]);

      const handleBars = getBarsAndWaste(cuttingList.calculations.handleInnerLock.optimization);
      tableData.push([
        'HANDLE INNER LOCK',
        `${numTracks} pcs × ${cuttingList.calculations.handleInnerLock.perPiece.toFixed(2)}"`,
        cuttingList.calculations.handleInnerLock.pieces,
        cuttingList.calculations.handleInnerLock.totalInches.toFixed(2) + '"',
        cuttingList.calculations.handleInnerLock.optimization?.label || '-',
        handleBars.bars,
        handleBars.waste
      ]);

      const interBars = getBarsAndWaste(cuttingList.calculations.interLock.optimization);
      tableData.push([
        'INTER LOCK',
        `${numTracks} pcs × ${cuttingList.calculations.interLock.perPiece.toFixed(2)}"`,
        cuttingList.calculations.interLock.pieces,
        cuttingList.calculations.interLock.totalInches.toFixed(2) + '"',
        cuttingList.calculations.interLock.optimization?.label || '-',
        interBars.bars,
        interBars.waste
      ]);

      const bearingBars = getBarsAndWaste(cuttingList.calculations.bearingBottom.optimization);
      tableData.push([
        'BEARING BOTTOM',
        `${cuttingList.calculations.bearingBottom.pieces} pcs × ${cuttingList.calculations.bearingBottom.perPiece.toFixed(2)}"`,
        cuttingList.calculations.bearingBottom.pieces,
        cuttingList.calculations.bearingBottom.totalInches.toFixed(2) + '"',
        cuttingList.calculations.bearingBottom.optimization?.label || '-',
        bearingBars.bars,
        bearingBars.waste
      ]);

      tableData.push([
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
        const rtBars = getBarsAndWaste(cuttingList.calculations.rt.optimization);
        tableData.push([
          'RT',
          cuttingList.calculations.rt.perPiece ? `1 pc × ${cuttingList.calculations.rt.perPiece.toFixed(2)}"` : `${cuttingList.calculations.rt.totalInches.toFixed(2)}"`,
          cuttingList.calculations.rt.pieces || 1,
          cuttingList.calculations.rt.totalInches.toFixed(2) + '"',
          cuttingList.calculations.rt.optimization?.label || '-',
          rtBars.bars,
          rtBars.waste
        ]);
      }

      if (cuttingList.calculations.roundPipe) {
        const roundPipeBars = getBarsAndWaste(cuttingList.calculations.roundPipe.optimization);
        tableData.push([
          'ROUND PIPE',
          cuttingList.calculations.roundPipe.perPiece ? `${cuttingList.calculations.roundPipe.pieces} pcs × ${cuttingList.calculations.roundPipe.perPiece.toFixed(2)}"` : `${cuttingList.calculations.roundPipe.totalInches.toFixed(2)}"`,
          cuttingList.calculations.roundPipe.pieces,
          cuttingList.calculations.roundPipe.totalInches.toFixed(2) + '"',
          cuttingList.calculations.roundPipe.optimization?.label || '-',
          roundPipeBars.bars,
          roundPipeBars.waste
        ]);
      }

      if (cuttingList.calculations.brightBar) {
        const brightBarBars = getBarsAndWaste(cuttingList.calculations.brightBar.optimization);
        tableData.push([
          'BRIGHT BAR',
          cuttingList.calculations.brightBar.perPiece ? `${cuttingList.calculations.brightBar.pieces} pcs × ${cuttingList.calculations.brightBar.perPiece.toFixed(2)}"` : `${cuttingList.calculations.brightBar.totalInches.toFixed(2)}"`,
          cuttingList.calculations.brightBar.pieces,
          cuttingList.calculations.brightBar.totalInches.toFixed(2) + '"',
          cuttingList.calculations.brightBar.optimization?.label || '-',
          brightBarBars.bars,
          brightBarBars.waste
        ]);
      }

      // Mosquito Net Materials (if exists)
      if (cuttingList.calculations.shutter) {
        const shutterBars = getBarsAndWaste(cuttingList.calculations.shutter.optimization);
        tableData.push([
          'SHUTTER',
          cuttingList.calculations.shutter.perPiece ? `${cuttingList.calculations.shutter.pieces} pcs × ${cuttingList.calculations.shutter.perPiece.toFixed(2)}"` : `${cuttingList.calculations.shutter.totalInches.toFixed(2)}"`,
          cuttingList.calculations.shutter.pieces,
          cuttingList.calculations.shutter.totalInches.toFixed(2) + '"',
          cuttingList.calculations.shutter.optimization?.label || '-',
          shutterBars.bars,
          shutterBars.waste
        ]);
      }

      if (cuttingList.calculations.mosquitoNet) {
        tableData.push([
          'MOSQUITO NET',
          `${cuttingList.calculations.mosquitoNet.length.toFixed(2)}" × ${cuttingList.calculations.mosquitoNet.height.toFixed(2)}"`,
          cuttingList.calculations.mosquitoNet.pieces || 1,
          `${cuttingList.calculations.mosquitoNet.length.toFixed(2)}" × ${cuttingList.calculations.mosquitoNet.height.toFixed(2)}"`,
          'N/A',
          'N/A',
          'N/A'
        ]);
      }

      if (cuttingList.calculations.cChannelLength) {
        const cChannelLengthBars = getBarsAndWaste(cuttingList.calculations.cChannelLength.optimization);
        tableData.push([
          'C-CHANNEL (LENGTH)',
          cuttingList.calculations.cChannelLength.perPiece ? `${cuttingList.calculations.cChannelLength.pieces} pcs × ${cuttingList.calculations.cChannelLength.perPiece.toFixed(2)}"` : `${cuttingList.calculations.cChannelLength.totalInches.toFixed(2)}"`,
          cuttingList.calculations.cChannelLength.pieces,
          cuttingList.calculations.cChannelLength.totalInches.toFixed(2) + '"',
          cuttingList.calculations.cChannelLength.optimization?.label || '-',
          cChannelLengthBars.bars,
          cChannelLengthBars.waste
        ]);
      }

      if (cuttingList.calculations.cChannelHeight) {
        const cChannelHeightBars = getBarsAndWaste(cuttingList.calculations.cChannelHeight.optimization);
        tableData.push([
          'C-CHANNEL (HEIGHT)',
          cuttingList.calculations.cChannelHeight.perPiece ? `${cuttingList.calculations.cChannelHeight.pieces} pcs × ${cuttingList.calculations.cChannelHeight.perPiece.toFixed(2)}"` : `${cuttingList.calculations.cChannelHeight.totalInches.toFixed(2)}"`,
          cuttingList.calculations.cChannelHeight.pieces,
          cuttingList.calculations.cChannelHeight.totalInches.toFixed(2) + '"',
          cuttingList.calculations.cChannelHeight.optimization?.label || '-',
          cChannelHeightBars.bars,
          cChannelHeightBars.waste
        ]);
      }

      // Generate table
      const startY = currentY;
      autoTable(doc, {
        startY: startY,
        head: [['Material', 'Size', 'Units', 'Total', 'Which Material', 'How Much Bar', 'Wasteage']],
        body: tableData,
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

      // Get final Y position
      let finalY = currentY + 10 + (tableData.length * 6) + 10;
      try {
        if (doc.lastAutoTable && doc.lastAutoTable.finalY) {
          finalY = doc.lastAutoTable.finalY + 10;
        }
      } catch (e) {
        // Use calculated fallback
      }
      
      currentY = finalY + 15;
      
      // Add page break between windows (except last one)
      if (index < cuttingLists.length - 1) {
        doc.addPage();
        currentY = 20;
      }
    });

    // Footer
    const footerY = doc.internal.pageSize.getHeight() - 15;
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Generated on ${new Date().toLocaleString()}`, pageWidth / 2, footerY, { align: 'center' });
    
    // Save PDF
    const fileName = `Combined_Cutting_List_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
    // Close modal
    setShowCuttingListModal(false);
  };

  const handleAddBatchRow = () => {
    const newId = Math.max(...batchRows.map(r => r.id)) + 1;
    setBatchRows([...batchRows, { id: newId, name: '', length: '', width: '', lengthDora: '', widthDora: '' }]);
  };

  const handleRemoveBatchRow = (id) => {
    if (batchRows.length === 1) {
      alert('At least one row is required');
      return;
    }
    setBatchRows(batchRows.filter(row => row.id !== id));
  };

  const handleBatchRowChange = (id, field, value) => {
    setBatchRows(batchRows.map(row => 
      row.id === id ? { ...row, [field]: value } : row
    ));
  };

  const handleAddAllWindows = () => {
    // Validate all rows
    const validRows = [];
    for (let i = 0; i < batchRows.length; i++) {
      const row = batchRows[i];
      if (!row.length || !row.width) {
        alert(`Row ${i + 1}: Please fill in both Length and Width`);
        return;
      }
      const lengthVal = parseFloat(row.length);
      const widthVal = parseFloat(row.width);
      if (isNaN(lengthVal) || lengthVal <= 0 || isNaN(widthVal) || widthVal <= 0) {
        alert(`Row ${i + 1}: Please enter valid positive numbers for Length and Width`);
        return;
      }
      validRows.push({
        ...row,
        length: lengthVal,
        width: widthVal
      });
    }

    // Calculate and add all windows
    const newWindows = [];
    for (const row of validRows) {
      const dimensions = {
        length: row.length,
        width: row.width,
        lengthDora: batchConfig.unit === 'inches' ? (row.lengthDora ? parseFloat(row.lengthDora) : 0) : 0,
        widthDora: batchConfig.unit === 'inches' ? (row.widthDora ? parseFloat(row.widthDora) : 0) : 0,
        unit: batchConfig.unit
      };

      const options = {
        tracks: batchConfig.tracks,
        hasMosquitoNet: batchConfig.hasMosquitoNet,
        hasGrill: batchConfig.hasGrill,
        numberOfPipes: batchConfig.numberOfPipes,
        glassType: batchConfig.glassType
      };

      const result = calculateWindowCost(batchConfig.category, batchConfig.subCategory, dimensions, options, rates);
      
      if (result) {
        // Get cutting profile and calculate cutting list
        const cuttingProfile = getCuttingProfileForWindow(batchConfig.category, batchConfig.subCategory, batchConfig.hasGrill, batchConfig.hasMosquitoNet);
        let cuttingList = null;
        
        if (cuttingProfile) {
          cuttingList = calculateWindowCuttingList({
            dimensions: {
              length: row.length,
              width: row.width,
              lengthDora: batchConfig.unit === 'inches' ? (row.lengthDora ? parseFloat(row.lengthDora) : 0) : 0,
              widthDora: batchConfig.unit === 'inches' ? (row.widthDora ? parseFloat(row.widthDora) : 0) : 0,
              unit: batchConfig.unit
            },
            options: {
              tracks: batchConfig.tracks,
              hasMosquitoNet: batchConfig.hasMosquitoNet,
              hasGrill: batchConfig.hasGrill,
              numberOfPipes: batchConfig.numberOfPipes,
              glassType: batchConfig.glassType
            }
          }, cuttingProfile.data);
          cuttingList.profile = cuttingProfile.name;
        }

        const windowData = {
          id: Date.now() + Math.random(), // Ensure unique ID
          name: row.name.trim() || null,
          category: batchConfig.category,
          subCategory: batchConfig.subCategory,
          dimensions: {
            length: row.length,
            width: row.width,
            lengthDora: batchConfig.unit === 'inches' ? (row.lengthDora ? parseFloat(row.lengthDora) : 0) : 0,
            widthDora: batchConfig.unit === 'inches' ? (row.widthDora ? parseFloat(row.widthDora) : 0) : 0,
            unit: batchConfig.unit
          },
          options: {
            tracks: batchConfig.tracks,
            hasMosquitoNet: batchConfig.hasMosquitoNet,
            hasGrill: batchConfig.hasGrill,
            numberOfPipes: batchConfig.numberOfPipes,
            glassType: batchConfig.glassType
          },
          result: result,
          cuttingList: cuttingList,
          timestamp: new Date().toLocaleString()
        };
        newWindows.push(windowData);
      }
    }

    if (newWindows.length > 0) {
      setWindowsList([...windowsList, ...newWindows]);
      handleCloseBatchModal();
      alert(`Successfully added ${newWindows.length} window${newWindows.length !== 1 ? 's' : ''}!`);
    } else {
      alert('Failed to calculate windows. Please check your inputs.');
    }
  };

  const getBatchConfigDisplay = () => {
    if (!batchConfig) return '';
    
    const trackDisplay = batchConfig.hasMosquitoNet 
      ? '2 Tracks with Mosquitoes Net'
      : batchConfig.hasGrill 
        ? `2 Tracks + Grill (${batchConfig.numberOfPipes} pipes)`
        : `${batchConfig.tracks} Tracks`;
    
    const glassDisplay = batchConfig.glassType === 'plane' ? 'Plane Glass' : 'Reflective Glass';
    
    return `${getCategoryDisplayName(batchConfig.category, batchConfig.subCategory)} | ${trackDisplay} | ${glassDisplay}`;
  };

  // Calculate totals for summary
  const calculateSummary = () => {
    if (windowsList.length === 0) return null;

    const summary = {
      totalWindows: windowsList.length,
      totalArea: 0,
      totalCost: 0,
      breakdown: {
        outerFrame: { kg: 0, cost: 0 },
        shutterFrame: { kg: 0, cost: 0 },
        innerLockClip: { kg: 0, cost: 0 },
        coating: { kg: 0, cost: 0 },
        glass: { area: 0, cost: 0 },
        lock: { quantity: 0, cost: 0 },
        bearing: { quantity: 0, cost: 0 },
        outerClamp: { quantity: 0, cost: 0 },
        innerClamp: { quantity: 0, cost: 0 },
        glassRubber: { length: 0, cost: 0 },
        woolfile: { length: 0, cost: 0 },
        labour: { area: 0, cost: 0 },
        fixedCharge: { cost: 0 },
        mosquitoNet: { area: 0, cost: 0 },
        cChannel: { kg: 0, cost: 0 },
        rt: { kg: 0, cost: 0 },
        roundPipe: { kg: 0, cost: 0 },
        brightBar: { cost: 0 },
        cover: { quantity: 0, cost: 0 }
      }
    };

    windowsList.forEach(window => {
      const result = window.result;
      summary.totalArea += result.area;
      summary.totalCost += result.totalCost;
      
      summary.breakdown.outerFrame.kg += result.breakdown.outerFrame.kg;
      summary.breakdown.outerFrame.cost += result.breakdown.outerFrame.cost;
      
      summary.breakdown.shutterFrame.kg += result.breakdown.shutterFrame.kg;
      summary.breakdown.shutterFrame.cost += result.breakdown.shutterFrame.cost;
      
      summary.breakdown.innerLockClip.kg += result.breakdown.innerLockClip.kg;
      summary.breakdown.innerLockClip.cost += result.breakdown.innerLockClip.cost;
      
      summary.breakdown.coating.kg += result.breakdown.coating.kg;
      summary.breakdown.coating.cost += result.breakdown.coating.cost;
      
      summary.breakdown.glass.area += result.breakdown.glass.area;
      summary.breakdown.glass.cost += result.breakdown.glass.cost;
      
      summary.breakdown.lock.quantity += result.breakdown.lock.quantity;
      summary.breakdown.lock.cost += result.breakdown.lock.cost;
      
      summary.breakdown.bearing.quantity += result.breakdown.bearing.quantity;
      summary.breakdown.bearing.cost += result.breakdown.bearing.cost;
      
      summary.breakdown.outerClamp.quantity += result.breakdown.outerClamp.quantity;
      summary.breakdown.outerClamp.cost += result.breakdown.outerClamp.cost;
      
      summary.breakdown.innerClamp.quantity += result.breakdown.innerClamp.quantity;
      summary.breakdown.innerClamp.cost += result.breakdown.innerClamp.cost;
      
      summary.breakdown.glassRubber.length += result.breakdown.glassRubber.length;
      summary.breakdown.glassRubber.cost += result.breakdown.glassRubber.cost;
      
      summary.breakdown.woolfile.length += result.breakdown.woolfile.length;
      summary.breakdown.woolfile.cost += result.breakdown.woolfile.cost;
      
      summary.breakdown.labour.area += result.breakdown.labour.area;
      summary.breakdown.labour.cost += result.breakdown.labour.cost;
      
      if (result.breakdown.fixedCharge) {
        summary.breakdown.fixedCharge.cost += result.breakdown.fixedCharge.cost;
      }
      
      if (result.breakdown.mosquitoNet) {
        summary.breakdown.mosquitoNet.area += result.breakdown.mosquitoNet.area;
        summary.breakdown.mosquitoNet.cost += result.breakdown.mosquitoNet.cost;
      }
      
      if (result.breakdown.cChannel) {
        summary.breakdown.cChannel.kg += result.breakdown.cChannel.kg || 0;
        summary.breakdown.cChannel.cost += result.breakdown.cChannel.cost || 0;
      }
      
      if (result.breakdown.rt) {
        summary.breakdown.rt.kg += result.breakdown.rt.kg || 0;
        summary.breakdown.rt.cost += result.breakdown.rt.cost || 0;
      }
      
      if (result.breakdown.roundPipe) {
        summary.breakdown.roundPipe.kg += result.breakdown.roundPipe.kg || 0;
        summary.breakdown.roundPipe.cost += result.breakdown.roundPipe.cost || 0;
      }
      
      if (result.breakdown.brightBar) {
        summary.breakdown.brightBar.cost += result.breakdown.brightBar.cost || 0;
      }
      
      if (result.breakdown.cover) {
        summary.breakdown.cover.quantity += result.breakdown.cover.quantity || 0;
        summary.breakdown.cover.cost += result.breakdown.cover.cost || 0;
      }
    });

    summary.averageCostPerSqft = summary.totalArea > 0 ? summary.totalCost / summary.totalArea : 0;

    return summary;
  };

  const summary = calculateSummary();

  const getCategoryDisplayName = (cat, subCat) => {
    const categoryNames = {
      sliding: 'Sliding Window',
      openable: 'Openable Window'
    };
    const subCategoryNames = {
      miniDomal: 'Mini Domal',
      domal: 'Domal',
      ventena: 'Ventena'
    };
    
    // Check if it's a custom category
    if (customCategories[cat] && customCategories[cat][subCat]) {
      return `${categoryNames[cat] || cat} - ${customCategories[cat][subCat].displayName || subCat}`;
    }
    
    return `${categoryNames[cat] || cat}${subCat ? ` - ${subCategoryNames[subCat] || subCat}` : ''}`;
  };

  return (
    <div className="costing-page">
      <div className="costing-header">
        <h1>Window Costing System</h1>
      </div>

      <div className="costing-form-container">
        <div className="costing-form">
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
                  onClick={() => {
                    setSubCategory('miniDomal');
                  }}
                >
                  Mini Domal
                </button>
                <button
                  type="button"
                  className={`option-button ${subCategory === 'domal' ? 'active' : ''}`}
                  onClick={() => {
                    setSubCategory('domal');
                  }}
                >
                  Domal
                </button>
                <button
                  type="button"
                  className={`option-button ${subCategory === 'ventena' ? 'active' : ''}`}
                  onClick={() => {
                    setSubCategory('ventena');
                  }}
                >
                  Ventena
                </button>
                {/* Custom Categories */}
                {Object.entries(customCategories.sliding || {}).map(([key, cat]) => (
                  <button
                    key={key}
                    type="button"
                    className={`option-button ${subCategory === key ? 'active' : ''}`}
                    onClick={() => {
                      setSubCategory(key);
                    }}
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
                      onClick={() => {
                        setSubCategory(key);
                      }}
                    >
                      {cat.displayName || key}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Window Name (Optional)</label>
            <input
              type="text"
              value={windowName}
              onChange={(e) => setWindowName(e.target.value)}
              placeholder="e.g., Living Room Window, Bedroom Window"
              maxLength={100}
            />
          </div>

          <div className="dimensions-group">
            <div className="form-group">
              <label>Length *</label>
              <input
                type="number"
                value={length}
                onChange={(e) => setLength(e.target.value)}
                onWheel={(e) => e.target.blur()}
                step="0.01"
                placeholder="Enter length"
              />
            </div>
            {unit === 'inches' && (
            <div className="form-group">
                <label>Length Dora (1 inch = 8 dora)</label>
                <input
                  type="number"
                  value={lengthDora}
                  onChange={(e) => setLengthDora(e.target.value)}
                  onWheel={(e) => e.target.blur()}
                  step="1"
                  min="0"
                  max="7"
                  placeholder="0-7 dora"
                />
              </div>
            )}
            <div className="form-group">
              <label>Height *</label>
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                onWheel={(e) => e.target.blur()}
                step="0.01"
                placeholder="Enter height"
              />
            </div>
            {unit === 'inches' && (
              <div className="form-group">
                <label>Height Dora (1 inch = 8 dora)</label>
                <input
                  type="number"
                  value={widthDora}
                  onChange={(e) => setWidthDora(e.target.value)}
                  onWheel={(e) => e.target.blur()}
                  step="1"
                  min="0"
                  max="7"
                  placeholder="0-7 dora"
                />
              </div>
            )}
            <div className="form-group">
              <label>Unit</label>
              <div className="button-group">
                <button
                  type="button"
                  className={`option-button ${unit === 'feet' ? 'active' : ''}`}
                  onClick={() => {
                    setUnit('feet');
                    setLengthDora('');
                    setWidthDora('');
                  }}
                >
                  Feet
                </button>
                <button
                  type="button"
                  className={`option-button ${unit === 'inches' ? 'active' : ''}`}
                  onClick={() => setUnit('inches')}
                >
                  Inches
                </button>
              </div>
            </div>
          </div>

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
                      setTracks(2);
                      setHasMosquitoNet(false);
                      setHasGrill(false);
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
                      setTracks(2);
                      setHasMosquitoNet(true);
                      setHasGrill(false);
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
                      setTracks(2);
                      setHasMosquitoNet(false);
                      setHasGrill(true);
                    }}
                  >
                    2 Track + Grill
                  </button>
                  <button
                    type="button"
                    className={`option-button ${windowConfig === '2_track_mosquito_grill' ? 'active' : ''}`}
                    onClick={() => {
                      setWindowConfig('2_track_mosquito_grill');
                      setTracks(2);
                      setHasMosquitoNet(true);
                      setHasGrill(true);
                    }}
                  >
                    2 Track + Mosquito + Grill
                  </button>
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
              <div className="form-group">
                <label>Glass Type *</label>
                <div className="button-group">
                  <button
                    type="button"
                    className={`option-button ${glassType === 'plane' ? 'active' : ''}`}
                    onClick={() => setGlassType('plane')}
                  >
                    Plane (45 Rs/sqft)
                  </button>
                  <button
                    type="button"
                    className={`option-button ${glassType === 'reflective' ? 'active' : ''}`}
                    onClick={() => setGlassType('reflective')}
                  >
                    Reflective (75 Rs/sqft)
                  </button>
                </div>
              </div>
            </>
          )}

          <div className="form-actions">
            <button onClick={handleCalculate} className="calculate-btn">
              Add Window
            </button>
            <button 
              onClick={handleOpenBatchMode} 
              className="batch-btn"
              disabled={!category || !subCategory}
              title="Add multiple windows with same settings but different dimensions"
            >
              Add Multiple Windows
            </button>
            <button onClick={handleReset} className="reset-btn">
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Windows List */}
      {windowsList.length > 0 && (
        <div className="windows-list-section">
          <div className="windows-list-header">
            <h2>Windows List ({windowsList.length})</h2>
            <div className="windows-list-actions">
              <button onClick={handleOpenCuttingList} className="generate-cutting-list-btn">
                📏 Generate Cutting List
              </button>
            <button onClick={handleClearAll} className="clear-all-btn">
              Clear All
            </button>
            </div>
          </div>
          
          <div className="windows-grid">
            {windowsList.map((window, index) => (
              <div 
                key={window.id} 
                className={`window-card ${expandedWindows.includes(window.id) ? 'expanded' : ''}`}
              >
                <div 
                  className="window-card-header"
                  onClick={(e) => toggleWindowExpand(window.id, e)}
                >
                  <div className="window-header-content">
                    <span className="window-number">Window #{index + 1}</span>
                    <span className="window-name-small">{window.name || 'Unnamed Window'}</span>
                  </div>
                  <div className="window-header-actions">
                    <span className="expand-icon">{expandedWindows.includes(window.id) ? '▼' : '▶'}</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveWindow(window.id);
                      }} 
                      className="remove-window-btn"
                      title="Remove window"
                    >
                      ×
                    </button>
                  </div>
                </div>
                <div className={`window-card-body ${expandedWindows.includes(window.id) ? 'show' : 'hide'}`}>
                  <div className="window-name-display">
                    <span className="window-name-label">Name:</span>
                    <span className="window-name-value">{window.name || 'Unnamed Window'}</span>
                  </div>
                  <div className="window-info">
                    <div className="window-info-item">
                      <span className="info-label">Type:</span>
                      <span className="info-value">{getCategoryDisplayName(window.category, window.subCategory)}</span>
                    </div>
                    <div className="window-info-item">
                      <span className="info-label">Dimensions (L × H):</span>
                      <span className="info-value">
                        {window.dimensions.length.toFixed(2)}
                        {window.dimensions.unit === 'inches' && window.dimensions.lengthDora > 0 && ` + ${window.dimensions.lengthDora}d`}
                        {' × '}
                        {window.dimensions.width.toFixed(2)}
                        {window.dimensions.unit === 'inches' && window.dimensions.widthDora > 0 && ` + ${window.dimensions.widthDora}d`}
                        {' '}{window.dimensions.unit}
                      </span>
                    </div>
                    {window.options.tracks && (
                      <div className="window-info-item">
                        <span className="info-label">Tracks:</span>
                        <span className="info-value">
                          {window.options.tracks} {window.options.hasMosquitoNet ? 'with Mosquitoes Net' : window.options.hasGrill ? '+ Grill' : ''}
                        </span>
                      </div>
                    )}
                    {window.options.hasGrill && window.options.numberOfPipes > 0 && (
                      <div className="window-info-item">
                        <span className="info-label">No. of Pipes:</span>
                        <span className="info-value">{window.options.numberOfPipes}</span>
                      </div>
                    )}
                    {window.options.glassType && (
                      <div className="window-info-item">
                        <span className="info-label">Glass:</span>
                        <span className="info-value">{window.options.glassType}</span>
                      </div>
                    )}
                    <div className="window-info-item">
                      <span className="info-label">Area:</span>
                      <span className="info-value">{window.result.area.toFixed(2)} sq ft</span>
                    </div>
                    <div className="window-info-item highlight-item">
                      <span className="info-label">Total Cost:</span>
                      <span className="info-value">Rs. {window.result.totalCost.toFixed(2)}</span>
                    </div>
                    <div className="window-info-item highlight-item">
                      <span className="info-label">Cost per Sqft:</span>
                      <span className="info-value">Rs. {window.result.costPerSqft.toFixed(2)}</span>
                    </div>
                    {window.cuttingList && (
                      <div className="window-info-item" style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #eee' }}>
                        <span className="info-label" style={{ fontWeight: 'bold', color: '#22c55e' }}>📏 Cutting List:</span>
                        <div style={{ marginTop: '8px', fontSize: '13px' }}>
                          <div style={{ marginBottom: '5px' }}>
                            <strong>Profile:</strong> {window.cuttingList.profile}
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', fontSize: '12px', color: '#666' }}>
                            <div>TOP H: {((2 * window.cuttingList.dimensions.height).toFixed(2))}"</div>
                            <div>TOP W: {window.cuttingList.dimensions.length.toFixed(2)}"</div>
                            <div>Bottom: {window.cuttingList.dimensions.length.toFixed(2)}"</div>
                            <div>Handle: {window.cuttingList.calculations.handleInnerLock.totalInches.toFixed(2)}"</div>
                            <div>Inter: {window.cuttingList.calculations.interLock.totalInches.toFixed(2)}"</div>
                            <div>Bearing: {window.cuttingList.calculations.bearingBottom.totalInches.toFixed(2)}"</div>
                            <div style={{ gridColumn: 'span 2' }}>
                              Glass: {window.cuttingList.calculations.glass.length.toFixed(2)}" × {window.cuttingList.calculations.glass.height.toFixed(2)}"
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="window-info-item click-hint">
                      <button 
                        className="view-breakdown-btn"
                        onClick={() => handleWindowClick(window, index)}
                      >
                        View Cost Breakdown
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Batch Entry Modal */}
      {showBatchModal && (
        <div className="modal-overlay" onClick={handleCloseBatchModal}>
          <div className="batch-modal" onClick={(e) => e.stopPropagation()}>
            <div className="batch-modal-header">
              <h2>Add Multiple Windows</h2>
              <button onClick={handleCloseBatchModal} className="close-modal-btn">×</button>
            </div>
            <div className="batch-modal-body">
              <div className="batch-config-display">
                <strong>Configuration:</strong> {getBatchConfigDisplay()}
              </div>
              
              <div className="batch-table-container">
                <table className="batch-table">
                  <thead>
                    <tr>
                      <th className="batch-col-number">#</th>
                      <th className="batch-col-name">Window Name (Optional)</th>
                      <th className="batch-col-dimension">Length ({batchConfig?.unit || 'feet'}) *</th>
                      {batchConfig?.unit === 'inches' && (
                        <th className="batch-col-dora">L-Dora</th>
                      )}
                      <th className="batch-col-dimension">Height ({batchConfig?.unit || 'feet'}) *</th>
                      {batchConfig?.unit === 'inches' && (
                        <th className="batch-col-dora">H-Dora</th>
                      )}
                      <th className="batch-col-action">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batchRows.map((row, index) => (
                      <tr key={row.id}>
                        <td className="batch-col-number">{index + 1}</td>
                        <td className="batch-col-name">
                          <input
                            type="text"
                            value={row.name}
                            onChange={(e) => handleBatchRowChange(row.id, 'name', e.target.value)}
                            placeholder="e.g., Living Room"
                            maxLength={100}
                          />
                        </td>
                        <td className="batch-col-dimension">
                          <input
                            type="number"
                            value={row.length}
                            onChange={(e) => handleBatchRowChange(row.id, 'length', e.target.value)}
                            onWheel={(e) => e.target.blur()}
                            step="0.01"
                            placeholder="0.00"
                          />
                        </td>
                        {batchConfig?.unit === 'inches' && (
                          <td className="batch-col-dora">
                            <input
                              type="number"
                              value={row.lengthDora}
                              onChange={(e) => handleBatchRowChange(row.id, 'lengthDora', e.target.value)}
                              onWheel={(e) => e.target.blur()}
                              step="1"
                              min="0"
                              max="7"
                              placeholder="0-7"
                            />
                          </td>
                        )}
                        <td className="batch-col-dimension">
                          <input
                            type="number"
                            value={row.width}
                            onChange={(e) => handleBatchRowChange(row.id, 'width', e.target.value)}
                            onWheel={(e) => e.target.blur()}
                            step="0.01"
                            placeholder="0.00"
                          />
                        </td>
                        {batchConfig?.unit === 'inches' && (
                          <td className="batch-col-dora">
                            <input
                              type="number"
                              value={row.widthDora}
                              onChange={(e) => handleBatchRowChange(row.id, 'widthDora', e.target.value)}
                              onWheel={(e) => e.target.blur()}
                              step="1"
                              min="0"
                              max="7"
                              placeholder="0-7"
                            />
                          </td>
                        )}
                        <td className="batch-col-action">
                          <button
                            onClick={() => handleRemoveBatchRow(row.id)}
                            className="batch-remove-btn"
                            title="Remove this row"
                            disabled={batchRows.length === 1}
                          >
                            ×
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="batch-modal-actions">
                <button onClick={handleAddBatchRow} className="add-row-btn">
                  + Add Row
                </button>
                <div className="batch-modal-buttons">
                  <button onClick={handleAddAllWindows} className="modal-btn primary">
                    Add All Windows ({batchRows.length})
                  </button>
                  <button onClick={handleCloseBatchModal} className="modal-btn secondary">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cutting List Modal */}
      {showCuttingListModal && (
        <div className="modal-overlay" onClick={() => setShowCuttingListModal(false)}>
          <div className="batch-modal cutting-list-modal" onClick={(e) => e.stopPropagation()}>
            <div className="batch-modal-header">
              <h2>📏 Generate Cutting List</h2>
              <button onClick={() => setShowCuttingListModal(false)} className="close-modal-btn">×</button>
            </div>
            <div className="batch-modal-body">
              {/* Info Message */}
              <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f0f9ff', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                <p style={{ margin: 0, fontSize: '14px', color: '#0369a1' }}>
                  <strong>ℹ️ Automatic Profile Selection:</strong> Each window will use the cutting profile configured in <strong>Tool Settings → Window Costing Calculator</strong> based on its configuration (2 Track, 2 Track + Grill, etc.).
                </p>
              </div>

              {/* Window Selection */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <label style={{ fontWeight: 'bold', fontSize: '16px' }}>Select Windows ({selectedWindowsForCutting.length} selected)</label>
                  <button 
                    onClick={handleSelectAllWindows}
                    className="modal-btn secondary"
                    style={{ padding: '5px 15px', fontSize: '14px' }}
                  >
                    {selectedWindowsForCutting.length === windowsList.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '5px', padding: '10px' }}>
                  {windowsList.map((window, index) => (
                    <div 
                      key={window.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '10px',
                        borderBottom: '1px solid #eee',
                        cursor: 'pointer',
                        backgroundColor: selectedWindowsForCutting.includes(window.id) ? '#f0f9ff' : 'transparent'
                      }}
                      onClick={() => handleToggleWindowSelection(window.id)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedWindowsForCutting.includes(window.id)}
                        onChange={() => handleToggleWindowSelection(window.id)}
                        style={{ marginRight: '10px', width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'bold' }}>
                          Window #{index + 1}: {window.name || 'Unnamed Window'}
                        </div>
                        <div style={{ fontSize: '14px', color: '#666', marginTop: '3px' }}>
                          {window.dimensions.length.toFixed(2)}
                          {window.dimensions.unit === 'inches' && window.dimensions.lengthDora > 0 && ` + ${window.dimensions.lengthDora}d`}
                          {' × '}
                          {window.dimensions.width.toFixed(2)}
                          {window.dimensions.unit === 'inches' && window.dimensions.widthDora > 0 && ` + ${window.dimensions.widthDora}d`}
                          {' '}{window.dimensions.unit} | Tracks: {window.options.tracks}
                        </div>
                        {(() => {
                          const profile = getCuttingProfileForWindow(
                            window.category,
                            window.subCategory,
                            window.options.hasGrill,
                            window.options.hasMosquitoNet
                          );
                          return profile ? (
                            <div style={{ fontSize: '12px', color: '#22c55e', marginTop: '3px', fontWeight: '500' }}>
                              📏 Profile: {profile.name}
                            </div>
                          ) : (
                            <div style={{ fontSize: '12px', color: '#dc2626', marginTop: '3px' }}>
                              ⚠️ No profile configured
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="batch-modal-footer">
                <button 
                  onClick={handleGenerateCuttingListPDF} 
                  className="modal-btn primary"
                  disabled={selectedWindowsForCutting.length === 0}
                >
                  📥 Download PDF ({selectedWindowsForCutting.length} windows)
                </button>
                <button 
                  onClick={() => setShowCuttingListModal(false)} 
                  className="modal-btn secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={handlePasswordCancel}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Enter Password</h2>
            <form onSubmit={handlePasswordSubmit}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="password-input"
                autoFocus
              />
              <div className="modal-actions">
                <button type="submit" className="modal-btn primary">
                  Submit
                </button>
                <button type="button" onClick={handlePasswordCancel} className="modal-btn secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Window Breakdown Modal */}
      {selectedWindowForBreakdown && isAuthenticated && (
        <div className="modal-overlay" onClick={handleCloseBreakdown}>
          <div className="breakdown-modal" onClick={(e) => e.stopPropagation()}>
            <div className="breakdown-modal-header">
              <div>
                <h2>Cost Breakdown - Window #{selectedWindowForBreakdown.index + 1}</h2>
                {selectedWindowForBreakdown.window.name && (
                  <p className="breakdown-window-name">{selectedWindowForBreakdown.window.name}</p>
                )}
              </div>
              <button onClick={handleCloseBreakdown} className="close-modal-btn">×</button>
            </div>
            <div className="breakdown-modal-body">
              <div className="breakdown-summary-card">
                <div className="breakdown-summary-item">
                  <span className="summary-label">Area:</span>
                  <span className="summary-value">{selectedWindowForBreakdown.window.result.area.toFixed(2)} sq ft</span>
                </div>
                <div className="breakdown-summary-item">
                  <span className="summary-label">Total Cost:</span>
                  <span className="summary-value highlight">Rs. {selectedWindowForBreakdown.window.result.totalCost.toFixed(2)}</span>
                </div>
                <div className="breakdown-summary-item">
                  <span className="summary-label">Cost per Sqft:</span>
                  <span className="summary-value highlight">Rs. {selectedWindowForBreakdown.window.result.costPerSqft.toFixed(2)}</span>
                </div>
              </div>

              <div className="breakdown-section">
                <h3>Cost Breakdown</h3>
                <div className="breakdown-list">
                  <div className="breakdown-item">
                    <span className="breakdown-name">Outer Frame</span>
                    <span className="breakdown-details">
                      {selectedWindowForBreakdown.window.result.breakdown.outerFrame.kg.toFixed(3)} kg
                    </span>
                    <span className="breakdown-cost">
                      Rs. {selectedWindowForBreakdown.window.result.breakdown.outerFrame.cost.toFixed(2)}
                    </span>
                  </div>
                  <div className="breakdown-item">
                    <span className="breakdown-name">Shutter Frame</span>
                    <span className="breakdown-details">
                      {selectedWindowForBreakdown.window.result.breakdown.shutterFrame.kg.toFixed(3)} kg
                    </span>
                    <span className="breakdown-cost">
                      Rs. {selectedWindowForBreakdown.window.result.breakdown.shutterFrame.cost.toFixed(2)}
                    </span>
                  </div>
                  {selectedWindowForBreakdown.window.result.breakdown.cChannel && selectedWindowForBreakdown.window.result.breakdown.cChannel.cost > 0 && (
                    <div className="breakdown-item">
                      <span className="breakdown-name">C-Channel</span>
                      <span className="breakdown-details">
                        {selectedWindowForBreakdown.window.result.breakdown.cChannel.kg.toFixed(3)} kg
                      </span>
                      <span className="breakdown-cost">
                        Rs. {selectedWindowForBreakdown.window.result.breakdown.cChannel.cost.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="breakdown-item">
                    <span className="breakdown-name">Inner Lock Clip</span>
                    <span className="breakdown-details">
                      {selectedWindowForBreakdown.window.result.breakdown.innerLockClip.kg.toFixed(3)} kg
                    </span>
                    <span className="breakdown-cost">
                      Rs. {selectedWindowForBreakdown.window.result.breakdown.innerLockClip.cost.toFixed(2)}
                    </span>
                  </div>
                  <div className="breakdown-item">
                    <span className="breakdown-name">Coating</span>
                    <span className="breakdown-details">
                      {selectedWindowForBreakdown.window.result.breakdown.coating.kg.toFixed(3)} kg
                    </span>
                    <span className="breakdown-cost">
                      Rs. {selectedWindowForBreakdown.window.result.breakdown.coating.cost.toFixed(2)}
                    </span>
                  </div>
                  <div className="breakdown-item">
                    <span className="breakdown-name">Glass ({selectedWindowForBreakdown.window.result.breakdown.glass.type})</span>
                    <span className="breakdown-details">
                      {selectedWindowForBreakdown.window.result.breakdown.glass.area.toFixed(2)} sq ft
                    </span>
                    <span className="breakdown-cost">
                      Rs. {selectedWindowForBreakdown.window.result.breakdown.glass.cost.toFixed(2)}
                    </span>
                  </div>
                  <div className="breakdown-item">
                    <span className="breakdown-name">Lock</span>
                    <span className="breakdown-details">
                      {selectedWindowForBreakdown.window.result.breakdown.lock.quantity} units
                    </span>
                    <span className="breakdown-cost">
                      Rs. {selectedWindowForBreakdown.window.result.breakdown.lock.cost.toFixed(2)}
                    </span>
                  </div>
                  <div className="breakdown-item">
                    <span className="breakdown-name">Bearing</span>
                    <span className="breakdown-details">
                      {selectedWindowForBreakdown.window.result.breakdown.bearing.quantity} units
                    </span>
                    <span className="breakdown-cost">
                      Rs. {selectedWindowForBreakdown.window.result.breakdown.bearing.cost.toFixed(2)}
                    </span>
                  </div>
                  <div className="breakdown-item">
                    <span className="breakdown-name">Outer Clamp</span>
                    <span className="breakdown-details">
                      {selectedWindowForBreakdown.window.result.breakdown.outerClamp.quantity} units
                    </span>
                    <span className="breakdown-cost">
                      Rs. {selectedWindowForBreakdown.window.result.breakdown.outerClamp.cost.toFixed(2)}
                    </span>
                  </div>
                  <div className="breakdown-item">
                    <span className="breakdown-name">Inner Clamp</span>
                    <span className="breakdown-details">
                      {selectedWindowForBreakdown.window.result.breakdown.innerClamp.quantity} units
                    </span>
                    <span className="breakdown-cost">
                      Rs. {selectedWindowForBreakdown.window.result.breakdown.innerClamp.cost.toFixed(2)}
                    </span>
                  </div>
                  <div className="breakdown-item">
                    <span className="breakdown-name">Glass Rubber</span>
                    <span className="breakdown-details">
                      {selectedWindowForBreakdown.window.result.breakdown.glassRubber.length.toFixed(2)} ft
                    </span>
                    <span className="breakdown-cost">
                      Rs. {selectedWindowForBreakdown.window.result.breakdown.glassRubber.cost.toFixed(2)}
                    </span>
                  </div>
                  <div className="breakdown-item">
                    <span className="breakdown-name">Woolfile</span>
                    <span className="breakdown-details">
                      {selectedWindowForBreakdown.window.result.breakdown.woolfile.length.toFixed(2)} ft
                    </span>
                    <span className="breakdown-cost">
                      Rs. {selectedWindowForBreakdown.window.result.breakdown.woolfile.cost.toFixed(2)}
                    </span>
                  </div>
                  <div className="breakdown-item">
                    <span className="breakdown-name">Labour</span>
                    <span className="breakdown-details">
                      {selectedWindowForBreakdown.window.result.breakdown.labour.area.toFixed(2)} sq ft
                    </span>
                    <span className="breakdown-cost">
                      Rs. {selectedWindowForBreakdown.window.result.breakdown.labour.cost.toFixed(2)}
                    </span>
                  </div>
                  <div className="breakdown-item">
                    <span className="breakdown-name">Fixed Charge</span>
                    <span className="breakdown-details">
                      1 window
                    </span>
                    <span className="breakdown-cost">
                      Rs. {selectedWindowForBreakdown.window.result.breakdown.fixedCharge.cost.toFixed(2)}
                    </span>
                  </div>
                  {selectedWindowForBreakdown.window.result.breakdown.mosquitoNet && selectedWindowForBreakdown.window.result.breakdown.mosquitoNet.cost > 0 && (
                    <div className="breakdown-item">
                      <span className="breakdown-name">Mosquito Net</span>
                      <span className="breakdown-details">
                        {selectedWindowForBreakdown.window.result.breakdown.mosquitoNet.area.toFixed(2)} sq ft
                      </span>
                      <span className="breakdown-cost">
                        Rs. {selectedWindowForBreakdown.window.result.breakdown.mosquitoNet.cost.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {selectedWindowForBreakdown.window.result.breakdown.rt && selectedWindowForBreakdown.window.result.breakdown.rt.cost > 0 && (
                    <div className="breakdown-item">
                      <span className="breakdown-name">RT</span>
                      <span className="breakdown-details">
                        {selectedWindowForBreakdown.window.result.breakdown.rt.kg.toFixed(3)} kg
                      </span>
                      <span className="breakdown-cost">
                        Rs. {selectedWindowForBreakdown.window.result.breakdown.rt.cost.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {selectedWindowForBreakdown.window.result.breakdown.roundPipe && selectedWindowForBreakdown.window.result.breakdown.roundPipe.cost > 0 && (
                    <div className="breakdown-item">
                      <span className="breakdown-name">Round Pipe</span>
                      <span className="breakdown-details">
                        {selectedWindowForBreakdown.window.result.breakdown.roundPipe.kg.toFixed(3)} kg
                      </span>
                      <span className="breakdown-cost">
                        Rs. {selectedWindowForBreakdown.window.result.breakdown.roundPipe.cost.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {selectedWindowForBreakdown.window.result.breakdown.brightBar && selectedWindowForBreakdown.window.result.breakdown.brightBar.cost > 0 && (
                    <div className="breakdown-item">
                      <span className="breakdown-name">Bright Bar</span>
                      <span className="breakdown-details">
                        -
                      </span>
                      <span className="breakdown-cost">
                        Rs. {selectedWindowForBreakdown.window.result.breakdown.brightBar.cost.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {selectedWindowForBreakdown.window.result.breakdown.cover && selectedWindowForBreakdown.window.result.breakdown.cover.cost > 0 && (
                    <div className="breakdown-item">
                      <span className="breakdown-name">Cover</span>
                      <span className="breakdown-details">
                        {selectedWindowForBreakdown.window.result.breakdown.cover.quantity} units
                      </span>
                      <span className="breakdown-cost">
                        Rs. {selectedWindowForBreakdown.window.result.breakdown.cover.cost.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary Section */}
      {summary && (
        <div className="summary-section">
          <h2>Summary of All Windows</h2>
          
          <div className="summary-overview">
            <div className="summary-overview-item">
              <span className="overview-label">Total Windows:</span>
              <span className="overview-value">{summary.totalWindows}</span>
            </div>
            <div className="summary-overview-item">
              <span className="overview-label">Total Area:</span>
              <span className="overview-value">{summary.totalArea.toFixed(2)} sq ft</span>
            </div>
            <div className="summary-overview-item highlight-overview">
              <span className="overview-label">Total Cost:</span>
              <span className="overview-value">Rs. {summary.totalCost.toFixed(2)}</span>
            </div>
            <div className="summary-overview-item">
              <span className="overview-label">Average Cost/Sqft:</span>
              <span className="overview-value">Rs. {summary.averageCostPerSqft.toFixed(2)}</span>
            </div>
          </div>

          <div className="breakdown-section">
            <h3>Total Cost Breakdown</h3>
            <div className="breakdown-list">
              <div className="breakdown-item">
                <span className="breakdown-name">Outer Frame</span>
                <span className="breakdown-details">
                  {summary.breakdown.outerFrame.kg.toFixed(3)} kg
                </span>
                <span className="breakdown-cost">
                  Rs. {summary.breakdown.outerFrame.cost.toFixed(2)}
                </span>
              </div>
              <div className="breakdown-item">
                <span className="breakdown-name">Shutter Frame</span>
                <span className="breakdown-details">
                  {summary.breakdown.shutterFrame.kg.toFixed(3)} kg
                </span>
                <span className="breakdown-cost">
                  Rs. {summary.breakdown.shutterFrame.cost.toFixed(2)}
                </span>
              </div>
              {summary.breakdown.cChannel && summary.breakdown.cChannel.cost > 0 && (
                <div className="breakdown-item">
                  <span className="breakdown-name">C-Channel</span>
                  <span className="breakdown-details">
                    {summary.breakdown.cChannel.kg.toFixed(3)} kg
                  </span>
                  <span className="breakdown-cost">
                    Rs. {summary.breakdown.cChannel.cost.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="breakdown-item">
                <span className="breakdown-name">Inner Lock Clip</span>
                <span className="breakdown-details">
                  {summary.breakdown.innerLockClip.kg.toFixed(3)} kg
                </span>
                <span className="breakdown-cost">
                  Rs. {summary.breakdown.innerLockClip.cost.toFixed(2)}
                </span>
              </div>
              <div className="breakdown-item">
                <span className="breakdown-name">Coating</span>
                <span className="breakdown-details">
                  {summary.breakdown.coating.kg.toFixed(3)} kg
                </span>
                <span className="breakdown-cost">
                  Rs. {summary.breakdown.coating.cost.toFixed(2)}
                </span>
              </div>
              <div className="breakdown-item">
                <span className="breakdown-name">Glass</span>
                <span className="breakdown-details">
                  {summary.breakdown.glass.area.toFixed(2)} sq ft
                </span>
                <span className="breakdown-cost">
                  Rs. {summary.breakdown.glass.cost.toFixed(2)}
                </span>
              </div>
              <div className="breakdown-item">
                <span className="breakdown-name">Lock</span>
                <span className="breakdown-details">
                  {summary.breakdown.lock.quantity} units
                </span>
                <span className="breakdown-cost">
                  Rs. {summary.breakdown.lock.cost.toFixed(2)}
                </span>
              </div>
              <div className="breakdown-item">
                <span className="breakdown-name">Bearing</span>
                <span className="breakdown-details">
                  {summary.breakdown.bearing.quantity} units
                </span>
                <span className="breakdown-cost">
                  Rs. {summary.breakdown.bearing.cost.toFixed(2)}
                </span>
              </div>
              <div className="breakdown-item">
                <span className="breakdown-name">Outer Clamp</span>
                <span className="breakdown-details">
                  {summary.breakdown.outerClamp.quantity} units
                </span>
                <span className="breakdown-cost">
                  Rs. {summary.breakdown.outerClamp.cost.toFixed(2)}
                </span>
              </div>
              <div className="breakdown-item">
                <span className="breakdown-name">Inner Clamp</span>
                <span className="breakdown-details">
                  {summary.breakdown.innerClamp.quantity} units
                </span>
                <span className="breakdown-cost">
                  Rs. {summary.breakdown.innerClamp.cost.toFixed(2)}
                </span>
              </div>
              <div className="breakdown-item">
                <span className="breakdown-name">Glass Rubber</span>
                <span className="breakdown-details">
                  {summary.breakdown.glassRubber.length.toFixed(2)} ft
                </span>
                <span className="breakdown-cost">
                  Rs. {summary.breakdown.glassRubber.cost.toFixed(2)}
                </span>
              </div>
              <div className="breakdown-item">
                <span className="breakdown-name">Woolfile</span>
                <span className="breakdown-details">
                  {summary.breakdown.woolfile.length.toFixed(2)} ft
                </span>
                <span className="breakdown-cost">
                  Rs. {summary.breakdown.woolfile.cost.toFixed(2)}
                </span>
              </div>
              <div className="breakdown-item">
                <span className="breakdown-name">Labour</span>
                <span className="breakdown-details">
                  {summary.breakdown.labour.area.toFixed(2)} sq ft
                </span>
                <span className="breakdown-cost">
                  Rs. {summary.breakdown.labour.cost.toFixed(2)}
                </span>
              </div>
              <div className="breakdown-item">
                <span className="breakdown-name">Fixed Charge</span>
                <span className="breakdown-details">
                  {summary.totalWindows} window{summary.totalWindows !== 1 ? 's' : ''}
                </span>
                <span className="breakdown-cost">
                  Rs. {summary.breakdown.fixedCharge.cost.toFixed(2)}
                </span>
              </div>
              {summary.breakdown.mosquitoNet && summary.breakdown.mosquitoNet.cost > 0 && (
                <div className="breakdown-item">
                  <span className="breakdown-name">Mosquito Net</span>
                  <span className="breakdown-details">
                    {summary.breakdown.mosquitoNet.area.toFixed(2)} sq ft
                  </span>
                  <span className="breakdown-cost">
                    Rs. {summary.breakdown.mosquitoNet.cost.toFixed(2)}
                  </span>
                </div>
              )}
              {summary.breakdown.rt && summary.breakdown.rt.cost > 0 && (
                <div className="breakdown-item">
                  <span className="breakdown-name">RT</span>
                  <span className="breakdown-details">
                    {summary.breakdown.rt.kg.toFixed(3)} kg
                  </span>
                  <span className="breakdown-cost">
                    Rs. {summary.breakdown.rt.cost.toFixed(2)}
                  </span>
                </div>
              )}
              {summary.breakdown.roundPipe && summary.breakdown.roundPipe.cost > 0 && (
                <div className="breakdown-item">
                  <span className="breakdown-name">Round Pipe</span>
                  <span className="breakdown-details">
                    {summary.breakdown.roundPipe.kg.toFixed(3)} kg
                  </span>
                  <span className="breakdown-cost">
                    Rs. {summary.breakdown.roundPipe.cost.toFixed(2)}
                  </span>
                </div>
              )}
              {summary.breakdown.brightBar && summary.breakdown.brightBar.cost > 0 && (
                <div className="breakdown-item">
                  <span className="breakdown-name">Bright Bar</span>
                  <span className="breakdown-details">
                    -
                  </span>
                  <span className="breakdown-cost">
                    Rs. {summary.breakdown.brightBar.cost.toFixed(2)}
                  </span>
                </div>
              )}
              {summary.breakdown.cover && summary.breakdown.cover.cost > 0 && (
                <div className="breakdown-item">
                  <span className="breakdown-name">Cover</span>
                  <span className="breakdown-details">
                    {summary.breakdown.cover.quantity} units
                  </span>
                  <span className="breakdown-cost">
                    Rs. {summary.breakdown.cover.cost.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CostingPage;
