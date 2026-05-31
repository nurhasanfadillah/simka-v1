import {
  LayoutDashboard,
  CalendarDays,
  Users,
  UserRound,
  CreditCard,
  FileText,
  Zap,
  ClipboardList,
  ArrowLeftRight,
  History,
  AlertCircle,
  CalendarRange,
  BarChart2,
  BarChart3,
  Receipt,
  UserCog,
  ShieldCheck,
  LogOut,
  Shuffle,
  GraduationCap,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import NavItem from './NavItem'
import { useAuthStore } from '@/stores/auth.store'

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

function SectionLabel({ label }: { label: string }) {
  return (
    <p className="text-white/40 text-[10px] font-semibold uppercase tracking-wider px-3 pt-4 pb-1">
      {label}
    </p>
  )
}

export default function Sidebar() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-gradient-to-b from-primary to-primary-light shrink-0">
      {/* Logo area */}
      <div className="flex items-center gap-3 py-6 px-4 border-b border-white/10">
        <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain shrink-0" />
        <div className="flex flex-col">
          <span className="text-white font-bold text-base leading-tight">SIMKA</span>
          <span className="text-white/60 text-[10px] leading-tight mt-0.5">
            Sistem Manajemen Keuangan
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />

        {/* === MASTER DATA === */}
        {/* Urutan: Tahun → Kelas → Siswa → POS → Template (dependency flow) */}
        <SectionLabel label="Master Data" />
        <NavItem to="/master/tahun-pelajaran" icon={CalendarDays} label="Tahun Pelajaran" />
        <NavItem to="/master/kelas" icon={Users} label="Manajemen Kelas" end />
        <NavItem to="/master/kelas/mapping" icon={Shuffle} label="Mapping Kelas" />
        <NavItem to="/master/migrasi-status" icon={GraduationCap} label="Migrasi Status" />
        <NavItem to="/master/siswa" icon={UserRound} label="Data Siswa" />
        <NavItem to="/master/pos" icon={CreditCard} label="POS Keuangan" />
        <NavItem to="/master/manajemen-pembayaran" icon={FileText} label="Pembayaran" />

        {/* === KEUANGAN === */}
        <SectionLabel label="Keuangan" />
        <NavItem to="/keuangan/generate" icon={Zap} label="Generate Pembayaran" />
        <NavItem to="/keuangan/tagihan" icon={ClipboardList} label="Data Tagihan" />
        <NavItem to="/keuangan/transaksi/baru" icon={ArrowLeftRight} label="Transaksi Baru" />
        <NavItem to="/keuangan/riwayat" icon={History} label="Riwayat Pembayaran" />
        <NavItem to="/keuangan/tunggakan" icon={AlertCircle} label="Tunggakan" />

        {/* === LAPORAN === */}
        {/* Urutan: Harian → Bulanan → Tahunan → Tunggakan → Rekap POS */}
        <SectionLabel label="Laporan" />
        <NavItem to="/laporan/harian" icon={CalendarRange} label="Laporan Harian" />
        <NavItem to="/laporan/bulanan" icon={BarChart2} label="Laporan Bulanan" />
        <NavItem to="/laporan/tahunan" icon={BarChart3} label="Laporan Tahunan" />
        <NavItem to="/laporan/tunggakan" icon={Receipt} label="Lap. Tunggakan" />
        <NavItem to="/laporan/rekap-pos" icon={FileText} label="Rekap POS" />

        {/* === PENGATURAN === */}
        <SectionLabel label="Pengaturan" />
        <NavItem to="/pengaturan/profil" icon={UserRound} label="Profil Saya" />
        <NavItem to="/pengaturan/users" icon={UserCog} label="Pengguna" />
        <NavItem to="/pengaturan/roles" icon={ShieldCheck} label="Role & Akses" />
      </nav>

      {/* User info + logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold">
              {user ? getInitials(user.name) : 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.name ?? 'User'}</p>
            <p className="text-white/50 text-xs truncate">{user?.role ?? ''}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="mt-1 flex items-center gap-2 w-full px-3 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 text-sm transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}
