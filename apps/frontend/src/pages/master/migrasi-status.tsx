import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'
import type {
  SchoolYear,
  Class,
  PromotionPreviewResponse,
  PromotionPreviewStudent,
  PromoteItemDto,
  PromoteResult,
} from '@/types/master'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'

export default function MigrasiStatusPage() {
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [fromYearId, setFromYearId] = useState<number | null>(null)
  const [toYearId, setToYearId] = useState<number | null>(null)
  const [fromClassId, setFromClassId] = useState<number | null>(null)
  const [preview, setPreview] = useState<PromotionPreviewResponse | null>(null)
  const [studentActions, setStudentActions] = useState<
    Record<number, { action: 'naik' | 'tinggal' | 'lulus' | 'keluar' | 'pindah'; toClassId?: number }>
  >({})
  const [defaultToClassId, setDefaultToClassId] = useState<number | null>(null)
  const [loadingPreview, setLoadingPreview] = useState(false)
  const [loadingSubmit, setLoadingSubmit] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [result, setResult] = useState<PromoteResult | null>(null)

  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const [yearsRes, classesRes] = await Promise.all([
          apiClient.get<SchoolYear[]>('/master/school-years'),
          apiClient.get<Class[]>('/master/classes'),
        ])
        setSchoolYears(yearsRes.data)
        setClasses(classesRes.data)
        const active = yearsRes.data.find((y) => y.isActive)
        if (active) setFromYearId(active.id)
      } catch {
        setError('Gagal memuat data awal.')
      }
    }
    fetchInitial()
  }, [])

  const handlePreview = async () => {
    if (!fromClassId || !fromYearId) return
    setLoadingPreview(true)
    setError(null)
    setPreview(null)
    setResult(null)
    try {
      const res = await apiClient.get<PromotionPreviewResponse>('/academic/promotion/preview', {
        params: { fromClassId, fromYearId },
      })
      setPreview(res.data)
      const init: typeof studentActions = {}
      res.data.students.forEach((s) => {
        init[s.studentId] = { action: 'naik' }
      })
      setStudentActions(init)
      setDefaultToClassId(null)
    } catch {
      setError('Gagal mengambil data siswa.')
    } finally {
      setLoadingPreview(false)
    }
  }

  const handleApplyDefault = () => {
    if (!defaultToClassId) return
    setStudentActions((prev) => {
      const next = { ...prev }
      Object.keys(next).forEach((key) => {
        const id = Number(key)
        if (next[id].action !== 'lulus' && next[id].action !== 'keluar' && next[id].action !== 'pindah') {
          next[id] = { ...next[id], toClassId: defaultToClassId }
        }
      })
      return next
    })
  }

  const handleConfirm = async () => {
    if (!fromYearId || !toYearId || !preview) return
    setLoadingSubmit(true)
    try {
      const items: PromoteItemDto[] = preview.students.map((s) => ({
        studentId: s.studentId,
        action: studentActions[s.studentId]?.action ?? 'naik',
        toClassId: studentActions[s.studentId]?.toClassId,
      }))
      const res = await apiClient.post<PromoteResult>('/academic/promotion', {
        fromYearId,
        toYearId,
        items,
      })
      setResult(res.data)
      setConfirmOpen(false)
      setPreview(null)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setError(axiosErr?.response?.data?.message ?? 'Gagal memproses.')
      setConfirmOpen(false)
    } finally {
      setLoadingSubmit(false)
    }
  }

  const getConfirmSummary = () => {
    const counts = { naik: 0, tinggal: 0, lulus: 0, keluar: 0, pindah: 0 }
    const tunggakanCount =
      preview?.students.filter(
        (s) => s.hasTunggakan && studentActions[s.studentId]?.action !== 'lulus'
      ).length ?? 0
    Object.values(studentActions).forEach((a) => counts[a.action]++)
    return { ...counts, tunggakanCount }
  }

  const summary = preview ? getConfirmSummary() : { naik: 0, tinggal: 0, lulus: 0, keluar: 0, pindah: 0, tunggakanCount: 0 }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Migrasi Status</h1>
        <p className="text-gray-500 mt-1">Kelola status akademik siswa — naik kelas, lulus, keluar, atau pindah</p>
      </div>
      <p className="text-xs italic text-red-500 mt-2">
        Perhatian: Proses migrasi status bersifat permanen. Pastikan tahun ajaran, kelas, dan
        data siswa sudah benar sebelum mengkonfirmasi.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md px-4 py-3 text-sm text-red-700">
          {error}
          <button className="ml-2 underline" onClick={() => setError(null)}>Tutup</button>
        </div>
      )}

      {/* Filter section */}
      <div className="bg-white rounded-lg border p-4">
        <h2 className="font-medium text-gray-700 mb-4">Parameter Kenaikan Kelas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <Label>Tahun Ajaran Asal</Label>
            <Select
              value={fromYearId?.toString() ?? ''}
              onValueChange={(v) => {
                setFromYearId(Number(v))
                setPreview(null)
                setResult(null)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih tahun asal" />
              </SelectTrigger>
              <SelectContent>
                {schoolYears.map((y) => (
                  <SelectItem key={y.id} value={y.id.toString()}>
                    {y.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Kelas (dari tahun asal)</Label>
            <Select
              value={fromClassId?.toString() ?? ''}
              onValueChange={(v) => {
                setFromClassId(Number(v))
                setPreview(null)
                setResult(null)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih kelas" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((c) => (
                  <SelectItem key={c.id} value={c.id.toString()}>
                    {c.name} (Tingkat {c.level})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Tahun Ajaran Tujuan</Label>
            <Select
              value={toYearId?.toString() ?? ''}
              onValueChange={(v) => {
                setToYearId(Number(v))
                setPreview(null)
                setResult(null)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih tahun tujuan" />
              </SelectTrigger>
              <SelectContent>
                {schoolYears.map((y) => (
                  <SelectItem key={y.id} value={y.id.toString()}>
                    {y.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <Button
            onClick={handlePreview}
            disabled={!fromClassId || !fromYearId || loadingPreview}
          >
            {loadingPreview ? 'Memuat...' : 'Tampilkan Siswa'}
          </Button>
        </div>
      </div>

      {/* Preview table */}
      {preview && preview.students.length > 0 && (
        <div className="bg-white rounded-lg border">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <div>
              <h2 className="font-medium text-gray-800">
                Siswa di {preview.fromClass?.name} — {preview.fromClass?.schoolYearName}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">{preview.students.length} siswa</p>
            </div>
          </div>

          {/* Kelas tujuan default */}
          <div className="px-5 py-3 border-b bg-gray-50 flex items-center gap-3">
            <Label className="text-sm text-gray-600 whitespace-nowrap">Kelas Tujuan Default:</Label>
            <div className="w-48">
              <Select
                value={defaultToClassId?.toString() ?? ''}
                onValueChange={(v) => setDefaultToClassId(Number(v))}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Pilih kelas" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.name} (T{c.level})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleApplyDefault}
              disabled={!defaultToClassId}
            >
              Terapkan ke Semua
            </Button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left px-4 py-2 font-medium text-gray-600">NIS</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-600">Nama</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-600">JK</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-600">Tunggakan</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-600">Aksi</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-600">Kelas Tujuan</th>
                </tr>
              </thead>
              <tbody>
                {preview.students.map((s: PromotionPreviewStudent) => {
                  const sa = studentActions[s.studentId] ?? { action: 'naik' as const }
                  return (
                    <tr key={s.studentId} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-2 font-mono text-xs">{s.nis}</td>
                      <td className="px-4 py-2">{s.name}</td>
                      <td className="px-4 py-2 text-gray-500">{s.gender === 'L' ? 'L' : 'P'}</td>
                      <td className="px-4 py-2">
                        {s.hasTunggakan ? (
                          <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">
                            Ada
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        <Select
                          value={sa.action}
                          onValueChange={(v: 'naik' | 'tinggal' | 'lulus' | 'keluar' | 'pindah') =>
                            setStudentActions((prev) => ({
                              ...prev,
                              [s.studentId]: { ...prev[s.studentId], action: v },
                            }))
                          }
                        >
                          <SelectTrigger className="h-7 w-28 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="naik">Naik</SelectItem>
                            <SelectItem value="tinggal">Tinggal</SelectItem>
                            <SelectItem value="lulus">Lulus</SelectItem>
                            <SelectItem value="keluar">Keluar</SelectItem>
                            <SelectItem value="pindah">Pindah</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-4 py-2">
                        {sa.action !== 'lulus' && sa.action !== 'keluar' && sa.action !== 'pindah' ? (
                          <Select
                            value={sa.toClassId?.toString() ?? ''}
                            onValueChange={(v) =>
                              setStudentActions((prev) => ({
                                ...prev,
                                [s.studentId]: { ...prev[s.studentId], toClassId: Number(v) },
                              }))
                            }
                          >
                            <SelectTrigger className="h-7 w-36 text-xs">
                              <SelectValue placeholder="Pilih kelas" />
                            </SelectTrigger>
                            <SelectContent>
                              {classes.map((c) => (
                                <SelectItem key={c.id} value={c.id.toString()}>
                                  {c.name} (T{c.level})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="px-5 py-4 border-t">
            <Button
              onClick={() => setConfirmOpen(true)}
              disabled={!toYearId}
              className="bg-[#00A651] hover:bg-[#008c44] text-white"
            >
              Proses Migrasi
            </Button>
            {!toYearId && (
              <p className="text-xs text-amber-600 mt-1">
                Pilih Tahun Ajaran Tujuan terlebih dahulu.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Empty state */}
      {preview && preview.students.length === 0 && (
        <div className="bg-white rounded-lg border px-5 py-10 text-center text-sm text-gray-400">
          Tidak ada siswa di kelas dan tahun ajaran yang dipilih.
        </div>
      )}

      {/* Dialog konfirmasi */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Proses Migrasi Status</DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-5 gap-3 text-center">
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-2xl font-bold text-green-700">{summary.naik}</p>
                    <p className="text-xs text-green-600">Naik</p>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-3">
                    <p className="text-2xl font-bold text-amber-700">{summary.tinggal}</p>
                    <p className="text-xs text-amber-600">Tinggal</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-2xl font-bold text-blue-700">{summary.lulus}</p>
                    <p className="text-xs text-blue-600">Lulus</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-3">
                    <p className="text-2xl font-bold text-red-700">{summary.keluar}</p>
                    <p className="text-xs text-red-600">Keluar</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3">
                    <p className="text-2xl font-bold text-orange-700">{summary.pindah}</p>
                    <p className="text-xs text-orange-600">Pindah</p>
                  </div>
                </div>
                {summary.tunggakanCount > 0 && (
                  <p className="text-xs text-red-500 bg-red-50 rounded p-2">
                    ⚠ {summary.tunggakanCount} siswa masih memiliki tunggakan. Proses tetap bisa
                    dilanjutkan, namun tagihan lama tidak otomatis terhapus.
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  Aksi ini akan membuat enrollment baru di tahun ajaran tujuan. Tidak bisa
                  dibatalkan.
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Batal
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={loadingSubmit}
              className="bg-[#00A651] hover:bg-[#008c44] text-white"
            >
              {loadingSubmit ? 'Memproses...' : 'Konfirmasi'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hasil proses */}
      {result && (
        <div className="bg-white rounded-lg border p-5 space-y-4">
          <h2 className="font-medium text-gray-800">Hasil Proses Migrasi Status</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xl font-bold text-gray-700">{result.processed}</p>
              <p className="text-xs text-gray-500">Diproses</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <p className="text-xl font-bold text-green-700">{result.naik}</p>
              <p className="text-xs text-green-600">Naik</p>
            </div>
            <div className="bg-amber-50 rounded-lg p-3">
              <p className="text-xl font-bold text-amber-700">{result.tinggal}</p>
              <p className="text-xs text-amber-600">Tinggal</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-xl font-bold text-blue-700">{result.lulus}</p>
              <p className="text-xs text-blue-600">Lulus</p>
            </div>
            <div className="bg-red-50 rounded-lg p-3">
              <p className="text-xl font-bold text-red-700">{result.keluar}</p>
              <p className="text-xs text-red-600">Keluar</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-3">
              <p className="text-xl font-bold text-orange-700">{result.pindah}</p>
              <p className="text-xs text-orange-600">Pindah</p>
            </div>
          </div>
          {result.errors.length > 0 && (
            <div className="border border-red-200 rounded-lg p-3">
              <p className="text-sm font-medium text-red-600 mb-2">
                Siswa Gagal Diproses ({result.errors.length})
              </p>
              <ul className="space-y-1">
                {result.errors.map((e) => (
                  <li key={e.studentId} className="text-xs text-red-500">
                    ID {e.studentId}: {e.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <Button
            variant="outline"
            onClick={() => {
              setResult(null)
              setFromClassId(null)
            }}
          >
            Proses Kelas Lain
          </Button>
        </div>
      )}
    </div>
  )
}
