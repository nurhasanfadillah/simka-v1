import { useEffect, useState, useCallback } from 'react'
import { apiClient } from '@/lib/api'
import type { ReportTunggakan, Class as _Class, SchoolYear } from '@/types/master'
import { Button } from '@/components/ui/button'

const formatRupiah = (v: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v)

export default function LaporanTunggakanPage() {
  const [data, setData] = useState<ReportTunggakan | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [classes, setClasses] = useState<_Class[]>([])
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([])
  const [filterClassId, setFilterClassId] = useState('')
  const [filterSchoolYearId, setFilterSchoolYearId] = useState('')

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const params: Record<string, string> = {}
      if (filterSchoolYearId) params.schoolYearId = filterSchoolYearId
      if (filterClassId) params.classId = filterClassId
      const res = await apiClient.get<ReportTunggakan>('/reports/tunggakan', { params })
      setData(res.data)
    } catch {
      setError('Gagal memuat laporan tunggakan.')
    } finally {
      setLoading(false)
    }
  }, [filterSchoolYearId, filterClassId])

  useEffect(() => { fetchData() }, [fetchData])

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [cRes, yRes] = await Promise.all([
          apiClient.get<_Class[]>('/master/classes'),
          apiClient.get<SchoolYear[]>('/master/school-years'),
        ])
        setClasses(cRes.data)
        setSchoolYears(yRes.data)
      } catch { /* non-blocking */ }
    }
    fetchDropdowns()
  }, [])

  const handleExport = (format: 'pdf' | 'excel') => {
    const params = new URLSearchParams()
    if (filterSchoolYearId) params.set('schoolYearId', filterSchoolYearId)
    if (filterClassId) params.set('classId', filterClassId)
    window.open(`/api/reports/tunggakan/export/${format}?${params.toString()}`, '_blank')
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laporan Tunggakan</h1>
          <p className="text-gray-500 mt-1">Daftar siswa dengan tagihan belum lunas</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-700"
            value={filterSchoolYearId}
            onChange={e => setFilterSchoolYearId(e.target.value)}
          >
            <option value="">Semua Tahun</option>
            {schoolYears.map(y => (
              <option key={y.id} value={y.id}>{y.name}</option>
            ))}
          </select>
          <select
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-700"
            value={filterClassId}
            onChange={e => setFilterClassId(e.target.value)}
          >
            <option value="">Semua Kelas</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name} — {c.unitName}</option>
            ))}
          </select>
          <Button variant="outline" onClick={() => handleExport('excel')}>Excel</Button>
          <Button variant="outline" onClick={() => handleExport('pdf')}>PDF</Button>
        </div>
      </div>
      <p className="text-xs italic text-gray-400 mb-4">
        Daftar siswa yang masih memiliki tagihan belum lunas. Gunakan filter tahun pelajaran dan kelas untuk menyaring data. Gunakan tombol Export untuk mencetak laporan tunggakan.
      </p>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm mb-6">{error}</div>}

      {data && (
        <div className="grid grid-cols-1 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <p className="text-sm text-gray-500">Total Siswa Tunggakan</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{data.total} siswa</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              {['Nama Siswa', 'NIS', 'Kelas', 'Total Tunggakan', 'Jumlah Tagihan'].map(col => (
                <th key={col} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={5} className="px-6 py-4"><div className="animate-pulse bg-gray-200 h-6 rounded" /></td></tr>
              ))
            ) : !data || data.siswa.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-400">Tidak ada tunggakan</td></tr>
            ) : (
              data.siswa.map(row => (
                <tr key={row.studentId} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-800">{row.studentName}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{row.nis}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{row.className}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-red-600">{formatRupiah(row.totalTunggakan)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{row.jumlahTagihan} tagihan</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
