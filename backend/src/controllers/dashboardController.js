const pool = require('../config/db');

exports.getStats = async (req, res) => {
    try {
        const stats = {};

        // Total clients active
        const activeRes = await pool.query("SELECT COUNT(*) FROM clients WHERE status = 'ativo'");
        stats.total_active = parseInt(activeRes.rows[0].count);

        // Total expired
        const expiredRes = await pool.query("SELECT COUNT(*) FROM clients WHERE status = 'vencido'");
        stats.total_expired = parseInt(expiredRes.rows[0].count);

        // Expiring in 3 days
        const expiringRes = await pool.query(`
            SELECT COUNT(*) FROM clients 
            WHERE status = 'ativo' 
            AND data_vencimento BETWEEN NOW() AND NOW() + INTERVAL '3 days'
        `);
        stats.expiring_soon = parseInt(expiringRes.rows[0].count);

        // Waiting reminder
        const reminderRes = await pool.query(`
            SELECT COUNT(*) FROM clients 
            WHERE status_cobranca != 'pago' 
            AND proximo_lembrete <= NOW()
        `);
        stats.waiting_reminder = parseInt(reminderRes.rows[0].count);

        // Monthly Revenue (Current Month)
        const revenueRes = await pool.query(`
            SELECT SUM(valor) FROM sales 
            WHERE DATE_TRUNC('month', data_pagamento) = DATE_TRUNC('month', CURRENT_DATE)
        `);
        stats.monthly_revenue = parseFloat(revenueRes.rows[0].sum || 0);

        // Revenue by Product (Current Month)
        const revenueByProdRes = await pool.query(`
            SELECT p.nome, SUM(s.valor) as total
            FROM sales s
            JOIN products p ON s.produto_id = p.id
            WHERE DATE_TRUNC('month', s.data_pagamento) = DATE_TRUNC('month', CURRENT_DATE)
            GROUP BY p.nome
        `);
        stats.revenue_by_product = revenueByProdRes.rows;

        // Last Sales (Top 5)
        const lastSalesRes = await pool.query(`
            SELECT s.*, c.nome as cliente_nome, p.nome as produto_nome
            FROM sales s
            LEFT JOIN clients c ON s.cliente_id = c.id
            LEFT JOIN products p ON s.produto_id = p.id
            ORDER BY s.data_pagamento DESC
            LIMIT 5
        `);
        stats.last_sales = lastSalesRes.rows;

        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
