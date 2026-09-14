const express = require('express');
const db = require('./db.cjs');

const app = express();
const PORT = 3003;

app.use(express.json());

// Get the full board: every column with its cards nested inside
app.get('/api/board', (req, res) => {
    const columns = db.prepare('SELECT * FROM columns ORDER BY position').all();
    const cards = db.prepare('SELECT * FROM cards ORDER BY position').all();

    const board = columns.map(function (column) {
        return {
            id: column.id,
            title: column.title,
            position: column.position,
            cards: cards.filter(function (card) {
                return card.column_id === column.id;
            })
        };
    });

    res.json(board);
});

// Add a new card to a column
app.post('/api/cards', (req, res) => {
    const { column_id, text } = req.body;

    if (!text || !text.trim()) {
        return res.status(400).json({ error: 'Card text is required.' });
    }

    const maxPosition = db.prepare(
        'SELECT COALESCE(MAX(position), -1) AS maxPos FROM cards WHERE column_id = ?'
    ).get(column_id);

    const insert = db.prepare('INSERT INTO cards (column_id, text, position) VALUES (?, ?, ?)');
    const result = insert.run(column_id, text.trim(), maxPosition.maxPos + 1);

    res.status(201).json({
        id: result.lastInsertRowid,
        column_id: column_id,
        text: text.trim(),
        position: maxPosition.maxPos + 1
    });
});

// Edit a card's text
app.put('/api/cards/:id', (req, res) => {
    const id = req.params.id;
    const { text } = req.body;

    if (!text || !text.trim()) {
        return res.status(400).json({ error: 'Card text is required.' });
    }

    db.prepare('UPDATE cards SET text = ? WHERE id = ?').run(text.trim(), id);
    res.json({ id: Number(id), text: text.trim() });
});

// Delete a card
app.delete('/api/cards/:id', (req, res) => {
    const id = req.params.id;
    db.prepare('DELETE FROM cards WHERE id = ?').run(id);
    res.json({ message: 'Card deleted.' });
});

// Reorder/move cards within or between columns after a drag-and-drop
app.patch('/api/columns/:id/cards', (req, res) => {
    const columnId = req.params.id;
    const { cardIds } = req.body;

    const updatePosition = db.prepare(
        'UPDATE cards SET column_id = ?, position = ? WHERE id = ?'
    );

    cardIds.forEach(function (cardId, index) {
        updatePosition.run(columnId, index, cardId);
    });

    res.json({ message: 'Cards reordered.' });
});

app.listen(PORT, () => {
    console.log('Server running on http://localhost:' + PORT);
});