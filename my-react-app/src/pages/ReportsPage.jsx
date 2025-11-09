import './ReportsPage.css';

const ReportsPage = () => {
  return (
    <div className="reports-page">
      <div className="reports-header">
        <h1>Reports & Analytics</h1>
        <p>View project history and business insights</p>
      </div>

      <div className="coming-soon-container">
        <div className="coming-soon-content">
          <div className="coming-soon-icon-large">📊</div>
          <h2>Reports & Analytics</h2>
          <p>This feature is coming soon!</p>
          <div className="coming-soon-features">
            <div className="feature-preview">
              <span className="feature-icon">📈</span>
              <span>Sales Analytics</span>
            </div>
            <div className="feature-preview">
              <span className="feature-icon">💰</span>
              <span>Revenue Reports</span>
            </div>
            <div className="feature-preview">
              <span className="feature-icon">📅</span>
              <span>Monthly Summaries</span>
            </div>
            <div className="feature-preview">
              <span className="feature-icon">🎯</span>
              <span>Performance Metrics</span>
            </div>
          </div>
          <div className="coming-soon-cta">
            <p>Start using the <strong>Window Costing Tool</strong> to build your data!</p>
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

export default ReportsPage;

