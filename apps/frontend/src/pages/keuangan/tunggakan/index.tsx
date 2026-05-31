import { useEffect, useState, useCallback } from 'react'
import { apiClient } from '@/lib/api'
import type { Bill, Class as _Class, SchoolYear } from '@/types/master'

const formatRupiah = (v: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v)

const STATUSES: Record<string, { label: string; className: string }> = {
  belum_bayar: { label: 'Belum Bayar', className: 'bg-yellow-100 text-yellow-800' },
  cicilan: { label: 'Cicilan', className: 'bg-blue-100 text-blue-800' },
  lunas: { label: 'Lunas', className: 'bg-green-100 text-green-800' },
}

export default function TunggakanPage() {
  const [data, setData] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [classes, setClasses] = useState<_Class[]>([])
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([])
  const [filterClassId, setFilterClassId] = useState('')
  const [filterSchoolYearId, setFilterSchoolYearId] = useState('')

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const params: Record<string, string> = {}
      if (filterClassId) params.classId = filterClassId
      if (filterSchoolYearId) params.schoolYearId = filterSchoolYearId
      const res = await apiClient.get<Bill[]>('/billing/bills/tunggakan', { params })
      setData(res.data)
      setError(null)
    } catch {
      setError('Gagal memuat data.')
    } finally {
      setLoading(false)
    }
  }, [filterClassId, filterSchoolYearId])

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

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tunggakan</h1>
          <p className="text-gray-500 mt-1">Daftar tagihan yang belum lunas</p>
        </div>
        <div className="flex items-center gap-3">
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
        </div>
      </div>
      <p className="text-xs italic text-gray-400 mb-4">
        Daftar siswa yang memiliki tagihan belum lunas. Gunakan filter kelas dan tahun pelajaran untuk melihat tunggakan per kelompok siswa.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm mb-6">{error}</div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              {['No.', 'Siswa', 'NIS', 'Kelas', 'POS', 'Nominal', 'Status'].map(col => (
                <th key={col} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={7} className="px-6 py-4"><div className="animate-pulse bg-gray-200 h-6 rounded" /></td></tr>
              ))
            ) : data.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-400">Tidak ada tunggakan</td></tr>
            ) : (
              data.map(row => (
                <tr key={row.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-700 font-mono">#{row.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-800 font-medium">{row.studentName}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{row.nis}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{row.className}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{row.paymentPostName}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-[#00A651]">{formatRupiah(row.totalAmount)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${STATUSES[row.status]?.className ?? ''}`}>
                      {STATUSES[row.status]?.label ?? row.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
