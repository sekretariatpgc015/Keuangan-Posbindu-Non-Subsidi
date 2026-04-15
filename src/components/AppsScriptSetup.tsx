import React, { useState } from 'react';
import { Code2, Copy, CheckCircle2, Save, ExternalLink, AlertCircle } from 'lucide-react';

interface AppsScriptSetupProps {
  scriptUrl: string;
  onSaveUrl: (url: string) => void;
}

export default function AppsScriptSetup({ scriptUrl, onSaveUrl }: AppsScriptSetupProps) {
  const [inputUrl, setInputUrl] = useState(scriptUrl);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const appsScriptCode = `function doPost(e) {
  try {
    // Membuka sheet aktif, pastikan nama sheet sesuai atau gunakan index 0
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    
    // Mengambil data dari request
    var tanggal = e.parameter.tanggal;
    var uraian = e.parameter.uraian;
    var jenis = e.parameter.jenis;
    var jumlah = parseFloat(e.parameter.jumlah);
    
    // Menentukan kolom pemasukan atau pengeluaran
    var pemasukan = jenis === 'Pemasukan' ? jumlah : '';
    var pengeluaran = jenis === 'Pengeluaran' ? jumlah : '';
    
    // Menambahkan baris baru ke Google Sheet
    sheet.appendRow([tanggal, uraian, pemasukan, pengeluaran]);
    
    // Mengembalikan response sukses
    return ContentService.createTextOutput(JSON.stringify({"status": "success", "message": "Data berhasil ditambahkan"}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    // Mengembalikan response error
    return ContentService.createTextOutput(JSON.stringify({"status": "error", "message": error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(appsScriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveUrl(inputUrl);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-pink-900">Setup Integrasi Google Sheet</h2>
        <p className="text-sm text-pink-600/80 mt-1">Ikuti langkah-langkah di bawah ini untuk menghubungkan form dengan Google Sheet Anda.</p>
      </div>

      {/* Step 1: URL Input */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-pink-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-pink-100 text-pink-600 w-8 h-8 rounded-full flex items-center justify-center font-bold">1</div>
          <h3 className="text-lg font-bold text-slate-800">Masukkan URL Web App</h3>
        </div>
        
        <p className="text-sm text-slate-600 mb-4">
          Jika Anda sudah melakukan deploy Apps Script, masukkan URL Web App di sini agar form dapat mengirim data.
        </p>

        <form onSubmit={handleSave} className="flex flex-col sm:flex-row gap-3">
          <input
            type="url"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="https://script.google.com/macros/s/.../exec"
            className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-200 focus:border-pink-400 transition-colors text-sm"
          />
          <button
            type="submit"
            className="flex items-center justify-center gap-2 bg-pink-500 hover:bg-pink-600 text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-sm shadow-pink-200 whitespace-nowrap"
          >
            {saved ? (
              <>
                <CheckCircle2 size={18} />
                Tersimpan
              </>
            ) : (
              <>
                <Save size={18} />
                Simpan URL
              </>
            )}
          </button>
        </form>
      </div>

      {/* Step 2: Apps Script Code */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-pink-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-pink-100 text-pink-600 w-8 h-8 rounded-full flex items-center justify-center font-bold">2</div>
          <h3 className="text-lg font-bold text-slate-800">Deploy Google Apps Script</h3>
        </div>

        <div className="space-y-4 text-sm text-slate-600">
          <p>Jika Anda belum memiliki URL Web App, ikuti panduan ini:</p>
          <ol className="list-decimal list-inside space-y-2 ml-2">
            <li>Buka Google Sheet Anda.</li>
            <li>Klik menu <strong>Ekstensi</strong> &gt; <strong>Apps Script</strong>.</li>
            <li>Hapus semua kode yang ada, lalu paste kode di bawah ini.</li>
            <li>Klik <strong>Simpan</strong> (ikon disket).</li>
            <li>Klik tombol <strong>Terapkan (Deploy)</strong> &gt; <strong>Deployment baru</strong>.</li>
            <li>Pilih jenis <strong>Aplikasi Web</strong>.</li>
            <li>Set "Akses" menjadi <strong>Siapa saja (Anyone)</strong>.</li>
            <li>Klik <strong>Terapkan</strong> dan berikan izin otorisasi jika diminta.</li>
            <li>Salin <strong>URL Aplikasi Web</strong> dan paste ke form di Langkah 1 atas.</li>
          </ol>
        </div>

        <div className="mt-6 relative">
          <div className="absolute top-0 right-0 p-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            >
              {copied ? (
                <>
                  <CheckCircle2 size={14} />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={14} />
                  Copy Code
                </>
              )}
            </button>
          </div>
          <div className="bg-slate-900 rounded-xl p-4 overflow-x-auto border border-slate-800">
            <pre className="text-slate-300 text-sm font-mono leading-relaxed">
              <code>{appsScriptCode}</code>
            </pre>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 flex items-start gap-4">
        <AlertCircle className="text-blue-500 shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-semibold mb-1">Catatan Keamanan</p>
          <p>
            Aplikasi ini berjalan sepenuhnya di browser Anda. URL Apps Script disimpan secara lokal di perangkat Anda (Local Storage) dan tidak dikirim ke server lain.
          </p>
        </div>
      </div>
    </div>
  );
}
