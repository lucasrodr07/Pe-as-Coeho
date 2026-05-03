/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Tag as TagIcon, 
  Printer, 
  Search, 
  CheckSquare, 
  Square,
  AlertCircle
} from 'lucide-react';
import { Area, Peca } from '../types';
import { cn, formatDate, getStatus } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const LOGO_BASE64 = "https://i.postimg.cc/SKkDVKVM/logo.png"; // User can replace this with Base64

interface EtiquetasProps {
  areas: Area[];
  pecas: Peca[];
}

export default function Etiquetas({ areas, pecas }: EtiquetasProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [areaFilter, setAreaFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // 1.c. Clear selection when area filter changes to avoid confusion
  useEffect(() => {
    setSelectedIds(new Set());
  }, [areaFilter]);

  const filteredPecas = useMemo(() => {
    return pecas.filter(p => {
      const matchArea = areaFilter === '' || p.areaId === areaFilter;
      const matchSearch = searchTerm === '' || 
        p.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.pecaCoelho.toLowerCase().includes(searchTerm.toLowerCase());
      return matchArea && matchSearch;
    });
  }, [pecas, areaFilter, searchTerm]);

  const selectedPecas = useMemo(() => {
    return pecas.filter(p => selectedIds.has(p.id));
  }, [pecas, selectedIds]);

  const togglePeca = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const selectAll = () => {
    if (selectedIds.size === filteredPecas.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filteredPecas.map(p => p.id)));
  };

  const handlePrint = () => {
    if (selectedPecas.length === 0) return;
    window.print();
  };

  return (
    <div className="space-y-6 pb-20">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Gerador de Etiquetas</h2>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-0.5">Gestão de etiquetas de qualidade e rastreabilidade</p>
        </div>
        <button 
          disabled={selectedPecas.length === 0}
          onClick={handlePrint}
          className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-lg text-[11px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-sm disabled:opacity-30 disabled:shadow-none"
        >
          <Printer className="w-5 h-5 text-white" />
          Imprimir ({selectedPecas.length})
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Selection List */}
        <div className="xl:col-span-4 space-y-4">
          <div className="sleek-card flex flex-col h-[600px] p-0 border-none overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50">
              <span className="kpi-label block mb-4">Seleção de Peças</span>
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Filtrar nesta lista..."
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-100 focus:border-slate-400 transition-all font-semibold placeholder:text-slate-300"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select 
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-100 font-bold text-slate-600 transition-all cursor-pointer"
                  value={areaFilter}
                  onChange={(e) => setAreaFilter(e.target.value)}
                >
                  <option value="">Todas áreas</option>
                  {areas.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
                </select>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
              <button 
                onClick={selectAll}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors text-left group"
              >
                {selectedIds.size === filteredPecas.length && filteredPecas.length > 0 ? (
                  <CheckSquare className="w-5 h-5 text-slate-900" />
                ) : (
                  <Square className="w-5 h-5 text-slate-200 group-hover:text-slate-400" />
                )}
                <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">Selecionar Todos</span>
              </button>

              {filteredPecas.map(p => (
                <button
                  key={p.id}
                  onClick={() => togglePeca(p.id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-lg transition-all border",
                    selectedIds.has(p.id) ? "bg-slate-900 text-white border-slate-900 shadow-md" : "hover:bg-slate-50 border-transparent text-slate-600"
                  )}
                >
                  <div className={cn(
                    "w-5 h-5 rounded flex items-center justify-center transition-colors",
                    selectedIds.has(p.id) ? "bg-white text-slate-900" : "border-2 border-slate-200 group-hover:border-slate-400"
                  )}>
                    {selectedIds.has(p.id) && <CheckSquare className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0 pr-2">
                    <h4 className={cn("text-[11px] font-bold uppercase truncate", selectedIds.has(p.id) ? "text-white" : "text-slate-800")}>{p.pecaCoelho}</h4>
                    <p className={cn("text-[10px] font-medium truncate", selectedIds.has(p.id) ? "text-slate-300" : "text-slate-400")}>{p.nome}</p>
                  </div>
                  <div className={cn("w-1.5 h-1.5 rounded-full", {
                    'bg-emerald-500': getStatus(p.dataProximaValidacao) === 'verde',
                    'bg-amber-500': getStatus(p.dataProximaValidacao) === 'amarelo',
                    'bg-rose-500': getStatus(p.dataProximaValidacao) === 'vermelho',
                  })} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Preview Area */}
        <div className="xl:col-span-8 flex flex-col gap-4 text-center xl:text-left">
          <div className="sleek-card flex-1 p-0 border-none overflow-hidden h-[600px] flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <span className="kpi-label">Pré-visualização</span>
              <span className="sleek-pill">Alta Definição</span>
            </div>

            <div className="flex-1 overflow-y-auto p-8 bg-slate-50/30 space-y-8 custom-scrollbar">
              {selectedPecas.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center gap-4 py-20">
                  <TagIcon className="w-16 h-16 opacity-5" />
                  <p className="text-sm font-bold uppercase tracking-widest text-slate-300">Selecione peças para visualizar<br />as etiquetas de qualidade</p>
                </div>
              ) : (
                selectedPecas.map((p) => (
                  <div key={p.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                    <LabelPair peca={p} />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

        <div id="print-content" className="hidden print:block fixed inset-0 bg-white">
          {selectedPecas.map((p) => (
            <LabelPair key={p.id} peca={p} isPrint={true} />
          ))}
        </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-content, #print-content * { visibility: visible; }
          #print-content { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 210mm; /* A4 width */
            padding: 10mm;
          }
          @page {
            size: A4;
            margin: 0;
          }
        }
        
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
      `}</style>
    </div>
  );
}

const LabelPair: React.FC<{ peca: Peca, isPrint?: boolean }> = ({ peca, isPrint = false }) => {
  return (
    <div className={cn(
      "space-y-4 print:space-y-6",
      isPrint ? "mb-12 page-break-inside-avoid" : "mb-8 last:mb-0" // 2.a. page-break-inside: avoid
    )} style={{ pageBreakInside: 'avoid' }}>
      <Label peca={peca} status="CONFORME" />
      <div className="h-px border-t border-dashed border-gray-300 print:hidden" />
      <Label peca={peca} status="NÃO CONFORME" />
    </div>
  );
}

const Label: React.FC<{ peca: Peca, status: 'CONFORME' | 'NÃO CONFORME' }> = ({ peca, status }) => {
  return (
    <div className="bg-white border-[3px] border-black max-w-[800px] mx-auto overflow-hidden font-sans">
      <div className="flex border-b-[3px] border-black">
        {/* Logo Col */}
        <div className="w-[30%] p-4 flex flex-col items-center justify-center border-r-[3px] border-black">
          <img src={LOGO_BASE64} alt="Company Logo" className="max-w-full h-auto object-contain max-h-[80px]" />
          <span className="text-[10px] font-black mt-2 text-center leading-tight">INSPEÇÃO DE QUALIDADE</span>
        </div>
        
        {/* Content Col */}
        <div className="flex-1 p-0 flex flex-col">
          <div className="p-3 bg-gray-50 border-b-[3px] border-black text-center">
            <h5 className="text-lg font-black uppercase text-black leading-tight">{peca.nome}</h5>
          </div>
          <div className="flex-1">
            <DataRow label="DESCRIÇÃO:" value={peca.descricao} />
            <DataRow label="PEÇA COELHO:" value={peca.pecaCoelho} mono />
            <DataRow label="PART NUMBER:" value={peca.partNumber} mono />
            <DataRow label="DATA VALIDAÇÃO:" value={formatDate(peca.dataValidacao)} />
            <DataRow label="PRÓXIMA VALIDAÇÃO:" value={formatDate(peca.dataProximaValidacao)} />
          </div>
        </div>

        {/* Elaborado Por Col - 2.b. increased width */}
        <div className="w-[14%] flex items-center justify-center border-l-[3px] border-black bg-gray-50">
          <span className="text-[11px] font-black whitespace-nowrap" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
            ELABORADO POR: {peca.elaboradoPor}
          </span>
        </div>
      </div>
      
      {/* Status Footer */}
      <div className={cn(
        "p-2 text-center text-xl font-black text-white uppercase tracking-[0.2em]",
        status === 'CONFORME' ? "bg-green-600" : "bg-red-600"
      )}>
        {status}
      </div>
    </div>
  );
}

const DataRow: React.FC<{ label: string, value: string, mono?: boolean }> = ({ label, value, mono = false }) => {
  return (
    <div className="flex border-b border-black last:border-b-0 hover:bg-gray-50 transition-colors">
      <div className="w-[45%] text-right pr-4 py-1 text-[10px] font-black border-r border-black uppercase bg-gray-50/30">
        {label}
      </div>
      <div className={cn(
        "flex-1 pl-4 py-1 text-[11px] font-bold text-black uppercase",
        mono && "font-mono"
      )}>
        {value || '--'}
      </div>
    </div>
  );
}
