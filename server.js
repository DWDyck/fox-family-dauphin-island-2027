const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const DATA_FILE = path.join(__dirname, 'data.json');
const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
const save = () => { fs.writeFileSync(DATA_FILE + '.tmp', JSON.stringify(data, null, 1)); fs.renameSync(DATA_FILE + '.tmp', DATA_FILE); };
const sortBy = {
  events: (a, b) => a.date.localeCompare(b.date) || a.id - b.id,
  albums: (a, b) => (a.sort || 0) - (b.sort || 0) || a.id - b.id,
  updates: (a, b) => b.id - a.id, photos: (a, b) => b.id - a.id, memories: (a, b) => b.id - a.id,
};
const now = () => new Date().toISOString().slice(0, 19).replace('T', ' ');

const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'fox2027';
const SITE_PASSCODE = process.env.SITE_PASSCODE || ''; // optional: protects door/Wi-Fi codes
const UPLOADS = path.join(__dirname, 'uploads');
fs.mkdirSync(UPLOADS, { recursive: true });

// Editable columns per resource
const R = {
  updates: ['message', 'active'],
  events: ['title', 'date', 'time', 'location_id', 'location_text', 'description', 'host_family_id', 'notes', 'category', 'status', 'meal_type'],
  locations: ['name', 'category', 'address', 'description', 'lat', 'lng'],
  houses: ['name', 'address', 'location_id', 'wifi_name', 'wifi_password', 'door_code', 'gate_code', 'parking', 'manager_name', 'manager_phone', 'notes'],
  families: ['name', 'photo', 'members', 'phone', 'email', 'house_id'],
  albums: ['name', 'sort'],
  photos: ['album_id', 'url', 'caption', 'featured'],
  memories: ['kind', 'title', 'body', 'author', 'photo_url'],
};

const app = express();
app.use(express.json({ limit: '1mb' }));

const sessions = new Set();
const cookie = (req, name) => (req.headers.cookie || '').split(';').map((c) => c.trim().split('=')).find(([k]) => k === name)?.[1];
const same = (a, b) => a.length === b.length && crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
const siteToken = SITE_PASSCODE ? crypto.createHash('sha256').update('site:' + SITE_PASSCODE).digest('hex') : '';
const siteOk = (req) => !SITE_PASSCODE || cookie(req, 'site') === siteToken;
const isAdmin = (req) => sessions.has(cookie(req, 'admin'));
const needAdmin = (req, res, next) => (isAdmin(req) ? next() : res.status(401).json({ error: 'Admin login required' }));

app.post('/api/site-login', (req, res) => {
  if (SITE_PASSCODE && !same(String(req.body.passcode || ''), SITE_PASSCODE)) return res.status(401).json({ error: 'Wrong passcode' });
  res.setHeader('Set-Cookie', `site=${siteToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=7776000`);
  res.json({ ok: true });
});

app.post('/api/admin-login', (req, res) => {
  if (!same(String(req.body.password || ''), ADMIN_PASSWORD)) return res.status(401).json({ error: 'Wrong password' });
  const t = crypto.randomBytes(24).toString('hex');
  sessions.add(t);
  res.setHeader('Set-Cookie', `admin=${t}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`);
  res.json({ ok: true });
});
app.post('/api/admin-logout', (req, res) => {
  sessions.delete(cookie(req, 'admin'));
  res.json({ ok: true });
});

// Everything the site needs in one call (the dataset is small)
app.get('/api/all', (req, res) => {
  if (!siteOk(req)) return res.status(401).json({ error: 'passcode' });
  const out = { admin: isAdmin(req) };
  for (const t of Object.keys(R)) out[t] = [...(data[t] || [])].sort(sortBy[t] || ((a, b) => a.id - b.id));
  res.json(out);
});

const clean = (v) => (v === '' || v === undefined ? null : v);
app.post('/api/:t', needAdmin, (req, res) => {
  const cols = R[req.params.t];
  if (!cols) return res.sendStatus(404);
  const rows = (data[req.params.t] ||= []);
  const row = { id: Math.max(0, ...rows.map((r) => r.id)) + 1 };
  cols.forEach((c) => (row[c] = c in req.body ? clean(req.body[c]) : null));
  if (['updates', 'photos', 'memories'].includes(req.params.t)) row.created_at = now();
  rows.push(row);
  save();
  res.json({ id: row.id });
});
app.put('/api/:t/:id', needAdmin, (req, res) => {
  const cols = R[req.params.t];
  const row = cols && (data[req.params.t] || []).find((r) => r.id === +req.params.id);
  if (!row) return res.sendStatus(404);
  cols.filter((c) => c in req.body).forEach((c) => (row[c] = clean(req.body[c])));
  save();
  res.json({ ok: true });
});
app.delete('/api/:t/:id', needAdmin, (req, res) => {
  if (!R[req.params.t]) return res.sendStatus(404);
  data[req.params.t] = (data[req.params.t] || []).filter((r) => r.id !== +req.params.id);
  save();
  res.json({ ok: true });
});

const EXT = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif' };
app.post('/api/upload/image', needAdmin, express.raw({ type: Object.keys(EXT), limit: '15mb' }), (req, res) => {
  const ext = EXT[req.headers['content-type']];
  if (!ext || !req.body?.length) return res.status(400).json({ error: 'Please choose a JPG, PNG, WebP or GIF image' });
  const name = crypto.randomBytes(10).toString('hex') + ext;
  fs.writeFileSync(path.join(UPLOADS, name), req.body);
  res.json({ url: '/uploads/' + name });
});

app.use('/uploads', (req, res, next) => (siteOk(req) ? next() : res.sendStatus(401)), express.static(UPLOADS));
app.use(express.static(path.join(__dirname, 'public')));
app.listen(PORT, () => console.log(`Fox Family Dauphin Island 2027 running at http://localhost:${PORT}  (admin password: ${process.env.ADMIN_PASSWORD ? 'set via env' : 'fox2027 - change it!'})`));
