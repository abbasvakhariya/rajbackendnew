import { useState, useEffect } from 'react';
import { Save, Building2 } from 'lucide-react';
import { settingsService } from '../utils/storage';

function Settings() {
  const [formData, setFormData] = useState({
    companyName: '',
    companyAddress: '',
    companyPhone: '',
    companyEmail: '',
    companyGST: '',
    currency: '₹',
    taxRate: 18,
    quotationPrefix: 'QT',
    invoicePrefix: 'INV',
    termsAndConditions: ''
  });

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    const settings = settingsService.get();
    setFormData(settings);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    settingsService.update(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <Building2 size={32} style={{ color: '#2563eb' }} />
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827' }}>
          Business Settings
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card" style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#111827', borderBottom: '2px solid #e5e7eb', paddingBottom: '12px' }}>
            Company Information
          </h2>

          <div className="form-group">
            <label className="form-label">Company Name *</label>
            <input
              type="text"
              className="form-input"
              value={formData.companyName}
              onChange={(e) => handleChange('companyName', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Address</label>
            <textarea
              className="form-textarea"
              value={formData.companyAddress}
              onChange={(e) => handleChange('companyAddress', e.target.value)}
              rows="3"
            />
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                className="form-input"
                value={formData.companyPhone}
                onChange={(e) => handleChange('companyPhone', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                value={formData.companyEmail}
                onChange={(e) => handleChange('companyEmail', e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">GST Number</label>
            <input
              type="text"
              className="form-input"
              value={formData.companyGST}
              onChange={(e) => handleChange('companyGST', e.target.value)}
              placeholder="e.g., 27AABCU9603R1Z5"
            />
          </div>
        </div>

        <div className="card" style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#111827', borderBottom: '2px solid #e5e7eb', paddingBottom: '12px' }}>
            Financial Settings
          </h2>

          <div className="grid grid-3">
            <div className="form-group">
              <label className="form-label">Currency Symbol</label>
              <input
                type="text"
                className="form-input"
                value={formData.currency}
                onChange={(e) => handleChange('currency', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Default Tax Rate (%)</label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                value={formData.taxRate}
                onChange={(e) => handleChange('taxRate', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#111827', borderBottom: '2px solid #e5e7eb', paddingBottom: '12px' }}>
            Document Settings
          </h2>

          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Quotation Prefix</label>
              <input
                type="text"
                className="form-input"
                value={formData.quotationPrefix}
                onChange={(e) => handleChange('quotationPrefix', e.target.value)}
                placeholder="e.g., QT"
              />
              <small style={{ color: '#6b7280', fontSize: '12px' }}>
                Example: {formData.quotationPrefix}-0001
              </small>
            </div>

            <div className="form-group">
              <label className="form-label">Invoice Prefix</label>
              <input
                type="text"
                className="form-input"
                value={formData.invoicePrefix}
                onChange={(e) => handleChange('invoicePrefix', e.target.value)}
                placeholder="e.g., INV"
              />
              <small style={{ color: '#6b7280', fontSize: '12px' }}>
                Example: {formData.invoicePrefix}-0001
              </small>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Terms & Conditions</label>
            <textarea
              className="form-textarea"
              value={formData.termsAndConditions}
              onChange={(e) => handleChange('termsAndConditions', e.target.value)}
              rows="5"
              placeholder="Enter terms and conditions to be displayed on invoices and quotations"
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          {saved && (
            <div style={{
              padding: '12px 20px',
              background: '#dcfce7',
              color: '#166534',
              borderRadius: '6px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              ✓ Settings saved successfully!
            </div>
          )}
          <button type="submit" className="btn btn-primary">
            <Save size={20} />
            Save Settings
          </button>
        </div>
      </form>

      {/* Preview Section */}
      <div className="card" style={{ marginTop: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#111827', borderBottom: '2px solid #e5e7eb', paddingBottom: '12px' }}>
          Document Preview
        </h2>
        
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '24px', background: '#f9fafb' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#2563eb', marginBottom: '8px' }}>
              {formData.companyName || 'Your Company Name'}
            </h3>
            {formData.companyAddress && <p style={{ fontSize: '14px', color: '#6b7280' }}>{formData.companyAddress}</p>}
            {(formData.companyPhone || formData.companyEmail) && (
              <p style={{ fontSize: '14px', color: '#6b7280' }}>
                {formData.companyPhone} {formData.companyPhone && formData.companyEmail && '|'} {formData.companyEmail}
              </p>
            )}
            {formData.companyGST && <p style={{ fontSize: '14px', color: '#6b7280' }}>GST: {formData.companyGST}</p>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
            <div>
              <strong style={{ color: '#111827' }}>Sample Invoice:</strong>
              <p style={{ color: '#6b7280', marginTop: '4px' }}>{formData.invoicePrefix}-0001</p>
            </div>
            <div>
              <strong style={{ color: '#111827' }}>Sample Quotation:</strong>
              <p style={{ color: '#6b7280', marginTop: '4px' }}>{formData.quotationPrefix}-0001</p>
            </div>
          </div>

          {formData.termsAndConditions && (
            <div style={{ marginTop: '20px', padding: '12px', background: 'white', borderRadius: '6px' }}>
              <strong style={{ color: '#111827' }}>Terms & Conditions:</strong>
              <p style={{ color: '#6b7280', marginTop: '8px', fontSize: '12px', whiteSpace: 'pre-wrap' }}>
                {formData.termsAndConditions}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Data Management */}
      <div className="card" style={{ marginTop: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#111827', borderBottom: '2px solid #e5e7eb', paddingBottom: '12px' }}>
          Data Management
        </h2>
        
        <div style={{ background: '#fef3c7', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
          <strong style={{ color: '#92400e' }}>⚠️ Warning:</strong>
          <p style={{ color: '#92400e', marginTop: '8px', fontSize: '14px' }}>
            All data is stored locally in your browser. Clearing browser data will remove all records. 
            Consider exporting reports regularly as backup.
          </p>
        </div>

        <div style={{ marginTop: '20px', padding: '16px', background: '#e0f2fe', borderRadius: '8px', borderLeft: '4px solid #0284c7' }}>
          <strong style={{ color: '#075985' }}>💡 Tips:</strong>
          <ul style={{ marginTop: '8px', marginLeft: '20px', color: '#075985', fontSize: '14px' }}>
            <li>Bookmark this page to access your data easily</li>
            <li>Use the Export CSV feature in Reports to backup your data</li>
            <li>Keep your browser updated for best performance</li>
            <li>This application works completely offline</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Settings;


