import { useState } from 'react';
import { calculateWindowCost } from '../utils/costCalculator';
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

  const handleCalculate = () => {
    if (!category || !subCategory || !length || !width) {
      alert('Please fill in all required fields');
      return;
    }
    
    if (hasGrill && (!numberOfPipes || parseInt(numberOfPipes) < 1)) {
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

    const options = {
      tracks: parseInt(tracks),
      hasMosquitoNet,
      hasGrill,
      numberOfPipes: hasGrill ? parseInt(numberOfPipes) : 0,
      glassType
    };

    const result = calculateWindowCost(category, subCategory, dimensions, options, rates);
    
    if (result) {
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
    
    if (hasGrill && (!numberOfPipes || parseInt(numberOfPipes) < 1)) {
      alert('Please enter the number of pipes required for grill window');
      return;
    }

    // Capture current form configuration
    const config = {
      category,
      subCategory,
      unit,
      tracks: parseInt(tracks),
      hasMosquitoNet,
      hasGrill,
      numberOfPipes: hasGrill ? parseInt(numberOfPipes) : 0,
      glassType
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

          {subCategory === 'miniDomal' && (
            <>
              <div className="form-group">
                <label>Number of Tracks *</label>
                <div className="button-group">
                  <button
                    type="button"
                    className={`option-button ${tracks === 2 && !hasMosquitoNet && !hasGrill ? 'active' : ''}`}
                    onClick={() => {
                      setTracks(2);
                      setHasMosquitoNet(false);
                      setHasGrill(false);
                      setNumberOfPipes('');
                    }}
                  >
                    2 Tracks
                  </button>
                  <button
                    type="button"
                    className={`option-button ${tracks === 2 && hasMosquitoNet ? 'active' : ''}`}
                    onClick={() => {
                      setTracks(2);
                      setHasMosquitoNet(true);
                      setHasGrill(false);
                      setNumberOfPipes('');
                    }}
                  >
                    2 Tracks with Mosquitoes Net
                  </button>
                  <button
                    type="button"
                    className={`option-button ${tracks === 2 && hasGrill ? 'active' : ''}`}
                    onClick={() => {
                      setTracks(2);
                      setHasMosquitoNet(false);
                      setHasGrill(true);
                    }}
                  >
                    2 Tracks + Grill
                  </button>
                </div>
              </div>
              {hasGrill && (
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
            <button onClick={handleClearAll} className="clear-all-btn">
              Clear All
            </button>
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
