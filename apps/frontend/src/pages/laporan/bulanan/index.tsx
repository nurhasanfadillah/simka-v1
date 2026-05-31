import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api'
import type { ReportBulanan } from '@/types/master'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const formatRupiah = (v: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v)

const MONTHS = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

export default function BulananPage() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [data, setData] = useState<ReportBulanan | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await apiClient.get<ReportBulanan>(`/reports/bulanan?month=${month}&year=${year}`)
      setData(res.data)
    } catch {
      setError('Gagal memuat laporan.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [month, year])

  const handleExport = (format: 'pdf' | 'excel') => {
    window.open(`/api/reports/bulanan/export/${format}?month=${month}&year=${year}`, '_blank')
  }

  return (<div className="p-6 animate-fade-in-up">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laporan Bulanan</h1>
          <p className="text-gray-500 mt-1">Ringkasan transaksi per bulan</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Pilih bulan" />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((m, i) => i > 0 && <SelectItem key={i} value={String(i)}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Pilih tahun" />
            </SelectTrigger>
            <SelectContent>
              {[year - 2, year - 1, year, year + 1, year + 2].map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" className="border-green-300 text-green-700 hover:bg-green-50" onClick={() => handleExport('excel')}>Excel</Button>
          <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-50" onClick={() => handleExport('pdf')}>PDF</Button>
        </div>
      </div>
      <p className="text-xs italic text-gray-400 mb-4">
        Rekap transaksi per hari dalam satu bulan. Pilih bulan dan tahun untuk melihat total penerimaan dan rinciannya. Gunakan tombol Export untuk mencetak atau menyimpan laporan.
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
              {['Tanggal', 'Penerimaan', 'Jumlah Transaksi'].map(col => (
                <th key={col} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i}><td colSpan={3} className="px-6 py-4"><div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" /><div className="mt-2 h-4 bg-gray-200 rounded animate-pulse w-1/2" /></td></tr>
              ))
            ) : !data || data.perHari.length === 0 ? (
              <tr><td colSpan={3} className="px-6 py-8 text-center text-sm text-gray-400">Tidak ada data</td></tr>
            ) : (
              data.perHari.map((d, i) => (
                <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-800 font-medium">{new Date(d.date).toLocaleDateString('id-ID')}</td>
                  <td className="px-6 py-4 text-sm font-semibold tabular-nums text-accent">{formatRupiah(d.totalPenerimaan)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{d.jumlahTransaksi}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
