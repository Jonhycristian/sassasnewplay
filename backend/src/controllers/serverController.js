const pool = require('../config/db');

exports.getAllServers = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM servers ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createServer = async (req, res) => {
    const { nome, host, tipo, ativo } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO servers (nome, host, tipo, ativo) VALUES ($1, $2, $3, $4) RETURNING *',
            [nome, host, tipo, ativo]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateServer = async (req, res) => {
    const { id } = req.params;
    const { nome, host, tipo, ativo } = req.body;
    try {
        const result = await pool.query(
            'UPDATE servers SET nome = $1, host = $2, tipo = $3, ativo = $4 WHERE id = $5 RETURNING *',
            [nome, host, tipo, ativo, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteServer = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM servers WHERE id = $1', [id]);
        res.json({ message: 'Servidor removido' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
