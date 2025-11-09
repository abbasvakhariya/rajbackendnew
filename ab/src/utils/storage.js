// LocalStorage utility for CRUD operations

const STORAGE_KEYS = {
  CUSTOMERS: 'babji_glass_customers',
  PRODUCTS: 'babji_glass_products',
  QUOTATIONS: 'babji_glass_quotations',
  INVOICES: 'babji_glass_invoices',
  ORDERS: 'babji_glass_orders',
  PAYMENTS: 'babji_glass_payments',
  SETTINGS: 'babji_glass_settings'
};

// Generic CRUD operations
export const storage = {
  // Get all items
  getAll: (key) => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return [];
    }
  },

  // Get item by ID
  getById: (key, id) => {
    const items = storage.getAll(key);
    return items.find(item => item.id === id);
  },

  // Add new item
  add: (key, item) => {
    try {
      const items = storage.getAll(key);
      const newItem = {
        ...item,
        id: item.id || Date.now().toString(),
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      items.push(newItem);
      localStorage.setItem(key, JSON.stringify(items));
      return newItem;
    } catch (error) {
      console.error('Error adding to localStorage:', error);
      return null;
    }
  },

  // Update item
  update: (key, id, updatedItem) => {
    try {
      const items = storage.getAll(key);
      const index = items.findIndex(item => item.id === id);
      if (index !== -1) {
        items[index] = {
          ...items[index],
          ...updatedItem,
          id: items[index].id,
          createdAt: items[index].createdAt,
          updatedAt: new Date().toISOString()
        };
        localStorage.setItem(key, JSON.stringify(items));
        return items[index];
      }
      return null;
    } catch (error) {
      console.error('Error updating localStorage:', error);
      return null;
    }
  },

  // Delete item
  delete: (key, id) => {
    try {
      const items = storage.getAll(key);
      const filtered = items.filter(item => item.id !== id);
      localStorage.setItem(key, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Error deleting from localStorage:', error);
      return false;
    }
  },

  // Clear all items
  clear: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }
};

// Specific data operations
export const customerService = {
  getAll: () => storage.getAll(STORAGE_KEYS.CUSTOMERS),
  getById: (id) => storage.getById(STORAGE_KEYS.CUSTOMERS, id),
  add: (customer) => storage.add(STORAGE_KEYS.CUSTOMERS, customer),
  update: (id, customer) => storage.update(STORAGE_KEYS.CUSTOMERS, id, customer),
  delete: (id) => storage.delete(STORAGE_KEYS.CUSTOMERS, id),
  search: (query) => {
    const customers = storage.getAll(STORAGE_KEYS.CUSTOMERS);
    return customers.filter(c => 
      c.name?.toLowerCase().includes(query.toLowerCase()) ||
      c.phone?.includes(query) ||
      c.email?.toLowerCase().includes(query.toLowerCase())
    );
  }
};

export const productService = {
  getAll: () => storage.getAll(STORAGE_KEYS.PRODUCTS),
  getById: (id) => storage.getById(STORAGE_KEYS.PRODUCTS, id),
  add: (product) => storage.add(STORAGE_KEYS.PRODUCTS, product),
  update: (id, product) => storage.update(STORAGE_KEYS.PRODUCTS, id, product),
  delete: (id) => storage.delete(STORAGE_KEYS.PRODUCTS, id),
  search: (query) => {
    const products = storage.getAll(STORAGE_KEYS.PRODUCTS);
    return products.filter(p => 
      p.name?.toLowerCase().includes(query.toLowerCase()) ||
      p.category?.toLowerCase().includes(query.toLowerCase())
    );
  }
};

export const quotationService = {
  getAll: () => storage.getAll(STORAGE_KEYS.QUOTATIONS),
  getById: (id) => storage.getById(STORAGE_KEYS.QUOTATIONS, id),
  add: (quotation) => storage.add(STORAGE_KEYS.QUOTATIONS, quotation),
  update: (id, quotation) => storage.update(STORAGE_KEYS.QUOTATIONS, id, quotation),
  delete: (id) => storage.delete(STORAGE_KEYS.QUOTATIONS, id),
  getNextNumber: () => {
    const quotations = storage.getAll(STORAGE_KEYS.QUOTATIONS);
    return quotations.length + 1;
  }
};

