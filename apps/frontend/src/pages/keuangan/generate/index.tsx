import { useEffect, useState, useCallback, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import axios from 'axios'
import { apiClient } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  DialogDescription,
} from '@/components/ui/dialog'
import type {
  PaymentTemplate,
  PaymentBookInfo,
  StudentBillRow,
  StudentNoBillRow,
  CreateBillsResponse,
  SchoolUnit,
} from '@/types/master'

interface ClassItem {
  id: number
  name: string
  schoolUnitId: number
}

const formatRupiah = (v: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v)

const editBillSchema = z.object({
  amount: z.coerce.number().int().min(1000, 'Minimal Rp 1.000'),
})

type EditBillFormData = z.infer<typeof editBillSchema>

export default function GeneratePembayaranPage() {
  const [selectedBookId, setSelectedBookId] = useState('')
  const [selectedUnitId, setSelectedUnitId] = useState('')
  const [selectedClassId, setSelectedClassId] = useState('')
  const [search, setSearch] = useState('')

  const [books, setBooks] = useState<PaymentTemplate[]>([])
  const [units, setUnits] = useState<SchoolUnit[]>([])
  const [classes, setClasses] = useState<ClassItem[]>([])

  const [template, setTemplate] = useState<PaymentBookInfo | null | undefined>(undefined)
  const [withBills, setWithBills] = useState<StudentBillRow[]>([])
  const [withoutBills, setWithoutBills] = useState<StudentNoBillRow[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [editBillTarget, setEditBillTarget] = useState<StudentBillRow | null>(null)
  const [deleteBillTarget, setDeleteBillTarget] = useState<StudentBillRow | null>(null)
  const [createPreviewOpen, setCreatePreviewOpen] = useState(false)
  const [checkedIds, setCheckedIds] = useState<Set<number>>(new Set())
  const [amounts, setAmounts] = useState<Record<number, number>>({})

  const editBillForm = useForm<EditBillFormData>({ resolver: zodResolver(editBillSchema) })

  useEffect(() => {
    const fetchInit = async () => {
      try {
        const [bRes, uRes] = await Promise.all([
          apiClient.get<PaymentTemplate[]>('/billing/payment-templates'),
          apiClient.get<SchoolUnit[]>('/master/school-units'),
        ])
        setBooks(bRes.data)
        setUnits(uRes.data)
      } catch { /* non-blocking */ }
    }
    fetchInit()
  }, [])

  const selectedBook = useMemo(() => books.find((b) => String(b.id) === selectedBookId), [books, selectedBookId])

  useEffect(() => {
    if (!selectedBook) { setClasses([]); return }
    apiClient.get<ClassItem[]>('/master/classes', { params: { schoolYearId: selectedBook.schoolYearId } })
      .then((r) => setClasses(r.data))
      .catch(() => setClasses([]))
  }, [selectedBook])

  const fetchData = useCallback(async () => {
    if (!selectedBook) return
    setLoading(true)
    setError(null)
    try {
      const tRes = await apiClient.get<PaymentBookInfo | null>(
        '/billing/payment-management/template',
        { params: { paymentPostId: selectedBook.paymentPostId, schoolYearId: selectedBook.schoolYearId } },
      )
      setTemplate(tRes.data)
      if (tRes.data) {
        const params: Record<string, string> = {
          paymentPostId: String(selectedBook.paymentPostId),
          schoolYearId: String(selectedBook.schoolYearId),
        }
        if (selectedClassId) params.classId = selectedClassId
        if (selectedUnitId) params.unitId = selectedUnitId
        if (search) params.search = search
        const [wbRes, wobRes] = await Promise.all([
          apiClient.get<StudentBillRow[]>('/billing/payment-management/with-bills', { params }),
          apiClient.get<StudentNoBillRow[]>('/billing/payment-management/without-bills', { params }),
        ])
        setWithBills(wbRes.data)
        setWithoutBills(wobRes.data)
        const defaultAmounts: Record<number, number> = {}
        wobRes.data.forEach((s) => { defaultAmounts[s.studentId] = tRes.data!.amount })
        setAmounts((prev) => ({ ...defaultAmounts, ...prev }))
      }
    } catch {
      setError('Gagal memuat data.')
    } finally {
      setLoading(false)
    }
  }, [selectedBook, selectedClassId, selectedUnitId, search])

  useEffect(() => { fetchData() }, [fetchData])

  const handleEditBill = async (data: EditBillFormData) => {
    if (!editBillTarget) return
    try {
      setSaving(true)
      await apiClient.patch(`/billing/payment-management/bills/${editBillTarget.billId}`, { amount: data.amount })
      setEditBillTarget(null)
      await fetchData()
    } catch (e) {
      const axiosErr = e as { response?: { data?: { message?: string } } }
      setError(axiosErr?.response?.data?.message ?? 'Gagal mengedit tagihan.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteBill = async () => {
    if (!deleteBillTarget) return
    try {
      setSaving(true)
      await apiClient.delete(`/billing/payment-management/bills/${deleteBillTarget.billId}`)
      setDeleteBillTarget(null)
      await fetchData()
    } catch (e) {
      setDeleteBillTarget(null)
      if (axios.isAxiosError(e) && e.response?.status === 409) {
        setError('Tagihan tidak dapat dihapus karena sudah memiliki transaksi pembayaran.')
      } else {
        setError('Gagal menghapus tagihan.')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleCreateBills = async () => {
    if (checkedIds.size === 0 || !selectedBook) return
    try {
      setSaving(true)
      const billItems = Array.from(checkedIds).map((sid) => ({
        studentId: sid,
        amount: amounts[sid] ?? 0,
      }))
      await apiClient.post<CreateBillsResponse>('/billing/payment-management/bills', {
        bills: billItems,
        paymentPostId: selectedBook.paymentPostId,
        schoolYearId: selectedBook.schoolYearId,
      })
      setCreatePreviewOpen(false)
      setCheckedIds(new Set())
      await fetchData()
    } catch (e) {
      const axiosErr = e as { response?: { data?: { message?: string } } }
      setError(axiosErr?.response?.data?.message ?? 'Gagal membuat tagihan.')
    } finally {
      setSaving(false)
    }
  }

  const toggleCheck = (studentId: number) => {
    setCheckedIds((prev) => {
      const next = new Set(prev)
      if (next.has(studentId)) next.delete(studentId)
      else next.add(studentId)
      return next
    })
  }

  const toggleAll = () => {
    if (checkedIds.size === withoutBills.length) {
      setCheckedIds(new Set())
    } else {
      setCheckedIds(new Set(withoutBills.map((s) => s.studentId)))
    }
  }

  const updateAmount = (studentId: number, value: number) => {
    setAmounts((prev) => ({ ...prev, [studentId]: value }))
  }

  const checkedStudents = useMemo(() => withoutBills.filter((s) => checkedIds.has(s.studentId)), [withoutBills, checkedIds])

  const filteredClasses = useMemo(() => {
    if (!selectedUnitId) return classes
    return classes.filter((c) => String(c.schoolUnitId) === selectedUnitId)
  }, [classes, selectedUnitId])

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Generate Pembayaran</h1>
          <p className="text-gray-500 mt-1">Generate tagihan dari buku pembayaran yang sudah dibuat</p>
        </div>
      </div>
      <p className="text-xs italic text-red-500 mb-6">
        Generate tagihan massal dari buku pembayaran. Pilih buku untuk melihat daftar siswa yang sudah atau belum memiliki tagihan. Tagihan yang sudah digenerate tidak dapat dihapus massal — gunakan aksi hapus satu per satu.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm mb-6">{error}</div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <Label>Buku Pembayaran</Label>
            <Select value={selectedBookId} onValueChange={(v) => { setSelectedBookId(v); setTemplate(undefined); setSelectedUnitId(''); setSelectedClassId(''); setSearch('') }}>
              <SelectTrigger><SelectValue placeholder="Pilih buku" /></SelectTrigger>
              <SelectContent>
                {books.map((b) => (
                  <SelectItem key={b.id} value={String(b.id)}>{b.name} ({b.paymentPostName} — {b.schoolYearName})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Unit Sekolah</Label>
            <Select value={selectedUnitId} onValueChange={setSelectedUnitId} disabled={!selectedBookId}>
              <SelectTrigger><SelectValue placeholder="Semua unit" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Unit</SelectItem>
                {units.map((u) => (
                  <SelectItem key={u.id} value={String(u.id)}>{u.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Kelas</Label>
            <Select value={selectedClassId} onValueChange={setSelectedClassId} disabled={!selectedBookId}>
              <SelectTrigger><SelectValue placeholder="Semua kelas" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kelas</SelectItem>
                {filteredClasses.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Input
              placeholder="Cari NIS atau Nama..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              disabled={!selectedBookId}
            />
          </div>
        </div>
      </div>

      {!selectedBookId ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-400 text-sm">
          Pilih Buku Pembayaran untuk melanjutkan. Buku dibuat di menu <strong>Manajemen Pembayaran</strong>.
        </div>
      ) : template === undefined ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      ) : template === null ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <p className="text-gray-500">Buku tidak ditemukan.</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
            <div className="flex items-center gap-6 text-sm">
              <div><span className="text-gray-500">POS:</span>{' '}<span className="font-semibold">{template.paymentPostName}</span></div>
              <div><span className="text-gray-500">Tahun:</span>{' '}<span className="font-semibold">{template.schoolYearName}</span></div>
              <div><span className="text-gray-500">Nominal:</span>{' '}<span className="font-semibold text-[#00A651]">{formatRupiah(template.amount)}</span></div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Siswa dengan Tagihan ({withBills.length})</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    {['NIS', 'Nama', 'Kelas', 'Nominal', 'Status', 'Aksi'].map((col) => (
                      <th key={col} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i}><td colSpan={6} className="px-6 py-4"><div className="animate-pulse bg-gray-200 h-6 rounded" /></td></tr>
                    ))
                  ) : withBills.length === 0 ? (
                    <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-400">Tidak ada siswa dengan tagihan</td></tr>
                  ) : (
                    withBills.map((row) => (
                      <tr key={row.billId} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-800">{row.nis}</td>
                        <td className="px-6 py-4 text-sm text-gray-800 font-medium">{row.studentName}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{row.className}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                          {formatRupiah(row.amount)}
                          {row.status !== 'belum_bayar' && (
                            <span className="block text-xs font-normal text-gray-400">Dibayar: {formatRupiah(row.paidAmount)}</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            row.status === 'lunas' ? 'bg-green-100 text-green-700' :
                            row.status === 'cicilan' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {row.status === 'lunas' ? 'Lunas' : row.status === 'cicilan' ? 'Cicilan' : 'Belum Bayar'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <Button size="sm" variant="outline" onClick={() => { editBillForm.reset({ amount: row.amount }); setEditBillTarget(row) }}>
                              <Pencil className="w-3 h-3 mr-1" />Edit
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => setDeleteBillTarget(row)}>
                              <Trash2 className="w-3 h-3 mr-1" />Hapus
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Siswa tanpa Tagihan ({withoutBills.length})</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 w-10">
                      <input type="checkbox" className="rounded" checked={withoutBills.length > 0 && checkedIds.size === withoutBills.length} onChange={toggleAll} />
                    </th>
                    {['NIS', 'Nama', 'Kelas', 'Nominal'].map((col) => (
                      <th key={col} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i}><td colSpan={5} className="px-6 py-4"><div className="animate-pulse bg-gray-200 h-6 rounded" /></td></tr>
                    ))
                  ) : withoutBills.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-400">Semua siswa sudah memiliki tagihan</td></tr>
                  ) : (
                    withoutBills.map((row) => (
                      <tr key={row.studentId} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <input type="checkbox" className="rounded" checked={checkedIds.has(row.studentId)} onChange={() => toggleCheck(row.studentId)} />
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-800">{row.nis}</td>
                        <td className="px-6 py-4 text-sm text-gray-800 font-medium">{row.studentName}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{row.className}</td>
                        <td className="px-6 py-4">
                          <Input type="number" className="w-32 text-sm" value={amounts[row.studentId] ?? template.amount}
                            onChange={(e) => updateAmount(row.studentId, Number(e.target.value))} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="mt-3 flex justify-end">
              <Button className="bg-[#00A651] hover:bg-[#008C44]" disabled={checkedIds.size === 0 || saving} onClick={() => setCreatePreviewOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />Buat Tagihan ({checkedIds.size})
              </Button>
            </div>
          </div>
        </>
      )}

      <Dialog open={!!editBillTarget} onOpenChange={(open) => { if (!open) setEditBillTarget(null) }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit Nominal Tagihan</DialogTitle>
            <DialogDescription asChild>
              <div>
                {editBillTarget?.studentName} — {editBillTarget?.className}
                {editBillTarget && editBillTarget.paidAmount > 0 && (
                  <p className="mt-2 text-yellow-600 text-sm">Sudah dibayar: {formatRupiah(editBillTarget.paidAmount)}. Nominal tidak boleh di bawah jumlah tersebut.</p>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={editBillForm.handleSubmit(handleEditBill)} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-amount">Nominal (Rp) *</Label>
              <Input id="edit-amount" type="number" {...editBillForm.register('amount')} />
              {editBillForm.formState.errors.amount && <p className="text-sm text-red-500">{editBillForm.formState.errors.amount.message}</p>}
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setEditBillTarget(null)}>Batal</Button>
              <Button type="submit" className="bg-[#00A651] hover:bg-[#008C44]" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteBillTarget} onOpenChange={(open) => { if (!open) setDeleteBillTarget(null) }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Hapus Tagihan</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600 py-2">
            Hapus tagihan <strong>{deleteBillTarget?.studentName}</strong> — {deleteBillTarget?.className}?
            {deleteBillTarget && deleteBillTarget.paidAmount > 0 && (
              <span className="block mt-1 text-yellow-600">Telah dibayar: {formatRupiah(deleteBillTarget.paidAmount)}</span>
            )}
          </p>
          <p className="text-sm text-gray-600">Tagihan yang sudah memiliki transaksi tidak dapat dihapus.</p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setDeleteBillTarget(null)}>Batal</Button>
            <Button className="bg-red-600 hover:bg-red-700 text-white" disabled={saving} onClick={handleDeleteBill}>{saving ? 'Menghapus...' : 'Hapus'}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={createPreviewOpen} onOpenChange={setCreatePreviewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Konfirmasi Buat Tagihan</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600 py-2">Buat tagihan untuk <strong>{checkedStudents.length} siswa</strong>?</p>
          <div className="max-h-40 overflow-y-auto border rounded-lg p-2 bg-gray-50">
            {checkedStudents.map((s) => (
              <div key={s.studentId} className="text-sm py-1 px-2 flex justify-between">
                <span>{s.studentName} ({s.nis})</span>
                <span className="font-medium">{formatRupiah(amounts[s.studentId] ?? 0)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setCreatePreviewOpen(false)}>Batal</Button>
            <Button className="bg-[#00A651] hover:bg-[#008C44]" disabled={saving} onClick={handleCreateBills}>{saving ? 'Membuat...' : 'Konfirmasi'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
