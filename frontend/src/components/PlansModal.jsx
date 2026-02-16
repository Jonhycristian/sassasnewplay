import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Trash, Edit, Plus, X } from 'lucide-react';

const PlansModal = ({ product, onClose }) => {
    const [plans, setPlans] = useState([]);
    const [formData, setFormData] = useState({ duracao_meses: 1, valor: '', tipo_preco: 'normal' });
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (product) fetchPlans();
    }, [product]);

    const fetchPlans = async () => {
        try {
            const res = await api.get(`/plans/product/${product.id}`);
            setPlans(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = { ...formData, produto_id: product.id };
            if (editingId) {
                await api.put(`/plans/${editingId}`, payload);
            } else {
                await api.post('/plans', payload);
            }
            setFormData({ duracao_meses: 1, valor: '', tipo_preco: 'normal' });
            setEditingId(null);
            fetchPlans();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (plan) => {
        setFormData({ duracao_meses: plan.duracao_meses, valor: plan.valor, tipo_preco: plan.tipo_preco });
        setEditingId(plan.id);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Excluir este plano?')) {
            try {
                await api.delete(`/plans/${id}`);
                fetchPlans();
            } catch (err) {
                console.error(err);
            }
        }
    };

    if (!product) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="glass-panel w-full max-w-2xl p-6 relative z-10 animate-scale-in max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
                    <div>
                        <h3 className="text-xl font-bold text-white">Gerenciar Planos</h3>
                        <p className="text-sm text-slate-400">Produto: <span className="text-indigo-400">{product.nome}</span></p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-full"><X size={24} /></button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-slate-800/50 p-4 rounded-lg mb-6 border border-slate-700/50">
                    <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                        {editingId ? <Edit size={16} /> : <Plus size={16} />}
                        {editingId ? 'Editar Plano' : 'Adicionar Novo Plano'}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="text-xs text-slate-400 block mb-1">Duração (Meses)</label>
                            <input
                                type="number" min="1"
                                className="input-field py-1.5 text-sm"
                                value={formData.duracao_meses}
                                onChange={(e) => setFormData({ ...formData, duracao_meses: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 block mb-1">Valor (R$)</label>
                            <input
                                type="number" step="0.01"
                                className="input-field py-1.5 text-sm"
                                value={formData.valor}
                                onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                                placeholder="0.00"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 block mb-1">Tipo</label>
                            <select
                                className="input-field py-1.5 text-sm bg-slate-800"
                                value={formData.tipo_preco}
                                onChange={(e) => setFormData({ ...formData, tipo_preco: e.target.value })}
                            >
                                <option value="normal">Normal</option>
                                <option value="promocional">Promocional</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-1.5 text-sm">
                                {editingId ? 'Atualizar' : 'Adicionar'}
                            </button>
                        </div>
                    </div>
                    {editingId && (
                        <div className="mt-2 text-right">
                            <button
                                type="button"
                                onClick={() => { setEditingId(null); setFormData({ duracao_meses: 1, valor: '', tipo_preco: 'normal' }); }}
                                className="text-xs text-slate-500 hover:text-white underline"
                            >
                                Cancelar Edição
                            </button>
                        </div>
                    )}
                </form>

                {/* List */}
                <div className="overflow-hidden rounded-lg border border-slate-700/50">
                    <table className="w-full text-left text-slate-300">
                        <thead className="bg-slate-800/80 text-xs uppercase text-slate-400">
                            <tr>
                                <th className="p-3 pl-4">Duração</th>
                                <th className="p-3">Valor</th>
                                <th className="p-3">Tipo</th>
                                <th className="p-3 text-right pr-4">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {plans.map((plan) => (
                                <tr key={plan.id} className="hover:bg-slate-800/30">
                                    <td className="p-3 pl-4 font-medium text-white">{plan.duracao_meses} Mês(es)</td>
                                    <td className="p-3 text-emerald-400 font-bold">R$ {parseFloat(plan.valor).toFixed(2)}</td>
                                    <td className="p-3">
                                        <span className={`text-xs px-2 py-0.5 rounded-full border ${plan.tipo_preco === 'promocional' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-slate-700/30 text-slate-400 border-slate-600'}`}>
                                            {plan.tipo_preco}
                                        </span>
                                    </td>
                                    <td className="p-3 text-right pr-4 space-x-2">
                                        <button onClick={() => handleEdit(plan)} className="text-indigo-400 hover:text-white transition-colors" title="Editar"><Edit size={16} /></button>
                                        <button onClick={() => handleDelete(plan.id)} className="text-red-400 hover:text-white transition-colors" title="Excluir"><Trash size={16} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {plans.length === 0 && <div className="p-6 text-center text-slate-500 text-sm">Nenhum plano cadastrado para este produto.</div>}
                </div>
            </div>
        </div>
    );
};

export default PlansModal;
