const pool = require('../config/db');

exports.getAllClients = async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT c.*, p.nome as nome_produto, s.nome as nome_servidor 
      FROM clients c
      LEFT JOIN products p ON c.produto_id = p.id
      LEFT JOIN servers s ON c.servidor_id = s.id
      ORDER BY c.data_vencimento ASC
    `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createClient = async (req, res) => {
    const { nome, usuario_login, telefone, produto_id, servidor_id, quantidade_telas, tipo_preco, valor_personalizado, data_inicio, data_vencimento, observacoes } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO clients (nome, usuario_login, telefone, produto_id, servidor_id, quantidade_telas, tipo_preco, valor_personalizado, data_inicio, data_vencimento, observacoes) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
            [nome, usuario_login, telefone, produto_id, servidor_id, quantidade_telas, tipo_preco, valor_personalizado, data_inicio, data_vencimento, observacoes]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateClient = async (req, res) => {
    const { id } = req.params;
    const { nome, usuario_login, telefone, produto_id, servidor_id, quantidade_telas, tipo_preco, valor_personalizado, data_inicio, data_vencimento, status, observacoes } = req.body;
    try {
        const result = await pool.query(
            `UPDATE clients SET nome=$1, usuario_login=$2, telefone=$3, produto_id=$4, servidor_id=$5, quantidade_telas=$6, tipo_preco=$7, valor_personalizado=$8, data_inicio=$9, data_vencimento=$10, status=$11, observacoes=$12 WHERE id=$13 RETURNING *`,
            [nome, usuario_login, telefone, produto_id, servidor_id, quantidade_telas, tipo_preco, valor_personalizado, data_inicio, data_vencimento, status, observacoes, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteClient = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM clients WHERE id = $1', [id]);
        res.json({ message: 'Cliente removido' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getWhatsappMessage = async (req, res) => {
    const { id } = req.params;
    try {
        const clientResult = await pool.query('SELECT * FROM clients WHERE id = $1', [id]);
        const client = clientResult.rows[0];

        if (!client) return res.status(404).json({ message: 'Cliente não encontrado' });

        let message = `⚠️ Prezado(a) ${client.nome}, Sua assinatura vence em ${new Date(client.data_vencimento).toLocaleDateString('pt-BR')}.\n`;
        message += `👤 Usuário: ${client.usuario_login || 'N/A'}\n\n`;

        if (client.tipo_preco === 'personalizado') {
            message += `Valor de renovação: R$ ${client.valor_personalizado}\n`;
        } else {
            // Fetch plans
            const plansResult = await pool.query('SELECT * FROM plans WHERE produto_id = $1 AND tipo_preco = $2 ORDER BY duracao_meses ASC', [client.produto_id, client.tipo_preco]);
            if (plansResult.rows.length > 0) {
                message += `Opções de renovação (${client.tipo_preco}):\n`;
                plansResult.rows.forEach(plan => {
                    message += `📅 ${plan.duracao_meses} mês(es): R$ ${plan.valor}\n`;
                });
            }
        }

        // Update client status details as per requirements
        // "Após clicar no botão, atualizar automaticamente: status_cobranca = cobrado..."
        // This endpoint just generates the message. The action of "clicking/sending" should Trigger the update. 
        // We might want a separate endpoint "markAsCobrado" or do it here if this endpoint IS the trigger.
        // Assuming the FE calls this to get the text, and then opens WhatsApp.
        // We can update the status here if we assume the user WILL send it.

        const nextReminder = new Date();
        nextReminder.setDate(nextReminder.getDate() + 3);

        await pool.query(
            `UPDATE clients SET status_cobranca = 'cobrado', ultimo_aviso = NOW(), proximo_lembrete = $1, tentativas_cobranca = tentativas_cobranca + 1 WHERE id = $2`,
            [nextReminder, id]
        );

        res.json({ message });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.confirmPayment = async (req, res) => {
    const { id } = req.params;
    const { meses_comprados, valor_pago } = req.body; // Admin confirms how many months and value

    try {
        const clientResult = await pool.query('SELECT * FROM clients WHERE id = $1', [id]);
        const client = clientResult.rows[0];
        if (!client) return res.status(404).json({ message: 'Cliente não encontrado' });

        const currentVencimento = new Date(client.data_vencimento);
        const today = new Date();
        const baseDate = currentVencimento > today ? currentVencimento : today; // Add to current expiry or today if expired

        const newVencimento = new Date(baseDate);
        newVencimento.setDate(newVencimento.getDate() + (30 * meses_comprados));

        // Update Client
        await pool.query(
            `UPDATE clients SET data_vencimento = $1, status = 'ativo', status_cobranca = 'pago', tentativas_cobranca = 0, ultimo_aviso = NULL, proximo_lembrete = NULL WHERE id = $2`,
            [newVencimento, id]
        );

        // Record Sale
        await pool.query(
            `INSERT INTO sales (cliente_id, produto_id, valor, meses_comprados) VALUES ($1, $2, $3, $4)`,
            [id, client.produto_id, valor_pago, meses_comprados]
        );

        res.json({ message: 'Pagamento confirmado e cliente renovado.', new_vencimento: newVencimento });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
