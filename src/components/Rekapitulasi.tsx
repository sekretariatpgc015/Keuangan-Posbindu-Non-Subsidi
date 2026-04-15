import { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import { Download, RefreshCw, TrendingUp, TrendingDown, Wallet, AlertCircle, Filter, ExternalLink, History } from 'lucide-react';

interface Transaction {
  Tanggal: string;
  Uraian: string;
  Pemasukan: number;
  Pengeluaran: number;
  // Internal use for filtering
  _monthYear: string; 
}

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQyzEsF5z1vS5kIGxQnrMG-kycNWZufQTcSpGm7beB6MM9ItGg_SUTmlSB6Bl_XoPqSHfVoiCfeaUWu/pub?gid=0&single=true&output=csv';
const GSHEET_URL = 'https://docs.google.com/spreadsheets/d/1AyYWH024NcZs-XAUinM35_3Tgb4QNGnfNd9pQ4-Ofu0/edit?gid=0#gid=0';

export default function Rekapitulasi() {
  const [data, setData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  const fetchData = () => {
    setLoading(true);
    setError(null);

    Papa.parse(CSV_URL, {
      download: true,
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      complete: (results) => {
        try {
          const parsedData: Transaction[] = results.data.map((row: any) => {
            // Clean up numbers (remove commas, spaces, currency symbols if any)
            const cleanNumber = (val: string) => {
              if (!val) return 0;
              // Remove "Rp", spaces, and dots (thousand separators)
              let cleaned = val.toString().replace(/Rp/gi, '').replace(/\s/g, '');
              cleaned = cleaned.replace(/\./g, '').replace(/,/g, '.');
              return parseFloat(cleaned) || 0;
            };

            // Format tanggal ke dd/mm/yyyy
            let formattedDate = row.Tanggal || '';
            let monthYear = '';
            
            if (formattedDate) {
              // Jika formatnya yyyy-mm-dd
              if (formattedDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
                const [year, month, day] = formattedDate.split('-');
                formattedDate = `${day}/${month}/${year}`;
                monthYear = `${year}-${month}`;
              } 
              // Jika formatnya d/m/yyyy atau m/d/yyyy dari Google Sheet
              else if (formattedDate.includes('/')) {
                const parts = formattedDate.split('/');
                if (parts.length === 3) {
                  const p1 = parts[0].padStart(2, '0');
                  const p2 = parts[1].padStart(2, '0');
                  const p3 = parts[2];
                  if (p3.length === 4) {
                    formattedDate = `${p1}/${p2}/${p3}`;
                    // Assuming format is dd/mm/yyyy
                    monthYear = `${p3}-${p2}`;
                  }
                }
              }
            }

            return {
              Tanggal: formattedDate,
              Uraian: row.Uraian || '',
              Pemasukan: cleanNumber(row.Pemasukan),
              Pengeluaran: cleanNumber(row.Pengeluaran),
              _monthYear: monthYear
            };
          }).filter(item => item.Tanggal || item.Uraian || item.Pemasukan > 0 || item.Pengeluaran > 0);

          setData(parsedData);
          setLoading(false);
        } catch (err: any) {
          console.error("Error parsing data:", err);
          setError("Gagal memproses data dari Google Sheet.");
          setLoading(false);
        }
      },
      error: (err: any) => {
        console.error("Error fetching CSV:", err);
        setError("Gagal mengambil data. Pastikan link Google Sheet benar dan dipublikasikan.");
        setLoading(false);
      }
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Get unique months for filter dropdown
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    data.forEach(item => {
      if (item._monthYear) {
        months.add(item._monthYear);
      }
    });
    
    // Sort descending (newest first)
    return Array.from(months).sort().reverse().map(my => {
      const [year, month] = my.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1);
      const monthName = date.toLocaleString('id-ID', { month: 'long' });
      return {
        value: my,
        label: `${monthName} ${year}`
      };
    });
  }, [data]);

  // Filter data based on selected month
  const filteredData = useMemo(() => {
    if (selectedMonth === 'all') return data;
    return data.filter(item => item._monthYear === selectedMonth);
  }, [data, selectedMonth]);

  // Calculate summary based on filtered data
  const summary = useMemo(() => {
    const totalIn = filteredData.reduce((acc, curr) => acc + curr.Pemasukan, 0);
    const totalOut = filteredData.reduce((acc, curr) => acc + curr.Pengeluaran, 0);
    
    // Hitung saldo bulan lalu (akumulasi saldo sebelum bulan yang dipilih)
    let saldoBulanLalu = 0;
    if (selectedMonth !== 'all') {
      const priorData = data.filter(item => item._monthYear < selectedMonth);
      const priorIn = priorData.reduce((acc, curr) => acc + curr.Pemasukan, 0);
      const priorOut = priorData.reduce((acc, curr) => acc + curr.Pengeluaran, 0);
      saldoBulanLalu = priorIn - priorOut;
    }

    return {
      totalPemasukan: totalIn,
      totalPengeluaran: totalOut,
      saldo: totalIn - totalOut,
      saldoBulanLalu: saldoBulanLalu
    };
  }, [filteredData, data, selectedMonth]);

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-pink-900">Rekapitulasi Keuangan</h2>
          <p className="text-sm text-pink-600/80 mt-1">Data terintegrasi langsung dari Google Sheet.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Month Filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-4 w-4 text-pink-400" />
            </div>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="block w-full sm:w-auto pl-9 pr-8 py-2 border border-pink-200 rounded-xl bg-white text-sm font-medium text-slate-700 focus:ring-2 focus:ring-pink-200 focus:border-pink-400 appearance-none cursor-pointer shadow-sm"
            >
              <option value="all">Semua Bulan</option>
              {availableMonths.map(month => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-white border border-pink-200 text-pink-700 px-4 py-2 rounded-xl hover:bg-pink-50 transition-colors shadow-sm disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            <span className="text-sm font-medium">Muat Ulang</span>
          </button>

          <a
            href={GSHEET_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-pink-500 text-white px-4 py-2 rounded-xl hover:bg-pink-600 transition-colors shadow-sm shadow-pink-200"
          >
            <ExternalLink size={16} />
            <span className="text-sm font-medium">Buka G-Sheet</span>
          </a>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <History size={64} className="text-blue-500" />
          </div>
          <p className="text-sm font-medium text-blue-600/80 mb-1">Saldo Bulan Lalu</p>
          <h3 className="text-2xl font-bold text-blue-700">{formatRupiah(summary.saldoBulanLalu)}</h3>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <TrendingUp size={64} className="text-emerald-500" />
          </div>
          <p className="text-sm font-medium text-emerald-600/80 mb-1">Total Pemasukan</p>
          <h3 className="text-2xl font-bold text-emerald-700">{formatRupiah(summary.totalPemasukan)}</h3>
        </div>
        
        <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <TrendingDown size={64} className="text-rose-500" />
          </div>
          <p className="text-sm font-medium text-rose-600/80 mb-1">Total Pengeluaran</p>
          <h3 className="text-2xl font-bold text-rose-700">{formatRupiah(summary.totalPengeluaran)}</h3>
        </div>
        
        <div className="bg-gradient-to-br from-pink-500 to-pink-600 p-5 rounded-2xl border border-pink-400 shadow-sm shadow-pink-200 relative overflow-hidden text-white">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <Wallet size={64} />
          </div>
          <p className="text-sm font-medium text-pink-100 mb-1">Saldo Akhir</p>
          <h3 className="text-2xl font-bold">{formatRupiah(summary.saldo + summary.saldoBulanLalu)}</h3>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-rose-50 text-rose-700 rounded-xl flex items-start gap-3 border border-rose-100">
          <AlertCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-pink-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-pink-50/50 border-b border-pink-100 text-sm font-semibold text-pink-900">
                <th className="p-4 whitespace-nowrap">Tanggal</th>
                <th className="p-4">Uraian</th>
                <th className="p-4 text-right whitespace-nowrap">Pemasukan</th>
                <th className="p-4 text-right whitespace-nowrap">Pengeluaran</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <RefreshCw size={24} className="animate-spin text-pink-400" />
                      <p>Memuat data dari Google Sheet...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">
                    Belum ada data transaksi{selectedMonth !== 'all' ? ' di bulan ini' : ''}.
                  </td>
                </tr>
              ) : (
                filteredData.map((row, index) => (
                  <tr key={index} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 text-slate-600 whitespace-nowrap">{row.Tanggal}</td>
                    <td className="p-4 text-slate-800 font-medium">{row.Uraian}</td>
                    <td className="p-4 text-right text-emerald-600 font-medium whitespace-nowrap">
                      {row.Pemasukan > 0 ? formatRupiah(row.Pemasukan) : '-'}
                    </td>
                    <td className="p-4 text-right text-rose-600 font-medium whitespace-nowrap">
                      {row.Pengeluaran > 0 ? formatRupiah(row.Pengeluaran) : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
