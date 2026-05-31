import { useEffect, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import axios from 'axios'
import { apiClient } from '@/lib/api'
import { DeleteErrorModal } from '@/components/ui/delete-error-modal'
import type { PaymentPost, CreatePaymentPostDto } from '@/types/master'
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
  code: z.string().min(1, 'Wajib diisi').max(20, 'Maksimal 20 karakter'),
  name: z.string().min(1, 'Wajib diisi').max(255, 'Maksimal 255 karakter'),
  type: z.enum(['bulanan', 'bebas'], { required_error: 'Pilih tipe' }),
  description: z.string().max(500, 'Maksimal 500 karakter').optional(),
})

type FormData = z.infer<typeof schema>

export default function PosPage() {
  const [data, setData] = useState<PaymentPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<PaymentPost | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<PaymentPost | null>(null)
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
      const res = await apiClient.get<PaymentPost[]>('/master/payment-posts')
      setData(res.data)
      setError(null)
    } catch {
      setError('Gagal memuat data. Pastikan server berjalan.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const openCreate = () => {
    setEditing(null)
    reset({ code: '', name: '', type: undefined as unknown as 'bulanan', description: '' })
    setModalOpen(true)
  }

  const openEdit = (row: PaymentPost) => {
    setEditing(row)
    reset({ code: row.code, name: row.name, type: row.type, description: row.description ?? '' })
    setModalOpen(true)
  }

  const onSubmit = async (formData: FormData) => {
    try {
      setSaving(true)
      const payload: CreatePaymentPostDto = {
        code: formData.code.toUpperCase(),
        name: formData.name,
        type: formData.type,
        description: formData.description || undefined,
      }
      if (editing) {
        await apiClient.patch(`/master/payment-posts/${editing.id}`, payload)
      } else {
        await apiClient.post('/master/payment-posts', payload)
      }
      setModalOpen(false)
      await fetchData()
    } catch {
      setError('Gagal menyimpan data.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      setDeleting(true)
      await apiClient.delete(`/master/payment-posts/${id}`)
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

  const selectedType = watch('type')

  return (<div className="p-6 animate-fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">POS Keuangan</h1>
          <p className="text-gray-500 mt-1">Kelola pos-pos pembayaran</p>
        </div>
        <Button className="bg-accent hover:bg-accent/90" onClick={openCreate}>
          <Plus className="size-4 mr-2" />
          Tambah POS
        </Button>
      </div>
      <p className="text-xs italic text-gray-400 mb-4">
        Kelola pos-pos penerimaan keuangan sekolah (contoh: SPP, Uang Gedung, Seragam). POS yang sudah digunakan dalam tagihan tidak dapat dihapus — nonaktifkan saja jika tidak lagi dibutuhkan.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm mb-6">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto hover:shadow-md transition-shadow duration-200">
        <table className="w-full">
          <thead>
            <tr>
              {['Kode', 'Nama', 'Tipe', 'Deskripsi', 'Aksi'].map((col) => (
                <th
                  key={col}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={5} className="px-6 py-4">
                     <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" /><div className="mt-2 h-4 bg-gray-200 rounded animate-pulse w-1/2" />
                  </td>
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-400">
                  Belum ada data POS keuangan
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={row.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-800 font-mono font-semibold">{row.code}</td>
                  <td className="px-6 py-4 text-sm text-gray-800 font-medium">{row.name}</td>
                  <td className="px-6 py-4">
                    <span
                      className={
                        row.type === 'bulanan'
                          ? 'inline-flex px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800'
                          : 'inline-flex px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800'
                      }
                    >
                      {row.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-[200px] truncate">
                    {row.description ?? '-'}
                  </td>
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
          <DialogHeader><DialogTitle>Hapus POS Keuangan</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600 py-2">Hapus <strong>{deleteTarget?.name}</strong>? Tindakan ini tidak bisa dibatalkan.</p>
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
            <DialogTitle>{editing ? 'Edit POS Keuangan' : 'Tambah POS Keuangan'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="code">Kode</Label>
              <Input
                id="code"
                placeholder="SPP"
                className="uppercase"
                {...register('code')}
                onChange={(e) => {
                  register('code').onChange(e)
                }}
              />
              {errors.code && <p className="text-sm text-red-500">{errors.code.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nama</Label>
              <Input id="name" placeholder="SPP Bulanan" {...register('name')} />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Tipe</Label>
              <Select
                value={selectedType}
                onValueChange={(value) =>
                  setValue('type', value as 'bulanan' | 'bebas', { shouldValidate: true })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bulanan">Bulanan</SelectItem>
                  <SelectItem value="bebas">Bebas</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && <p className="text-sm text-red-500">{errors.type.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi (opsional)</Label>
              <Input id="description" placeholder="Keterangan singkat" {...register('description')} />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Batal
              </Button>
              <Button
                type="submit"
                className="bg-accent hover:bg-accent/90"
                disabled={saving}
              >
                {saving ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
