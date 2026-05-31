import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/api'
import type {
  SchoolYear,
  SchoolUnit,
  Class,
  ClassMember,
  MappingAvailableStudent,
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { AlertDialog } from '@/components/ui/alert-dialog'

function formatGender(g: 'L' | 'P') {
  return g === 'L' ? 'Laki-laki' : 'Perempuan'
}

export default function ClassMappingPage() {
  // ── Master data ──────────────────────────────────────────────────────────
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([])
  const [schoolUnits, setSchoolUnits] = useState<SchoolUnit[]>([])
  const [classes, setClasses] = useState<Class[]>([])

  // ── Selection state ──────────────────────────────────────────────────────
  const [selectedYearId, setSelectedYearId] = useState<number | null>(null)
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null)
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null)
  const [selectedClassName, setSelectedClassName] = useState<string>('')

  // ── Table data ───────────────────────────────────────────────────────────
  const [currentMembers, setCurrentMembers] = useState<ClassMember[]>([])
  const [availableStudents, setAvailableStudents] = useState<MappingAvailableStudent[]>([])
  const [staging, setStaging] = useState<MappingAvailableStudent[]>([])

  // ── Filter state ─────────────────────────────────────────────────────────
  const [filterSearch, setFilterSearch] = useState('')
  const [filterClassId, setFilterClassId] = useState('')

  // ── UI state ─────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [lepasTarget, setLepasTarget] = useState<ClassMember | null>(null)

  // ── Fetch master data on mount ───────────────────────────────────────────
  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const [yearsRes, unitsRes] = await Promise.all([
          apiClient.get<SchoolYear[]>('/master/school-years'),
          apiClient.get<SchoolUnit[]>('/master/school-units'),
        ])
        setSchoolYears(yearsRes.data)
        setSchoolUnits(unitsRes.data)
        const active = yearsRes.data.find((y) => y.isActive)
        if (active) setSelectedYearId(active.id)
      } catch {
        setError('Gagal memuat data awal.')
      }
    }
    fetchInitial()
  }, [])

  // ── Fetch classes when unit changes ─────────────────────────────────────
  useEffect(() => {
    if (!selectedUnitId) {
      setClasses([])
      setSelectedClassId(null)
      setSelectedClassName('')
      return
    }
    apiClient
      .get<Class[]>('/master/classes', { params: { school_unit_id: selectedUnitId } })
      .then((res) => {
        setClasses(res.data)
        setSelectedClassId(null)
        setSelectedClassName('')
      })
      .catch(() => setError('Gagal memuat daftar kelas.'))
  }, [selectedUnitId])

  // ── Fetch class data when class changes ──────────────────────────────────
  const fetchClassData = useCallback(async (classId: number, yearId: number) => {
    try {
      const [membersRes, availableRes] = await Promise.all([
        apiClient.get<ClassMember[]>('/master/student-classes', {
          params: { classId, schoolYearId: yearId },
        }),
        apiClient.get<MappingAvailableStudent[]>('/master/students/mapping', {
          params: { schoolYearId: yearId, excludeClassId: classId },
        }),
      ])
      setCurrentMembers(membersRes.data)
      setAvailableStudents(availableRes.data)
      setStaging([])
      setFilterSearch('')
      setFilterClassId('')
    } catch {
      setError('Gagal memuat data siswa kelas.')
    }
  }, [])

  useEffect(() => {
    if (selectedClassId && selectedYearId) {
      fetchClassData(selectedClassId, selectedYearId)
    } else {
      setCurrentMembers([])
      setAvailableStudents([])
      setStaging([])
    }
  }, [selectedClassId, selectedYearId, fetchClassData])

  // ── Handlers ─────────────────────────────────────────────────────────────
  const executeLepas = async (member: ClassMember) => {
    if (!selectedClassId || !selectedYearId) return
    try {
      await apiClient.delete(`/master/student-classes/${member.enrollmentId}`)
      await fetchClassData(selectedClassId, selectedYearId)
    } catch {
      setError('Gagal melepas siswa dari kelas.')
    } finally {
      setLepasTarget(null)
    }
  }

  const handleAddToStaging = (student: MappingAvailableStudent) => {
    setStaging((prev) => [...prev, student])
  }

  const handleRemoveFromStaging = (student: MappingAvailableStudent) => {
    setStaging((prev) => prev.filter((s) => s.id !== student.id))
  }

  const handleProses = async () => {
    if (!selectedClassId || !selectedYearId || staging.length === 0) return
    setLoading(true)
    setError(null)
    try {
      await Promise.all(
        staging.map((s) => {
          if (s.enrollmentId) {
            return apiClient.patch(`/master/student-classes/${s.enrollmentId}/transfer`, {
              classId: selectedClassId,
            })
          } else {
            return apiClient.post('/master/student-classes', {
              studentId: s.id,
              classId: selectedClassId,
              schoolYearId: selectedYearId,
            })
          }
        }),
      )
      setStaging([])
      await fetchClassData(selectedClassId, selectedYearId)
    } catch {
      setError('Proses gagal. Periksa koneksi dan coba lagi.')
    } finally {
      setLoading(false)
      setConfirmOpen(false)
    }
  }

  // ── Dropdown options dari unique currentClassName ─────────────────────────
  const classOptions = Array.from(
    new Set(availableStudents.map((s) => s.currentClassName).filter(Boolean))
  ).sort() as string[]

  // ── Filtered available students (exclude staging) ─────────────────────────
  const stagingIds = new Set(staging.map((s) => s.id))
  const filteredAvailable = availableStudents.filter((s) => {
    if (stagingIds.has(s.id)) return false
    if (filterSearch) {
      const q = filterSearch.toLowerCase()
      if (!s.nis.toLowerCase().includes(q) && !s.name.toLowerCase().includes(q)) return false
    }
    if (filterClassId === '__none__') {
      if (s.currentClassName !== null) return false
    } else if (filterClassId && (s.currentClassName ?? '') !== filterClassId) {
      return false
    }
    return true
  })

  // ── Render ────────────────────────────────────────────────────────────────
  return (<div className="p-6 animate-fade-in-up space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mapping Kelas</h1>
        <p className="text-sm text-gray-500 mt-1">Assign siswa ke kelas berdasarkan tahun pelajaran</p>
      </div>
      <p className="text-xs italic text-red-500 -mt-4">
        Gunakan halaman ini untuk memasukkan siswa ke dalam kelas. Pilih tahun pelajaran, unit sekolah, dan kelas terlebih dahulu. Periksa daftar siswa sebelum mengklik Proses — tindakan ini langsung mengubah data kelas siswa.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md px-4 py-3 text-sm text-red-700">
          {error}
          <button className="ml-2 underline" onClick={() => setError(null)}>Tutup</button>
        </div>
      )}

      {/* Filter bar */}
      <div className="bg-white rounded-xl border p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Tahun Pelajaran */}
          <div className="space-y-1">
            <Label>Tahun Pelajaran</Label>
            <Select
              value={selectedYearId?.toString() ?? ''}
              onValueChange={(v) => setSelectedYearId(Number(v))}
            >
              <SelectTrigger>
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

          {/* Unit Sekolah */}
          <div className="space-y-1">
            <Label>Unit Sekolah</Label>
            <Select
              value={selectedUnitId?.toString() ?? ''}
              onValueChange={(v) => setSelectedUnitId(Number(v))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih unit sekolah" />
              </SelectTrigger>
              <SelectContent>
                {schoolUnits.map((u) => (
                  <SelectItem key={u.id} value={u.id.toString()}>
                    {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Kelas */}
          <div className="space-y-1">
            <Label>Kelas (Target)</Label>
            <Select
              value={selectedClassId?.toString() ?? ''}
              onValueChange={(v) => {
                const cls = classes.find((c) => c.id === Number(v))
                setSelectedClassId(Number(v))
                setSelectedClassName(cls?.name ?? '')
              }}
              disabled={!selectedUnitId}
            >
              <SelectTrigger>
                <SelectValue placeholder={selectedUnitId ? 'Pilih kelas' : 'Pilih unit dulu'} />
              </SelectTrigger>
              <SelectContent>
                {classes.map((c) => (
                  <SelectItem key={c.id} value={c.id.toString()}>
                    {c.name} (Level {c.level})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Tabel atas: siswa di kelas terpilih */}
      {selectedClassId && (
        <div className="bg-white rounded-xl border">
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-800">
                Siswa di Kelas {selectedClassName}
              </h2>
              <p className="text-xs text-gray-500">{currentMembers.length} siswa terdaftar</p>
            </div>
          </div>
          {currentMembers.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-gray-400">
              Belum ada siswa di kelas ini
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left px-4 py-2 font-medium text-gray-600">NIS</th>
                    <th className="text-left px-4 py-2 font-medium text-gray-600">Nama</th>
                    <th className="text-left px-4 py-2 font-medium text-gray-600">Jenis Kelamin</th>
                    <th className="text-left px-4 py-2 font-medium text-gray-600">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {currentMembers.map((m) => (
                    <tr key={m.enrollmentId} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-2 font-mono tabular-nums text-xs">{m.nis}</td>
                      <td className="px-4 py-2">{m.name}</td>
                      <td className="px-4 py-2">{formatGender(m.gender)}</td>
                      <td className="px-4 py-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700"
                          onClick={() => setLepasTarget(m)}
                        >
                          Lepas
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Dual table: tersedia + staging */}
      {selectedClassId && (
        <>
          <div className="border-t pt-2">
            <p className="text-sm font-medium text-gray-600">Tambah Siswa ke Kelas</p>
            <p className="text-xs text-gray-400">
              Klik baris siswa di tabel kiri untuk menambahkan ke staging, lalu klik Proses
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Tabel kiri: siswa tersedia */}
            <div className="bg-white rounded-xl border">
              <div className="px-4 py-3 border-b">
                <h3 className="font-medium text-gray-800">
                  Siswa Tersedia ({filteredAvailable.length})
                </h3>
              </div>

              {/* Filter inputs */}
              <div className="px-4 py-3 border-b space-y-2">
                <Input
                  placeholder="Cari NIS atau Nama..."
                  value={filterSearch}
                  onChange={(e) => setFilterSearch(e.target.value)}
                  className="h-8 text-sm"
                />
                <Select
                  value={filterClassId || '__all__'}
                  onValueChange={(v) => setFilterClassId(v === '__all__' ? '' : v)}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Semua Kelas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">Semua Kelas</SelectItem>
                    <SelectItem value="__none__">Tanpa Kelas</SelectItem>
                    {classOptions.map((cls) => (
                      <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="overflow-auto max-h-96">
                {filteredAvailable.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-gray-400">
                    Tidak ada siswa tersedia
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        <th className="text-left px-3 py-2 font-medium text-gray-600">NIS</th>
                        <th className="text-left px-3 py-2 font-medium text-gray-600">Nama</th>
                        <th className="text-left px-3 py-2 font-medium text-gray-600">JK</th>
                        <th className="text-left px-3 py-2 font-medium text-gray-600">Kelas Saat Ini</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAvailable.map((s) => (
                        <tr
                          key={s.id}
                          className="border-b last:border-0 cursor-pointer hover:bg-green-50 transition-colors"
                          onClick={() => handleAddToStaging(s)}
                        >
                          <td className="px-3 py-2 font-mono tabular-nums text-xs">{s.nis}</td>
                          <td className="px-3 py-2">{s.name}</td>
                          <td className="px-3 py-2">{s.gender}</td>
                          <td className="px-3 py-2 text-gray-500">
                            {s.currentClassName ?? '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Tabel kanan: staging */}
            <div className="bg-white rounded-xl border">
              <div className="px-4 py-3 border-b">
                <h3 className="font-medium text-gray-800">
                  Akan Dipindahkan ({staging.length})
                </h3>
              </div>

              <div className="overflow-auto max-h-96">
                {staging.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-gray-400">
                    Klik siswa di kiri untuk menambahkan
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        <th className="text-left px-3 py-2 font-medium text-gray-600">NIS</th>
                        <th className="text-left px-3 py-2 font-medium text-gray-600">Nama</th>
                        <th className="text-left px-3 py-2 font-medium text-gray-600">JK</th>
                        <th className="text-left px-3 py-2 font-medium text-gray-600">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {staging.map((s) => (
                        <tr key={s.id} className="border-b last:border-0">
                          <td className="px-3 py-2 font-mono tabular-nums text-xs">{s.nis}</td>
                          <td className="px-3 py-2">{s.name}</td>
                          <td className="px-3 py-2">{s.gender}</td>
                          <td className="px-3 py-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRemoveFromStaging(s)}
                            >
                              Batal
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

          {/* Action bar */}
          {staging.length > 0 && (
            <div className="flex items-center justify-end gap-3 bg-white border rounded-xl px-4 py-3">
              <span className="text-sm text-gray-600">
                {staging.length} siswa akan ditambahkan ke {selectedClassName}
              </span>
              <Button
                onClick={() => setConfirmOpen(true)}
                className="bg-primary hover:bg-primary/90"
              >
                {`Proses (${staging.length} siswa)`}
              </Button>
            </div>
          )}
        </>
      )}

      <AlertDialog
        open={!!lepasTarget}
        onOpenChange={(open) => { if (!open) setLepasTarget(null) }}
        title="Lepaskan Siswa?"
        description={`Lepas ${lepasTarget?.name ?? 'siswa'} dari kelas ${selectedClassName}? Siswa dapat di-assign kembali melalui Mapping Kelas.`}
        actionLabel="Lepaskan"
        onAction={() => lepasTarget && executeLepas(lepasTarget)}
      />

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Proses</DialogTitle>
            <DialogDescription>
              {staging.length} siswa akan ditambahkan ke kelas <strong>{selectedClassName}</strong>.
              Tindakan ini tidak dapat dibatalkan secara massal.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={loading}>
              Batal
            </Button>
            <Button
              onClick={handleProses}
              disabled={loading}
              className="bg-primary hover:bg-primary/90"
            >
              {loading ? 'Memproses...' : 'Konfirmasi'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
