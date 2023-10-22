const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();
app.use(express.json());

// Create MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'movieAction'
});

// Connect to MySQL
db.connect((err) => {
    if (err) throw err;
    console.log('Connected to the database');
});

const users = [
    { id: 1, username: 'admin', role: 'admin' },
    { id: 2, username: 'user', role: 'user' }
];

const activityLogger = (activityType) => {
    return (req, res, next) => {
        const { userId } = req;
        const user = users.find(u => u.id === userId);
        const username = user ? user.username : 'Unknown';

        console.log(`[Activity Log] User: ${username}, Activity: ${activityType}, Timestamp: ${new Date().toISOString()}`);

        next();
    };
};

// ACL Middleware
const acl = (roles) => {
    return (req, res, next) => {
        const user = users.find(u => u.id === req.userId);
        if (!user || !roles.includes(user.role)) {
            return res.status(403).send('Access forbidden');
        }
        next();
    };
};

app.use((req, res, next) => {
    req.userId = 1;
    next();
});

// Endpoint Register
app.post('/register', activityLogger('Register'), async (req, res) => {
    try {
        const { username, password, role } = req.body;

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Simpan ke database
        const sql = 'INSERT INTO users (username, password, role) VALUES (?, ?, ?)';
        db.query(sql, [username, hashedPassword, role], (err, result) => {
            if (err) throw err;
            res.status(201).json({ message: "User created" });
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Endpoint untuk Login
app.post('/login', activityLogger('Login'), async (req, res) => {
    const { username, password } = req.body;

    // Cari user dari database
    const sql = 'SELECT * FROM users WHERE username = ?';
    db.query(sql, [username], async (err, results) => {
        if (err) throw err;

        if (results.length === 0) {
            return res.status(400).json({ error: "User not found" });
        }

        const user = results[0];

        // Verifikasi password
        if (await bcrypt.compare(password, user.password)) {
            // Membuat JWT
            const token = jwt.sign({ username: user.username, role: user.role }, 'jwtSecret', { expiresIn: '1h' });
            res.json({ token });
        } else {
            res.status(401).json({ error: "Invalid password" });
        }
    });
});

// CREATE: menambah list movie action baru
app.post('/actions', acl(['admin']), activityLogger('Create Movie'), (req, res) => {
    const movie = req.body;
    const sql = 'INSERT INTO actions SET ?';
    db.query(sql, movie, (err, result) => {
        if (err) throw err;
        res.status(201).send(`Movie added with ID: ${result.insertId}`);
    });
});

// READ: melihat dan membaca semua movie
app.get('/actions', acl(['admin', 'user']), activityLogger('Read Movie'), (req, res) => {
    const sql = 'SELECT * FROM actions';
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.status(200).json(results);
    });
});

// UPDATE: Update movie dengan id
app.put('/actions/:id', acl(['admin']), activityLogger('Update Movie'), (req, res) => {
    const { id } = req.params;
    const updatedMovie = req.body;
    let title;

    const getTitleSql = 'SELECT title FROM actions WHERE id = ?';
    db.query(getTitleSql, [id], (err, result) => {
        if (err) throw err;

        if (result.length > 0) {
            title = result[0].title;
            const updateSql = 'UPDATE actions SET ? WHERE id = ?';
            db.query(updateSql, [updatedMovie, id], (err, result) => {
                if (err) throw err;
                res.status(200).send(`Movie title: ${title} updated`);
            });
        } else {
            res.status(404).send('Movie not found');
        }
    });
});

// DELETE: Delete movie berdasarkan id movie
app.delete('/actions/:id', acl(['admin']), activityLogger('Delete Movie'), (req, res) => {
    const { id } = req.params;
    let title;

    const getTitleSql = 'SELECT title FROM actions WHERE id = ?';
    db.query(getTitleSql, [id], (err, result) => {
        if (err) throw err;
        if (result.length > 0) {
            title = result[0].title;

            // menghapus movie
            const deleteSql = 'DELETE FROM actions WHERE id = ?';
            db.query(deleteSql, [id], (err, result) => {
                if (err) throw err;
                res.status(200).send(`Movie deleted with title: ${title}`);
            });
        } else {
            res.status(404).send('Movie not found');
        }
    });
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
