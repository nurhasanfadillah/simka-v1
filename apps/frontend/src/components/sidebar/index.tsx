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
  ChevronLeft,
  Menu,
  X,
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

function SectionLabel({ label, collapsed }: { label: string; collapsed: boolean }) {
  if (collapsed) return null
  return (
    <p className="text-white/40 text-[10px] font-semibold uppercase tracking-wider px-3 pt-5 pb-1.5">
      {label}
    </p>
  )
}

interface SidebarProps {
  collapsed: boolean
  mobileOpen: boolean
  onMobileClose: () => void
  onToggle: () => void
}

export default function Sidebar({ collapsed, mobileOpen, onMobileClose, onToggle }: SidebarProps) {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <>
      {mobileOpen && (
        <button
          onClick={onMobileClose}
          aria-label="Tutup sidebar"
          className="lg:hidden fixed top-4 right-4 z-50 p-2 rounded-lg bg-white/10 text-white hover:bg-white/20"
        >
          <X className="size-5" />
        </button>
      )}

      <aside
        className={`flex flex-col h-full bg-primary shrink-0
          fixed top-0 left-0 z-30
          transition-[transform,opacity] duration-300 ease-in-out
          ${collapsed ? 'w-16' : 'w-64'}
          lg:translate-x-0
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header — sticky */}
        <div className="sticky top-0 z-10 bg-primary">
          {collapsed ? (
            <div className="flex items-center justify-center py-5 border-b border-white/10">
              <button
                onClick={onToggle}
                aria-label="Buka sidebar"
                className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                title="Buka sidebar"
              >
                <Menu className="size-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
              <img src="/logo.png" alt="Logo" className="size-9 object-contain shrink-0" />
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-white font-bold text-sm leading-tight">SIMKA</span>
                <span className="text-white/50 text-[10px] leading-tight mt-0.5">
                  Manajemen Keuangan
                </span>
              </div>
              <button
                onClick={onToggle}
                aria-label="Tutup sidebar"
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors shrink-0"
                title="Tutup sidebar"
              >
                <ChevronLeft className="size-4" />
              </button>
            </div>
          )}
        </div>

        {/* Nav — scrollable, footer di dalam */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" collapsed={collapsed} />

          <SectionLabel label="Master Data" collapsed={collapsed} />
          <NavItem to="/master/tahun-pelajaran" icon={CalendarDays} label="Tahun Pelajaran" collapsed={collapsed} />
          <NavItem to="/master/kelas" icon={Users} label="Manajemen Kelas" end collapsed={collapsed} />
          <NavItem to="/master/kelas/mapping" icon={Shuffle} label="Mapping Kelas" collapsed={collapsed} />
          <NavItem to="/master/migrasi-status" icon={GraduationCap} label="Migrasi Status" collapsed={collapsed} />
          <NavItem to="/master/siswa" icon={UserRound} label="Data Siswa" collapsed={collapsed} />
          <NavItem to="/master/pos" icon={CreditCard} label="POS Keuangan" collapsed={collapsed} />
          <NavItem to="/master/manajemen-pembayaran" icon={FileText} label="Pembayaran" collapsed={collapsed} />

          <SectionLabel label="Keuangan" collapsed={collapsed} />
          <NavItem to="/keuangan/generate" icon={Zap} label="Generate Pembayaran" collapsed={collapsed} />
          <NavItem to="/keuangan/tagihan" icon={ClipboardList} label="Data Tagihan" collapsed={collapsed} />
          <NavItem to="/keuangan/transaksi/baru" icon={ArrowLeftRight} label="Transaksi Baru" collapsed={collapsed} />
          <NavItem to="/keuangan/riwayat" icon={History} label="Riwayat Pembayaran" collapsed={collapsed} />
          <NavItem to="/keuangan/tunggakan" icon={AlertCircle} label="Tunggakan" collapsed={collapsed} />

          <SectionLabel label="Laporan" collapsed={collapsed} />
          <NavItem to="/laporan/harian" icon={CalendarRange} label="Laporan Harian" collapsed={collapsed} />
          <NavItem to="/laporan/bulanan" icon={BarChart2} label="Laporan Bulanan" collapsed={collapsed} />
          <NavItem to="/laporan/tahunan" icon={BarChart3} label="Laporan Tahunan" collapsed={collapsed} />
          <NavItem to="/laporan/tunggakan" icon={Receipt} label="Lap. Tunggakan" collapsed={collapsed} />
          <NavItem to="/laporan/rekap-pos" icon={FileText} label="Rekap POS" collapsed={collapsed} />

          <SectionLabel label="Pengaturan" collapsed={collapsed} />
          <NavItem to="/pengaturan/profil" icon={UserRound} label="Profil Saya" collapsed={collapsed} />
          <NavItem to="/pengaturan/users" icon={UserCog} label="Pengguna" collapsed={collapsed} />
          <NavItem to="/pengaturan/roles" icon={ShieldCheck} label="Role & Akses" collapsed={collapsed} />

          {/* Footer — inside nav, scrolls with content */}
          {!collapsed && (
            <div className="pt-4 mt-4 border-t border-white/10">
              <div className="flex items-center gap-2 px-2 py-2 rounded-lg">
                <div className="size-8 rounded-full bg-accent flex items-center justify-center shrink-0">
                  <span className="text-white text-xs font-bold">
                    {user ? getInitials(user.name) : 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{user?.name ?? 'User'}</p>
                  <p className="text-white/50 text-xs truncate">{user?.role ?? ''}</p>
                </div>
                <button
                  onClick={handleLogout}
                  aria-label="Keluar"
                  className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors shrink-0"
                  title="Keluar"
                >
                  <LogOut className="size-4" />
                </button>
              </div>
            </div>
          )}
        </nav>
      </aside>
    </>
  )
}
