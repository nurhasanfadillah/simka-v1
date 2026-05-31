import { useEffect, useState, useCallback } from 'react'
import { Eye } from 'lucide-react'
import { apiClient } from '@/lib/api'
import type { Bill, BillDetail, Class as _Class, SchoolYear } from '@/types/master'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const formatRupiah = (v: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v)

const STATUSES: Record<string, { label: string; className: string }> = {
  belum_bayar: { label: 'Belum Bayar', className: 'bg-yellow-100 text-yellow-800' },
  cicilan: { label: 'Cicilan', className: 'bg-blue-100 text-blue-800' },
  lunas: { label: 'Lunas', className: 'bg-green-100 text-green-800' },
}

const MONTH_NAMES = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

export default function TagihanPage() {
  const [data, setData] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [classes, setClasses] = useState<_Class[]>([])
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([])

  const [filterClassId, setFilterClassId] = useState('')
  const [filterSchoolYearId, setFilterSchoolYearId] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const [detailModal, setDetailModal] = useState<BillDetail | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const params: Record<string, string> = {}
      if (filterClassId) params.classId = filterClassId
      if (filterSchoolYearId) params.schoolYearId = filterSchoolYearId
      if (filterStatus) params.status = filterStatus
      const res = await apiClient.get<Bill[]>('/billing/bills', { params })
      setData(res.data)
      setError(null)
    } catch {
      setError('Gagal memuat data. Pastikan server berjalan.')
    } finally {
      setLoading(false)
    }
  }, [filterClassId, filterSchoolYearId, filterStatus])

  useEffect(() => {
    fetchData()
  }, [fetchData])

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

  const openDetail = async (bill: Bill) => {
    try {
      setLoadingDetail(true)
      const res = await apiClient.get<BillDetail>(`/billing/bills/${bill.id}`)
      setDetailModal(res.data)
    } catch {
      setError('Gagal memuat detail tagihan.')
    } finally {
      setLoadingDetail(false)
    }
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Tagihan</h1>
          <p className="text-gray-500 mt-1">Daftar semua tagihan siswa</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-700"
            value={filterClassId}
            onChange={(e) => setFilterClassId(e.target.value)}
          >
            <option value="">Semua Kelas</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name} — {c.unitName}</option>
            ))}
          </select>
          <select
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-700"
            value={filterSchoolYearId}
            onChange={(e) => setFilterSchoolYearId(e.target.value)}
          >
            <option value="">Semua Tahun</option>
            {schoolYears.map((y) => (
              <option key={y.id} value={y.id}>{y.name}</option>
            ))}
          </select>
          <select
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-700"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">Semua Status</option>
            <option value="belum_bayar">Belum Bayar</option>
            <option value="cicilan">Cicilan</option>
            <option value="lunas">Lunas</option>
          </select>
        </div>
      </div>
      <p className="text-xs italic text-gray-400 mb-4">
        Daftar tagihan yang telah digenerate untuk setiap siswa. Gunakan filter untuk mencari tagihan berdasarkan kelas, tahun pelajaran, atau status pembayaran. Klik baris untuk melihat detail tagihan per bulan.
      </p>

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm mb-6">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              {['No.', 'Siswa', 'NIS', 'Kelas', 'POS', 'Nominal', 'Status', 'Aksi'].map((col) => (
                <th key={col} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={8} className="px-6 py-4">
                    <div className="animate-pulse bg-gray-200 h-6 rounded" />
                  </td>
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-sm text-gray-400">
                  Belum ada data tagihan
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={row.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-700 font-mono">#{row.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-800 font-medium">{row.studentName}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{row.nis}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{row.className}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{row.paymentPostName}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-[#00A651]">{formatRupiah(row.totalAmount)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${STATUSES[row.status]?.className ?? 'bg-gray-100 text-gray-600'}`}>
                      {STATUSES[row.status]?.label ?? row.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Button size="sm" variant="outline" onClick={() => openDetail(row)} disabled={loadingDetail}>
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      Detail
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      <Dialog open={!!detailModal} onOpenChange={() => setDetailModal(null)}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tagihan #{detailModal?.id} — {detailModal?.studentName}</DialogTitle>
          </DialogHeader>
          {detailModal && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3 text-sm bg-gray-50 rounded-lg p-4">
                <div><span className="text-gray-500">Kelas:</span> <span className="font-medium">{detailModal.className}</span></div>
                <div><span className="text-gray-500">POS:</span> <span className="font-medium">{detailModal.paymentPostName}</span></div>
                <div><span className="text-gray-500">Tahun:</span> <span className="font-medium">{detailModal.schoolYearName}</span></div>
                <div><span className="text-gray-500">Total:</span> <span className="font-semibold text-[#00A651]">{formatRupiah(detailModal.totalAmount)}</span></div>
                <div className="col-span-2">
                  <span className="text-gray-500">Status:</span>{' '}
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUSES[detailModal.status]?.className ?? ''}`}>
                    {STATUSES[detailModal.status]?.label ?? detailModal.status}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Detail Bulan</h4>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Bulan</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Tahun</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Nominal</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailModal.billMonths.map((bm) => (
                        <tr key={bm.id} className="border-t border-gray-100">
                          <td className="px-3 py-2 font-medium text-gray-800">{MONTH_NAMES[bm.month] ?? bm.month}</td>
                          <td className="px-3 py-2 text-gray-600">{bm.year}</td>
                          <td className="px-3 py-2 text-gray-700">{formatRupiah(bm.amount)}</td>
                          <td className="px-3 py-2">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${bm.status === 'lunas' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                              {bm.status === 'lunas' ? 'Lunas' : 'Belum Bayar'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
