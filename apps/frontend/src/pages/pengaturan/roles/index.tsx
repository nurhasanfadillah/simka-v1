import { useEffect, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, ShieldCheck, Trash2 } from 'lucide-react'
import axios from 'axios'
import { DeleteErrorModal } from '@/components/ui/delete-error-modal'
import { apiClient } from '@/lib/api'
import type { RoleItem, PermissionItem } from '@/types/master'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const createSchema = z.object({
  name: z.string().min(1, 'Wajib diisi'),
})
type CreateFormData = z.infer<typeof createSchema>

export default function PengaturanRolesPage() {
  const [roles, setRoles] = useState<RoleItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [allPermissions, setAllPermissions] = useState<PermissionItem[]>([])

  const [createOpen, setCreateOpen] = useState(false)
  const [assignOpen, setAssignOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<RoleItem | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteErrorData, setDeleteErrorData] = useState<Record<string, number> | null>(null)
  const [selectedRole, setSelectedRole] = useState<RoleItem | null>(null)
  const [checkedIds, setCheckedIds] = useState<Set<number>>(new Set())

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateFormData>({ resolver: zodResolver(createSchema) })

  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true)
      const res = await apiClient.get<RoleItem[]>('/roles')
      setRoles(res.data)
      const permMap = new Map<number, PermissionItem>()
      res.data.forEach(r => r.permissions.forEach(p => permMap.set(p.id, p)))
      setAllPermissions(Array.from(permMap.values()).sort((a, b) => a.code.localeCompare(b.code)))
      setError(null)
    } catch {
      setError('Gagal memuat data. Pastikan server berjalan.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRoles()
  }, [fetchRoles])

  const openCreate = () => {
    reset({ name: '' })
    setError(null)
    setCreateOpen(true)
  }

  const onSubmitCreate = async (formData: CreateFormData) => {
    try {
      setSaving(true)
      setError(null)
      await apiClient.post('/roles', { name: formData.name })
      setCreateOpen(false)
      await fetchRoles()
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        setError('Nama role sudah dipakai')
      } else {
        setError('Gagal menyimpan data.')
      }
    } finally {
      setSaving(false)
    }
  }

  const openAssign = (role: RoleItem) => {
    setSelectedRole(role)
    setCheckedIds(new Set(role.permissions.map(p => p.id)))
    setAssignOpen(true)
  }

  const onSubmitAssign = async () => {
    if (!selectedRole) return
    try {
      setSaving(true)
      await apiClient.patch(`/roles/${selectedRole.id}/permissions`, { permissionIds: Array.from(checkedIds) })
      setAssignOpen(false)
      await fetchRoles()
    } catch {
      setError('Gagal menyimpan permission.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      setDeleting(true)
      await apiClient.delete(`/roles/${id}`)
      await fetchRoles()
      setDeleteTarget(null)
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        setDeleteTarget(null)
        setDeleteErrorData(err.response.data.relatedData ?? {})
      } else {
        setError('Gagal menghapus role.')
      }
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Role &amp; Akses</h1>
          <p className="text-gray-500 mt-1">Manajemen role dan hak akses pengguna</p>
        </div>
        <Button className="bg-[#00A651] hover:bg-[#008C44]" onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Role
        </Button>
      </div>
      <p className="text-xs italic text-gray-400 mb-4">
        Kelola peran dan hak akses pengguna. Setiap role memiliki kumpulan izin yang menentukan fitur apa yang bisa diakses oleh pengguna dengan role tersebut.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm mb-6">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              {['Nama Role', 'Jumlah Permission', 'Aksi'].map(col => (
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
                  <td colSpan={3} className="px-6 py-4">
                    <div className="animate-pulse bg-gray-200 h-6 rounded" />
                  </td>
                </tr>
              ))
            ) : roles.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-sm text-gray-400">
                  Belum ada data role
                </td>
              </tr>
            ) : (
              roles.map(role => (
                <tr key={role.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-800">{role.name}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                      {role.permissions.length} permission
                    </span>
                  </td>
                  <td className="px-6 py-4 flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => openAssign(role)}>
                      <ShieldCheck className="w-3.5 h-3.5 mr-1" />Atur Permission
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => setDeleteTarget(role)}>
                      <Trash2 className="w-3.5 h-3.5 mr-1" />Hapus
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
          <DialogHeader><DialogTitle>Hapus Role</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600 py-2">Hapus role <strong>{deleteTarget?.name}</strong>? Tindakan ini tidak bisa dibatalkan.</p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Batal</Button>
            <Button className="bg-red-600 hover:bg-red-700 text-white" disabled={deleting} onClick={() => deleteTarget && handleDelete(deleteTarget.id)}>
              {deleting ? 'Menghapus...' : 'Hapus'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Role</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmitCreate)} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Role</Label>
              <Input id="name" placeholder="Contoh: Bendahara" {...register('name')} />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Batal</Button>
              <Button type="submit" className="bg-[#00A651] hover:bg-[#008C44]" disabled={saving}>
                {saving ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Atur Permission — {selectedRole?.name}</DialogTitle>
          </DialogHeader>
          <div className="pt-4">
            <div className="max-h-72 overflow-y-auto border border-gray-100 rounded-lg">
              {allPermissions.length === 0 ? (
                <p className="text-sm text-gray-400 p-4 text-center">Tidak ada permission tersedia</p>
              ) : (
                allPermissions.map(p => (
                  <label key={p.id} className="flex items-center gap-3 py-2 px-3 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checkedIds.has(p.id)}
                      onChange={e => {
                        const next = new Set(checkedIds)
                        e.target.checked ? next.add(p.id) : next.delete(p.id)
                        setCheckedIds(next)
                      }}
                      className="w-4 h-4 accent-[#00A651]"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-800">{p.name}</span>
                      <span className="ml-2 text-xs font-mono text-gray-400">{p.code}</span>
                    </div>
                  </label>
                ))
              )}
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setAssignOpen(false)}>Batal</Button>
              <Button type="button" className="bg-[#00A651] hover:bg-[#008C44]" disabled={saving} onClick={onSubmitAssign}>
                {saving ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
