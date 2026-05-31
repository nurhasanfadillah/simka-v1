import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Pencil } from 'lucide-react'
import { apiClient } from '@/lib/api'
import { Button } from '@/components/ui/button'
import type { Student, StudentClass } from '@/types/master'

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-gray-500">{label}</dt>
      <dd className="text-gray-800 font-medium text-right">{value}</dd>
    </div>
  )
}

export default function SiswaDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [student, setStudent] = useState<Student | null>(null)
  const [enrollments, setEnrollments] = useState<StudentClass[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    Promise.all([
      apiClient.get<Student>(`/master/students/${id}`),
      apiClient.get<StudentClass[]>(`/master/students/${id}/classes`),
    ])
      .then(([sRes, eRes]) => {
        setStudent(sRes.data)
        setEnrollments(eRes.data)
      })
      .catch(() => setError('Gagal memuat data siswa.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="p-6">Memuat...</div>
  if (error || !student) return <div className="p-6 text-red-600">{error ?? 'Siswa tidak ditemukan'}</div>

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/master/siswa')}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Kembali
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{student.name}</h1>
            <p className="text-sm text-gray-500 font-mono">NIS: {student.nis}</p>
          </div>
        </div>
        <Button
          className="bg-[#00A651] hover:bg-[#008C44]"
          onClick={() => navigate('/master/siswa')}
        >
          <Pencil className="w-4 h-4 mr-2" />
          Edit di Daftar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 border-b border-gray-200 pb-2">Identitas</h3>
          <dl className="space-y-2 text-sm">
            <Row label="NISN" value={student.nisn ?? '-'} />
            <Row label="Jenis Kelamin" value={student.gender === 'L' ? 'Laki-laki' : 'Perempuan'} />
            <Row label="Tempat Lahir" value={student.birthPlace} />
            <Row label="Tanggal Lahir" value={student.birthDate} />
          </dl>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 border-b border-gray-200 pb-2">Kontak</h3>
          <dl className="space-y-2 text-sm">
            <Row label="Nama Orang Tua" value={student.parentName} />
            <Row label="Telepon" value={student.phone ?? '-'} />
            <Row label="Alamat" value={student.address ?? '-'} />
          </dl>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 border-b border-gray-200 pb-2">Status</h3>
          <dl className="space-y-2 text-sm">
            <Row label="Pendaftaran" value={student.registrationStatus} />
            <Row label="Tahun Masuk" value={String(student.entryYear)} />
            <Row label="Status Akademik" value={student.studentStatus} />
            <Row label="Kelas Aktif" value={student.activeClassName ?? '-'} />
            <Row label="Unit" value={student.activeUnitName ?? '-'} />
          </dl>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <div className="p-5 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700">Riwayat Kelas</h3>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Kelas</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tingkat</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tahun</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody>
            {enrollments.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-400">Belum ada riwayat</td></tr>
            ) : enrollments.map((e) => (
              <tr key={e.id} className="border-t border-gray-100">
                <td className="px-4 py-2 font-medium">{e.className}</td>
                <td className="px-4 py-2">{e.classLevel}</td>
                <td className="px-4 py-2">{e.unitName}</td>
                <td className="px-4 py-2">{e.yearName}</td>
                <td className="px-4 py-2">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${e.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                    {e.isActive ? 'Aktif' : 'Nonaktif'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
