/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMemo } from 'react';
import { 
  Package, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  LineChart,
  Line
} from 'recharts';
import { Area, Peca } from '../types';
import { getStatus, getDaysRemaining, cn, formatDate } from '../lib/utils';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DashboardProps {
  areas: Area[];
  pecas: Peca[];
  loading: boolean;
  onNavigate: (filter?: { search?: string, status?: string }) => void;
}

export default function Dashboard({ areas, pecas, loading, onNavigate }: DashboardProps) {
  const stats = useMemo(() => {
    let verde = 0, amarelo = 0, vermelho = 0;
    pecas.forEach(p => {
      const s = getStatus(p.dataProximaValidacao);
      if (s === 'verde') verde++;
      else if (s === 'amarelo') amarelo++;
      else vermelho++;
    });
    return { total: pecas.length, verde, amarelo, vermelho };
  }, [pecas]);

  const donutData = [
    { name: 'Conforme', value: stats.verde, color: '#10b981' },
    { name: 'Atenção', value: stats.amarelo, color: '#f59e0b' },
    { name: 'Crítica', value: stats.vermelho, color: '#ef4444' },
  ].filter(d => d.value > 0);

  const areaData = useMemo(() => {
    return areas.map(a => {
      const areaPecas = pecas.filter(p => p.areaId === a.id);
      return { 
        name: a.nome, 
        total: areaPecas.length 
      };
    })
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);
  }, [areas, pecas]);

  const criticalPecas = useMemo(() => {
    return pecas
      .map(p => ({ ...p, days: getDaysRemaining(p.dataProximaValidacao), status: getStatus(p.dataProximaValidacao) }))
      .filter(p => p.status !== 'verde')
      .sort((a, b) => a.days - b.days)
      .slice(0, 10);
  }, [pecas]);

  const complianceRate = stats.total > 0 ? (stats.verde / stats.total) * 100 : 0;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
        <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Sincronizando Dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Dashboard Operacional</h2>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-0.5">Visão analítica em tempo real</p>
        </div>
        <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
          {['Hoje', 'Esta Semana', 'Este Mês'].map((period) => (
            <button
              key={period}
              className={cn(
                "px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all",
                period === 'Hoje' ? "bg-slate-900 text-white" : "text-slate-400 hover:text-slate-600"
              )}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Total em Estoque" 
          value={stats.total} 
          icon={Package} 
          subtitle="Peças cadastradas" 
          color="slate"
        />
        <KPICard 
          title="Conformidade" 
          value={`${complianceRate.toFixed(1)}%`} 
          icon={CheckCircle} 
          subtitle="Meta atingida" 
          color="green"
          isProgress
        />
        <KPICard 
          title="Em Atenção" 
          value={stats.amarelo} 
          icon={Clock} 
          subtitle="Ações preventivas" 
          color="yellow"
        />
        <KPICard 
          title="Peças Críticas" 
          value={stats.vermelho} 
          icon={AlertTriangle} 
          subtitle="Atrasadas/Vencidas" 
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Left Column: Stats & Charts */}
        <div className="xl:col-span-8 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             {/* Donut Chart */}
            <div className="sleek-card">
              <div className="flex items-center justify-between mb-8">
                <span className="kpi-label">Status Global</span>
                <span className="sleek-pill">Geral</span>
              </div>
              <div className="flex items-center justify-around h-full min-h-[200px]">
                <div className="w-40 h-40 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={donutData}
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                        animationDuration={1000}
                      >
                        {donutData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-bold text-slate-800 leading-none">{stats.total}</span>
                    <span className="text-[10px] font-bold text-slate-400">TOTAL</span>
                  </div>
                </div>
                <div className="space-y-3">
                  {donutData.map((d) => (
                    <div key={d.name} className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-slate-800">{d.name}</span>
                        <span className="text-[9px] font-bold text-slate-400 capitalize">{((d.value/stats.total)*100).toFixed(0)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bar Chart */}
            <div className="sleek-card">
              <div className="flex items-center justify-between mb-8">
                <span className="kpi-label">Distribuição por Área</span>
                <TrendingUp className="w-4 h-4 text-slate-400" />
              </div>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={areaData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <Bar dataKey="total" fill="#1e293b" radius={[4, 4, 0, 0]} barSize={16} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 8, fontWeight: 600, fill: '#94a3b8' }} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Large Wide Card or Grid for specific insights if needed - Staying within structure */}
          <div className="sleek-card p-6">
             <div className="flex items-center justify-between mb-6">
                <span className="kpi-label uppercase">Inteligência de Operação</span>
                <Activity className="w-4 h-4 text-slate-400" />
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                <div className="space-y-2">
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Taxa de Sucesso</span>
                   <div className="flex items-end gap-2">
                      <span className="text-2xl font-bold text-slate-800">94.2%</span>
                      <span className="text-[10px] font-bold text-emerald-500 mb-1">↑ 2.1%</span>
                   </div>
                   <div className="h-1.5 w-full bg-slate-100 rounded-full">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '94%' }} />
                   </div>
                </div>
                <div className="space-y-1">
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Próximos 7 Dias</span>
                   <div className="text-2xl font-bold text-slate-800">12 Peças</div>
                   <p className="text-[11px] text-slate-500 font-medium">Aguardando validação imediata</p>
                </div>
                <div className="flex items-center justify-end">
                   <button 
                     onClick={() => onNavigate()}
                     className="px-6 py-2.5 bg-slate-900 text-white rounded-lg text-[11px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors shadow-sm"
                   >
                     Gerenciar Tudo
                   </button>
                </div>
             </div>
          </div>
        </div>

        {/* Right Column: Alerts & Recent (The Glass Card Side) */}
        <div className="xl:col-span-4 flex flex-col gap-8">
           <div className="glass-card flex-1 min-h-[400px] flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <span className="kpi-label">Peças Críticas</span>
                <span className="flex items-center gap-1.5 text-[9px] font-black text-rose-600 uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 bg-rose-600 rounded-full animate-pulse" />
                  Live
                </span>
              </div>
              <div className="space-y-4 overflow-y-auto flex-1 pr-1 custom-scrollbar">
                {criticalPecas.map((p) => (
                  <div 
                    key={p.id} 
                    onClick={() => onNavigate({ search: p.pecaCoelho })}
                    className="group border-b border-white/40 pb-4 last:border-0 hover:border-slate-300 transition-colors cursor-pointer"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="text-[13px] font-bold text-slate-800 group-hover:text-brand transition-colors">{p.pecaCoelho}</h4>
                        <p className="text-[10px] font-medium text-slate-400 capitalize">{p.nome}</p>
                      </div>
                      <span className={cn(
                        "sleek-pill",
                        p.days < 0 ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600"
                      )}>
                        {p.days < 0 ? 'ATRASADO' : `${p.days}d`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t border-white/40">
                <span className="kpi-label block mb-4">Adições Recentes</span>
                <div className="space-y-3">
                  {pecas.slice(0, 3).map(p => (
                    <div key={p.id} className="flex justify-between items-center text-[12px] font-medium">
                      <span className="text-slate-600 truncate">{p.nome}</span>
                      <span className="text-slate-400 text-[10px]">Hoje</span>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={() => onNavigate()}
                  className="mt-6 text-[11px] font-bold text-blue-500 hover:text-blue-600 transition-colors uppercase tracking-widest flex items-center gap-1"
                >
                  Ver todas as peças <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function KPICard({ title, value, icon: Icon, subtitle, color }: { title: string, value: string | number, icon: any, subtitle: string, color: string, isProgress?: boolean }) {
  const sparklineColor = color === 'green' ? '#10b981' : color === 'red' ? '#ef4444' : color === 'yellow' ? '#f59e0b' : '#334155';
  
  return (
    <div className="sleek-card group">
      <div className="flex justify-between items-start mb-4">
        <span className="kpi-label">{title}</span>
        <div className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center transition-colors shadow-sm",
          color === 'green' ? "bg-emerald-50 text-emerald-600" : 
          color === 'red' ? "bg-rose-50 text-rose-600" : 
          color === 'yellow' ? "bg-amber-50 text-amber-600" : "bg-slate-900 text-white"
        )}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="mb-2">
        <div className="kpi-value text-slate-800">{value}</div>
        <div className="flex items-center gap-2 mt-1">
           <span className="trend-up">↑ 12.4%</span>
           <span className="text-[10px] text-slate-300 font-medium tracking-tight">vs mês ant.</span>
        </div>
      </div>
      <div className="mt-4 opacity-50 group-hover:opacity-100 transition-opacity">
        <svg viewBox="0 0 100 30" className="h-6 w-full" style={{ fill: 'none', stroke: sparklineColor, strokeWidth: 2 }}>
          <polyline points="0,25 20,22 40,28 60,15 80,18 100,5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}
