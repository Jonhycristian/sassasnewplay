const pool = require('../config/db');

exports.getSales = async (req, res) => {
    const { month, year } = req.query;

    let query = `
        SELECT s.*, c.nome as cliente_nome, p.nome as produto_nome
        FROM sales s
        LEFT JOIN clients c ON s.cliente_id = c.id
        LEFT JOIN products p ON s.produto_id = p.id
    `;

    const params = [];
    if (month && year) {
        query += ` WHERE EXTRACT(MONTH FROM s.data_pagamento) = $1 AND EXTRACT(YEAR FROM s.data_pagamento) = $2`;
        params.push(month, year);
    } else if (year) {
        query += ` WHERE EXTRACT(YEAR FROM s.data_pagamento) = $1`;
        params.push(year);
    }

    query += ` ORDER BY s.data_pagamento DESC`;

    try {
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
