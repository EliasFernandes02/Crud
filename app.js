const express = require('express');
const db = require('./conection');
const app = express();
const { v4: uuidv4 } = require('uuid');
const argon2 = require('argon2');
const authenticateToken = require('./jwt');
const jwt = require('jsonwebtoken');

require('dotenv').config();

app.use(express.json());

app.post('/create', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const id = uuidv4();

    const hashedPassword = await argon2.hash(password);

    const query = 'INSERT INTO tb_teste (id, name, email, password) VALUES (?, ?, ?, ?)';

    const connection = await db.getConnection();
    const [rows] = await connection.query(query, [id, name, email, hashedPassword]);
    connection.release();

    res.send('User created successfully');
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).send('Error creating user');
  }
});
app.get('/list/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const query = 'SELECT * FROM tb_teste WHERE id = ?';
    const connection = await db.getConnection();
    const [results] = await connection.query(query, [id]);
    connection.release();
    if (results.length === 0) {
      res.status(404).send('User not found');
      return;
    }
    res.json(results[0]);
  } catch (err) {
    console.error('Error retrieving user:', err);
    res.status(500).send('Error retrieving user');
  }
});

app.put('/update/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;
    const query = 'UPDATE tb_teste SET name = ?, email = ? WHERE id = ?';
    const connection = await db.getConnection();
    const [result] = await connection.query(query, [name, email, id]);
    connection.release();
    res.send('User updated successfully');
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).send('Error updating user');
  }
});

app.delete('/delete/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const query = 'DELETE FROM tb_teste WHERE id = ?';
    const connection = await db.getConnection();
    const [result] = await connection.query(query, [id]);
    connection.release();
    res.send('User deleted successfully');
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).send('Error deleting user');
  }
});


app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const connection = await db.getConnection();
    const [rows] = await connection.query('SELECT * FROM tb_teste WHERE email = ?', [email]);
    const user = rows[0];

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

     // Password is correct, generate and return a JWT token
    if (await argon2.verify(user.password, password)) {
      const token = jwt.sign({ userId: user.id }, 'batata', { expiresIn: '1h' });
      return res.json({ token });
    } else {
      return res.status(401).json({ message: 'Invalid password' });
    }
  } catch (error) {
    console.error('Error during login', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/list', authenticateToken, async (req, res) => {
  try {
    const query = 'SELECT * FROM tb_teste';
    const connection = await db.getConnection();
    const [results] = await connection.query(query);
    connection.release();
    res.json(results);
  } catch (err) {
    console.error('Error retrieving users:', err);
    res.status(500).send('Error retrieving users');
  }
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});