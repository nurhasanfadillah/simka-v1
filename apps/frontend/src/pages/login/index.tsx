import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Navigate, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { apiClient } from '@/lib/api'
import { useAuthStore } from '@/stores/auth.store'

const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
})

type LoginForm = z.infer<typeof loginSchema>

interface LoginResponse {
  access_token: string
  refresh_token: string
  user: { id: string; name: string; email: string; role: string }
}

export default function LoginPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()
  const [serverError, setServerError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })

  // Semua hooks dipanggil sebelum conditional return
  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  const onSubmit = async (data: LoginForm) => {
    setServerError(null)
    try {
      const res = await apiClient.post<LoginResponse>('/auth/login', data)
      setAuth(res.data.access_token, res.data.refresh_token, res.data.user)
      navigate('/dashboard')
    } catch {
      setServerError('Email atau password salah')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary to-primary-light px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8 space-y-6">
        {/* Logo + Judul */}
        <div className="flex flex-col items-center space-y-2">
          <img src="/logo.png" alt="Logo Al-Hasaniyyah" className="size-20 object-contain" />
          <h1 className="text-2xl font-bold text-accent">SIMKA</h1>
          <p className="text-sm text-gray-500 text-center">
            Sistem Manajemen Keuangan Al-Hasaniyyah
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@alhasaniyyah.sch.id"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register('password')}
            />
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          {serverError && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm text-center">{serverError}</div>
          )}

          <Button
            type="submit"
            className="w-full bg-accent hover:bg-accent/90 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Masuk...' : 'Masuk'}
          </Button>
        </form>
      </div>
    </div>
  )
}
