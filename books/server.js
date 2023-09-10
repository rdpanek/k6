const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const db = new sqlite3.Database('./database.db'); // or :memory: for in-memory database

app.use(bodyParser.json());

// Inicializace databáze
db.serialize(() => {
  db.run("CREATE TABLE books (id INTEGER PRIMARY KEY, type TEXT, title TEXT, author TEXT)");
});

// REST API endpointy
app.post('/book', (req, res) => {
  const { type, title, author } = req.body;
  db.run(`INSERT INTO books (type, title, author) VALUES (?, ?, ?)`, [type, title, author], function(err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.status(201).json({ id: this.lastID });
  });
});

app.get('/book/:id', (req, res) => {
  const { id } = req.params;
  db.get(`SELECT * FROM books WHERE id = ?`, [id], (err, row) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.status(200).json(row);
  });
});

app.put('/book/:id', (req, res) => {
  const { id } = req.params;
  const { type, title, author } = req.body;
  db.run(`UPDATE books SET type = ?, title = ?, author = ? WHERE id = ?`, [type, title, author, id], function(err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.status(200).json({ changes: this.changes });
  });
});

app.delete('/book/:id', (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM books WHERE id = ?`, [id], function(err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.status(200).json({ changes: this.changes });
  });
});

app.get('/books/:type', (req, res) => {
  const { type } = req.params;
  db.all(`SELECT * FROM books WHERE type = ?`, [type], (err, rows) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.status(200).json(rows);
  });
});

// Spuštění serveru
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
