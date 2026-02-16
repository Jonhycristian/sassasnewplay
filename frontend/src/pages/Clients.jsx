import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus, Edit, Trash, Users, Search, Filter, MessageCircle, CheckCircle, Calendar, AlertTriangle } from 'lucide-react';
import Modal from '../components/ui/Modal';

const Clients = () => {
    const [clients, setClients] = useState([]);
    const [products, setProducts] = useState([]);
    const [servers, setServers] = useState([]);
    const [filter, setFilter] = useState('');

    // Modals state
    const [isClientModalOpen, setIsClientModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    // Form state
    const [currentClient, setCurrentClient] = useState(null);
    const [formData, setFormData] = useState({
        nome: '', usuario_login: '', telefone: '', produto_id: '', servidor_id: '',
        quantidade_telas: 1, tipo_preco: 'normal', valor_personalizado: '',
        data_vencimento: '', observacoes: '', status: 'ativo'
    });

    // Payment state
    const [paymentData, setPaymentData] = useState({ cliente_id: null, meses_comprados: 1, valor_pago: '' });

    const fetchData = async () => {
        try {
            const [clientsRes, productsRes, serversRes] = await Promise.all([
                api.get('/clients'),
                api.get('/products'),
                api.get('/servers')
            ]);
            setClients(clientsRes.data);
            setProducts(productsRes.data);
            setServers(serversRes.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleClientSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...formData };
            // Ensure numbers
            payload.quantidade_telas = parseInt(payload.quantidade_telas);
            if (!payload.servidor_id) payload.servidor_id = null; // optional?

            if (currentClient) {
                await api.put(`/clients/${currentClient.id}`, payload);
            } else {
                // Set defaults for new client
                if (!payload.data_inicio) payload.data_inicio = new Date().toISOString();
                await api.post('/clients', payload);
            }
            setIsClientModalOpen(false);
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/clients/${paymentData.cliente_id}/confirm-payment`, {
                meses_comprados: parseInt(paymentData.meses_comprados),
                valor_pago: parseFloat(paymentData.valor_pago)
            });
            setIsPaymentModalOpen(false);
            fetchData();
            alert('Pagamento confirmado com sucesso!');
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Excluir este cliente permanentemente?')) {
            await api.delete(`/clients/${id}`);
            fetchData();
        }
    };

    const handleWhatsapp = async (client) => {
        try {
            const res = await api.get(`/clients/${client.id}/whatsapp`);
            const message = res.data.message;
            const encodedMessage = encodeURIComponent(message);
            const phone = client.telefone.replace(/\D/g, ''); // Remove non-digits
            window.open(`https://wa.me/55${phone}?text=${encodedMessage}`, '_blank');
            // Refresh logic handled by backend endpoint trigger? 
            // The prompt says "Após clicar no botão, atualizar automaticamente...". 
            // My backend endpoint generates the message AND updates the status.
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const openClientModal = (client = null) => {
        setCurrentClient(client);
        if (client) {
            setFormData({
                nome: client.nome, usuario_login: client.usuario_login || '', telefone: client.telefone || '',
                produto_id: client.produto_id || '', servidor_id: client.servidor_id || '',
                quantidade_telas: client.quantidade_telas, tipo_preco: client.tipo_preco,
                valor_personalizado: client.valor_personalizado || '',
                data_vencimento: client.data_vencimento ? client.data_vencimento.split('T')[0] : '',
                observacoes: client.observacoes || '', status: client.status
            });
        } else {
            setFormData({
                nome: '', usuario_login: '', telefone: '', produto_id: products[0]?.id || '',
                servidor_id: servers[0]?.id || '', quantidade_telas: 1, tipo_preco: 'normal',
                valor_personalizado: '', data_vencimento: new Date().toISOString().split('T')[0],
                observacoes: '', status: 'ativo'
            });
        }
        setIsClientModalOpen(true);
    };

    const openPaymentModal = (client) => {
        setPaymentData({ cliente_id: client.id, meses_comprados: 1, valor_pago: '' });
        setIsPaymentModalOpen(true);
    };

    // Derived logic for display
    const getStatusColor = (client) => {
        const today = new Date();
        const vencimento = new Date(client.data_vencimento);
        const diffTime = vencimento - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (client.status === 'cancelado') return 'bg-slate-700 text-slate-400 border-slate-600';
        if (client.status_cobranca === 'pago') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'; // Green
        if (client.status === 'vencido' || diffDays < 0) return 'bg-red-500/10 text-red-400 border-red-500/20'; // Red
        if (diffDays === 0) return 'bg-orange-500/10 text-orange-400 border-orange-500/20'; // Orange (Today)
        if (client.status_cobranca === 'cobrado' || client.status_cobranca === 'aguardando') return 'bg-amber-500/10 text-amber-400 border-amber-500/20'; // Yellow

        return 'bg-blue-500/10 text-blue-400 border-blue-500/20'; // Normal Active
    };

    const filteredClients = clients.filter(c =>
        c.nome.toLowerCase().includes(filter.toLowerCase()) ||
        (c.usuario_login && c.usuario_login.toLowerCase().includes(filter.toLowerCase()))
    );

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400"><Users size={32} /></div>
                        Clientes
                    </h2>
                    <p className="text-slate-400 mt-1 ml-14">Gerenciamento de assinantes</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-2.5 text-slate-500" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar cliente..."
                            className="input-field pl-10 py-2"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        />
                    </div>
                    <button onClick={() => openClientModal()} className="btn-primary whitespace-nowrap">
                        <Plus size={20} /> Novo Cliente
                    </button>
                </div>
            </div>

            <div className="glass-panel overflow-hidden">
                <table className="w-full text-left text-slate-300">
                    <thead className="bg-slate-800/80 text-xs uppercase text-slate-400 font-semibold">
                        <tr>
                            <th className="p-4 pl-6">Cliente / Usuário</th>
                            <th className="p-4">Serviço</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Vencimento</th>
                            <th className="p-4 text-center">Whatsapp</th>
                            <th className="p-4 text-right pr-6">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                        {filteredClients.map(client => {
                            const statusClass = getStatusColor(client);
                            return (
                                <tr key={client.id} className="hover:bg-slate-800/40 transition-colors">
                                    <td className="p-4 pl-6">
                                        <div className="font-semibold text-white">{client.nome}</div>
                                        <div className="text-xs text-slate-400">{client.usuario_login}</div>
                                        <div className="text-xs text-slate-500">{client.telefone}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-sm text-indigo-300">{client.nome_produto}</div>
                                        <div className="text-xs text-slate-500">{client.nome_servidor}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded border text-xs font-semibold ${statusClass}`}>
                                            {client.status === 'ativo' && client.status_cobranca === 'pago' ? 'Pago / Ativo' :
                                                client.status === 'ativo' ? client.status_cobranca : client.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm font-mono">
                                        {new Date(client.data_vencimento).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 text-center">
                                        <button
                                            onClick={() => handleWhatsapp(client)}
                                            className="bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white p-2 rounded-full transition-all"
                                            title="Enviar Cobrança"
                                        >
                                            <MessageCircle size={18} />
                                        </button>
                                    </td>
                                    <td className="p-4 text-right pr-6 space-x-1">
                                        <button onClick={() => openPaymentModal(client)} className="text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 p-2 rounded-lg transition-colors" title="Confirmar Pagamento">
                                            <CheckCircle size={18} />
                                        </button>
                                        <button onClick={() => openClientModal(client)} className="text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 p-2 rounded-lg transition-colors" title="Editar">
                                            <Edit size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(client.id)} className="text-slate-400 hover:text-red-400 hover:bg-red-500/10 p-2 rounded-lg transition-colors" title="Excluir">
                                            <Trash size={18} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {filteredClients.length === 0 && <div className="p-12 text-center text-slate-500">Nenhum cliente encontrado.</div>}
            </div>

            {/* Client Modal */}
            <Modal isOpen={isClientModalOpen} onClose={() => setIsClientModalOpen(false)} title={currentClient ? 'Editar Cliente' : 'Novo Cliente'}>
                <form onSubmit={handleClientSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">Nome Completo</label>
                            <input className="input-field" value={formData.nome} onChange={e => setFormData({ ...formData, nome: e.target.value })} required />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">Usuário Login</label>
                            <input className="input-field" value={formData.usuario_login} onChange={e => setFormData({ ...formData, usuario_login: e.target.value })} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Telefone (Whatsapp)</label>
                        <input className="input-field" value={formData.telefone} onChange={e => setFormData({ ...formData, telefone: e.target.value })} placeholder="5511999999999" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">Produto</label>
                            <select className="input-field bg-slate-800" value={formData.produto_id} onChange={e => setFormData({ ...formData, produto_id: e.target.value })} required>
                                <option value="">Selecione...</option>
                                {products.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">Servidor</label>
                            <select className="input-field bg-slate-800" value={formData.servidor_id} onChange={e => setFormData({ ...formData, servidor_id: e.target.value })}>
                                <option value="">Selecione...</option>
                                {servers.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">Telas</label>
                            <input type="number" className="input-field" value={formData.quantidade_telas} onChange={e => setFormData({ ...formData, quantidade_telas: e.target.value })} min="1" />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs text-slate-400 mb-1">Tipo de Preço</label>
                            <select className="input-field bg-slate-800" value={formData.tipo_preco} onChange={e => setFormData({ ...formData, tipo_preco: e.target.value })}>
                                <option value="normal">Normal</option>
                                <option value="promocional">Promocional</option>
                                <option value="personalizado">Personalizado</option>
                            </select>
                        </div>
                    </div>
                    {formData.tipo_preco === 'personalizado' && (
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">Valor Personalizado (R$)</label>
                            <input type="number" step="0.01" className="input-field" value={formData.valor_personalizado} onChange={e => setFormData({ ...formData, valor_personalizado: e.target.value })} />
                        </div>
                    )}
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Data de Vencimento</label>
                        <input type="date" className="input-field" value={formData.data_vencimento} onChange={e => setFormData({ ...formData, data_vencimento: e.target.value })} required />
                    </div>
                    {currentClient && (
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">Status</label>
                            <select className="input-field bg-slate-800" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                <option value="ativo">Ativo</option>
                                <option value="vencido">Vencido</option>
                                <option value="cancelado">Cancelado</option>
                            </select>
                        </div>
                    )}
                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={() => setIsClientModalOpen(false)} className="px-4 py-2 text-slate-400">Cancelar</button>
                        <button type="submit" className="btn-primary">Salvar</button>
                    </div>
                </form>
            </Modal>

            {/* Payment Modal */}
            <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} title="Confirmar Pagamento">
                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                    <p className="text-slate-300 text-sm">Confirme o recebimento renovando o acesso do cliente.</p>
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Meses Comprados</label>
                        <input type="number" min="1" className="input-field" value={paymentData.meses_comprados} onChange={e => setPaymentData({ ...paymentData, meses_comprados: e.target.value })} required />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Valor Pago (R$)</label>
                        <input type="number" step="0.01" className="input-field" value={paymentData.valor_pago} onChange={e => setPaymentData({ ...paymentData, valor_pago: e.target.value })} placeholder="0.00" required />
                    </div>
                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={() => setIsPaymentModalOpen(false)} className="px-4 py-2 text-slate-400">Cancelar</button>
                        <button type="submit" className="btn-primary bg-emerald-500 hover:bg-emerald-600">Confirmar</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Clients;
