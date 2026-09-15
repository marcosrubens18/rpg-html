const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const { ITEMS, EQUIPMENT } = require('../data/items');
const { DESTINIES } = require('../data/gameData');
const { toPublicCharacter, parseJsonField } = require('../data/characterUtils');

const router = express.Router();

function getRow(userId) {
  return db.prepare('SELECT * FROM characters WHERE user_id = ?').get(userId);
}

function priceFor(row, basePrice) {
  const destiny = DESTINIES[row.destiny_id] || {};
  return Math.round(basePrice * (destiny.shopPriceMultiplier || 1));
}

router.get('/catalog', requireAuth, (req, res) => {
  const row = getRow(req.user.id);
  const items = Object.values(ITEMS).map((item) => ({ ...item, price: priceFor(row, item.price) }));
  const equipment = Object.values(EQUIPMENT).map((item) => ({ ...item, price: priceFor(row, item.price) }));
  res.json({ items, equipment });
});

router.post('/buy', requireAuth, (req, res) => {
  const row = getRow(req.user.id);
  if (!row) return res.status(404).json({ error: 'Personagem não encontrado.' });

  const { itemId } = req.body || {};
  const catalogItem = ITEMS[itemId] || EQUIPMENT[itemId];
  if (!catalogItem) return res.status(400).json({ error: 'Item inexistente.' });

  const price = priceFor(row, catalogItem.price);
  if (row.gold < price) return res.status(400).json({ error: 'Ouro insuficiente.' });

  const inventory = parseJsonField(row.inventory, {});
  inventory[itemId] = (inventory[itemId] || 0) + 1;

  db.prepare('UPDATE characters SET gold = gold - ?, inventory = ? WHERE user_id = ?')
    .run(price, JSON.stringify(inventory), req.user.id);

  const updated = getRow(req.user.id);
  res.json({ character: toPublicCharacter(updated), bought: catalogItem.name });
});

router.post('/sell', requireAuth, (req, res) => {
  const row = getRow(req.user.id);
  if (!row) return res.status(404).json({ error: 'Personagem não encontrado.' });

  const { itemId } = req.body || {};
  const catalogItem = ITEMS[itemId] || EQUIPMENT[itemId];
  const inventory = parseJsonField(row.inventory, {});

  if (!catalogItem || !inventory[itemId]) {
    return res.status(400).json({ error: 'Você não possui esse item.' });
  }

  const equipment = parseJsonField(row.equipment, {});
  if (Object.values(equipment).includes(itemId)) {
    return res.status(400).json({ error: 'Desequipe o item antes de vendê-lo.' });
  }

  inventory[itemId] -= 1;
  if (inventory[itemId] <= 0) delete inventory[itemId];
  const sellPrice = Math.floor(catalogItem.price / 2);

  db.prepare('UPDATE characters SET gold = gold + ?, inventory = ? WHERE user_id = ?')
    .run(sellPrice, JSON.stringify(inventory), req.user.id);

  const updated = getRow(req.user.id);
  res.json({ character: toPublicCharacter(updated), sold: catalogItem.name, sellPrice });
});

module.exports = router;
