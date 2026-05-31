import { useEffect, useState, useCallback } from 'react'
import { apiClient } from '@/lib/api'
import type { ReportRekapPos, SchoolYear } from '@/types/master'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const formatRupiah = (v: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v)

export default function RekapPosPage() {
  const [data, setData] = useState<ReportRekapPos | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([])
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [filterSchoolYearId, setFilterSchoolYearId] = useState('')

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const params: Record<string, string> = {}
      if (dateFrom) params.dateFrom = dateFrom
      if (dateTo) params.dateTo = dateTo
      if (filterSchoolYearId) params.schoolYearId = filterSchoolYearId
      const res = await apiClient.get<ReportRekapPos>('/reports/rekap-pos', { params })
      setData(res.data)
    } catch {
      setError('Gagal memuat rekap POS.')
    } finally {
      setLoading(false)
    }
  }, [dateFrom, dateTo, filterSchoolYearId])

  useEffect(() => { fetchData() }, [fetchData])

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const res = await apiClient.get<SchoolYear[]>('/master/school-years')
        setSchoolYears(res.data)
      } catch { /* non-blocking */ }
    }
    fetchDropdowns()
  }, [])

  const handleExport = (format: 'pdf' | 'excel') => {
    const params = new URLSearchParams()
    if (dateFrom) params.set('dateFrom', dateFrom)
    if (dateTo) params.set('dateTo', dateTo)
    if (filterSchoolYearId) params.set('schoolYearId', filterSchoolYearId)
    window.open(`/api/reports/rekap-pos/export/${format}?${params.toString()}`, '_blank')
  }

  return (<div className="p-6 animate-fade-in-up">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rekap POS</h1>
          <p className="text-gray-500 mt-1">Rekap penerimaan per pos pembayaran</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap gap-y-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Dari</label>
            <Input type="date" className="w-36" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Sampai</label>
            <Input type="date" className="w-36" value={dateTo} onChange={e => setDateTo(e.target.value)} />
          </div>
          <Select value={filterSchoolYearId} onValueChange={setFilterSchoolYearId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Semua Tahun" />
            </SelectTrigger>
            <SelectContent>
              {schoolYears.map(y => (
                <SelectItem key={y.id} value={String(y.id)}>{y.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" className="border-green-300 text-green-700 hover:bg-green-50" onClick={() => handleExport('excel')}>Excel</Button>
          <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-50" onClick={() => handleExport('pdf')}>PDF</Button>
        </div>
      </div>
      <p className="text-xs italic text-gray-400 mb-4">
        Rekap penerimaan yang dipecah per pos pembayaran (SPP, Uang Gedung, dll). Gunakan filter tanggal dan tahun ajaran untuk menyesuaikan rentang data, lalu Export untuk mencetak rekap.
      </p>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm mb-6">{error}</div>}

      {data && (
        <div className="grid grid-cols-1 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
            <p className="text-sm text-gray-500">Total POS Aktif</p>
            <p className="text-2xl font-bold tabular-nums text-gray-900 mt-1">{data.total} POS</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto hover:shadow-md transition-shadow duration-200">
        <table>
          <thead>
            <tr>
              {['Kode POS', 'Nama POS', 'Total Penerimaan', 'Jumlah Transaksi', 'Jumlah Siswa'].map(col => (
                <th key={col} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}><td colSpan={5} className="px-6 py-4"><div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" /><div className="mt-2 h-4 bg-gray-200 rounded animate-pulse w-1/2" /></td></tr>
              ))
            ) : !data || data.perPos.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-400">Tidak ada data rekap POS</td></tr>
            ) : (
              data.perPos.map(row => (
                <tr key={row.posId} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-mono tabular-nums font-medium text-gray-700">{row.posCode}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">{row.posName}</td>
                  <td className="px-6 py-4 text-sm font-semibold tabular-nums text-accent">{formatRupiah(row.totalPenerimaan)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{row.jumlahTransaksi}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{row.jumlahSiswa}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
