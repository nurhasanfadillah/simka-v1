import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, CreditCard, Banknote, BarChart2, ChevronRight } from 'lucide-react'
import { apiClient } from '@/lib/api'
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
    <div className="p-6 space-y-6">
      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
          {error}
        </div>
      )}

      {/* Info Lembaga — full width, invisible card */}
      <div className="py-6">
        <div className="flex items-start gap-6">
          <img src="/logo.png" className="w-24 h-24 object-contain flex-shrink-0" alt="Logo Al-Hasaniyyah" />
          <div>
            <h3 className="text-xl font-bold text-[#1A3829]">YAYASAN PENDIDIKAN ISLAM AL-HASANIYYAH</h3>
            <div className="mt-4 space-y-1.5 text-sm text-gray-600">
              <p>Jl. Raya Cileungsi-Jonggo Km. 10, Cipeucang, Cileungsi, Bogor, Jawa Barat 16820</p>
              <p>(0262) 123-4567</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <>
            {[0, 1, 2].map((i) => (
              <div key={i} className="animate-pulse bg-gray-200 rounded-xl h-32" />
            ))}
          </>
        ) : (
          <>
            {/* Card 1: Siswa Aktif */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#E8F5EE] flex items-center justify-center shrink-0">
                  <Users className="w-6 h-6 text-[#00A651]" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Siswa Aktif</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {stats?.totalSiswaAktif ?? 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2: Pembayar Bulan Ini */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#E8F5EE] flex items-center justify-center shrink-0">
                  <CreditCard className="w-6 h-6 text-[#00A651]" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pembayar Bulan Ini</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {stats?.pembayarBulanIni ?? 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Card 3: Penerimaan Bulan Ini */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#E8F5EE] flex items-center justify-center shrink-0">
                  <Banknote className="w-6 h-6 text-[#00A651]" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Penerimaan Bulan Ini</p>
                  <p className="text-3xl font-bold text-[#00A651] mt-1">
                    {formatRupiah(stats?.penerimaanBulanIni ?? 0)}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Quick Action */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-3">Aksi Cepat</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/keuangan/transaksi/baru')}
            className="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm cursor-pointer hover:border-[#00A651] hover:shadow-md transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#E8F5EE] flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-[#00A651]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Transaksi Baru</p>
                <p className="text-xs text-gray-500">Catat pembayaran siswa</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          <button
            onClick={() => navigate('/laporan/harian')}
            className="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm cursor-pointer hover:border-[#00A651] hover:shadow-md transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#E8F5EE] flex items-center justify-center">
                <BarChart2 className="w-5 h-5 text-[#00A651]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Lihat Laporan</p>
                <p className="text-xs text-gray-500">Laporan keuangan harian</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Tabel Riwayat Transaksi */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Riwayat Transaksi Terbaru</h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                {['No. Transaksi', 'Nama Siswa', 'NIS', 'Nominal', 'Status', 'Tanggal'].map((col) => (
                  <th
                    key={col}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [0, 1, 2, 3, 4].map((i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-6 py-4">
                      <div className="animate-pulse bg-gray-200 h-5 rounded" />
                    </td>
                  </tr>
                ))
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-400">
                    Belum ada transaksi
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-700 font-mono">{tx.transactionNumber}</td>
                    <td className="px-6 py-4 text-sm text-gray-800 font-medium">{tx.studentName}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{tx.nis}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-[#00A651]">
                      {formatRupiah(tx.totalAmount)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={
                          tx.status === 'aktif'
                            ? 'inline-flex px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800'
                            : 'inline-flex px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800'
                        }
                      >
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatTanggal(tx.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
