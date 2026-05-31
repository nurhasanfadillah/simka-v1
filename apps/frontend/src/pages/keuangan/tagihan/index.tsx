import { useEffect, useState, useCallback } from 'react'
import { Eye, CreditCard } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { apiClient } from '@/lib/api'
import type { Bill, BillDetail, Class as _Class, SchoolYear, PaymentTemplate } from '@/types/master'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  const navigate = useNavigate()
  const [data, setData] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [classes, setClasses] = useState<_Class[]>([])
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([])
  const [paymentTemplates, setPaymentTemplates] = useState<PaymentTemplate[]>([])

  const [filterClassId, setFilterClassId] = useState('')
  const [filterSchoolYearId, setFilterSchoolYearId] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterPaymentTemplateId, setFilterPaymentTemplateId] = useState('')

  const [detailModal, setDetailModal] = useState<BillDetail | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const params: Record<string, string> = {}
      if (filterClassId) params.classId = filterClassId
      if (filterSchoolYearId) params.schoolYearId = filterSchoolYearId
      if (filterStatus) params.status = filterStatus
      if (filterPaymentTemplateId) params.paymentTemplateId = filterPaymentTemplateId
      const res = await apiClient.get<Bill[]>('/billing/bills', { params })
      setData(res.data)
      setError(null)
    } catch {
      setError('Gagal memuat data.')
    } finally {
      setLoading(false)
    }
  }, [filterClassId, filterSchoolYearId, filterStatus, filterPaymentTemplateId])

  useEffect(() => { fetchData() }, [fetchData])

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [cRes, yRes, pRes] = await Promise.all([
          apiClient.get<_Class[]>('/master/classes'),
          apiClient.get<SchoolYear[]>('/master/school-years'),
          apiClient.get<PaymentTemplate[]>('/billing/payment-templates'),
        ])
        setClasses(cRes.data)
        setSchoolYears(yRes.data)
        setPaymentTemplates(pRes.data)
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

  const handleBayar = (studentId: number) => {
    navigate(`/keuangan/transaksi/baru?studentId=${studentId}`)
  }

  return (<div className="p-6 animate-fade-in-up">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Data Tagihan</h1>
        <p className="text-gray-500 mt-1">Daftar semua tagihan siswa</p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <Select value={filterSchoolYearId} onValueChange={setFilterSchoolYearId}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tahun Pelajaran" />
            </SelectTrigger>
            <SelectContent>
              {schoolYears.map((y) => (<SelectItem key={y.id} value={String(y.id)}>{y.name}</SelectItem>))}
            </SelectContent>
          </Select>
          <Select value={filterClassId} onValueChange={setFilterClassId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Semua Kelas" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((c) => (<SelectItem key={c.id} value={String(c.id)}>{c.name} — {c.unitName}</SelectItem>))}
            </SelectContent>
          </Select>
          <Select value={filterPaymentTemplateId} onValueChange={setFilterPaymentTemplateId}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Semua Pembayaran" />
            </SelectTrigger>
            <SelectContent>
              {paymentTemplates.map((p) => (<SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Semua Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="belum_bayar">Belum Bayar</SelectItem>
              <SelectItem value="cicilan">Cicilan</SelectItem>
              <SelectItem value="lunas">Lunas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <p className="text-xs italic text-gray-400 mb-4">
        Daftar tagihan yang telah digenerate untuk setiap siswa. Gunakan filter di atas untuk mencari tagihan berdasarkan tahun pelajaran, kelas, pembayaran, atau status. Klik Bayar untuk langsung membuka transaksi siswa tersebut.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm mb-6">{error}</div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto hover:shadow-md transition-shadow duration-200">
        <table>
          <thead>
            <tr>
              {['NIS', 'Siswa', 'Kelas', 'Pembayaran', 'Nominal', 'Status', 'Aksi'].map((col) => (
                <th key={col} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={7} className="px-6 py-4"><div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" /><div className="mt-2 h-4 bg-gray-200 rounded animate-pulse w-1/2" /></td></tr>
              ))
            ) : data.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-400">Belum ada data tagihan</td></tr>
            ) : (
              data.map((row) => (
                <tr key={row.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-500 tabular-nums font-mono">{row.nis}</td>
                  <td className="px-6 py-4 text-sm text-gray-800 font-medium">{row.studentName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{row.className}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{row.paymentPostName}</td>
                  <td className="px-6 py-4 text-sm tabular-nums font-semibold text-accent">{formatRupiah(row.totalAmount)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${STATUSES[row.status]?.className ?? 'bg-gray-100 text-gray-600'}`}>
                      {STATUSES[row.status]?.label ?? row.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-accent" title="Bayar" onClick={() => handleBayar(row.studentId)}>
                        <CreditCard className="size-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-500" title="Detail" onClick={() => openDetail(row)} disabled={loadingDetail}>
                        <Eye className="size-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={!!detailModal} onOpenChange={() => setDetailModal(null)}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tagihan #{detailModal?.id} — {detailModal?.studentName}</DialogTitle>
          </DialogHeader>
          {detailModal && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3 text-sm bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-150">
                <div><span className="text-gray-500">Kelas:</span> <span className="font-medium">{detailModal.className}</span></div>
                <div><span className="text-gray-500">Pembayaran:</span> <span className="font-medium">{detailModal.paymentPostName}</span></div>
                <div><span className="text-gray-500">Tahun:</span> <span className="font-medium">{detailModal.schoolYearName}</span></div>
                <div><span className="text-gray-500">Total:</span> <span className="tabular-nums font-semibold text-accent">{formatRupiah(detailModal.totalAmount)}</span></div>
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
                  <table>
                    <thead>
                      <tr>
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
