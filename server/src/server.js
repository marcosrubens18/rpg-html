const path = require('path');
const express = require('express');

const authRoutes = require('./routes/auth');
const characterRoutes = require('./routes/character');
const locationRoutes = require('./routes/location');
const combatRoutes = require('./routes/combat');
const shopRoutes = require('./routes/shop');
const trainingRoutes = require('./routes/training');
const hospitalRoutes = require('./routes/hospital');
const eventsRoutes = require('./routes/events');
const adminRoutes = require('./routes/admin');
const guildRoutes = require('./routes/guild');
const pvpRoutes = require('./routes/pvp');
const metaRoutes = require('./routes/meta');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/character', characterRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/combat', combatRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/training', trainingRoutes);
app.use('/api/hospital', hospitalRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/guild', guildRoutes);
app.use('/api/pvp', pvpRoutes);
app.use('/api/meta', metaRoutes);

const CLIENT_DIR = path.join(__dirname, '..', '..', 'client');
app.use(express.static(CLIENT_DIR));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(CLIENT_DIR, 'index.html'));
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Erro interno do servidor.' });
});

app.listen(PORT, () => {
  console.log(`Crônicas de Valdora rodando em http://localhost:${PORT}`);
});
