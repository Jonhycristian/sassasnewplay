const pool = require('../config/db');

exports.createPlan = async (req, res) => {
    const { produto_id, duracao_meses, valor, tipo_preco } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO plans (produto_id, duracao_meses, valor, tipo_preco) VALUES ($1, $2, $3, $4) RETURNING *',
            [produto_id, duracao_meses, valor, tipo_preco]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getPlansByProduct = async (req, res) => {
    const { productId } = req.params;
    try {
        const result = await pool.query('SELECT * FROM plans WHERE produto_id = $1 ORDER BY duracao_meses ASC', [productId]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAllPlans = async (req, res) => {
    try {
        const result = await pool.query(`
          SELECT plans.*, products.nome as nome_produto 
          FROM plans 
          JOIN products ON plans.produto_id = products.id
      `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updatePlan = async (req, res) => {
    const { id } = req.params;
    const { duracao_meses, valor, tipo_preco } = req.body;
    try {
        const result = await pool.query(
            'UPDATE plans SET duracao_meses = $1, valor = $2, tipo_preco = $3 WHERE id = $4 RETURNING *',
            [duracao_meses, valor, tipo_preco, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deletePlan = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM plans WHERE id = $1', [id]);
        res.json({ message: 'Plano removido' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
