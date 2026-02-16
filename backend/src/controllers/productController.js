const pool = require('../config/db');

exports.getAllProducts = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM products ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createProduct = async (req, res) => {
    const { nome, tipo, ativo } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO products (nome, tipo, ativo) VALUES ($1, $2, $3) RETURNING *',
            [nome, tipo, ativo]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateProduct = async (req, res) => {
    const { id } = req.params;
    const { nome, tipo, ativo } = req.body;
    try {
        const result = await pool.query(
            'UPDATE products SET nome = $1, tipo = $2, ativo = $3 WHERE id = $4 RETURNING *',
            [nome, tipo, ativo, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteProduct = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM products WHERE id = $1', [id]);
        res.json({ message: 'Produto removido' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
