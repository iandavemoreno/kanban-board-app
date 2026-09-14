const path = require('path');
const Database = require('better-sqlite3');

const db = new Database(path.join(__dirname, 'kanban.db'));

db.exec(`
    CREATE TABLE IF NOT EXISTS columns (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        position INTEGER NOT NULL
    )
`);

db.exec(`
    CREATE TABLE IF NOT EXISTS cards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        column_id INTEGER NOT NULL,
        text TEXT NOT NULL,
        position INTEGER NOT NULL,
        FOREIGN KEY (column_id) REFERENCES columns(id)
    )
`);

// Seed the three default columns the very first time this runs
const columnCount = db.prepare('SELECT COUNT(*) AS count FROM columns').get();
if (columnCount.count === 0) {
    const insertColumn = db.prepare('INSERT INTO columns (title, position) VALUES (?, ?)');
    insertColumn.run('To Do', 0);
    insertColumn.run('In Progress', 1);
    insertColumn.run('Done', 2);
}

module.exports = db;