import { useEffect, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pencil, GraduationCap, Trash2, MoreVertical, Eye, Upload } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { apiClient } from '@/lib/api'
import { DeleteErrorModal } from '@/components/ui/delete-error-modal'
import type { Student, StudentClass, SchoolUnit, Class as _Class, SchoolYear } from '@/types/master'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const studentSchema = z.object({
  nisn: z.string().max(20).optional().or(z.literal('')),
  name: z.string().min(1, 'Wajib diisi').max(255, 'Maksimal 255 karakter'),
  gender: z.enum(['L', 'P'], { required_error: 'Pilih jenis kelamin' }),
  birthPlace: z.string().min(1, 'Wajib diisi').max(100, 'Maksimal 100 karakter'),
  birthDate: z.string().min(1, 'Wajib diisi'),
  parentName: z.string().min(1, 'Wajib diisi').max(255, 'Maksimal 255 karakter'),
  phone: z.string().max(20).optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  registrationStatus: z.enum(['baru', 'pindahan', 'mengulang'], { required_error: 'Pilih status' }),
  entryYear: z.coerce.number().int().min(2000, 'Minimal 2000').max(2099, 'Maksimal 2099'),
})

type StudentFormData = z.infer<typeof studentSchema>

const GENDER_LABELS: Record<string, string> = { L: 'Laki-laki', P: 'Perempuan' }
const STATUS_CLASSES: Record<string, string> = {
  aktif: 'bg-green-100 text-green-800',
  lulus: 'bg-blue-100 text-blue-800',
  keluar: 'bg-red-100 text-red-800',
  pindah: 'bg-orange-100 text-orange-800',
}

