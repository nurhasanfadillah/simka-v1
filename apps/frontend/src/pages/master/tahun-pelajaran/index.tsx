import { useEffect, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import axios from 'axios'
import { apiClient } from '@/lib/api'
import { DeleteErrorModal } from '@/components/ui/delete-error-modal'
import type { SchoolYear, CreateSchoolYearDto } from '@/types/master'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const schema = z
  .object({
    name: z.string().min(1, 'Wajib diisi').max(20, 'Maksimal 20 karakter'),
    startYear: z.coerce.number().int().min(2000, 'Minimal 2000').max(2099, 'Maksimal 2099'),
    endYear: z.coerce.number().int().min(2000, 'Minimal 2000').max(2099, 'Maksimal 2099'),
  })
  .refine((d) => d.endYear > d.startYear, {
    message: 'Tahun akhir harus lebih besar dari tahun mulai',
    path: ['endYear'],
  })

type FormData = z.infer<typeof schema>

export default function TahunPelajaranPage() {
  const [data, setData] = useState<SchoolYear[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<SchoolYear | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<SchoolYear | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [activating, setActivating] = useState<number | null>(null)
  const [deleteErrorData, setDeleteErrorData] = useState<Record<string, number> | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const res = await apiClient.get<SchoolYear[]>('/master/school-years')
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
    reset({ name: '', startYear: undefined as unknown as number, endYear: undefined as unknown as number })
    setModalOpen(true)
  }

  const openEdit = (row: SchoolYear) => {
    setEditing(row)
    reset({ name: row.name, startYear: row.startYear, endYear: row.endYear })
    setModalOpen(true)
  }

  const onSubmit = async (formData: FormData) => {
    try {
      setSaving(true)
      const payload: CreateSchoolYearDto = {
        name: formData.name,
        startYear: formData.startYear,
        endYear: formData.endYear,
      }
      if (editing) {
        await apiClient.patch(`/master/school-years/${editing.id}`, payload)
      } else {
        await apiClient.post('/master/school-years', payload)
      }
      setModalOpen(false)
      await fetchData()
    } catch {
      setError('Gagal menyimpan data.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      setDeleting(true)
      setError(null)
      await apiClient.delete(`/master/school-years/${deleteTarget.id}`)
      setDeleteTarget(null)
      await fetchData()
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        setDeleteTarget(null)
        setDeleteErrorData(err.response.data.relatedData ?? {})
      } else {
        const msg = axios.isAxiosError(err) ? err.response?.data?.message : null
        setError(msg || 'Gagal menghapus data.')
      }
    } finally {
      setDeleting(false)
    }
  }

  const handleActivate = async (id: number) => {
    try {
      setActivating(id)
      setError(null)
      await apiClient.patch(`/master/school-years/${id}/activate`)
      await fetchData()
    } catch {
      setError('Gagal mengaktifkan tahun pelajaran.')
    } finally {
      setActivating(null)
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tahun Pelajaran</h1>
          <p className="text-gray-500 mt-1">Kelola data tahun pelajaran</p>
        </div>
        <Button className="bg-[#00A651] hover:bg-[#008C44]" onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Tahun
        </Button>
      </div>
      <p className="text-xs italic text-gray-400 mb-4">
        Gunakan halaman ini untuk mengatur tahun pelajaran. Pastikan hanya satu tahun yang ditandai Aktif — tahun aktif digunakan sebagai acuan data kelas dan tagihan siswa.
      </p>

      {error && !deleteTarget && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm mb-6">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              {['Nama', 'Tahun Mulai', 'Tahun Akhir', 'Status', 'Aksi'].map((col) => (
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
                    <div className="animate-pulse bg-gray-200 h-6 rounded" />
                  </td>
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-400">
                  Belum ada data tahun pelajaran
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={row.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-800 font-medium">{row.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{row.startYear}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{row.endYear}</td>
                  <td className="px-6 py-4">
                    {row.isActive ? (
                      <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Aktif
                      </span>
                    ) : (
                      <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        Nonaktif
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => openEdit(row)}>
                      <Pencil className="w-3.5 h-3.5 mr-1" />
                      Edit
                    </Button>
                    {!row.isActive && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 border-green-200 hover:bg-green-50"
                        disabled={activating === row.id}
                        onClick={() => handleActivate(row.id)}
                      >
                        {activating === row.id ? 'Mengaktifkan...' : 'Aktifkan'}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => { setError(null); setDeleteTarget(row) }}
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" />
                      Hapus
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Create/Edit */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Tahun Pelajaran' : 'Tambah Tahun Pelajaran'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama</Label>
              <Input id="name" placeholder="2026/2027" {...register('name')} />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startYear">Tahun Mulai</Label>
                <Input id="startYear" type="number" placeholder="2026" {...register('startYear')} />
                {errors.startYear && <p className="text-sm text-red-500">{errors.startYear.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="endYear">Tahun Akhir</Label>
                <Input id="endYear" type="number" placeholder="2027" {...register('endYear')} />
                {errors.endYear && <p className="text-sm text-red-500">{errors.endYear.message}</p>}
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Batal
              </Button>
              <Button
                type="submit"
                className="bg-[#00A651] hover:bg-[#008C44]"
                disabled={saving}
              >
                {saving ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteErrorModal
        open={deleteErrorData !== null}
        onClose={() => setDeleteErrorData(null)}
        relatedData={deleteErrorData ?? {}}
      />

      {/* Modal Konfirmasi Hapus */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) { setDeleteTarget(null); setError(null) } }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Hapus Tahun Pelajaran</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600 py-2">
            Hapus <strong>{deleteTarget?.name}</strong>? Tindakan ini tidak bisa dibatalkan.
          </p>
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => { setDeleteTarget(null); setError(null) }}>
              Batal
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={deleting}
              onClick={handleDelete}
            >
              {deleting ? 'Menghapus...' : 'Hapus'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
