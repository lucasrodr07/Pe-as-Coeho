/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Map, 
  CircleDot, 
  Tag as TagIcon, 
  Menu, 
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from './lib/firebase';
import { Area, Peca } from './types';
import { cn } from './lib/utils';

// Pages
import Dashboard from './components/Dashboard';
import Areas from './components/Areas';
import Pecas from './components/Pecas';
import Etiquetas from './components/Etiquetas';

export default function App() {
  const [activePage, setActivePage] = useState<'dashboard' | 'areas' | 'pecas' | 'etiquetas'>('dashboard');
  const [pecasFilter, setPecasFilter] = useState({ search: '', status: '' });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const [areas, setAreas] = useState<Area[]>([]);
  const [pecas, setPecas] = useState<Peca[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const qAreas = query(collection(db, 'areas'), orderBy('dataCriacao', 'desc'));
    const unsubAreas = onSnapshot(qAreas, (snap) => {
      setAreas(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Area)));
    });

    const qPecas = query(collection(db, 'pecas'), orderBy('dataCriacao', 'desc'));
    const unsubPecas = onSnapshot(qPecas, (snap) => {
      setPecas(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Peca)));
      setLoading(false);
    });

    return () => {
      unsubAreas();
      unsubPecas();
    };
  }, []);

  const navigateToPecas = (filter?: { search?: string, status?: string }) => {
    if (filter) {
      setPecasFilter({
        search: filter.search || '',
        status: filter.status || ''
      });
    } else {
      setPecasFilter({ search: '', status: '' });
    }
    setActivePage('pecas');
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'areas', label: 'Áreas', icon: Map, badge: areas.length },
    { id: 'pecas', label: 'Peças Coelho', icon: CircleDot, badge: pecas.length },
    { id: 'etiquetas', label: 'Etiquetas', icon: TagIcon },
  ];

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-900 font-sans selection:bg-slate-200 selection:text-brand">
      {/* Sidebar - Updated to white background with slate navigation */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transition-transform duration-300 lg:translate-x-0",
          !sidebarOpen && "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center text-white font-black text-xs">
              PC
            </div>
            <div className="flex flex-col">
              <span className="text-[14px] font-bold text-slate-900 leading-tight">PEÇAS <span className="text-slate-400">COELHO</span></span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">Gestão Industrial</span>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto py-4">
            <div className="px-6 mb-4">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Navegação</h3>
            </div>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActivePage(item.id as any);
                  if (item.id === 'pecas') setPecasFilter({ search: '', status: '' });
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-6 py-3 text-sm font-semibold transition-all group",
                  activePage === item.id 
                    ? "bg-slate-50 text-brand" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-brand"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5 flex-shrink-0 transition-colors",
                  activePage === item.id ? "text-brand" : "text-slate-400 group-hover:text-brand"
                )} />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="ml-auto bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-md min-w-[20px] text-center border border-slate-200">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div className="p-6 border-t border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
            v2.4.0 • Industrial Analytics
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className={cn(
        "flex-1 flex flex-col transition-all duration-300",
        sidebarOpen ? "lg:ml-64" : "ml-0"
      )}>
        {/* Topbar - Styled as per the Dark Header in Design HTML */}
        <header className="h-[60px] bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 sticky top-0 z-40 text-white">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-800 rounded-lg lg:hidden"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-3">
              <span className="font-bold text-base tracking-tight uppercase">
                PEÇAS <span className="text-slate-400">COELHO</span>
              </span>
              <span className="hidden sm:inline w-1 h-4 bg-slate-700 rounded-full mx-1"></span>
              <div className="hidden sm:flex flex-col leading-none">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Industrial Analytics</span>
                <h1 className="text-xs font-bold text-white capitalize opacity-80">{activePage}</h1>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
             <div className="text-right hidden sm:block">
                <div className="text-[11px] font-bold text-white">Gestor de Qualidade</div>
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                </div>
             </div>
             <div className="w-10 h-10 bg-slate-800 border border-slate-700 rounded flex items-center justify-center text-[10px] text-slate-400 font-bold">
               LOGO
             </div>
          </div>
        </header>

        <div className="p-6 overflow-y-auto bg-slate-100">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activePage === 'dashboard' && (
                <Dashboard 
                  areas={areas} 
                  pecas={pecas} 
                  loading={loading} 
                  onNavigate={navigateToPecas}
                />
              )}
              {activePage === 'areas' && <Areas areas={areas} pecas={pecas} />}
              {activePage === 'pecas' && (
                <Pecas 
                  areas={areas} 
                  pecas={pecas} 
                  initialSearch={pecasFilter.search}
                  initialStatus={pecasFilter.status}
                />
              )}
              {activePage === 'etiquetas' && <Etiquetas areas={areas} pecas={pecas} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
