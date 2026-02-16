import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { FileBarChart, Download, Search, DollarSign } from 'lucide-react';

const Reports = () => {
    const [sales, setSales] = useState([]);
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [loading, setLoading] = useState(false);

    const fetchSales = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/sales?month=${month}&year=${year}`);
            setSales(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSales();
    }, [month, year]);

    const totalSales = sales.reduce((acc, curr) => acc + parseFloat(curr.valor), 0);

    const exportCSV = () => {
        const headers = ['ID', 'Cliente', 'Produto', 'Meses', 'Valor', 'Data'];
        const csvContent = [
            headers.join(','),
            ...sales.map(s => [
                s.id,
                `"${s.cliente_nome}"`,
                `"${s.produto_nome}"`,
                s.meses_comprados,
                s.valor,
                new Date(s.data_pagamento).toLocaleDateString()
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `relatorio_vendas_${month}_${year}.csv`);
        document.body.appendChild(link);
        link.click();
    };

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400"><FileBarChart size={32} /></div>
                        Relatórios
                    </h2>
                    <p className="text-slate-400 mt-1 ml-14">Histórico de vendas e financeiro</p>
                </div>
                <div className="flex gap-3">
                    <select value={month} onChange={e => setMonth(e.target.value)} className="input-field bg-slate-800 w-32">
                        <option value="1">Janeiro</option>
                        <option value="2">Fevereiro</option>
                        <option value="3">Março</option>
                        <option value="4">Abril</option>
                        <option value="5">Maio</option>
                        <option value="6">Junho</option>
                        <option value="7">Julho</option>
                        <option value="8">Agosto</option>
                        <option value="9">Setembro</option>
                        <option value="10">Outubro</option>
                        <option value="11">Novembro</option>
                        <option value="12">Dezembro</option>
                    </select>
                    <select value={year} onChange={e => setYear(e.target.value)} className="input-field bg-slate-800 w-24">
                        <option value="2024">2024</option>
                        <option value="2025">2025</option>
                        <option value="2026">2026</option>
                    </select>
                    <button onClick={exportCSV} className="btn-primary bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600">
                        <Download size={20} /> Exportar
                    </button>
                </div>
            </div>

            {/* Stats Cards Line */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-panel p-6 flex items-center justify-between border-emerald-500/30 bg-emerald-500/5">
                    <div>
                        <p className="text-emerald-200/70 text-sm font-medium uppercase tracking-wider">Total Vendido</p>
                        <h3 className="text-3xl font-bold text-white mt-1">R$ {totalSales.toFixed(2)}</h3>
                    </div>
                    <div className="p-3 rounded-full bg-emerald-500/20 text-emerald-400">
                        <DollarSign size={28} />
                    </div>
                </div>
                <div className="glass-panel p-6 flex items-center justify-between">
                    <div>
                        <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Total Vendas</p>
                        <h3 className="text-3xl font-bold text-white mt-1">{sales.length}</h3>
                    </div>
                </div>
            </div>

            <div className="glass-panel overflow-hidden">
                <table className="w-full text-left text-slate-300">
                    <thead className="bg-slate-800/80 text-xs uppercase text-slate-400 font-semibold">
                        <tr>
                            <th className="p-4 pl-6">Data</th>
                            <th className="p-4">Cliente</th>
                            <th className="p-4">Produto</th>
                            <th className="p-4 text-center">Meses</th>
                            <th className="p-4 text-right pr-6">Valor</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                        {loading ? (
                            <tr><td colSpan="5" className="p-8 text-center">Carregando...</td></tr>
                        ) : sales.map(sale => (
                            <tr key={sale.id} className="hover:bg-slate-800/40 transition-colors">
                                <td className="p-4 pl-6 font-mono text-sm text-slate-400">
                                    {new Date(sale.data_pagamento).toLocaleDateString()} <span className="text-slate-600 text-xs">{new Date(sale.data_pagamento).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </td>
                                <td className="p-4 font-medium text-white">{sale.cliente_nome}</td>
                                <td className="p-4 text-slate-300">{sale.produto_nome}</td>
                                <td className="p-4 text-center">
                                    <span className="px-2 py-1 bg-slate-800 rounded text-xs">{sale.meses_comprados} mês(es)</span>
                                </td>
                                <td className="p-4 text-right pr-6 font-bold text-emerald-400">
                                    R$ {sale.valor}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {!loading && sales.length === 0 && <div className="p-12 text-center text-slate-500">Nenhuma venda neste período.</div>}
            </div>
        </div>
    );
};

export default Reports;
