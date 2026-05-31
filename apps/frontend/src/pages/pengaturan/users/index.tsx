import { useEffect, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import axios from 'axios'
import { DeleteErrorModal } from '@/components/ui/delete-error-modal'
import { apiClient } from '@/lib/api'
import type { UserItem, RoleItem } from '@/types/master'
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
  name: z.string().min(1, 'Wajib diisi'),
  email: z.string().email('Format email tidak valid'),
  password: z.union([z.string().min(6, 'Minimal 6 karakter'), z.literal('')]).optional(),
  roleId: z.coerce.number().int().min(1, 'Pilih role'),
  isActive: z.boolean().optional(),
})

type FormData = z.infer<typeof schema>

export default function PengaturanUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([])
  const [roles, setRoles] = useState<RoleItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<UserItem | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<UserItem | null>(null)
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

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const res = await apiClient.get<UserItem[]>('/users')
      setUsers(res.data)
      setError(null)
    } catch {
      setError('Gagal memuat data. Pastikan server berjalan.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  useEffect(() => {
    apiClient.get<RoleItem[]>('/roles').then(res => setRoles(res.data)).catch(() => {})
  }, [])

  const openCreate = () => {
    setEditing(null)
    reset({ name: '', email: '', password: '', roleId: undefined as unknown as number, isActive: true })
    setModalOpen(true)
  }

  const openEdit = (user: UserItem) => {
    setEditing(user)
    const role = roles.find(r => r.name === user.roleName)
    reset({ name: user.name, email: user.email, password: '', roleId: role?.id ?? undefined as unknown as number, isActive: user.isActive })
    setModalOpen(true)
  }

  const onSubmit = async (formData: FormData) => {
    try {
      setSaving(true)
      setError(null)
      if (editing) {
        const payload: Record<string, unknown> = {
          name: formData.name,
          email: formData.email,
          roleId: formData.roleId,
          isActive: formData.isActive,
        }
        await apiClient.patch(`/users/${editing.id}`, payload)
      } else {
        await apiClient.post('/users', {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          roleId: formData.roleId,
        })
      }
      setModalOpen(false)
      await fetchUsers()
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        setError('Email sudah terdaftar')
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
      await apiClient.delete(`/users/${id}`)
      await fetchUsers()
      setDeleteTarget(null)
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        setDeleteTarget(null)
        setDeleteErrorData(err.response.data.relatedData ?? {})
      } else {
        setError('Gagal menghapus pengguna.')
      }
    } finally {
      setDeleting(false)
    }
  }

  const watchedRoleId = watch('roleId')
  const watchedIsActive = watch('isActive')

  return (<div className="p-6 animate-fade-in-up">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pengguna</h1>
          <p className="text-gray-500 mt-1">Manajemen akun pengguna sistem</p>
        </div>
        <Button className="bg-accent hover:bg-accent/90" onClick={openCreate}>
          <Plus className="size-4 mr-2" />
          Tambah Pengguna
        </Button>
      </div>
      <p className="text-xs italic text-gray-400 mb-4">
        Kelola akun pengguna sistem SIMKA. Setiap pengguna memiliki satu role yang menentukan hak aksesnya. Nonaktifkan akun yang sudah tidak digunakan — jangan hapus.
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
              {['Nama', 'Email', 'Role', 'Status', 'Aksi'].map(col => (
                <th key={col} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-400">
                  Belum ada data pengguna
                </td>
              </tr>
            ) : (
              users.map(user => (
                <tr key={user.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-800">{user.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.roleName}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {user.isActive ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => openEdit(user)}>
                      <Pencil className="size-3.5 mr-1" />Edit
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => setDeleteTarget(user)}>
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
          <DialogHeader><DialogTitle>Hapus Pengguna</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600 py-2">Hapus pengguna <strong>{deleteTarget?.name}</strong>? Tindakan ini tidak bisa dibatalkan.</p>
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
            <DialogTitle>{editing ? 'Edit Pengguna' : 'Tambah Pengguna'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama</Label>
              <Input id="name" placeholder="Nama lengkap" {...register('name')} />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="email@sekolah.id" {...register('email')} />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">
                Password {editing && <span className="text-gray-400 font-normal">(kosongkan jika tidak diubah)</span>}
              </Label>
              <Input id="password" type="password" placeholder={editing ? '••••••' : 'Minimal 6 karakter'} {...register('password')} />
              {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={watchedRoleId ? String(watchedRoleId) : ''}
                onValueChange={value => setValue('roleId', Number(value), { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map(r => (
                    <SelectItem key={r.id} value={String(r.id)}>{r.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.roleId && <p className="text-sm text-red-500">{errors.roleId.message}</p>}
            </div>
            {editing && (
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={watchedIsActive ? 'true' : 'false'}
                  onValueChange={(v) => setValue('isActive', v === 'true', { shouldValidate: true })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Aktif</SelectItem>
                    <SelectItem value="false">Nonaktif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
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
