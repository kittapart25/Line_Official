const path = require('path');
const fs = require('fs');

const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'equipments.json');
const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');

// Helper to load equipment data
function getEquipments() {
  try {
    if (!fs.existsSync(DATA_FILE)) return [];
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (err) {
    console.error('Error reading equipments.json:', err);
    return [];
  }
}

// Helper to save equipment data
function saveEquipments(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// Filter equipment helper
function filterEquipments(list, { place, category, search }) {
  let result = list;
  if (place) {
    result = result.filter(item => item.p === place);
  }
  if (category && category !== 'ทั้งหมด') {
    result = result.filter(item => item.c === category);
  }
  if (search) {
    const s = search.toLowerCase();
    result = result.filter(item => (item.n + ' ' + (item.e || '')).toLowerCase().includes(s));
  }
  return result;
}

// Check if express is available
let expressAvailable = false;
try {
  require.resolve('express');
  expressAvailable = true;
} catch (e) {
  expressAvailable = false;
}

if (expressAvailable) {
  // ==========================================
  // Express Server Implementation
  // ==========================================
  const express = require('express');
  let cors = null;
  try { cors = require('cors'); } catch (_) {}

  const app = express();
  if (cors) app.use(cors());
  app.use(express.json());

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', server: 'express', time: new Date().toISOString() });
  });

  // Get categories for a place
  app.get('/api/categories', (req, res) => {
    const { place } = req.query;
    const all = getEquipments();
    const filtered = place ? all.filter(d => d.p === place) : all;
    const categories = ['ทั้งหมด', ...new Set(filtered.map(d => d.c).filter(Boolean))];
    res.json(categories);
  });

  // Get equipment list (with filters)
  app.get('/api/equipments', (req, res) => {
    const { place, category, search } = req.query;
    const all = getEquipments();
    const result = filterEquipments(all, { place, category, search });
    res.json(result);
  });

  // Get single equipment by ID
  app.get('/api/equipments/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const item = getEquipments().find(d => d.id === id);
    if (!item) return res.status(404).json({ error: 'Equipment not found' });
    res.json(item);
  });

  // Add new equipment
  app.post('/api/equipments', (req, res) => {
    const all = getEquipments();
    const newId = all.length > 0 ? Math.max(...all.map(d => d.id || 0)) + 1 : 1;
    const newItem = { id: newId, ...req.body };
    all.push(newItem);
    saveEquipments(all);
    res.status(201).json(newItem);
  });

  // Update equipment
  app.put('/api/equipments/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const all = getEquipments();
    const idx = all.findIndex(d => d.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Equipment not found' });
    all[idx] = { ...all[idx], ...req.body, id };
    saveEquipments(all);
    res.json(all[idx]);
  });

  // Delete equipment
  app.delete('/api/equipments/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const all = getEquipments();
    const filtered = all.filter(d => d.id !== id);
    if (filtered.length === all.length) return res.status(404).json({ error: 'Equipment not found' });
    saveEquipments(filtered);
    res.json({ success: true, deletedId: id });
  });

  // Serve static frontend files
  app.use(express.static(FRONTEND_DIR));

  // Fallback to index.html for SPA-like navigation
  app.get('*', (req, res) => {
    res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
  });

  app.listen(PORT, () => {
    console.log(`\n=================================================`);
    console.log(`  Reliability Lab Server (Express) running`);
    console.log(`  Local URL:   http://localhost:${PORT}`);
    console.log(`  API Status:  http://localhost:${PORT}/api/health`);
    console.log(`  Equipments:  http://localhost:${PORT}/api/equipments`);
    console.log(`=================================================\n`);
  });

} else {
  // ==========================================
  // Built-in Node.js HTTP Server (Zero Dependency Fallback)
  // ==========================================
  const http = require('http');
  const url = require('url');

  const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
  };

  const server = http.createServer((req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      return res.end();
    }

    const parsed = url.parse(req.url, true);
    const pathname = parsed.pathname;

    // API Routes
    if (pathname === '/api/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ status: 'ok', server: 'node-http', time: new Date().toISOString() }));
    }

    if (pathname === '/api/categories') {
      const place = parsed.query.place;
      const all = getEquipments();
      const filtered = place ? all.filter(d => d.p === place) : all;
      const categories = ['ทั้งหมด', ...new Set(filtered.map(d => d.c).filter(Boolean))];
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(categories));
    }

    if (pathname === '/api/equipments') {
      const all = getEquipments();
      const result = filterEquipments(all, parsed.query);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(result));
    }

    // Serve static files from FRONTEND_DIR
    let relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\//, '');
    let filePath = path.join(FRONTEND_DIR, relativePath);

    // Prevent directory traversal
    if (!filePath.startsWith(FRONTEND_DIR)) {
      res.writeHead(403);
      return res.end('Forbidden');
    }

    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        // Fallback to index.html
        filePath = path.join(FRONTEND_DIR, 'index.html');
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      fs.readFile(filePath, (readErr, content) => {
        if (readErr) {
          res.writeHead(500);
          return res.end('Error loading file');
        }
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      });
    });
  });

  server.listen(PORT, () => {
    console.log(`\n=================================================`);
    console.log(`  Reliability Lab Server (Built-in HTTP) running`);
    console.log(`  Local URL:   http://localhost:${PORT}`);
    console.log(`  API Status:  http://localhost:${PORT}/api/health`);
    console.log(`  Equipments:  http://localhost:${PORT}/api/equipments`);
    console.log(`  (Note: Run 'cd backend && npm install' to enable Express mode)`);
    console.log(`=================================================\n`);
  });
}

