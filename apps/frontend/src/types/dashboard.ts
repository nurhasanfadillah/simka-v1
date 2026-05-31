export interface DashboardStats {
  totalSiswaAktif: number
  penerimaanBulanIni: number
  pembayarBulanIni: number
}

export interface Transaction {
  id: string
  transactionNumber: string
  studentId: string
  studentName: string
  nis: string
  totalAmount: number
  status: 'aktif' | 'void'
  notes: string | null
  createdBy: string
  createdAt: string
}
