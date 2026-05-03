/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Map,
  X,
  Search
} from 'lucide-react';
import { Area, Peca } from '../types';
import { addDoc, collection, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { cn, formatDate } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface AreasProps {
  areas: Area[];
  pecas: Peca[];
}

export default function Areas({ areas, pecas }: AreasProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<Area | null>(null);
  const [form, setForm] = useState({ nome: '', descricao: '' });
  const [busy, setBusy] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAreas = areas.filter(a => 
    a.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome || busy) return;

    setBusy(true);
    try {
      if (editingArea) {
        await updateDoc(doc(db, 'areas', editingArea.id), {
          nome: form.nome,
          descricao: form.descricao
        });
      } else {
        await addDoc(collection(db, 'areas'), {
          nome: form.nome,
          descricao: form.descricao,
          dataCriacao: new Date().toISOString().slice(0, 10)
        });
      }
      setModalOpen(false);
      setEditingArea(null);
      setForm({ nome: '', descricao: '' });
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta área?')) return;
    try {
      await deleteDoc(doc(db, 'areas', id));
    } catch (e) {
      console.error(e);
    }
  };

  const openEdit = (area: Area) => {
    setEditingArea(area);
    setForm({ nome: area.nome, descricao: area.descricao || '' });
    setModalOpen(true);
  };

  return (    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Áreas de Trabalho</h2>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-0.5">Gestão de setores e linhas de produção</p>
        </div>
        <button 
          onClick={() => { setEditingArea(null); setForm({ nome: '', descricao: '' }); setModalOpen(true); }}
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-lg text-[11px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Nova Área
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar por nome ou descrição..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-100 focus:border-slate-400 transition-all font-semibold"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAreas.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-xl border border-dashed border-slate-200">
            <Map className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Nenhuma área encontrada</p>
          </div>
        ) : (
          filteredAreas.map(area => {
            const count = pecas.filter(p => p.areaId === area.id).length;
            return (
              <div key={area.id} className="sleek-card cursor-default group">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-slate-50 p-2 rounded-lg group-hover:bg-slate-100 transition-colors border border-slate-100">
                    <Map className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(area)} className="p-1.5 hover:bg-slate-50 rounded-md text-slate-400 hover:text-slate-900 transition-colors">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(area.id)} className="p-1.5 hover:bg-rose-50 rounded-md text-slate-400 hover:text-rose-600 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <h3 className="text-[15px] font-bold text-slate-800 mb-1 leading-tight">{area.nome}</h3>
                <p className="text-[12px] text-slate-400 line-clamp-2 min-h-[32px] mb-4 font-medium leading-relaxed">{area.descricao || 'Sem descrição cadastrada.'}</p>
                
                <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-auto">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{formatDate(area.dataCriacao)}</span>
                  <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    <span className="text-[10px] font-bold text-slate-600">{count} Peças</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Reusable Structure */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setModalOpen(false)}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-base font-bold text-slate-800 uppercase tracking-tight">
                  {editingArea ? 'Editar Área' : 'Nova Área'}
                </h3>
                <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <form onSubmit={handleSave} className="p-6 space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Nome da Área *</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-slate-100 focus:border-slate-400 transition-all placeholder:text-slate-300"
                    placeholder="Ex: Montagem Final - Linha A"
                    value={form.nome}
                    onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Descrição</label>
                  <textarea 
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-slate-100 focus:border-slate-400 transition-all resize-none placeholder:text-slate-300"
                    placeholder="Opcional: detalhes da área..."
                    value={form.descricao}
                    onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="flex-1 px-4 py-3 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-500 hover:bg-slate-50 transition-colors uppercase tracking-widest"
                  >
                    Cancelar
                  </button>
                  <button 
                    disabled={busy}
                    type="submit"
                    className="flex-1 px-4 py-3 bg-slate-900 text-white rounded-lg text-[11px] font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-100 uppercase tracking-widest flex justify-center items-center gap-2"
                  >
                    {busy && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                    Salvar
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
