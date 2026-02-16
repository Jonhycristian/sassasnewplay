import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus, Edit, Trash, ShoppingBag, List } from 'lucide-react';
import Modal from '../components/ui/Modal';
import PlansModal from '../components/PlansModal';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [formData, setFormData] = useState({ nome: '', tipo: 'IPTV', ativo: true });
    const [selectedProductForPlans, setSelectedProductForPlans] = useState(null);

    const fetchProducts = async () => {
        try {
            const res = await api.get('/products');
            setProducts(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentProduct) {
                await api.put(`/products/${currentProduct.id}`, formData);
            } else {
                await api.post('/products', formData);
            }
            setIsModalOpen(false);
            fetchProducts();
        } catch (err) {
            console.error(err);
        }
    };

    const openModal = (product = null) => {
        setCurrentProduct(product);
        setFormData(product || { nome: '', tipo: 'IPTV', ativo: true });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza? Clientes vinculados podem ser afetados.')) {
            try {
                await api.delete(`/products/${id}`);
                fetchProducts();
            } catch (err) {
                console.error(err);
                alert('Não foi possível excluir. Verifique dependências.');
            }
        }
    };

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                        <div className="p-2 bg-pink-500/20 rounded-lg text-pink-400"><ShoppingBag size={32} /></div>
                        Produtos
                    </h2>
                    <p className="text-slate-400 mt-1 ml-14">Gerencie os produtos e seus planos de preço</p>
                </div>
                <button onClick={() => openModal()} className="btn-primary">
                    <Plus size={20} /> Novo Produto
                </button>
            </div>

            <div className="glass-panel overflow-hidden">
                <table className="w-full text-left text-slate-300">
                    <thead className="bg-slate-800/80 text-slate-400 uppercase text-xs font-semibold tracking-wider">
                        <tr>
                            <th className="p-5 pl-8">Nome do Produto</th>
                            <th className="p-5">Tipo</th>
                            <th className="p-5">Status</th>
                            <th className="p-5 text-right pr-8">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                        {products.map((product) => (
                            <tr key={product.id} className="hover:bg-slate-800/40 transition-colors group">
                                <td className="p-5 pl-8 font-medium text-white text-lg">{product.nome}</td>
                                <td className="p-5">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${product.tipo === 'IPTV' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                                        {product.tipo}
                                    </span>
                                </td>
                                <td className="p-5">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${product.ativo ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400 bg-slate-700/30'}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${product.ativo ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`}></span>
                                        {product.ativo ? 'Ativo' : 'Inativo'}
                                    </span>
                                </td>
                                <td className="p-5 text-right pr-8 space-x-2">
                                    <button
                                        onClick={() => setSelectedProductForPlans(product)}
                                        className="btn-primary text-xs px-3 py-1.5 bg-indigo-500/20 hover:bg-indigo-500 text-indigo-300 hover:text-white border border-indigo-500/30"
                                    >
                                        <List size={16} /> Gerenciar Planos
                                    </button>
                                    <button onClick={() => openModal(product)} className="text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 p-2 rounded-lg transition-colors" title="Editar">
                                        <Edit size={18} />
                                    </button>
                                    <button onClick={() => handleDelete(product.id)} className="text-slate-400 hover:text-red-400 hover:bg-red-500/10 p-2 rounded-lg transition-colors" title="Excluir">
                                        <Trash size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {products.length === 0 && <div className="p-12 text-center text-slate-500">Nenhum produto cadastrado.</div>}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentProduct ? 'Editar Produto' : 'Novo Produto'}>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1.5">Nome do Produto</label>
                        <input
                            className="input-field"
                            value={formData.nome}
                            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1.5">Tipo</label>
                            <select className="input-field bg-slate-800 text-white" value={formData.tipo} onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}>
                                <option value="IPTV">IPTV</option>
                                <option value="VPN">VPN</option>
                            </select>
                        </div>
                        <div className="flex items-center mt-7">
                            <label className="flex items-center cursor-pointer gap-3">
                                <div className="relative">
                                    <input type="checkbox" className="sr-only" checked={formData.ativo} onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })} />
                                    <div className={`w-10 h-6 rounded-full transition-colors ${formData.ativo ? 'bg-emerald-500' : 'bg-slate-600'}`}></div>
                                    <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.ativo ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                </div>
                                <span className="text-sm font-medium text-slate-300">Produto Ativo</span>
                            </label>
                        </div>
                    </div>
                    <div className="pt-6 flex justify-end gap-3 border-t border-slate-700/50 mt-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-400 hover:text-white font-medium transition-colors">Cancelar</button>
                        <button type="submit" className="btn-primary px-6">Salvar</button>
                    </div>
                </form>
            </Modal>

            {selectedProductForPlans && (
                <PlansModal
                    product={selectedProductForPlans}
                    onClose={() => setSelectedProductForPlans(null)}
                />
            )}
        </div>
    );
};

export default Products;
