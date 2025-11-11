import { useState } from 'react';
import CostingPage from '../components/CostingPage';
import CuttingMeasuringTool from '../components/CuttingMeasuringTool';
import './ToolsPage.css';

const ToolsPage = ({ rates }) => {
  const [selectedTool, setSelectedTool] = useState(null);

  const tools = [
    {
      id: 'window-costing',
      name: 'Window Costing Calculator',
      icon: '🪟',
      description: 'Calculate complete window costs with material breakdown',
      color: '#667eea',
      status: 'active'
    },
    {
      id: 'cutting-measuring',
      name: 'Cutting Measuring Tool',
      icon: '📏',
      description: 'Get exact cutting lengths for all materials based on profiles',
      color: '#f59e0b',
      status: 'active'
    },
    {
      id: 'door-costing',
      name: 'Door Costing Calculator',
      icon: '🚪',
      description: 'Coming Soon - Calculate door installation costs',
      color: '#3498db',
      status: 'coming-soon'
    },
    {
      id: 'quotation-generator',
      name: 'Quotation Generator',
      icon: '📄',
      description: 'Coming Soon - Generate professional quotations',
      color: '#27ae60',
      status: 'coming-soon'
    },
    {
      id: 'material-calculator',
      name: 'Material Calculator',
      icon: '📦',
      description: 'Coming Soon - Calculate required materials for projects',
      color: '#f39c12',
      status: 'coming-soon'
    },
    {
      id: 'profit-analyzer',
      name: 'Profit Analyzer',
      icon: '💹',
      description: 'Coming Soon - Analyze profit margins and costs',
      color: '#e74c3c',
      status: 'coming-soon'
    }
  ];

  const handleToolClick = (tool) => {
    if (tool.status === 'active') {
      setSelectedTool(tool.id);
    }
  };

  const handleBackToTools = () => {
    setSelectedTool(null);
  };

  // If no tool is selected, show the tools grid
  if (!selectedTool) {
    return (
      <div className="tools-page">
        <div className="tools-header">
          <h1>Tools & Calculators</h1>
          <p>Professional tools to streamline your window business</p>
        </div>

        <div className="tools-grid-container">
          {tools.map((tool) => (
            <div
              key={tool.id}
              className={`tool-card ${tool.status === 'coming-soon' ? 'disabled' : ''}`}
              onClick={() => handleToolClick(tool)}
              style={{ borderTopColor: tool.color }}
            >
              <div className="tool-card-icon" style={{ backgroundColor: `${tool.color}20`, color: tool.color }}>
                {tool.icon}
              </div>
              <h3 className="tool-card-title">{tool.name}</h3>
              <p className="tool-card-description">{tool.description}</p>
              {tool.status === 'coming-soon' ? (
                <span className="tool-card-badge">Coming Soon</span>
              ) : (
                <div className="tool-card-action">
                  <span>Open Tool</span>
                  <span className="arrow">→</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // If a tool is selected, show it in full screen
  return (
    <div className="tools-page fullscreen-tool">
      <div className="tool-fullscreen-header">
        <button className="back-button" onClick={handleBackToTools}>
          <span className="back-arrow">←</span>
          <span>Back to Tools</span>
        </button>
      </div>

      <div className="tool-fullscreen-content">
        {selectedTool === 'window-costing' && <CostingPage rates={rates} />}
        {selectedTool === 'cutting-measuring' && <CuttingMeasuringTool />}
      </div>
    </div>
  );
};

export default ToolsPage;