export default function SiswaPage() {
  const navigate = useNavigate()
  const [data, setData] = useState<Student[]>([])
  const [units, setUnits] = useState<SchoolUnit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedUnitId, setSelectedUnitId] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = selectedUnitId
        ? await apiClient.get<Student[]>(`/master/students?school_unit_id=${selectedUnitId}`)
        : await apiClient.get<Student[]>('/master/students')
      setData(res.data)
      setError(null)
    } catch {
      setError('Gagal memuat data siswa.')
    } finally {
      setLoading(false)
    }
  }, [selectedUnitId])

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Student | null>(null)
  const [saving, setSaving] = useState(false)

  const [enrollModalOpen, setEnrollModalOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [enrollments, setEnrollments] = useState<StudentClass[]>([])
  const [enrollLoading, setEnrollLoading] = useState(false)
  const [classes, setClasses] = useState<_Class[]>([])
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([])
  const [enrollClassId, setEnrollClassId] = useState<string>('')
  const [enrollYearId, setEnrollYearId] = useState<string>('')
  const [enrollSaving, setEnrollSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteErrorData, setDeleteErrorData] = useState<Record<string, number> | null>(null)

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    apiClient.get<SchoolUnit[]>('/master/school-units').then(r => setUnits(r.data)).catch(() => {})
  }, [])

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      nisn: '',
      name: '',
      birthPlace: '',
      birthDate: '',
      parentName: '',
      phone: '',
      address: '',
      registrationStatus: 'baru',
      entryYear: new Date().getFullYear(),
    },
  })

  const openCreate = () => {
    setEditing(null)
    reset({
      nisn: '', name: '', gender: undefined as unknown as 'L', birthPlace: '', birthDate: '',
      parentName: '', phone: '', address: '', registrationStatus: undefined as unknown as 'baru',
      entryYear: undefined as unknown as number,
    })
    setModalOpen(true)
  }

  const openEdit = (row: Student) => {
    setEditing(row)
    reset({
      nisn: row.nisn ?? '',
      name: row.name,
      gender: row.gender,
      birthPlace: row.birthPlace,
      birthDate: row.birthDate,
      parentName: row.parentName,
      phone: row.phone ?? '',
      address: row.address ?? '',
      registrationStatus: row.registrationStatus,
      entryYear: row.entryYear,
    })
    setModalOpen(true)
  }

  const onSubmit = async (formData: StudentFormData) => {
    try {
      setSaving(true)
      const payload: Record<string, unknown> = {
        name: formData.name,
        gender: formData.gender,
        birthPlace: formData.birthPlace,
        birthDate: formData.birthDate,
        parentName: formData.parentName,
        registrationStatus: formData.registrationStatus,
      }
      if (formData.nisn) payload.nisn = formData.nisn
      if (formData.phone) payload.phone = formData.phone
      if (formData.address) payload.address = formData.address
      if (!editing) payload.entryYear = formData.entryYear

      if (editing) {
        await apiClient.patch(`/master/students/${editing.id}`, payload)
      } else {
        await apiClient.post('/master/students', payload)
      }
      setModalOpen(false)
      await fetchData()
    } catch {
      setError('Gagal menyimpan data.')
    } finally {
      setSaving(false)
    }
  }

  const openEnroll = async (student: Student) => {
    setSelectedStudent(student)
    setEnrollModalOpen(true)
    setEnrollClassId('')
    setEnrollYearId('')
    try {
      setEnrollLoading(true)
      const [eRes, cRes, yRes] = await Promise.all([
        apiClient.get<StudentClass[]>(`/master/students/${student.id}/classes`),
        apiClient.get<_Class[]>('/master/classes'),
        apiClient.get<SchoolYear[]>('/master/school-years'),
      ])
      setEnrollments(eRes.data)
      setClasses(cRes.data)
      setSchoolYears(yRes.data)
    } catch {
      setError('Gagal memuat data enrollment.')
    } finally {
      setEnrollLoading(false)
    }
  }

  const handleEnroll = async () => {
    if (!selectedStudent || !enrollClassId || !enrollYearId) return
    const existingEnrollment = enrollments.find(
      (e) => e.schoolYearId === Number(enrollYearId)
    )
    try {
      setEnrollSaving(true)
      if (existingEnrollment) {
        await apiClient.patch(`/master/student-classes/${existingEnrollment.id}/transfer`, {
          classId: Number(enrollClassId),
        })
      } else {
        await apiClient.post('/master/student-classes', {
          studentId: selectedStudent.id,
          classId: Number(enrollClassId),
          schoolYearId: Number(enrollYearId),
        })
      }
      const eRes = await apiClient.get<StudentClass[]>(`/master/students/${selectedStudent.id}/classes`)
      setEnrollments(eRes.data)
      setEnrollClassId('')
      setEnrollYearId('')
      await fetchData()
    } catch {
      setError(existingEnrollment ? 'Gagal memindahkan kelas.' : 'Gagal menambahkan enrollment.')
    } finally {
      setEnrollSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      setDeleting(true)
      await apiClient.delete(`/master/students/${id}`)
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

  const genderValue = watch('gender')
  const regStatusValue = watch('registrationStatus')

  return (<div className="p-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Siswa</h1>
          <p className="text-gray-500 mt-1">Kelola data siswa per unit sekolah</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedUnitId} onValueChange={setSelectedUnitId}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Semua Unit" />
            </SelectTrigger>
            <SelectContent>
              {units.map((u) => (
                <SelectItem key={u.id} value={String(u.id)}>{u.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button className="bg-accent hover:bg-accent/90" onClick={openCreate}>
            <Plus className="size-4 mr-2" />
            Tambah Siswa
          </Button>
          <Button variant="outline" className="border-[#00A651] text-accent hover:bg-accent hover:text-white" onClick={() => navigate('/master/siswa/import')}>
            <Upload className="size-4 mr-2" />
            Import Data
          </Button>
        </div>
      </div>
      <p className="text-xs italic text-gray-400 mb-4">
        Daftar seluruh siswa yang terdaftar di sekolah. Gunakan filter Unit Sekolah untuk melihat data per jenjang. Klik ikon kelas untuk melihat riwayat kelas siswa.
      </p>

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm mb-6">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto hover:shadow-md transition-shadow duration-200">
        <table>
          <thead>
            <tr>
              {['NIS', 'Nama', 'Gender', 'Kelas Aktif', 'Unit', 'Status', 'Aksi'].map((col) => (
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
                  <td colSpan={7} className="px-6 py-4">
                     <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" /><div className="mt-2 h-4 bg-gray-200 rounded animate-pulse w-1/2" />
                  </td>
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-400">
                  Belum ada data siswa
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={row.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-700 font-mono">{row.nis}</td>
                  <td className="px-6 py-4 text-sm text-gray-800 font-medium">{row.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{GENDER_LABELS[row.gender] ?? row.gender}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{row.activeClassName ?? '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{row.activeUnitName ?? '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${STATUS_CLASSES[row.studentStatus] ?? 'bg-gray-100 text-gray-600'}`}>
                      {row.studentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="size-7 p-0">
                          <MoreVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/master/siswa/${row.id}`)}>
                          <Eye className="size-3.5 mr-2" />
                          Lihat Detail
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEdit(row)}>
                          <Pencil className="size-3.5 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEnroll(row)}>
                          <GraduationCap className="size-3.5 mr-2" />
                          Kelas
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onClick={() => setDeleteTarget(row)}
                        >
                          <Trash2 className="size-3.5 mr-2" />
                          Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
          <DialogHeader><DialogTitle>Hapus Siswa</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600 py-2">Hapus <strong>{deleteTarget?.name}</strong>? Tindakan ini tidak bisa dibatalkan.</p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Batal</Button>
            <Button variant="destructive" disabled={deleting} onClick={() => deleteTarget && handleDelete(deleteTarget.id)}>
              {deleting ? 'Menghapus...' : 'Hapus'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Create/Edit */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Siswa' : 'Tambah Siswa'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
            {/* Section 1: Identitas */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 border-b border-gray-200 pb-1">
                Identitas
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nisn">NISN</Label>
                  <Input id="nisn" placeholder="Opsional" {...register('nisn')} />
                  {errors.nisn && <p className="text-sm text-red-500">{errors.nisn.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Lengkap *</Label>
                  <Input id="name" placeholder="Nama lengkap siswa" {...register('name')} />
                  {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Jenis Kelamin *</Label>
                  <Select
                    value={genderValue ?? ''}
                    onValueChange={(v) => setValue('gender', v as 'L' | 'P', { shouldValidate: true })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="L">Laki-laki</SelectItem>
                      <SelectItem value="P">Perempuan</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gender && <p className="text-sm text-red-500">{errors.gender.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birthPlace">Tempat Lahir *</Label>
                  <Input id="birthPlace" placeholder="Kota kelahiran" {...register('birthPlace')} />
                  {errors.birthPlace && <p className="text-sm text-red-500">{errors.birthPlace.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birthDate">Tanggal Lahir *</Label>
                  <Input id="birthDate" type="date" {...register('birthDate')} />
                  {errors.birthDate && <p className="text-sm text-red-500">{errors.birthDate.message}</p>}
                </div>
              </div>
            </div>

            {/* Section 2: Kontak */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 border-b border-gray-200 pb-1">
                Kontak
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="parentName">Nama Orang Tua *</Label>
                  <Input id="parentName" placeholder="Nama orang tua" {...register('parentName')} />
                  {errors.parentName && <p className="text-sm text-red-500">{errors.parentName.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telepon</Label>
                  <Input id="phone" placeholder="Opsional" {...register('phone')} />
                  {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Alamat</Label>
                <Input id="address" placeholder="Opsional" {...register('address')} />
                {errors.address && <p className="text-sm text-red-500">{errors.address.message}</p>}
              </div>
            </div>

            {/* Section 3: Status Pendaftaran */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 border-b border-gray-200 pb-1">
                Status Pendaftaran
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Jenis Pendaftaran *</Label>
                  <Select
                    value={regStatusValue ?? ''}
                    onValueChange={(v) => setValue('registrationStatus', v as 'baru' | 'pindahan' | 'mengulang', { shouldValidate: true })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baru">Baru</SelectItem>
                      <SelectItem value="pindahan">Pindahan</SelectItem>
                      <SelectItem value="mengulang">Mengulang</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.registrationStatus && <p className="text-sm text-red-500">{errors.registrationStatus.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="entryYear">Tahun Masuk *</Label>
                  <Input
                    id="entryYear"
                    type="number"
                    placeholder="2026"
                    disabled={!!editing}
                    {...register('entryYear')}
                  />
                  {errors.entryYear && <p className="text-sm text-red-500">{errors.entryYear.message}</p>}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Batal
              </Button>
              <Button type="submit" className="bg-accent hover:bg-accent/90" disabled={saving}>
                {saving ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Enrollment */}
      <Dialog open={enrollModalOpen} onOpenChange={setEnrollModalOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Kelas — {selectedStudent?.name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* Riwayat Kelas */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Riwayat Kelas</h3>
              <div className="border rounded-lg overflow-hidden max-h-48 overflow-y-auto">
                <table>
                  <thead>
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Kelas</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Tingkat</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Unit</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Tahun</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrollLoading ? (
                      <tr>
                        <td colSpan={5} className="px-3 py-4 text-center text-sm text-gray-400">Memuat...</td>
                      </tr>
                    ) : enrollments.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-3 py-4 text-center text-sm text-gray-400">Belum ada riwayat kelas</td>
                      </tr>
                    ) : (
                      enrollments.map((e) => (
                        <tr key={e.id} className="border-t border-gray-100">
                          <td className="px-3 py-2 text-gray-800 font-medium">{e.className}</td>
                          <td className="px-3 py-2 text-gray-600">{e.classLevel}</td>
                          <td className="px-3 py-2 text-gray-600">{e.unitName}</td>
                          <td className="px-3 py-2 text-gray-600">{e.yearName}</td>
                          <td className="px-3 py-2">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${e.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                              {e.isActive ? 'Aktif' : 'Nonaktif'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Form Tambah / Pindah Kelas */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                {enrollments.find((e) => e.schoolYearId === Number(enrollYearId)) && enrollYearId
                  ? 'Pindah Kelas'
                  : 'Tambah ke Kelas'}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Kelas</Label>
                  <Select value={enrollClassId} onValueChange={setEnrollClassId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kelas" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.name} — {c.unitName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Tahun Ajaran</Label>
                  <Select value={enrollYearId} onValueChange={setEnrollYearId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih tahun" />
                    </SelectTrigger>
                    <SelectContent>
                      {schoolYears.map((y) => (
                        <SelectItem key={y.id} value={String(y.id)}>{y.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <Button
                  className="bg-accent hover:bg-accent/90"
                  onClick={handleEnroll}
                  disabled={!enrollClassId || !enrollYearId || enrollSaving}
                >
                  {enrollSaving
                    ? 'Menyimpan...'
                    : enrollments.find((e) => e.schoolYearId === Number(enrollYearId)) && enrollYearId
                    ? 'Pindah Kelas'
                    : 'Simpan'}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
