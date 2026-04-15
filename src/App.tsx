import { useState, useEffect } from 'react';
import { FileText, Table as TableIcon, HeartPulse } from 'lucide-react';
import FormInput from './components/FormInput';
import Rekapitulasi from './components/Rekapitulasi';

export default function App() {
  const [activeTab, setActiveTab] = useState<'form' | 'rekap'>('form');

  return (
    <div className="min-h-screen bg-[#FFF0F5] text-slate-800 font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-pink-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white p-1 rounded-xl shadow-sm border border-pink-100 flex items-center justify-center overflow-hidden h-10 w-10">
              <img src="https://lh3.googleusercontent.com/d/1YibmCQLufPZ9t5gDx7I7JTLY4m1oymrM" alt="Logo Posbindu" className="h-full w-full object-contain" referrerPolicy="no-referrer" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-pink-900 leading-tight">Posbindu Cendrawasih 1</h1>
              <p className="text-xs text-pink-600/80 font-medium">Sistem Laporan Keuangan Non Subsidi</p>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-pink-50/50 p-1 rounded-xl border border-pink-100">
            <button
              onClick={() => setActiveTab('form')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'form' 
                  ? 'bg-white text-pink-700 shadow-sm border border-pink-100' 
                  : 'text-slate-600 hover:text-pink-600 hover:bg-pink-50'
              }`}
            >
              <FileText size={16} />
              Input Form
            </button>
            <button
              onClick={() => setActiveTab('rekap')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'rekap' 
                  ? 'bg-white text-pink-700 shadow-sm border border-pink-100' 
                  : 'text-slate-600 hover:text-pink-600 hover:bg-pink-50'
              }`}
            >
              <TableIcon size={16} />
              Rekapitulasi
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
        {activeTab === 'form' && <FormInput />}
        {activeTab === 'rekap' && <Rekapitulasi />}
      </main>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-pink-100 flex justify-around p-2 pb-safe z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <button
          onClick={() => setActiveTab('form')}
          className={`flex flex-col items-center gap-1 p-2 w-full rounded-xl transition-colors ${
            activeTab === 'form' ? 'text-pink-600 bg-pink-50' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <FileText size={20} />
          <span className="text-[10px] font-medium">Input</span>
        </button>
        <button
          onClick={() => setActiveTab('rekap')}
          className={`flex flex-col items-center gap-1 p-2 w-full rounded-xl transition-colors ${
            activeTab === 'rekap' ? 'text-pink-600 bg-pink-50' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <TableIcon size={20} />
          <span className="text-[10px] font-medium">Rekap</span>
        </button>
      </nav>
    </div>
  );
}
