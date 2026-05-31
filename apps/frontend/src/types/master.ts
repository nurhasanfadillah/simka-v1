export interface SchoolYear {
  id: number
  name: string
  startYear: number
  endYear: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateSchoolYearDto {
  name: string
  startYear: number
  endYear: number
}

export type UpdateSchoolYearDto = Partial<CreateSchoolYearDto>

export interface PaymentPost {
  id: number
  code: string
  name: string
  type: 'bulanan' | 'bebas'
  description: string | null
  createdAt: string
  updatedAt: string
}

export interface CreatePaymentPostDto {
  code: string
  name: string
  type: 'bulanan' | 'bebas'
  description?: string
}

export type UpdatePaymentPostDto = Partial<CreatePaymentPostDto>

export interface SchoolUnit {
  id: number
  name: string
  code: string
  classCount: number
  createdAt: string
  updatedAt: string
}

export interface CreateSchoolUnitDto {
  name: string
  code: string
}

export type UpdateSchoolUnitDto = Partial<CreateSchoolUnitDto>

export interface Class {
  id: number
  name: string
  level: number
  schoolUnitId: number
  unitName: string
  studentCount?: number
  createdAt: string
  updatedAt: string
}

export interface CreateClassDto {
  name: string
  level: number
  schoolUnitId: number
}

export type UpdateClassDto = Partial<CreateClassDto>

export interface Student {
  id: number
  nis: string
  nisn: string | null
  name: string
  gender: 'L' | 'P'
  birthPlace: string
  birthDate: string
  parentName: string
  phone: string | null
  address: string | null
  registrationStatus: 'baru' | 'pindahan' | 'mengulang'
  studentStatus: 'aktif' | 'lulus' | 'keluar' | 'pindah'
  entryYear: number
  activeClassId: number | null
  activeClassName: string | null
  activeClassLevel: number | null
  activeUnitId: number | null
  activeUnitName: string | null
  createdAt: string
  updatedAt: string
}

export interface StudentClass {
  id: number
  studentId: number
  classId: number
  schoolYearId: number
  isActive: boolean
  createdAt: string
  className: string
  classLevel: number
  unitName: string
  yearName: string
}

export interface PaymentTemplate {
  id: number
  name: string
  paymentPostId: number
  schoolYearId: number
  amount: number
  paymentPostName: string
  schoolYearName: string
  createdAt: string
  updatedAt: string
}

export interface CreatePaymentTemplateDto {
  name: string
  paymentPostId: number
  schoolYearId: number
  amount: number
}

export type UpdatePaymentTemplateDto = { amount?: number }

export interface Bill {
  id: number
  studentId: number
  studentName: string
  nis: string
  classId: number
  className: string
  schoolYearId: number
  schoolYearName: string
  paymentTemplateId: number
  paymentPostName: string
  paymentPostCode: string
  totalAmount: number
  status: 'belum_bayar' | 'cicilan' | 'lunas'
  createdAt: string
  updatedAt: string
}

export interface BillMonth {
  id: number
  billId: number
  month: number
  year: number
  amount: number
  status: 'belum_bayar' | 'lunas'
  paidAt: string | null
  createdAt: string
}

export interface BillDetail extends Bill {
  billMonths: BillMonth[]
}

export interface PaymentBookInfo {
  id: number
  paymentPostId: number
  schoolYearId: number
  amount: number
  paymentPostName: string
  paymentPostType: 'bulanan' | 'bebas'
  schoolYearName: string
}

export interface StudentBillRow {
  studentId: number
  studentName: string
  nis: string
  className: string
  classId: number
  billId: number
  amount: number
  paidAmount: number
  status: 'belum_bayar' | 'cicilan' | 'lunas'
}

export interface StudentNoBillRow {
  studentId: number
  studentName: string
  nis: string
  className: string
  classId: number
}

export interface CreateBillItem {
  studentId: number
  amount: number
}

export interface CreateBillsResponse {
  created: number
  bills: Array<{ id: number; studentId: number; amount: number }>
}

export interface Transaction {
  id: number
  transactionNumber: string
  studentId: number
  studentName: string
  nis: string
  totalAmount: number
  status: 'aktif' | 'void'
  notes: string | null
  createdBy: string
  createdAt: string
}

export interface TransactionItem {
  id: number
  transactionId: number
  billId: number
  billMonthId: number | null
  amount: number
  createdAt: string
}

export interface TransactionDetail extends Transaction {
  voidedAt: string | null
  voidedBy: number | null
  voidReason: string | null
  updatedAt: string
  items: TransactionItem[]
}

export interface CreateTransactionResult {
  id: number
  transactionNumber: string
  totalAmount: number
  status: 'aktif'
  createdAt: string
}

export interface ReportHarian {
  date: string
  totalPenerimaan: number
  jumlahTransaksi: number
  transactions: Array<{
    id: number
    transactionNumber: string
    studentName: string
    nis: string
    totalAmount: number
    status: string
    createdAt: string
  }>
}

export interface ReportBulanan {
  month: number
  year: number
  totalPenerimaan: number
  jumlahTransaksi: number
  perHari: Array<{ date: string; totalPenerimaan: number; jumlahTransaksi: number }>
}

export interface ReportTahunan {
  schoolYearId: number
  totalPenerimaan: number
  jumlahTransaksi: number
  perBulan: Array<{ month: number; year: number; totalPenerimaan: number; jumlahTransaksi: number }>
}

export interface ReportTunggakanSiswa {
  studentId: number
  studentName: string
  nis: string
  className: string
  totalTunggakan: number
  jumlahTagihan: number
}

export interface ReportTunggakan {
  total: number
  siswa: ReportTunggakanSiswa[]
}

export interface ReportRekapPosItem {
  posId: number
  posCode: string
  posName: string
  totalPenerimaan: number
  jumlahTransaksi: number
  jumlahSiswa: number
}

export interface ReportRekapPos {
  total: number
  perPos: ReportRekapPosItem[]
}

export interface AuthProfile {
  id: number
  name: string
  email: string
  role: string
  isActive: boolean
  lastLogin: string | null
  permissions: string[]
}

export interface UserItem {
  id: number
  name: string
  email: string
  roleName: string
  isActive: boolean
  lastLogin: string | null
  createdAt: string
}

export interface RoleItem {
  id: number
  name: string
  createdAt: string
  permissions: { id: number; code: string; name: string }[]
}

export interface CreateUserDto {
  name: string
  email: string
  password: string
  roleId: number
}

export interface UpdateUserDto {
  name?: string
  email?: string
  roleId?: number
  isActive?: boolean
}

export interface PermissionItem {
  id: number
  code: string
  name: string
}

export interface ChangePasswordDto {
  currentPassword: string
  newPassword: string
}

export interface ClassMember {
  enrollmentId: number
  studentId: number
  nis: string
  name: string
  gender: 'L' | 'P'
}

export interface MappingAvailableStudent {
  id: number
  nis: string
  name: string
  gender: 'L' | 'P'
  enrollmentId: number | null
  currentClassId: number | null
  currentClassName: string | null
}

export interface PromotionPreviewStudent {
  studentId: number
  nis: string
  name: string
  gender: 'L' | 'P'
  currentClass: { id: number; name: string; level: number }
  hasTunggakan: boolean
}

export interface PromotionPreviewResponse {
  fromClass: { id: number; name: string; level: number; schoolYearName: string } | null
  students: PromotionPreviewStudent[]
}

export interface PromoteItemDto {
  studentId: number
  action: 'naik' | 'tinggal' | 'lulus' | 'keluar' | 'pindah'
  toClassId?: number
}

export interface PromoteDto {
  fromYearId: number
  toYearId: number
  items: PromoteItemDto[]
}

export interface PromoteResult {
  processed: number
  naik: number
  tinggal: number
  lulus: number
  keluar: number
  pindah: number
  errors: Array<{ studentId: number; message: string }>
}

export interface ImportPreviewRow {
  row: number
  status: 'valid' | 'error'
  data: {
    name: string
    gender: string
    birthDate: string
    parentName: string
    nisn?: string | null
    birthPlace?: string | null
    phone?: string | null
    address?: string | null
    registrationStatus: string
    studentStatus: string
  } | null
  errors?: string[]
}

export interface ImportPreviewResponse {
  rows: ImportPreviewRow[]
}

export interface ImportCommitResponse {
  success: number
  failed: number
}

export interface StudentSearchResult {
  id: number
  nis: string
  name: string
  activeClassName: string | null
  activeUnitName: string | null
}

export interface StudentTxnInfo {
  id: number
  nis: string
  name: string
  activeClassName: string | null
  activeUnitName: string | null
}

export interface TxnBebasBill {
  id: number
  paymentPostName: string
  totalAmount: number
  paidAmount: number
  remaining: number
  status: 'belum_bayar' | 'cicilan' | 'lunas'
}

export interface TxnBulananMonth {
  id: number
  month: number
  year: number
  amount: number
  status: 'belum_bayar' | 'lunas'
}

export interface TxnBulananBill {
  id: number
  paymentPostName: string
  schoolYearName: string
  startYear: number
  months: TxnBulananMonth[]
  totalAmount: number
  paidAmount: number
  remaining: number
  status: 'belum_bayar' | 'cicilan' | 'lunas'
}

export interface StudentTransactionData {
  student: StudentTxnInfo
  totalTunggakan: number
  bebas: TxnBebasBill[]
  bulanan: TxnBulananBill[]
}
