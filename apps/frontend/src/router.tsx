import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from '@/pages/login'
import DashboardPage from '@/pages/dashboard'
import TahunPelajaranPage from '@/pages/master/tahun-pelajaran'
import KelasPage from '@/pages/master/kelas'
import KelasMapping from '@/pages/master/kelas/mapping'
import MigrasiStatusPage from '@/pages/master/migrasi-status'
import PosPage from '@/pages/master/pos'
import SiswaPage from '@/pages/master/siswa'
import SiswaDetailPage from '@/pages/master/siswa/[id]'
import SiswaImportPage from '@/pages/master/siswa/import'
import ManajemenPembayaranPage from '@/pages/master/manajemen-pembayaran'
import GeneratePage from '@/pages/keuangan/generate'
import TagihanPage from '@/pages/keuangan/tagihan'
import TransaksiBaruPage from '@/pages/keuangan/transaksi/baru'
import RiwayatPage from '@/pages/keuangan/riwayat'
import TunggakanPage from '@/pages/keuangan/tunggakan'
import HarianPage from '@/pages/laporan/harian'
import BulananPage from '@/pages/laporan/bulanan'
import TahunanPage from '@/pages/laporan/tahunan'
import LaporanTunggakanPage from '@/pages/laporan/tunggakan'
import RekapPosPage from '@/pages/laporan/rekap-pos'
import ProfilPage from '@/pages/pengaturan/profil'
import PengaturanUsersPage from '@/pages/pengaturan/users'
import PengaturanRolesPage from '@/pages/pengaturan/roles'
import AppLayout from '@/layouts/AppLayout'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppLayout>
                <DashboardPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/master/tahun-pelajaran"
          element={
            <ProtectedRoute>
              <AppLayout>
                <TahunPelajaranPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/master/kelas/mapping"
          element={
            <ProtectedRoute>
              <AppLayout>
                <KelasMapping />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/master/migrasi-status"
          element={
            <ProtectedRoute>
              <AppLayout>
                <MigrasiStatusPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/master/kelas"
          element={
            <ProtectedRoute>
              <AppLayout>
                <KelasPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/master/pos"
          element={
            <ProtectedRoute>
              <AppLayout>
                <PosPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/master/siswa"
          element={
            <ProtectedRoute>
              <AppLayout>
                <SiswaPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/master/siswa/import"
          element={
            <ProtectedRoute>
              <AppLayout>
                <SiswaImportPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/master/siswa/:id"
          element={
            <ProtectedRoute>
              <AppLayout>
                <SiswaDetailPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/master/manajemen-pembayaran"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ManajemenPembayaranPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/keuangan/generate"
          element={
            <ProtectedRoute>
              <AppLayout>
                <GeneratePage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/keuangan/tagihan"
          element={
            <ProtectedRoute>
              <AppLayout>
                <TagihanPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/keuangan/transaksi/baru"
          element={
            <ProtectedRoute>
              <AppLayout>
                <TransaksiBaruPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/keuangan/riwayat"
          element={
            <ProtectedRoute>
              <AppLayout>
                <RiwayatPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/keuangan/tunggakan"
          element={
            <ProtectedRoute>
              <AppLayout>
                <TunggakanPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/laporan/harian"
          element={
            <ProtectedRoute>
              <AppLayout>
                <HarianPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/laporan/bulanan"
          element={
            <ProtectedRoute>
              <AppLayout>
                <BulananPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/laporan/tahunan"
          element={
            <ProtectedRoute>
              <AppLayout>
                <TahunanPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/laporan/tunggakan"
          element={
            <ProtectedRoute>
              <AppLayout>
                <LaporanTunggakanPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/laporan/rekap-pos"
          element={
            <ProtectedRoute>
              <AppLayout>
                <RekapPosPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/pengaturan/profil"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ProfilPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/pengaturan/users"
          element={
            <ProtectedRoute>
              <AppLayout>
                <PengaturanUsersPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/pengaturan/roles"
          element={
            <ProtectedRoute>
              <AppLayout>
                <PengaturanRolesPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
