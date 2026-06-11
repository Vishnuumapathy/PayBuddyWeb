const https = require('https');

const apiKey = 'AIzaSyADk2YxrASsShKpKcFda5sB-AkzO8L_Vts';
const projectId = 'paybuddy-2df9a';
const email = 'test@paybuddy.com';
const password = 'password123';
const vendorId = 'dfsocXBXZETGAkYsmj1DcRiekdf2';

const customerId = 'test_cust_123';
const saleId = 'test_sale_123';
const installmentId = 'test_inst_123';
const ledgerEntryId = 'test_ledger_123';

const now = Date.now();

// Helper for HTTP requests
function request(options, bodyData = null) {
  return new Promise((resolve, reject) => {
    const data = bodyData ? JSON.stringify(bodyData) : '';
    
    if (bodyData) {
      options.headers = options.headers || {};
      options.headers['Content-Length'] = Buffer.byteLength(data);
    }

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });

    req.on('error', (err) => reject(err));
    if (bodyData) {
      req.write(data);
    }
    req.end();
  });
}

// 1. Sign in to get ID token
async function getAuthToken() {
  const options = {
    hostname: 'identitytoolkit.googleapis.com',
    port: 443,
    path: `/v1/accounts:signInWithPassword?key=${apiKey}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  const payload = { email, password, returnSecureToken: true };
  const res = await request(options, payload);
  if (res.status === 200) {
    return res.body.idToken;
  } else {
    throw new Error(`Auth failed: ${JSON.stringify(res.body)}`);
  }
}

// 2. Write doc with Auth header
async function writeDoc(idToken, collection, docId, fields) {
  const options = {
    hostname: 'firestore.googleapis.com',
    port: 443,
    path: `/v1/projects/${projectId}/databases/(default)/documents/${collection}/${docId}?key=${apiKey}`,
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  };
  const payload = { fields };
  const res = await request(options, payload);
  if (res.status === 200) {
    return res.body;
  } else {
    throw new Error(`Write doc to ${collection} failed: ${res.status} - ${JSON.stringify(res.body)}`);
  }
}

const customerFields = {
  customerId: { stringValue: customerId },
  vendorId: { stringValue: vendorId },
  name: { stringValue: 'E2E Test Customer' },
  phone: { stringValue: '9999988888' },
  totalAmount: { doubleValue: 1000 },
  paidAmount: { doubleValue: 0 },
  isArchived: { booleanValue: false },
  createdAt: { doubleValue: now }
};

const saleFields = {
  saleId: { stringValue: saleId },
  vendorId: { stringValue: vendorId },
  customerId: { stringValue: customerId },
  customerName: { stringValue: 'E2E Test Customer' },
  itemName: { stringValue: 'E2E Test Item' },
  quantity: { integerValue: 1 },
  unitPrice: { doubleValue: 1000 },
  totalAmount: { doubleValue: 1000 },
  interestRate: { doubleValue: 0 },
  installmentCount: { integerValue: 1 },
  paymentType: { stringValue: 'Partial Payment' },
  amountPaid: { doubleValue: 0 },
  status: { stringValue: 'PENDING' },
  isArchived: { booleanValue: false },
  createdAt: { doubleValue: now }
};

const installmentFields = {
  installmentId: { stringValue: installmentId },
  saleId: { stringValue: saleId },
  customerId: { stringValue: customerId },
  vendorId: { stringValue: vendorId },
  dueDate: { doubleValue: now + 86400000 * 7 },
  amount: { doubleValue: 1000 },
  amountPaid: { doubleValue: 0 },
  status: { stringValue: 'PENDING' },
  reminderCount: { integerValue: 0 },
  lastReminderSentAt: { doubleValue: 0 },
  reminderStatus: { stringValue: 'NOT_SENT' },
  createdAt: { doubleValue: now }
};

const ledgerFields = {
  entryId: { stringValue: ledgerEntryId },
  vendorId: { stringValue: vendorId },
  customerId: { stringValue: customerId },
  customerName: { stringValue: 'E2E Test Customer' },
  itemName: { stringValue: 'E2E Test Item' },
  saleId: { stringValue: saleId },
  type: { stringValue: 'sale' },
  amount: { doubleValue: 1000 },
  balanceAfter: { doubleValue: 1000 },
  createdAt: { doubleValue: now }
};

async function seed() {
  try {
    console.log('Authenticating...');
    const idToken = await getAuthToken();
    console.log('Auth successful.');

    console.log('Seeding customer...');
    await writeDoc(idToken, 'customers', customerId, customerFields);
    console.log('Seeding sale...');
    await writeDoc(idToken, 'sales', saleId, saleFields);
    console.log('Seeding installment...');
    await writeDoc(idToken, 'installments', installmentId, installmentFields);
    console.log('Seeding ledger entry...');
    await writeDoc(idToken, 'ledger', ledgerEntryId, ledgerFields);
    console.log('Database seeded successfully!');
  } catch (err) {
    console.error('Seeding failed:', err.message);
  }
}

seed();