export const invoiceService = {
  getAll: () => storage.getAll(STORAGE_KEYS.INVOICES),
  getById: (id) => storage.getById(STORAGE_KEYS.INVOICES, id),
  add: (invoice) => storage.add(STORAGE_KEYS.INVOICES, invoice),
  update: (id, invoice) => storage.update(STORAGE_KEYS.INVOICES, id, invoice),
  delete: (id) => storage.delete(STORAGE_KEYS.INVOICES, id),
  getNextNumber: () => {
    const invoices = storage.getAll(STORAGE_KEYS.INVOICES);
    return invoices.length + 1;
  }
};

export const orderService = {
  getAll: () => storage.getAll(STORAGE_KEYS.ORDERS),
  getById: (id) => storage.getById(STORAGE_KEYS.ORDERS, id),
  add: (order) => storage.add(STORAGE_KEYS.ORDERS, order),
  update: (id, order) => storage.update(STORAGE_KEYS.ORDERS, id, order),
  delete: (id) => storage.delete(STORAGE_KEYS.ORDERS, id),
  getByStatus: (status) => {
    const orders = storage.getAll(STORAGE_KEYS.ORDERS);
    return orders.filter(o => o.status === status);
  }
};

export const paymentService = {
  getAll: () => storage.getAll(STORAGE_KEYS.PAYMENTS),
  getById: (id) => storage.getById(STORAGE_KEYS.PAYMENTS, id),
  add: (payment) => storage.add(STORAGE_KEYS.PAYMENTS, payment),
  update: (id, payment) => storage.update(STORAGE_KEYS.PAYMENTS, id, payment),
  delete: (id) => storage.delete(STORAGE_KEYS.PAYMENTS, id),
  getByInvoice: (invoiceId) => {
    const payments = storage.getAll(STORAGE_KEYS.PAYMENTS);
    return payments.filter(p => p.invoiceId === invoiceId);
  }
};

export const settingsService = {
  get: () => {
    const settings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return settings ? JSON.parse(settings) : getDefaultSettings();
  },
  update: (settings) => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    return settings;
  }
};

function getDefaultSettings() {
  return {
    companyName: 'Babji Glass',
    companyAddress: '',
    companyPhone: '',
    companyEmail: '',
    companyGST: '',
    currency: '₹',
    taxRate: 18,
    quotationPrefix: 'QT',
    invoicePrefix: 'INV',
    termsAndConditions: ''
  };
}

// Initialize sample data if empty
export const initializeSampleData = () => {
  // Check if data already exists
  if (storage.getAll(STORAGE_KEYS.CUSTOMERS).length > 0) {
    return;
  }

  // Sample customers
  const sampleCustomers = [
    {
      name: 'John Construction',
      phone: '9876543210',
      email: 'john@construction.com',
      address: '123 Builder Street, Mumbai',
      gst: '27AABCU9603R1Z5'
    },
    {
      name: 'Sharma Interiors',
      phone: '9876543211',
      email: 'sharma@interiors.com',
      address: '456 Design Avenue, Delhi',
      gst: '07AABCU9603R1Z6'
    }
  ];

  sampleCustomers.forEach(customer => customerService.add(customer));

  // Sample products
  const sampleProducts = [
    {
      name: 'Clear Float Glass',
      category: 'Float Glass',
      thickness: '5mm',
      unit: 'sq ft',
      price: 50,
      description: 'Standard clear float glass'
    },
    {
      name: 'Toughened Glass',
      category: 'Tempered Glass',
      thickness: '8mm',
      unit: 'sq ft',
      price: 120,
      description: 'Safety toughened glass'
    },
    {
      name: 'Reflective Glass',
      category: 'Reflective Glass',
      thickness: '6mm',
      unit: 'sq ft',
      price: 85,
      description: 'Heat reflective glass'
    },
    {
      name: 'Laminated Glass',
      category: 'Laminated Glass',
      thickness: '6.38mm',
      unit: 'sq ft',
      price: 150,
      description: 'Safety laminated glass'
    }
  ];

  sampleProducts.forEach(product => productService.add(product));
};


