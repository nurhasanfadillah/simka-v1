import { useEffect, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import axios from 'axios'
import { apiClient } from '@/lib/api'
import { DeleteErrorModal } from '@/components/ui/delete-error-modal'
import type {
  Class,
  ClassMember,
  CreateClassDto,
  SchoolUnit,
  SchoolYear,
  CreateSchoolUnitDto,
} from '@/types/master'
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

// ── Schemas ────────────────────────────────────────────────────────────────

const classSchema = z.object({
  name: z.string().min(1, 'Wajib diisi').max(100, 'Maksimal 100 karakter'),
  level: z.coerce.number().int().min(1, 'Minimal 1').max(12, 'Maksimal 12'),
  schoolUnitId: z.coerce.number().int().min(1, 'Pilih unit sekolah'),
})

const unitSchema = z.object({
  name: z.string().min(1, 'Wajib diisi').max(255, 'Maksimal 255 karakter'),
  code: z
    .string()
    .min(1, 'Wajib diisi')
    .max(10, 'Maksimal 10 karakter')
    .transform((v) => v.toUpperCase()),
})

type ClassForm = z.infer<typeof classSchema>
type UnitForm = z.infer<typeof unitSchema>

// ── Component ──────────────────────────────────────────────────────────────

export default function KelasPage() {
  const [activeTab, setActiveTab] = useState<'kelas' | 'unit'>('kelas')

  // ── Shared state ──────────────────────────────────────────────────────────
  const [units, setUnits] = useState<SchoolUnit[]>([])
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([])
  const [activeYearId, setActiveYearId] = useState<number | null>(null)

  // ── Kelas state ───────────────────────────────────────────────────────────
  const [classes, setClasses] = useState<Class[]>([])
  const [studentListClass, setStudentListClass] = useState<Class | null>(null)
  const [studentListYearId, setStudentListYearId] = useState<number | null>(null)
  const [classMembers, setClassMembers] = useState<ClassMember[]>([])
  const [membersLoading, setMembersLoading] = useState(false)
  const [classesLoading, setClassesLoading] = useState(true)
  const [classError, setClassError] = useState<string | null>(null)
  const [selectedUnitId, setSelectedUnitId] = useState('')
  const [classModalOpen, setClassModalOpen] = useState(false)
  const [editingClass, setEditingClass] = useState<Class | null>(null)
  const [savingClass, setSavingClass] = useState(false)
  const [deleteClassTarget, setDeleteClassTarget] = useState<Class | null>(null)
  const [deletingClass, setDeletingClass] = useState(false)
  const [deleteErrorData, setDeleteErrorData] = useState<Record<string, number> | null>(null)

  // ── Unit Sekolah state ────────────────────────────────────────────────────
  const [unitsLoading, setUnitsLoading] = useState(true)
  const [unitError, setUnitError] = useState<string | null>(null)
  const [unitModalOpen, setUnitModalOpen] = useState(false)
  const [editingUnit, setEditingUnit] = useState<SchoolUnit | null>(null)
  const [savingUnit, setSavingUnit] = useState(false)
  const [deleteUnitTarget, setDeleteUnitTarget] = useState<SchoolUnit | null>(null)
  const [deletingUnit, setDeletingUnit] = useState(false)

  // ── Forms ─────────────────────────────────────────────────────────────────
  const classForm = useForm<ClassForm>({ resolver: zodResolver(classSchema) })
  const unitForm = useForm<UnitForm>({ resolver: zodResolver(unitSchema) })

  // ── Fetch functions ───────────────────────────────────────────────────────
  const fetchUnits = useCallback(async () => {
    try {
      setUnitsLoading(true)
      const [unitsRes, yearsRes] = await Promise.all([
        apiClient.get<SchoolUnit[]>('/master/school-units'),
        apiClient.get<SchoolYear[]>('/master/school-years'),
      ])
      setUnits(unitsRes.data)
      setSchoolYears(yearsRes.data)
      const active = yearsRes.data.find((y) => y.isActive)
      if (active) setActiveYearId(active.id)
    } catch {
      setUnitError('Gagal memuat data unit sekolah.')
    } finally {
      setUnitsLoading(false)
    }
  }, [])

  const fetchClasses = useCallback(async () => {
    try {
      setClassesLoading(true)
      const params: Record<string, string | number> = {}
      if (selectedUnitId) params.school_unit_id = selectedUnitId
      if (activeYearId) params.schoolYearId = activeYearId
      const res = await apiClient.get<Class[]>('/master/classes', { params })
      setClasses(res.data)
      setClassError(null)
    } catch {
      setClassError('Gagal memuat data. Pastikan server berjalan.')
    } finally {
      setClassesLoading(false)
    }
  }, [selectedUnitId, activeYearId])

  useEffect(() => { fetchUnits() }, [fetchUnits])
  useEffect(() => { fetchClasses() }, [fetchClasses])

  // ── Kelas handlers ────────────────────────────────────────────────────────
  const openCreateClass = () => {
    setEditingClass(null)
    classForm.reset({ name: '', level: undefined as unknown as number, schoolUnitId: undefined as unknown as number })
    setClassModalOpen(true)
  }

  const openEditClass = (row: Class) => {
    setEditingClass(row)
    classForm.reset({ name: row.name, level: row.level, schoolUnitId: row.schoolUnitId })
    setClassModalOpen(true)
  }

  const onSubmitClass = async (data: ClassForm) => {
    try {
      setSavingClass(true)
      const payload: CreateClassDto = { name: data.name, level: data.level, schoolUnitId: data.schoolUnitId }
      if (editingClass) {
        await apiClient.patch(`/master/classes/${editingClass.id}`, payload)
      } else {
        await apiClient.post('/master/classes', payload)
      }
      setClassModalOpen(false)
      await fetchClasses()
    } catch {
      setClassError('Gagal menyimpan kelas.')
    } finally {
      setSavingClass(false)
    }
  }

  const handleDeleteClass = async () => {
    if (!deleteClassTarget) return
    try {
      setDeletingClass(true)
      setClassError(null)
      await apiClient.delete(`/master/classes/${deleteClassTarget.id}`)
      setDeleteClassTarget(null)
      await fetchClasses()
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        setDeleteClassTarget(null)
        setDeleteErrorData(err.response.data.relatedData ?? {})
      } else {
        setClassError('Gagal menghapus kelas.')
      }
    } finally {
      setDeletingClass(false)
    }
  }

  // ── Daftar siswa handlers ─────────────────────────────────────────────────
  const fetchClassMembers = async (classId: number, yearId: number | null) => {
    if (!yearId) return
    setMembersLoading(true)
    try {
      const res = await apiClient.get<ClassMember[]>('/master/student-classes', {
        params: { classId, schoolYearId: yearId },
      })
      setClassMembers(res.data)
    } catch {
      setClassMembers([])
    } finally {
      setMembersLoading(false)
    }
  }

  const handleOpenStudentList = async (cls: Class) => {
    setStudentListClass(cls)
    setStudentListYearId(activeYearId)
    await fetchClassMembers(cls.id, activeYearId)
  }

  // ── Unit Sekolah handlers ─────────────────────────────────────────────────
  const openCreateUnit = () => {
    setEditingUnit(null)
    unitForm.reset({ name: '', code: '' })
    setUnitModalOpen(true)
  }

  const openEditUnit = (unit: SchoolUnit) => {
    setEditingUnit(unit)
    unitForm.reset({ name: unit.name, code: unit.code })
    setUnitModalOpen(true)
  }

  const onSubmitUnit = async (data: UnitForm) => {
    try {
      setSavingUnit(true)
      const payload: CreateSchoolUnitDto = { name: data.name, code: data.code }
      if (editingUnit) {
        await apiClient.patch(`/master/school-units/${editingUnit.id}`, payload)
      } else {
        await apiClient.post('/master/school-units', payload)
      }
      setUnitModalOpen(false)
      await fetchUnits()
    } catch (err: any) {
      setUnitError(err.response?.data?.message || 'Gagal menyimpan unit sekolah.')
    } finally {
      setSavingUnit(false)
    }
  }

  const handleDeleteUnit = async () => {
    if (!deleteUnitTarget) return
    try {
      setDeletingUnit(true)
      setUnitError(null)
      await apiClient.delete(`/master/school-units/${deleteUnitTarget.id}`)
      setDeleteUnitTarget(null)
      await fetchUnits()
    } catch (err: any) {
      setUnitError(err.response?.data?.message || 'Gagal menghapus unit sekolah.')
    } finally {
      setDeletingUnit(false)
    }
  }

  const selectedUnitValue = classForm.watch('schoolUnitId')

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="p-6">
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Kelas</h1>
        <p className="text-gray-500 mt-1">Kelola data kelas dan unit sekolah</p>
      </div>
      <p className="text-xs italic text-gray-400 mb-4">
        Kelola daftar kelas dan unit sekolah. Pada tab Kelas, klik baris kelas untuk melihat daftar siswanya. Pada tab Unit Sekolah, kelola jenjang atau satuan pendidikan yang tersedia.
      </p>

      {/* Tab bar */}
      <div className="flex border-b border-gray-200 mb-6">
        {(['kelas', 'unit'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-[#00A651] text-[#00A651]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'kelas' ? 'Kelas' : 'Unit Sekolah'}
          </button>
        ))}
      </div>

      {/* ── TAB KELAS ─────────────────────────────────────────────────────── */}
      {activeTab === 'kelas' && (
        <>
          <div className="flex items-center justify-between mb-4">
            <select
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#00A651] focus:border-transparent"
              value={selectedUnitId}
              onChange={(e) => setSelectedUnitId(e.target.value)}
            >
              <option value="">Semua Unit</option>
              {units.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
            <Button className="bg-[#00A651] hover:bg-[#008C44]" onClick={openCreateClass}>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Kelas
            </Button>
          </div>

          {classError && !deleteClassTarget && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm mb-4">
              {classError}
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  {['Nama Kelas', 'Tingkat', 'Unit Sekolah', 'Jumlah Siswa', 'Aksi'].map((col) => (
                    <th key={col} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {classesLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i}><td colSpan={5} className="px-6 py-4"><div className="animate-pulse bg-gray-200 h-6 rounded" /></td></tr>
                  ))
                ) : classes.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-400">Belum ada data kelas</td></tr>
                ) : (
                  classes.map((row) => (
                    <tr
                      key={row.id}
                      className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleOpenStudentList(row)}
                    >
                      <td className="px-6 py-4 text-sm text-gray-800 font-medium">{row.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{row.level}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{row.unitName}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{row.studentCount ?? 0}</td>
                      <td className="px-6 py-4 flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); openEditClass(row) }}>
                          <Pencil className="w-3.5 h-3.5 mr-1" />Edit
                        </Button>
                        <Button
                          size="sm" variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={(e) => { e.stopPropagation(); setClassError(null); setDeleteClassTarget(row) }}
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" />Hapus
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <DeleteErrorModal
            open={deleteErrorData !== null}
            onClose={() => setDeleteErrorData(null)}
            relatedData={deleteErrorData ?? {}}
          />

          {/* Modal Create/Edit Kelas */}
          <Dialog open={classModalOpen} onOpenChange={setClassModalOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{editingClass ? 'Edit Kelas' : 'Tambah Kelas'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={classForm.handleSubmit(onSubmitClass)} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="className">Nama Kelas</Label>
                  <Input id="className" placeholder="1A" {...classForm.register('name')} />
                  {classForm.formState.errors.name && <p className="text-sm text-red-500">{classForm.formState.errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="level">Tingkat</Label>
                  <Input id="level" type="number" min={1} max={12} placeholder="1" {...classForm.register('level')} />
                  {classForm.formState.errors.level && <p className="text-sm text-red-500">{classForm.formState.errors.level.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Unit Sekolah</Label>
                  <Select
                    value={selectedUnitValue ? String(selectedUnitValue) : ''}
                    onValueChange={(v) => classForm.setValue('schoolUnitId', Number(v), { shouldValidate: true })}
                  >
                    <SelectTrigger><SelectValue placeholder="Pilih unit sekolah" /></SelectTrigger>
                    <SelectContent>
                      {units.map((u) => (
                        <SelectItem key={u.id} value={String(u.id)}>{u.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {classForm.formState.errors.schoolUnitId && <p className="text-sm text-red-500">{classForm.formState.errors.schoolUnitId.message}</p>}
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setClassModalOpen(false)}>Batal</Button>
                  <Button type="submit" className="bg-[#00A651] hover:bg-[#008C44]" disabled={savingClass}>
                    {savingClass ? 'Menyimpan...' : 'Simpan'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Dialog Konfirmasi Hapus Kelas */}
          <Dialog open={!!deleteClassTarget} onOpenChange={(open) => { if (!open) { setDeleteClassTarget(null); setClassError(null) } }}>
            <DialogContent className="sm:max-w-sm">
              <DialogHeader><DialogTitle>Hapus Kelas</DialogTitle></DialogHeader>
              <p className="text-sm text-gray-600 py-2">
                Hapus kelas <strong>{deleteClassTarget?.name}</strong>? Tindakan ini tidak bisa dibatalkan.
              </p>
              {classError && <p className="text-sm text-red-600">{classError}</p>}
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => { setDeleteClassTarget(null); setClassError(null) }}>Batal</Button>
                <Button className="bg-red-600 hover:bg-red-700 text-white" disabled={deletingClass} onClick={handleDeleteClass}>
                  {deletingClass ? 'Menghapus...' : 'Hapus'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Dialog Daftar Siswa */}
          <Dialog open={!!studentListClass} onOpenChange={(open) => { if (!open) setStudentListClass(null) }}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Siswa Kelas {studentListClass?.name}</DialogTitle>
                <DialogDescription asChild>
                  <div>
                    <Select
                      value={studentListYearId?.toString() ?? '__none__'}
                      onValueChange={(v) => {
                        const id = Number(v)
                        setStudentListYearId(id)
                        if (studentListClass) fetchClassMembers(studentListClass.id, id)
                      }}
                    >
                      <SelectTrigger className="mt-2 h-8 text-sm">
                        <SelectValue placeholder="Pilih tahun pelajaran" />
                      </SelectTrigger>
                      <SelectContent>
                        {schoolYears.map((y) => (
                          <SelectItem key={y.id} value={y.id.toString()}>
                            {y.name}{y.isActive ? ' (Aktif)' : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </DialogDescription>
              </DialogHeader>
              <div className="max-h-80 overflow-auto">
                {membersLoading ? (
                  <p className="text-sm text-gray-400 py-4 text-center">Memuat...</p>
                ) : classMembers.length === 0 ? (
                  <p className="text-sm text-gray-400 py-4 text-center">Tidak ada siswa di kelas ini</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        <th className="text-left px-4 py-2 font-medium text-gray-600">NIS</th>
                        <th className="text-left px-4 py-2 font-medium text-gray-600">Nama</th>
                        <th className="text-left px-4 py-2 font-medium text-gray-600">JK</th>
                      </tr>
                    </thead>
                    <tbody>
                      {classMembers.map((m) => (
                        <tr key={m.enrollmentId} className="border-b last:border-0">
                          <td className="px-4 py-2 font-mono text-xs">{m.nis}</td>
                          <td className="px-4 py-2">{m.name}</td>
                          <td className="px-4 py-2">{m.gender}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}

      {/* ── TAB UNIT SEKOLAH ──────────────────────────────────────────────── */}
      {activeTab === 'unit' && (
        <>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-500">{units.length} unit sekolah terdaftar</span>
            <Button className="bg-[#00A651] hover:bg-[#008C44]" onClick={openCreateUnit}>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Unit
            </Button>
          </div>

          {unitError && !deleteUnitTarget && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm mb-4">
              {unitError}
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  {['Nama Unit', 'Kode', 'Jumlah Kelas', 'Aksi'].map((col) => (
                    <th key={col} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {unitsLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i}><td colSpan={4} className="px-6 py-4"><div className="animate-pulse bg-gray-200 h-6 rounded" /></td></tr>
                  ))
                ) : units.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-400">Belum ada data unit sekolah</td></tr>
                ) : (
                  units.map((row) => (
                    <tr key={row.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-800 font-medium">{row.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-mono">{row.code}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{row.classCount}</td>
                      <td className="px-6 py-4 flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEditUnit(row)}>
                          <Pencil className="w-3.5 h-3.5 mr-1" />Edit
                        </Button>
                        <Button
                          size="sm" variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => { setUnitError(null); setDeleteUnitTarget(row) }}
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" />Hapus
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Modal Create/Edit Unit Sekolah */}
          <Dialog open={unitModalOpen} onOpenChange={setUnitModalOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{editingUnit ? 'Edit Unit Sekolah' : 'Tambah Unit Sekolah'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={unitForm.handleSubmit(onSubmitUnit)} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="unitName">Nama Unit</Label>
                  <Input id="unitName" placeholder="SD Al-Hasaniyyah" {...unitForm.register('name')} />
                  {unitForm.formState.errors.name && <p className="text-sm text-red-500">{unitForm.formState.errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unitCode">Kode</Label>
                  <Input id="unitCode" placeholder="SD" {...unitForm.register('code')} className="uppercase" />
                  {unitForm.formState.errors.code && <p className="text-sm text-red-500">{unitForm.formState.errors.code.message}</p>}
                </div>
                {unitError && <p className="text-sm text-red-600">{unitError}</p>}
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => { setUnitModalOpen(false); setUnitError(null) }}>Batal</Button>
                  <Button type="submit" className="bg-[#00A651] hover:bg-[#008C44]" disabled={savingUnit}>
                    {savingUnit ? 'Menyimpan...' : 'Simpan'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Dialog Konfirmasi Hapus Unit */}
          <Dialog open={!!deleteUnitTarget} onOpenChange={(open) => { if (!open) { setDeleteUnitTarget(null); setUnitError(null) } }}>
            <DialogContent className="sm:max-w-sm">
              <DialogHeader><DialogTitle>Hapus Unit Sekolah</DialogTitle></DialogHeader>
              <p className="text-sm text-gray-600 py-2">
                Hapus unit <strong>{deleteUnitTarget?.name}</strong>? Tindakan ini tidak bisa dibatalkan.
              </p>
              {unitError && <p className="text-sm text-red-600">{unitError}</p>}
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => { setDeleteUnitTarget(null); setUnitError(null) }}>Batal</Button>
                <Button className="bg-red-600 hover:bg-red-700 text-white" disabled={deletingUnit} onClick={handleDeleteUnit}>
                  {deletingUnit ? 'Menghapus...' : 'Hapus'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  )
}
