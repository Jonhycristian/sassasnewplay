import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import Card from '../components/ui/Card';
import { Users, AlertCircle, Clock, DollarSign, Activity, TrendingUp } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/dashboard/stats');
                setStats(response.data);
            } catch (error) {
                console.error('Erro ao buscar estatísticas:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return <div className="text-white text-center mt-20">Carregando dashboard...</div>;
    }

    if (!stats) return null;

    // Chart Data Configuration
    const chartData = {
        labels: stats.revenue_by_product?.map(p => p.nome) || [],
        datasets: [
            {
                label: 'Faturamento por Produto (Mês Atual)',
                data: stats.revenue_by_product?.map(p => p.total) || [],
                backgroundColor: 'rgba(99, 102, 241, 0.6)',
                borderColor: 'rgb(99, 102, 241)',
                borderWidth: 1,
                borderRadius: 8,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top', labels: { color: '#94a3b8' } },
            title: { display: false },
        },
        scales: {
            y: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' } },
            x: { ticks: { color: '#94a3b8' }, grid: { display: false } },
        },
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-white">Dashboard</h2>
                <div className="text-slate-400 text-sm">
                    Atualizado em: {new Date().toLocaleTimeString()}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card title="Clientes Ativos" value={stats.total_active} icon={Users} color="indigo" />
                <Card title="Vencendo em 3 dias" value={stats.expiring_soon} icon={Clock} color="orange" />
                <Card title="Aguardando Lembrete" value={stats.waiting_reminder} icon={AlertCircle} color="yellow" />
                <Card
                    title="Faturamento (Mês)"
                    value={`R$ ${stats.monthly_revenue.toFixed(2)}`}
                    icon={DollarSign}
                    color="emerald"
                    subtext="Receita confirmada este mês"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart */}
                <div className="glass-panel p-6 lg:col-span-2">
                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                        <Activity className="text-indigo-500" />
                        Performance de Vendas
                    </h3>
                    <div className="h-[300px]">
                        {stats.revenue_by_product?.length > 0 ? (
                            <Bar data={chartData} options={chartOptions} />
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-500">Sem dados de vendas este mês</div>
                        )}
                    </div>
                </div>

                {/* Recent Sales List */}
                <div className="glass-panel p-6">
                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                        <TrendingUp className="text-emerald-500" />
                        Últimas Vendas
                    </h3>
                    <div className="space-y-4">
                        {stats.last_sales?.length > 0 ? (
                            stats.last_sales.map((sale) => (
                                <div key={sale.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors">
                                    <div>
                                        <p className="text-white font-medium">{sale.cliente_nome}</p>
                                        <p className="text-xs text-slate-400">{sale.produto_nome}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-emerald-400 font-bold">R$ {sale.valor}</p>
                                        <p className="text-xs text-slate-500">{new Date(sale.data_pagamento).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-slate-500 text-center">Nenhuma venda recente.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
