import React, { useState } from 'react';
import { Calendar, FileText, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxWXP4dBLbEKvmf2fzgmRY0SOJ8E3phRQ-k2u1aYWSbRIq56WtxfuHjo8Ux9Y3QDBjL/exec';

export default function FormInput() {
  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    uraian: '',
    jenis: 'Pemasukan',
    jumlah: ''
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setStatus('submitting');
    
    try {
      // Using URLSearchParams to send data as application/x-www-form-urlencoded
      // This avoids CORS preflight issues with Google Apps Script
      const params = new URLSearchParams();
      
      // Format tanggal dari yyyy-mm-dd menjadi dd/mm/yyyy
      const [year, month, day] = formData.tanggal.split('-');
      const formattedDate = `${day}/${month}/${year}`;
      
      params.append('tanggal', formattedDate);
      params.append('uraian', formData.uraian);
      params.append('jenis', formData.jenis);
      params.append('jumlah', formData.jumlah);

      const response = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        body: params,
      });

      const result = await response.json();

      if (result.status === 'success') {
        setStatus('success');
        setFormData(prev => ({
          ...prev,
          uraian: '',
          jumlah: ''
        }));
        setTimeout(() => setStatus('idle'), 3000);
      } else {
        throw new Error(result.message || 'Terjadi kesalahan saat menyimpan data');
      }
    } catch (error: any) {
      console.error('Error submitting form:', error);
      setStatus('error');
      setErrorMessage(error.message || 'Gagal terhubung ke server. Pastikan URL Web App benar.');
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-pink-100 overflow-hidden">
        <div className="bg-pink-50/50 p-6 border-b border-pink-100">
          <h2 className="text-xl font-bold text-pink-900">Input Transaksi Baru</h2>
          <p className="text-sm text-pink-600/80 mt-1">Masukkan detail pemasukan atau pengeluaran kas Posbindu.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Tanggal */}
          <div className="space-y-2">
            <label htmlFor="tanggal" className="block text-sm font-medium text-slate-700">Tanggal</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-pink-400" />
              </div>
              <input
                type="date"
                id="tanggal"
                name="tanggal"
                required
                value={formData.tanggal}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-200 focus:border-pink-400 transition-colors text-sm"
              />
            </div>
          </div>

          {/* Uraian */}
          <div className="space-y-2">
            <label htmlFor="uraian" className="block text-sm font-medium text-slate-700">Uraian / Keterangan</label>
            <div className="relative">
              <div className="absolute top-3 left-3 pointer-events-none">
                <FileText className="h-5 w-5 text-pink-400" />
              </div>
              <textarea
                id="uraian"
                name="uraian"
                required
                rows={3}
                value={formData.uraian}
                onChange={handleChange}
                placeholder="Contoh: Iuran anggota bulan Maret"
                className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-200 focus:border-pink-400 transition-colors text-sm resize-none"
              />
            </div>
          </div>

          {/* Jenis Transaksi */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Jenis Transaksi</label>
            <div className="grid grid-cols-2 gap-3">
              <label className={`
                relative flex items-center justify-center p-3 border rounded-xl cursor-pointer transition-all
                ${formData.jenis === 'Pemasukan' 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm' 
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}
              `}>
                <input
                  type="radio"
                  name="jenis"
                  value="Pemasukan"
                  checked={formData.jenis === 'Pemasukan'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <span className="text-sm font-semibold">Pemasukan</span>
              </label>
              
              <label className={`
                relative flex items-center justify-center p-3 border rounded-xl cursor-pointer transition-all
                ${formData.jenis === 'Pengeluaran' 
                  ? 'bg-rose-50 border-rose-200 text-rose-700 shadow-sm' 
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}
              `}>
                <input
                  type="radio"
                  name="jenis"
                  value="Pengeluaran"
                  checked={formData.jenis === 'Pengeluaran'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <span className="text-sm font-semibold">Pengeluaran</span>
              </label>
            </div>
          </div>

          {/* Jumlah */}
          <div className="space-y-2">
            <label htmlFor="jumlah" className="block text-sm font-medium text-slate-700">Jumlah (Rp)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-pink-400 font-bold text-sm">Rp</span>
              </div>
              <input
                type="number"
                id="jumlah"
                name="jumlah"
                required
                min="0"
                step="1"
                value={formData.jumlah}
                onChange={handleChange}
                placeholder="0"
                className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-200 focus:border-pink-400 transition-colors text-sm font-medium"
              />
            </div>
          </div>

          {/* Alerts */}
          {status === 'success' && (
            <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl flex items-start gap-3 border border-emerald-100">
              <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-sm font-medium">Data berhasil disimpan ke Google Sheet!</p>
            </div>
          )}

          {status === 'error' && (
            <div className="p-4 bg-rose-50 text-rose-700 rounded-xl flex items-start gap-3 border border-rose-100">
              <AlertCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{errorMessage}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={status === 'submitting'}
            className="w-full flex items-center justify-center gap-2 bg-pink-500 hover:bg-pink-600 text-white py-3 px-4 rounded-xl font-semibold transition-all shadow-sm shadow-pink-200 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {status === 'submitting' ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                Simpan Transaksi
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
