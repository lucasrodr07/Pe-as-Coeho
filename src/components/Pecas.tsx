/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  X,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { Area, Peca } from '../types';
import { addDoc, collection, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { cn, formatDate, getStatus } from '../lib/utils';
import { AnimatePresence, motion } from 'motion/react';

interface PecasProps {
  areas: Area[];
  pecas: Peca[];
  initialSearch?: string;
  initialStatus?: string;
}

export default function Pecas({ areas, pecas, initialSearch = '', initialStatus = '' }: PecasProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPeca, setEditingPeca] = useState<Peca | null>(null);
  const [busy, setBusy] = useState(false);
  
  // Filters & Search
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [areaFilter, setAreaFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const defaultForm = {
    nome: '',
    pecaCoelho: '',
    partNumber: '',
    descricao: '',
    areaId: '',
    elaboradoPor: '',
    dataValidacao: new Date().toISOString().slice(0, 10),
    dataProximaValidacao: (() => {
      const d = new Date();
      d.setFullYear(d.getFullYear() + 1);
      return d.toISOString().slice(0, 10);
    })()
  };

  const [form, setForm] = useState(defaultForm);

  const filteredPecas = useMemo(() => {
    return pecas.filter(p => {
      const matchSearch = searchTerm === '' || 
        p.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.pecaCoelho.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.partNumber.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchArea = areaFilter === '' || p.areaId === areaFilter;
      const matchStatus = statusFilter === '' || getStatus(p.dataProximaValidacao) === statusFilter;
      
      return matchSearch && matchArea && matchStatus;
    });
  }, [pecas, searchTerm, areaFilter, statusFilter]);

  const paginatedPecas = filteredPecas.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const totalPages = Math.ceil(filteredPecas.length / pageSize);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;

    setBusy(true);
    try {
      const data = { 
        ...form, 
        pecaCoelho: form.pecaCoelho.toUpperCase(), 
        partNumber: form.partNumber.toUpperCase(),
        dataCriacao: editingPeca ? editingPeca.dataCriacao : new Date().toISOString()
      };
      
      if (editingPeca) {
        await updateDoc(doc(db, 'pecas', editingPeca.id), data);
      } else {
        await addDoc(collection(db, 'pecas'), data);
      }
      setModalOpen(false);
      setEditingPeca(null);
      setForm(defaultForm);
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(false);
    }
  };

  const openAdd = () => {
    setEditingPeca(null);
    setForm(defaultForm);
    setModalOpen(true);
  };

  const openEdit = (peca: Peca) => {
    setEditingPeca(peca);
    setForm({
      nome: peca.nome,
      pecaCoelho: peca.pecaCoelho,
      partNumber: peca.partNumber,
      descricao: peca.descricao,
      areaId: peca.areaId,
      elaboradoPor: peca.elaboradoPor,
      dataValidacao: peca.dataValidacao,
      dataProximaValidacao: peca.dataProximaValidacao
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir esta peça coelho permanentemente?')) return;
    try {
      await deleteDoc(doc(db, 'pecas', id));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Peças Coelho</h2>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-0.5">Gestão de mestres e amostras de qualidade</p>
        </div>
        <button 
          onClick={openAdd}
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-lg text-[11px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Nova Peça
        </button>
      </div>

      {/* Toolbar */}
      <div className="sleek-card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por nome, código ou Part Number..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-100 focus:border-slate-400 transition-all font-semibold placeholder:text-slate-300"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <div className="flex gap-2">
            <select 
              className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-100 font-bold text-slate-600 cursor-pointer"
              value={areaFilter}
              onChange={(e) => { setAreaFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="">Todas áreas</option>
              {areas.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
            </select>
            <select 
              className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-100 font-bold text-slate-600 cursor-pointer"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="">Todos Status</option>
              <option value="verde">Conforme</option>
              <option value="amarelo">Atenção</option>
              <option value="vermelho">Crítico</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="sleek-card overflow-hidden overflow-x-auto p-0 border-none">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-6 py-4"> <span className="kpi-label">Peça Coelho</span> </th>
              <th className="px-6 py-4"> <span className="kpi-label">P/N</span> </th>
              <th className="px-6 py-4"> <span className="kpi-label">Nome</span> </th>
              <th className="px-6 py-4"> <span className="kpi-label">Área</span> </th>
              <th className="px-6 py-4"> <span className="kpi-label">Status</span> </th>
              <th className="px-6 py-4"> <span className="kpi-label whitespace-nowrap">Prox. Validação</span> </th>
              <th className="px-6 py-4 text-right"> <span className="kpi-label">Ações</span> </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paginatedPecas.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-[11px]">
                  Nenhuma peça encontrada
                </td>
              </tr>
            ) : (
              paginatedPecas.map(p => {
                const status = getStatus(p.dataProximaValidacao);
                const area = areas.find(a => a.id === p.areaId);
                return (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900 text-[11px]">{p.pecaCoelho}</td>
                    <td className="px-6 py-4 font-mono font-bold text-slate-400 text-[11px]">{p.partNumber}</td>
                    <td className="px-6 py-4">
                      <div className="text-[13px] font-bold text-slate-800">{p.nome}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[150px] font-medium leading-relaxed">{p.descricao}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold bg-slate-50 border border-slate-100 px-2 py-1 rounded text-slate-600 uppercase tracking-wide">
                        {area?.nome || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        status === 'verde' ? "bg-emerald-50 text-emerald-600" : status === 'amarelo' ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"
                      )}>
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          status === 'verde' ? "bg-emerald-600" : status === 'amarelo' ? "bg-amber-600" : "bg-rose-600 animate-pulse"
                        )} />
                        {status === 'verde' ? 'Conforme' : status === 'amarelo' ? 'Atenção' : 'Crítico'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[11px] font-bold text-slate-500">
                      {formatDate(p.dataProximaValidacao)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(p)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-900 transition-colors">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(p.id)} className="p-2 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Peça {(currentPage - 1) * pageSize + 1} a {Math.min(currentPage * pageSize, filteredPecas.length)} de {filteredPecas.length}
          </span>
          <div className="flex gap-2">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="p-2 border border-slate-200 rounded-lg disabled:opacity-30 hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            </button>
            <div className="flex items-center px-4 font-bold text-xs text-slate-800">{currentPage}</div>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="p-2 border border-slate-200 rounded-lg disabled:opacity-30 hover:bg-slate-50 transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>
      )}

      {/* Modal Nova Peça */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => !busy && setModalOpen(false)}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="text-base font-bold text-slate-800 uppercase tracking-tight">
                    {editingPeca ? 'Editar Peça Coelho' : 'Nova Peça Coelho'}
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Dados técnicos para rastreabilidade</p>
                </div>
                <button onClick={() => !busy && setModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>
              
              <form onSubmit={handleSave} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1 flex items-center gap-1.5">
                       Nome da Peça <span className="text-rose-500">*</span>
                    </label>
                    <input 
                      required
                      type="text" 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-slate-100 focus:border-slate-400 transition-all placeholder:text-slate-300"
                      placeholder="Ex: Conjunto Farol Bi-LED 2024"
                      value={form.nome}
                      onChange={(e) => setForm({ ...form, nome: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Código Peça Coelho *</label>
                    <input 
                      required
                      type="text" 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold uppercase focus:outline-none focus:ring-2 focus:ring-slate-100 focus:border-slate-400 transition-all font-mono placeholder:text-slate-300"
                      placeholder="Ex: PC-992.X"
                      value={form.pecaCoelho}
                      onChange={(e) => setForm({ ...form, pecaCoelho: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Part Number *</label>
                    <input 
                      required
                      type="text" 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold uppercase focus:outline-none focus:ring-2 focus:ring-slate-100 focus:border-slate-400 transition-all font-mono placeholder:text-slate-300"
                      placeholder="Ex: PN-2023-99-B"
                      value={form.partNumber}
                      onChange={(e) => setForm({ ...form, partNumber: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Área Vinculada *</label>
                    <select 
                      required
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-100 focus:border-slate-400 transition-all cursor-pointer"
                      value={form.areaId}
                      onChange={(e) => setForm({ ...form, areaId: e.target.value })}
                    >
                      <option value="">Selecione...</option>
                      {areas.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Elaborado Por *</label>
                    <input 
                      required
                      type="text" 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-slate-100 focus:border-slate-400 transition-all placeholder:text-slate-300"
                      placeholder="Nome do inspetor/resposável"
                      value={form.elaboradoPor}
                      onChange={(e) => setForm({ ...form, elaboradoPor: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Última Validação *</label>
                    <input 
                      required
                      type="date" 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-slate-100 focus:border-slate-400 transition-all"
                      value={form.dataValidacao}
                      onChange={(e) => setForm({ ...form, dataValidacao: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Próxima Validação *</label>
                    <input 
                      required
                      type="date" 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-slate-100 focus:border-slate-400 transition-all"
                      value={form.dataProximaValidacao}
                      onChange={(e) => setForm({ ...form, dataProximaValidacao: e.target.value })}
                    />
                  </div>

                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Descrição Complementar/Instrução</label>
                    <textarea 
                      rows={3}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-slate-100 focus:border-slate-400 transition-all resize-none placeholder:text-slate-300"
                      placeholder="Notas sobre pontos de inspeção..."
                      value={form.descricao}
                      onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4 border-t border-slate-50">
                  <button 
                    disabled={busy}
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="flex-1 px-4 py-4 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-500 hover:bg-slate-50 transition-all uppercase tracking-widest"
                  >
                    Descartar
                  </button>
                  <button 
                    disabled={busy}
                    type="submit"
                    className="flex-[2] px-4 py-4 bg-slate-900 text-white rounded-lg text-[11px] font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-100 uppercase tracking-widest flex justify-center items-center gap-2"
                  >
                    {busy && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                    Confirmar Registro
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
