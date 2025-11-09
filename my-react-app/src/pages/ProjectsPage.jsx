import './ProjectsPage.css';

const ProjectsPage = ({ title = "Projects & Customers", icon = "📋", feature = "Projects Management" }) => {
  const features = {
    "Projects Management": [
      { icon: '👤', label: 'Customer Management' },
      { icon: '📝', label: 'Project Tracking' },
      { icon: '💰', label: 'Invoice Generation' },
      { icon: '📊', label: 'Progress Monitoring' }
    ],
    "Quotation Management": [
      { icon: '👤', label: 'Customer Selection' },
      { icon: '📝', label: 'Item Addition' },
      { icon: '💰', label: 'Price Calculation' },
      { icon: '📄', label: 'PDF Generation' }
    ],
    "Invoice Management": [
      { icon: '🧾', label: 'Invoice Creation' },
      { icon: '💳', label: 'Payment Tracking' },
      { icon: '📧', label: 'Email Sending' },
      { icon: '📊', label: 'Revenue Reports' }
    ],
    "Order Management": [
      { icon: '📦', label: 'Order Tracking' },
      { icon: '🚚', label: 'Delivery Status' },
      { icon: '✅', label: 'Order Completion' },
      { icon: '📈', label: 'Order Analytics' }
    ]
  };

  const featureList = features[feature] || features["Projects Management"];

  return (
    <div className="projects-page">
      <div className="projects-header">
        <h1>{title}</h1>
        <p>Manage your {feature.toLowerCase()}</p>
      </div>

      <div className="coming-soon-container">
        <div className="coming-soon-content">
          <div className="coming-soon-icon-large">{icon}</div>
          <h2>{feature}</h2>
          <p>This feature is coming soon!</p>
          <div className="coming-soon-features">
            {featureList.map((item, index) => (
              <div key={index} className="feature-preview">
                <span className="feature-icon">{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
          <div className="coming-soon-cta">
            <p>Use the <strong>Window Costing Tool</strong> and manage <strong>Customers</strong> & <strong>Products</strong> in the meantime!</p>
            <button 
              className="cta-button"
              onClick={() => window.location.hash = '#tools'}
            >
              Go to Tools →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectsPage;

