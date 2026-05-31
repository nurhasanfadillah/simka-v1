import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api'
import type { ReportHarian } from '@/types/master'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const formatRupiah = (v: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v)

export default function HarianPage() {
  const today = new Date().toISOString().slice(0, 10)
  const [date, setDate] = useState(today)
  const [data, setData] = useState<ReportHarian | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async (d: string) => {
    try {
      setLoading(true)
      setError(null)
      const res = await apiClient.get<ReportHarian>(`/reports/harian?date=${d}`)
      setData(res.data)
    } catch {
      setError('Gagal memuat laporan.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData(date) }, [date])

  const handleExport = (format: 'pdf' | 'excel') => {
    window.open(`/api/reports/harian/export/${format}?date=${date}`, '_blank')
  }

  return (<div className="p-6 animate-fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laporan Harian</h1>
          <p className="text-gray-500 mt-1">Ringkasan transaksi per hari</p>
        </div>
        <div className="flex items-center gap-3">
          <Input type="date" className="w-40" value={date} onChange={e => setDate(e.target.value)} />
          <Button variant="outline" className="border-green-300 text-green-700 hover:bg-green-50" onClick={() => handleExport('excel')}>Excel</Button>
          <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-50" onClick={() => handleExport('pdf')}>PDF</Button>
        </div>
      </div>
      <p className="text-xs italic text-gray-400 mb-4">
        Rekap transaksi pembayaran untuk tanggal tertentu. Pilih tanggal lalu lihat total penerimaan dan daftar transaksi hari itu. Gunakan tombol Export untuk mencetak atau menyimpan laporan.
      </p>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm mb-6">{error}</div>}

      {data && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
            <p className="text-sm text-gray-500">Total Penerimaan</p>
            <p className="text-2xl font-bold tabular-nums text-accent mt-1">{formatRupiah(data.totalPenerimaan)}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
            <p className="text-sm text-gray-500">Jumlah Transaksi</p>
            <p className="text-2xl font-bold tabular-nums text-gray-900 mt-1">{data.jumlahTransaksi}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto hover:shadow-md transition-shadow duration-200">
        <table>
          <thead>
            <tr>
              {['No. Transaksi', 'Siswa', 'NIS', 'Nominal', 'Status', 'Tanggal'].map(col => (
                <th key={col} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i}><td colSpan={6} className="px-6 py-4"><div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" /><div className="mt-2 h-4 bg-gray-200 rounded animate-pulse w-1/2" /></td></tr>
              ))
            ) : !data || data.transactions.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-400">Tidak ada transaksi</td></tr>
            ) : (
              data.transactions.map(tx => (
                <tr key={tx.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-mono tabular-nums text-gray-700">{tx.transactionNumber}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-800">{tx.studentName}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{tx.nis}</td>
                  <td className="px-6 py-4 text-sm font-semibold tabular-nums text-accent">{formatRupiah(tx.totalAmount)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${tx.status === 'aktif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(tx.createdAt).toLocaleDateString('id-ID')}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
