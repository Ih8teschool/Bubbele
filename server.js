// THERE WILL BE NO CODE UNTIL 11/9/2025 or 11/10/2025 Due to research and school //

// - ps you can read the ReadMe.txt file for info on this project - //

// Ty! //

// server.js
const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Use environment variables for passwords:
// Example:
//   SCHOOL_PASSWORD=schoolsecret HOME_PASSWORD=homesecret node server.js
const SCHOOL_PASSWORD = process.env.SCHOOL_PASSWORD || '';
const HOME_PASSWORD = process.env.HOME_PASSWORD || '';

if (!SCHOOL_PASSWORD || !HOME_PASSWORD) {
  console.warn('Warning: SCHOOL_PASSWORD and/or HOME_PASSWORD not set as env vars. Set them before production.');
}

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Simple CORS for dev (if you host client elsewhere). Remove or restrict in production.
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // adjust for production
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

/**
 * POST /verify-password
 * body: { password: string, variant: 'school'|'home' }
 * response: { ok: true } or { ok: false, message: '...' }
 */
app.post('/verify-password', (req, res) => {
  const { password, variant } = req.body || {};
  if (!password || !variant) return res.status(400).json({ ok:false, message: 'Missing password or variant' });

  const expected = (variant === 'school') ? SCHOOL_PASSWORD : HOME_PASSWORD;
  if (!expected) {
    return res.status(500).json({ ok:false, message: 'Server not configured for that variant' });
  }

  // Time-constant comparison to be slightly safer
  const safeEqual = (a, b) => {
    if (typeof a !== 'string' || typeof b !== 'string') return false;
    if (a.length !== b.length) return false;
    let res = 0;
    for (let i = 0; i < a.length; i++) res |= a.charCodeAt(i) ^ b.charCodeAt(i);
    return res === 0;
  };

  if (safeEqual(password, expected)) {
    return res.json({ ok: true });
  } else {
    return res.json({ ok: false, message: 'Incorrect password' });
  }
});

// fallback to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
