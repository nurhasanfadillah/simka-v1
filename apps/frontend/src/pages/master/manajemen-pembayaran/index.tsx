import { useEffect, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import axios from 'axios'
import { apiClient } from '@/lib/api'
import { DeleteErrorModal } from '@/components/ui/delete-error-modal'
import type { PaymentTemplate, CreatePaymentTemplateDto, PaymentPost, SchoolYear } from '@/types/master'
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
} from '@/components/ui/dialog'

const schema = z.object({
  name: z.string().min(1, 'Nama wajib diisi').max(255),
  paymentPostId: z.coerce.number().int().min(1, 'Pilih POS'),
  schoolYearId: z.coerce.number().int().min(1, 'Pilih tahun ajaran'),
  amount: z.coerce.number().int().min(1000, 'Minimal Rp 1.000'),
})

type FormData = z.infer<typeof schema>

const formatRupiah = (v: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v)

export default function ManajemenPembayaranPage() {
  const [data, setData] = useState<PaymentTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterYearId, setFilterYearId] = useState('')

  const [posts, setPosts] = useState<PaymentPost[]>([])
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([])

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<PaymentTemplate | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<PaymentTemplate | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteErrorData, setDeleteErrorData] = useState<Record<string, number> | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const params = filterYearId ? { schoolYearId: filterYearId } : {}
      const res = await apiClient.get<PaymentTemplate[]>('/billing/payment-templates', { params })
      setData(res.data)
      setError(null)
    } catch {
      setError('Gagal memuat data.')
    } finally {
      setLoading(false)
    }
  }, [filterYearId])

  useEffect(() => { fetchData() }, [fetchData])

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [pRes, yRes] = await Promise.all([
          apiClient.get<PaymentPost[]>('/master/payment-posts'),
          apiClient.get<SchoolYear[]>('/master/school-years'),
        ])
        setPosts(pRes.data)
        setSchoolYears(yRes.data)
      } catch { /* non-blocking */ }
    }
    fetchDropdowns()
  }, [])

  const openCreate = () => {
    setEditing(null)
    reset({ name: '', paymentPostId: undefined as unknown as number, schoolYearId: undefined as unknown as number, amount: undefined as unknown as number })
    setModalOpen(true)
  }

  const openEdit = (row: PaymentTemplate) => {
    setEditing(row)
    reset({ name: row.name, paymentPostId: row.paymentPostId, schoolYearId: row.schoolYearId, amount: row.amount })
    setModalOpen(true)
  }

  const onSubmit = async (formData: FormData) => {
    try {
      setSaving(true)
      if (editing) {
        await apiClient.patch(`/billing/payment-templates/${editing.id}`, { name: formData.name, amount: formData.amount })
      } else {
        const payload: CreatePaymentTemplateDto = {
          name: formData.name,
          paymentPostId: formData.paymentPostId,
          schoolYearId: formData.schoolYearId,
          amount: formData.amount,
        }
        await apiClient.post('/billing/payment-templates', payload)
      }
      setError(null)
      setModalOpen(false)
      await fetchData()
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      const msg = axiosErr?.response?.data?.message ?? ''
      if (msg.includes('unique') || msg.includes('sudah ada')) {
        setError('Buku pembayaran dengan kombinasi POS dan tahun ajaran tersebut sudah ada.')
      } else {
        setError('Gagal menyimpan data.')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      setDeleting(true)
      await apiClient.delete(`/billing/payment-templates/${id}`)
      await fetchData()
      setDeleteTarget(null)
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        setDeleteTarget(null)
        setDeleteErrorData(err.response.data.relatedData ?? {})
      } else {
        setError('Gagal menghapus data.')
      }
    } finally {
      setDeleting(false)
    }
  }

  const postValue = watch('paymentPostId')
  const yearValue = watch('schoolYearId')

  return (<div className="p-6 animate-fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pembayaran</h1>
          <p className="text-gray-500 mt-1">Kelola buku pembayaran per pos dan tahun ajaran</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={filterYearId} onValueChange={setFilterYearId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Semua Tahun" />
            </SelectTrigger>
            <SelectContent>
              {schoolYears.map((y) => (
                <SelectItem key={y.id} value={String(y.id)}>{y.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button className="bg-accent hover:bg-accent/90" onClick={openCreate}>
            <Plus className="size-4 mr-2" />Tambah Buku
          </Button>
        </div>
      </div>
      <p className="text-xs italic text-gray-400 mb-4">
        Buku pembayaran adalah catatan tagihan per POS per tahun ajaran. Setiap buku memiliki nominal default yang digunakan sebagai acuan saat generate tagihan. POS Keuangan adalah sistem pembayaran utama — buku pembayaran adalah catatan per tahunnya.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm mb-6">{error}</div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto hover:shadow-md transition-shadow duration-200">
        <table className="w-full">
          <thead>
            <tr>
              {['Nama', 'POS', 'Tahun Ajaran', 'Nominal', 'Aksi'].map((col) => (
                <th key={col} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i}><td colSpan={5} className="px-6 py-4"><div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" /><div className="mt-2 h-4 bg-gray-200 rounded animate-pulse w-1/2" /></td></tr>
              ))
            ) : data.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-400">Belum ada buku pembayaran</td></tr>
            ) : (
              data.map((row) => (
                <tr key={row.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-800 font-medium">{row.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{row.paymentPostName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{row.schoolYearName}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-accent tabular-nums">{formatRupiah(row.amount)}</td>
                  <td className="px-6 py-4 flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => openEdit(row)}>
                      <Pencil className="size-3.5 mr-1" />Edit
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => setDeleteTarget(row)}>
                      <Trash2 className="size-3.5 mr-1" />Hapus
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <DeleteErrorModal open={deleteErrorData !== null} onClose={() => setDeleteErrorData(null)} relatedData={deleteErrorData ?? {}} />

      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Hapus Buku</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600 py-2">Hapus buku <strong>{deleteTarget?.paymentPostName} — {deleteTarget?.schoolYearName}</strong>? Buku yang sudah memiliki tagihan tidak dapat dihapus.</p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Batal</Button>
            <Button variant="destructive" disabled={deleting} onClick={() => deleteTarget && handleDelete(deleteTarget.id)}>
              {deleting ? 'Menghapus...' : 'Hapus'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Buku' : 'Tambah Buku'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Pembayaran *</Label>
              <Input id="name" placeholder="SPP Semester 1 2026" {...register('name')} />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>POS *</Label>
              <Select value={postValue ? String(postValue) : ''} onValueChange={(v) => setValue('paymentPostId', Number(v), { shouldValidate: true })} disabled={!!editing}>
                <SelectTrigger><SelectValue placeholder="Pilih POS" /></SelectTrigger>
                <SelectContent>
                  {posts.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>{p.code} — {p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.paymentPostId && <p className="text-sm text-red-500">{errors.paymentPostId.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Tahun Ajaran *</Label>
              <Select value={yearValue ? String(yearValue) : ''} onValueChange={(v) => setValue('schoolYearId', Number(v), { shouldValidate: true })} disabled={!!editing}>
                <SelectTrigger><SelectValue placeholder="Pilih tahun ajaran" /></SelectTrigger>
                <SelectContent>
                  {schoolYears.map((y) => (
                    <SelectItem key={y.id} value={String(y.id)}>{y.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.schoolYearId && <p className="text-sm text-red-500">{errors.schoolYearId.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Nominal (Rp) *</Label>
              <Input id="amount" type="number" placeholder="100000" {...register('amount')} />
              {errors.amount && <p className="text-sm text-red-500">{errors.amount.message}</p>}
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Batal</Button>
              <Button type="submit" className="bg-accent hover:bg-accent/90" disabled={saving}>
                {saving ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
