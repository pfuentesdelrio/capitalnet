import React, { useMemo, useState } from 'react';
import { Ticket, TicketType, TicketArea, TicketStatus } from '../types';
import { BarChart3, TrendingUp, AlertTriangle, Briefcase, Zap, PieChart, Filter, Calendar } from 'lucide-react';

interface AnalyticsViewProps {
    tickets: Ticket[];
}

const AnalyticsView: React.FC<AnalyticsViewProps> = ({ tickets }) => {
    const [selectedYear, setSelectedYear] = useState<string>('all');
    const [selectedSemester, setSelectedSemester] = useState<string>('all');
    const [selectedQuarter, setSelectedQuarter] = useState<string>('all');
    const [selectedMonth, setSelectedMonth] = useState<string>('all');

    const years = useMemo(() => {
        const uniqueYears = new Set<string>();
        tickets.forEach(t => {
            const year = t.createdAt.split('-')[0];
            if (year && year.length === 4) uniqueYears.add(year);
        });
        return Array.from(uniqueYears).sort((a, b) => b.localeCompare(a));
    }, [tickets]);

    const filteredData = useMemo(() => {
        return tickets.filter(t => {
            const dateStr = t.createdAt.includes('/') ? t.createdAt.split(' ')[0].split('/').reverse().join('-') : t.createdAt.split(' ')[0];
            const date = new Date(dateStr);
            const year = date.getFullYear().toString();
            const month = date.getMonth() + 1; // 1-12

            if (selectedYear !== 'all' && year !== selectedYear) return false;

            if (selectedSemester !== 'all') {
                const semester = month <= 6 ? '1' : '2';
                if (semester !== selectedSemester) return false;
            }

            if (selectedQuarter !== 'all') {
                const quarter = Math.ceil(month / 3).toString();
                if (quarter !== selectedQuarter) return false;
            }

            if (selectedMonth !== 'all' && month.toString() !== selectedMonth) return false;

            return true;
        });
    }, [tickets, selectedYear, selectedSemester, selectedQuarter, selectedMonth]);

    // Logic 1: Area with most errors
    const errorsByArea = useMemo(() => {
        const counts: Record<string, number> = {};
        Object.values(TicketArea).forEach(area => counts[area] = 0);

        filteredData.filter(t => t.type === TicketType.ERROR).forEach(t => {
            counts[t.area] = (counts[t.area] || 0) + 1;
        });

        return Object.entries(counts).sort((a, b) => b[1] - a[1]);
    }, [filteredData]);

    // Logic 2: Most frequent category per area
    const categoryByArea = useMemo(() => {
        const matrix: Record<string, Record<string, number>> = {};

        filteredData.forEach(t => {
            if (!matrix[t.area]) matrix[t.area] = {};
            matrix[t.area][t.type] = (matrix[t.area][t.type] || 0) + 1;
        });

        const results = Object.entries(matrix).map(([area, categories]) => {
            const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];
            return {
                area,
                category: topCategory[0],
                count: topCategory[1]
            };
        }).sort((a, b) => b.count - a.count);

        return results;
    }, [filteredData]);

    const totalTickets = filteredData.length;
    const resolvedCount = filteredData.filter(t => t.status === TicketStatus.RESOLVED).length;
    const resolvedRate = totalTickets > 0 ? ((resolvedCount / totalTickets) * 100).toFixed(1) : '0.0';

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Panel de Analytics</h2>
                    <p className="text-[var(--text-secondary)] text-sm mt-1">Inteligencia operativa y cuellos de botella por área.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <div className="glass-card flex items-center gap-2 px-3 py-1.5" style={{ background: 'var(--glass-bg)' }}>
                        <Filter size={14} className="text-[#1F3C88]" />
                        <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Filtros Temporales</span>
                    </div>
                    <div className="glass-card px-4 py-2 flex items-center gap-2" style={{ background: 'var(--glass-bg)' }}>
                        <div className="w-2 h-2 rounded-full bg-[#2FBF8F] animate-pulse"></div>
                        <span className="text-[10px] font-bold uppercase text-[var(--text-secondary)]">Tiempo Real</span>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="glass-card p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-1">
                        <Calendar size={10} /> Año
                    </label>
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-bold appearance-none cursor-pointer"
                    >
                        <option value="all" style={{ background: '#12172A' }}>Todos los años</option>
                        {years.map(y => <option key={y} value={y} style={{ background: '#12172A' }}>{y}</option>)}
                    </select>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">Semestre</label>
                    <select
                        value={selectedSemester}
                        onChange={(e) => setSelectedSemester(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-bold appearance-none cursor-pointer"
                    >
                        <option value="all" style={{ background: '#12172A' }}>Todo el año</option>
                        <option value="1" style={{ background: '#12172A' }}>1er Semestre</option>
                        <option value="2" style={{ background: '#12172A' }}>2do Semestre</option>
                    </select>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">Trimestre</label>
                    <select
                        value={selectedQuarter}
                        onChange={(e) => setSelectedQuarter(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-bold appearance-none cursor-pointer"
                    >
                        <option value="all" style={{ background: '#12172A' }}>Todos</option>
                        <option value="1" style={{ background: '#12172A' }}>T1 (Ene-Mar)</option>
                        <option value="2" style={{ background: '#12172A' }}>T2 (Abr-Jun)</option>
                        <option value="3" style={{ background: '#12172A' }}>T3 (Jul-Sep)</option>
                        <option value="4" style={{ background: '#12172A' }}>T4 (Oct-Dic)</option>
                    </select>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">Mes</label>
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-bold appearance-none cursor-pointer"
                    >
                        <option value="all" style={{ background: '#12172A' }}>Cualquier mes</option>
                        <option value="1" style={{ background: '#12172A' }}>Enero</option>
                        <option value="2" style={{ background: '#12172A' }}>Febrero</option>
                        <option value="3" style={{ background: '#12172A' }}>Marzo</option>
                        <option value="4" style={{ background: '#12172A' }}>Abril</option>
                        <option value="5" style={{ background: '#12172A' }}>Mayo</option>
                        <option value="6" style={{ background: '#12172A' }}>Junio</option>
                        <option value="7" style={{ background: '#12172A' }}>Julio</option>
                        <option value="8" style={{ background: '#12172A' }}>Agosto</option>
                        <option value="9" style={{ background: '#12172A' }}>Septiembre</option>
                        <option value="10" style={{ background: '#12172A' }}>Octubre</option>
                        <option value="11" style={{ background: '#12172A' }}>Noviembre</option>
                        <option value="12" style={{ background: '#12172A' }}>Diciembre</option>
                    </select>
                </div>
            </div>

            {/* Primary Stats Panel */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 border-b-4 border-b-[#1F3C88]">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-2xl text-[#1F3C88] bg-[#1F3C88]/10">
                            <TrendingUp size={24} />
                        </div>
                        <span className="text-[10px] font-bold text-[#2FBF8F] bg-[#2FBF8F]/10 px-2 py-1 rounded-lg">+{resolvedRate}% Eficiencia</span>
                    </div>
                    <p className="text-[var(--text-muted)] text-xs font-bold uppercase tracking-widest">Total Solicitudes</p>
                    <p className="text-3xl font-black text-white">{totalTickets}</p>
                </div>

                <div className="glass-card p-6 border-b-4 border-b-[#E5533D]">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-[#E5533D]/10 rounded-2xl text-[#E5533D]">
                            <AlertTriangle size={24} />
                        </div>
                        <span className="text-[10px] font-bold text-[#E5533D] bg-[#E5533D]/10 px-2 py-1 rounded-lg">Críticos</span>
                    </div>
                    <p className="text-[var(--text-muted)] text-xs font-bold uppercase tracking-widest">Área con más Errores</p>
                    <p className="text-2xl font-black text-white truncate">{errorsByArea[0][0]}</p>
                    <p className="text-xs text-[#E5533D] font-bold mt-1">{errorsByArea[0][1]} errores reportados</p>
                </div>

                <div className="glass-card p-6 border-b-4 border-b-[#F59E0B]">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-[#F59E0B]/10 rounded-2xl text-[#F59E0B]">
                            <Briefcase size={24} />
                        </div>
                        <span className="text-[10px] font-bold text-[#F59E0B] bg-[#F59E0B]/10 px-2 py-1 rounded-lg">Frecuencia</span>
                    </div>
                    <p className="text-[var(--text-muted)] text-xs font-bold uppercase tracking-widest">Categoría Top</p>
                    <p className="text-2xl font-black text-white truncate">{categoryByArea[0]?.category || 'N/A'}</p>
                    <p className="text-xs text-[var(--text-secondary)] font-medium mt-1">Predomina en área: <span className="font-bold text-white">{categoryByArea[0]?.area}</span></p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Chart 1: Errors by Area */}
                <div className="glass-card p-8">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-[#E5533D] text-white rounded-xl shadow-lg shadow-rose-900/40">
                            <AlertTriangle size={18} />
                        </div>
                        <h3 className="font-bold text-white uppercase text-xs tracking-widest">Distribución de Errores por Área</h3>
                    </div>

                    <div className="space-y-6">
                        {errorsByArea.map(([area, count]) => (
                            <div key={area} className="space-y-2">
                                <div className="flex justify-between text-xs font-bold">
                                    <span className="text-[var(--text-secondary)] font-bold">{area}</span>
                                    <span className="text-[var(--text-muted)]">{count} reports</span>
                                </div>
                                <div className="h-3 w-full bg-[var(--bg-secondary)] rounded-full overflow-hidden border border-[var(--separator)] shadow-inner">
                                    <div
                                        className="h-full bg-gradient-to-r from-[#E5533D] to-[#E5533D]/70 rounded-full shadow-lg transition-all duration-1000"
                                        style={{ width: `${totalTickets > 0 ? (count / totalTickets) * 100 * 2 : 0}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Chart 2: Category Frequency */}
                <div className="glass-card p-8">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-[#1F3C88] text-white rounded-xl shadow-lg shadow-blue-900/40">
                            <Zap size={18} />
                        </div>
                        <h3 className="font-bold text-white uppercase text-xs tracking-widest">Categoría más frecuente por Área</h3>
                    </div>

                    <div className="overflow-hidden">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest border-b border-[var(--separator)]">
                                    <th className="pb-4">Área</th>
                                    <th className="pb-4">Top Categoría</th>
                                    <th className="pb-4 text-right">Cantidad</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--separator)]">
                                {categoryByArea.map((item, idx) => (
                                    <tr key={item.area} className="table-row-float">
                                        <td className="py-4 pl-3 font-bold text-sm text-[var(--text-primary)] opacity-90">{item.area}</td>
                                        <td className="py-4">
                                            <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${item.category === TicketType.ERROR ? 'bg-[#E5533D]/20 text-[#E5533D]' :
                                                item.category === TicketType.IMPROVEMENT ? 'bg-[#2FBF8F]/20 text-[#2FBF8F]' :
                                                    'bg-[#1F3C88]/20 text-[#4F70C4]'
                                                }`}>
                                                {item.category}
                                            </span>
                                        </td>
                                        <td className="py-4 pr-3 text-right font-black text-[var(--text-primary)]">{item.count}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Insights Section */}
            <div className="glass-card p-6 flex items-center gap-6" style={{ background: 'linear-gradient(145deg, rgba(31, 60, 136, 0.1), rgba(11, 15, 26, 0.4))', border: '1px solid rgba(31, 60, 136, 0.3)' }}>
                <div className="w-16 h-16 bg-[#1F3C88]/20 rounded-2xl flex items-center justify-center text-[#4F70C4] shadow-lg border border-[#1F3C88]/30 shrink-0">
                    <PieChart size={32} />
                </div>
                <div>
                    <h4 className="font-black text-white text-sm italic">IA Recommendation Insights</h4>
                    <p className="text-[var(--text-secondary)] text-xs leading-relaxed max-w-2xl">
                        El área de <span className="font-bold text-[#E5533D] underline">{errorsByArea[0][0]}</span> presenta la mayor tasa de incidencias críticas.
                        Se sugiere una revisión de procesos técnicos en esta unidad para reducir la carga de soporte reactivo.
                        La categoría <span className="font-bold text-[#1F3C88] underline">{categoryByArea[0]?.category}</span> predomina en el ecosistema actual.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsView;
