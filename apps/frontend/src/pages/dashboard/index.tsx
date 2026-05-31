import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, CreditCard, Banknote, BarChart2, ChevronRight, Inbox } from 'lucide-react'
import { apiClient } from '@/lib/api'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { DashboardStats, Transaction } from '@/types/dashboard'

const formatRupiah = (value: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value)

const formatTanggal = (isoString: string) =>
  new Date(isoString).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

export default function DashboardPage() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, txRes] = await Promise.all([
          apiClient.get<DashboardStats>('/reports/dashboard'),
          apiClient.get<Transaction[]>('/transactions'),
        ])
        setStats(statsRes.data)
        setTransactions(txRes.data.slice(0, 5))
      } catch {
        setError('Gagal memuat data dashboard. Pastikan server berjalan.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="p-[var(--spacing-page)] space-y-[var(--spacing-section)] page-transition">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
          {error}
        </div>
      )}

      <Card variant="glass">
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <img src="/logo.png" className="size-24 object-contain flex-shrink-0" alt="Logo Al-Hasaniyyah" />
            <div>
              <h3 className="text-xl font-bold text-primary">YAYASAN PENDIDIKAN ISLAM AL-HASANIYYAH</h3>
              <div className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                <p>Jl. Raya Cileungsi-Jonggo Km. 10, Cipeucang, Cileungsi, Bogor, Jawa Barat 16820</p>
                <p>(0262) 123-4567</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <>
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
          </>
        ) : (
          <>
            <Card variant="glass">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-full bg-accent-light flex items-center justify-center shrink-0">
                    <Users className="size-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Siswa Aktif</p>
                     <p className="text-2xl font-bold mt-1 tabular-nums">
                      {stats?.totalSiswaAktif ?? 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card variant="glass">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-full bg-accent-light flex items-center justify-center shrink-0">
                    <CreditCard className="size-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pembayar Bulan Ini</p>
                     <p className="text-2xl font-bold mt-1 tabular-nums">
                      {stats?.pembayarBulanIni ?? 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card variant="glass">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-full bg-accent-light flex items-center justify-center shrink-0">
                    <Banknote className="size-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Penerimaan Bulan Ini</p>
                     <p className="text-2xl font-bold text-accent mt-1 tabular-nums">
                      {formatRupiah(stats?.penerimaanBulanIni ?? 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Card variant="glass">
        <CardContent className="p-6">
          <h2 className="text-base font-semibold mb-4">Aksi Cepat</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/keuangan/transaksi/baru')}
              className="w-full flex items-center justify-between p-4 bg-white/50 rounded-xl border border-gray-100 hover:border-accent hover:shadow-md transition-all text-left"
            >
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-accent-light flex items-center justify-center">
                  <CreditCard className="size-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Transaksi Baru</p>
                  <p className="text-xs text-muted-foreground">Catat pembayaran siswa</p>
                </div>
              </div>
              <ChevronRight className="size-5 text-muted-foreground" />
            </button>

            <button
              onClick={() => navigate('/laporan/harian')}
              className="w-full flex items-center justify-between p-4 bg-white/50 rounded-xl border border-gray-100 hover:border-accent hover:shadow-md transition-all text-left"
            >
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-accent-light flex items-center justify-center">
                  <BarChart2 className="size-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Lihat Laporan</p>
                  <p className="text-xs text-muted-foreground">Laporan keuangan harian</p>
                </div>
              </div>
              <ChevronRight className="size-5 text-muted-foreground" />
            </button>
          </div>
        </CardContent>
      </Card>

      <Card variant="glass">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-4">Riwayat Transaksi Terbaru</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No. Transaksi</TableHead>
                <TableHead>Nama Siswa</TableHead>
                <TableHead>NIS</TableHead>
                <TableHead>Nominal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tanggal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    <Inbox className="mx-auto mb-2 size-8 text-gray-300" />
                    Belum ada transaksi
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((tx) => (
                  <TableRow key={tx.id}>
                     <TableCell className="font-mono text-sm tabular-nums">{tx.transactionNumber}</TableCell>
                    <TableCell className="font-medium">{tx.studentName}</TableCell>
                    <TableCell className="text-muted-foreground">{tx.nis}</TableCell>
                     <TableCell className="font-semibold text-accent tabular-nums">
                      {formatRupiah(tx.totalAmount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={tx.status === 'aktif' ? 'success' : 'danger'}>
                        {tx.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatTanggal(tx.createdAt)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
