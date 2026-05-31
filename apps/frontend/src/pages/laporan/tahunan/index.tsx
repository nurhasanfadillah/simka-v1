import { useEffect, useState } from 'react'
import { CalendarDays } from 'lucide-react'
import { apiClient } from '@/lib/api'
import type { ReportTahunan, SchoolYear } from '@/types/master'
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

const MONTH_NAMES = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

export default function TahunanPage() {
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([])
  const [selectedYearId, setSelectedYearId] = useState('')
  const [data, setData] = useState<ReportTahunan | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    apiClient.get<SchoolYear[]>('/master/school-years').then(r => setSchoolYears(r.data)).catch(() => {})
  }, [])

  const fetchData = async (id: string) => {
    if (!id) return
    try {
      setLoading(true)
      setError(null)
      const res = await apiClient.get<ReportTahunan>(`/reports/tahunan?schoolYearId=${id}`)
      setData(res.data)
    } catch {
      setError('Gagal memuat laporan.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData(selectedYearId) }, [selectedYearId])

  const handleExport = (format: 'pdf' | 'excel') => {
    if (selectedYearId) window.open(`/api/reports/tahunan/export/${format}?schoolYearId=${selectedYearId}`, '_blank')
  }

  return (<div className="p-6 animate-fade-in-up">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laporan Tahunan</h1>
          <p className="text-gray-500 mt-1">Ringkasan transaksi per tahun ajaran</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedYearId} onValueChange={setSelectedYearId}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Pilih Tahun Ajaran" />
            </SelectTrigger>
            <SelectContent>
              {schoolYears.map(y => <SelectItem key={y.id} value={String(y.id)}>{y.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" className="border-green-300 text-green-700 hover:bg-green-50" disabled={!selectedYearId} onClick={() => handleExport('excel')}>Excel</Button>
          <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-50" disabled={!selectedYearId} onClick={() => handleExport('pdf')}>PDF</Button>
        </div>
      </div>
      <p className="text-xs italic text-gray-400 mb-4">
        Rekap transaksi per bulan dalam satu tahun ajaran. Pilih tahun ajaran untuk melihat tren penerimaan bulanan. Gunakan tombol Export untuk mencetak atau menyimpan laporan.
      </p>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm mb-6">{error}</div>}

      {!selectedYearId && !loading && (
        <div className="text-center py-12 text-gray-400">
          <CalendarDays className="mx-auto mb-3 size-8 text-gray-300" />
          <p>Pilih tahun ajaran untuk melihat laporan</p>
        </div>
      )}

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
              {['Bulan', 'Penerimaan', 'Jumlah Transaksi'].map(col => (
                <th key={col} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={3} className="px-6 py-4"><div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" /><div className="mt-2 h-4 bg-gray-200 rounded animate-pulse w-1/2" /></td></tr>
              ))
            ) : !data || data.perBulan.length === 0 ? (
              <tr><td colSpan={3} className="px-6 py-8 text-center text-sm text-gray-400">Tidak ada data</td></tr>
            ) : (
              data.perBulan.map((d, i) => (
                <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-800 font-medium">{MONTH_NAMES[d.month]} {d.year}</td>
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
