import { useState, useEffect } from 'react';
import { adminAPI } from '../../utils/api';

const PaymentsTab = () => {
  return (
    <div className="payments-tab">
      <div className="tab-header">
        <h2>Payment & Billing</h2>
        <p className="tab-subtitle">View and manage all payments</p>
      </div>
      <p>Payment management features coming soon...</p>
    </div>
  );
};

export default PaymentsTab;

