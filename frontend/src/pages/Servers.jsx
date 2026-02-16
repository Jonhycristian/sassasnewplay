import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus, Edit, Trash, Server as ServerIcon, Globe } from 'lucide-react';
import Modal from '../components/ui/Modal';

const Servers = () => {
    const [servers, setServers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentServer, setCurrentServer] = useState(null);
    const [formData, setFormData] = useState({ nome: '', host: '', tipo: 'IPTV', ativo: true });

    const fetchServers = async () => {
        try {
            const res = await api.get('/servers');
            setServers(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchServers();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentServer) {
                await api.put(`/servers/${currentServer.id}`, formData);
            } else {
                await api.post('/servers', formData);
            }
            setIsModalOpen(false);
            fetchServers();
        } catch (err) {
            console.error(err);
        }
    };

    const openModal = (server = null) => {
        setCurrentServer(server);
        setFormData(server || { nome: '', host: '', tipo: 'IPTV', ativo: true });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir este servidor?')) {
            try {
                await api.delete(`/servers/${id}`);
                fetchServers();
            } catch (err) {
                console.error(err);
                alert('Erro ao excluir. Verifique se existem clientes vinculados.');
            }
        }
    };

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400"><ServerIcon size={32} /></div>
                        Servidores
                    </h2>
                    <p className="text-slate-400 mt-1 ml-14">Gerencie os servidores de IPTV e VPN</p>
                </div>
                <button onClick={() => openModal()} className="btn-primary shadow-lg shadow-indigo-500/20">
                    <Plus size={20} /> Novo Servidor
                </button>
            </div>

            <div className="glass-panel overflow-hidden border-slate-700/50">
                <table className="w-full text-left text-slate-300">
                    <thead className="bg-slate-800/80 text-slate-400 uppercase text-xs font-semibold tracking-wider">
                        <tr>
                            <th className="p-5 pl-8">Nome do Servidor</th>
                            <th className="p-5">Host / IP</th>
                            <th className="p-5">Tipo</th>
                            <th className="p-5">Status</th>
                            <th className="p-5 text-right pr-8">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                        {servers.map((server) => (
                            <tr key={server.id} className="hover:bg-slate-800/40 transition-colors group">
                                <td className="p-5 pl-8 font-medium text-white flex items-center gap-3">
                                    <div className={`w-2 h-8 rounded-full ${server.tipo === 'IPTV' ? 'bg-purple-500' : 'bg-blue-500'}`}></div>
                                    {server.nome}
                                </td>
                                <td className="p-5 text-slate-400 font-mono text-sm">
                                    <div className="flex items-center gap-2">
                                        <Globe size={14} className="text-slate-500" />
                                        {server.host}
                                    </div>
                                </td>
                                <td className="p-5">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${server.tipo === 'IPTV' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                                        {server.tipo}
                                    </span>
                                </td>
                                <td className="p-5">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${server.ativo ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400 bg-slate-700/30'}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${server.ativo ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`}></span>
                                        {server.ativo ? 'Operacional' : 'Inativo'}
                                    </span>
                                </td>
                                <td className="p-5 text-right pr-8 space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openModal(server)} className="text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 p-2 rounded-lg transition-colors" title="Editar">
                                        <Edit size={18} />
                                    </button>
                                    <button onClick={() => handleDelete(server.id)} className="text-slate-400 hover:text-red-400 hover:bg-red-500/10 p-2 rounded-lg transition-colors" title="Excluir">
                                        <Trash size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {servers.length === 0 && <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-2">
                    <ServerIcon size={48} className="text-slate-700" />
                    <p>Nenhum servidor cadastrado.</p>
                </div>}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentServer ? 'Editar Servidor' : 'Novo Servidor'}>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1.5">Nome do Servidor</label>
                        <input
                            className="input-field"
                            value={formData.nome}
                            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                            placeholder="Ex: Servidor Principal BR"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1.5">Host (URL ou IP)</label>
                        <input
                            className="input-field font-mono text-sm"
                            value={formData.host}
                            onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                            placeholder="Ex: http://srv1.exemplo.com:8080"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1.5">Tipo de Serviço</label>
                            <select className="input-field bg-slate-800 text-white" value={formData.tipo} onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}>
                                <option value="IPTV">IPTV</option>
                                <option value="VPN">VPN</option>
                            </select>
                        </div>
                        <div className="flex items-center mt-7 p-1">
                            <label className="flex items-center cursor-pointer gap-3">
                                <div className="relative">
                                    <input type="checkbox" className="sr-only" checked={formData.ativo} onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })} />
                                    <div className={`w-10 h-6 rounded-full transition-colors ${formData.ativo ? 'bg-emerald-500' : 'bg-slate-600'}`}></div>
                                    <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.ativo ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                </div>
                                <span className="text-sm font-medium text-slate-300">Servidor Ativo</span>
                            </label>
                        </div>
                    </div>
                    <div className="pt-6 flex justify-end gap-3 border-t border-slate-700/50 mt-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-400 hover:text-white font-medium transition-colors">Cancelar</button>
                        <button type="submit" className="btn-primary px-6">
                            {currentServer ? 'Salvar Alterações' : 'Criar Servidor'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Servers;
