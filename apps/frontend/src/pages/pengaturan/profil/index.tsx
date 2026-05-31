import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import axios from 'axios'
import { apiClient } from '@/lib/api'
import type { AuthProfile } from '@/types/master'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const pwSchema = z.object({
  currentPassword: z.string().min(1, 'Wajib diisi'),
  newPassword: z.string().min(6, 'Minimal 6 karakter'),
  confirmPassword: z.string().min(1, 'Wajib diisi'),
}).refine(d => d.newPassword === d.confirmPassword, {
  message: 'Password baru tidak cocok',
  path: ['confirmPassword'],
})
type PwFormData = z.infer<typeof pwSchema>

export default function ProfilPage() {
  const [data, setData] = useState<AuthProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [pwSaving, setPwSaving] = useState(false)
  const [pwSuccess, setPwSuccess] = useState<string | null>(null)
  const [pwError, setPwError] = useState<string | null>(null)

  const {
    register: registerPw,
    handleSubmit: handleSubmitPw,
    reset: resetPw,
    formState: { errors: pwErrors },
  } = useForm<PwFormData>({ resolver: zodResolver(pwSchema) })

  useEffect(() => {
    apiClient.get<AuthProfile>('/auth/me')
      .then(res => setData(res.data))
      .catch(() => setError('Gagal memuat profil.'))
      .finally(() => setLoading(false))
  }, [])

  const formatLastLogin = (v: string | null) =>
    v ? new Date(v).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : 'Belum pernah login'

  const onSubmitPw = async (formData: PwFormData) => {
    setPwSaving(true)
    setPwError(null)
    setPwSuccess(null)
    try {
      await apiClient.patch('/auth/change-password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      })
      setPwSuccess('Password berhasil diubah')
      resetPw()
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 400) {
        setPwError(err.response?.data?.message ?? 'Password saat ini tidak cocok')
      } else {
        setPwError('Gagal mengubah password')
      }
    } finally {
      setPwSaving(false)
    }
  }

  return (<div className="p-6 animate-fade-in-up max-w-2xl">
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-gray-900">Profil Saya</h1>
        <p className="text-gray-500 mt-1">Informasi akun yang sedang login</p>
      </div>
      <p className="text-xs italic text-gray-400 mb-4">
        Halaman ini menampilkan informasi akun Anda yang sedang login. Gunakan form Ganti Password di bawah untuk memperbarui kata sandi Anda.
      </p>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm mb-6">{error}</div>}

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow duration-200 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-200 h-6 rounded w-3/4" />
          ))}
        </div>
      ) : data && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</dt>
                <dd className="mt-1 text-sm font-semibold text-gray-900">{data.name}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email</dt>
                <dd className="mt-1 text-sm text-gray-700">{data.email}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Role</dt>
                <dd className="mt-1 text-sm text-gray-700">{data.role}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Status Akun</dt>
                <dd className="mt-1">
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${data.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                    {data.isActive ? 'Aktif' : 'Nonaktif'}
                  </span>
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Terakhir Login</dt>
                <dd className="mt-1 text-sm text-gray-700">{formatLastLogin(data.lastLogin)}</dd>
              </div>
            </dl>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Hak Akses ({data.permissions.length})</h2>
            {data.permissions.length === 0 ? (
              <p className="text-sm text-gray-400">Tidak ada permission</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {data.permissions.map(p => (
                  <span key={p} className="inline-flex px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-mono tabular-nums">{p}</span>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Ganti Password</h2>
            {pwSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 text-sm mb-4">{pwSuccess}</div>
            )}
            {pwError && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm mb-4">{pwError}</div>
            )}
            <form onSubmit={handleSubmitPw(onSubmitPw)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Password Saat Ini</Label>
                <Input id="currentPassword" type="password" placeholder="••••••" {...registerPw('currentPassword')} />
                {pwErrors.currentPassword && <p className="text-sm text-red-500">{pwErrors.currentPassword.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">Password Baru</Label>
                <Input id="newPassword" type="password" placeholder="Minimal 6 karakter" {...registerPw('newPassword')} />
                {pwErrors.newPassword && <p className="text-sm text-red-500">{pwErrors.newPassword.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
                <Input id="confirmPassword" type="password" placeholder="Ulangi password baru" {...registerPw('confirmPassword')} />
                {pwErrors.confirmPassword && <p className="text-sm text-red-500">{pwErrors.confirmPassword.message}</p>}
              </div>
              <Button type="submit" className="bg-accent hover:bg-accent/90" disabled={pwSaving}>
                {pwSaving ? 'Menyimpan...' : 'Ubah Password'}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
