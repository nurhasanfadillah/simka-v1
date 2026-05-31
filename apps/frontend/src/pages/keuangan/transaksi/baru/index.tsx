import { useEffect, useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, CheckCircle, X } from 'lucide-react'
import { apiClient } from '@/lib/api'
import type {
  CreateTransactionResult,
  StudentSearchResult,
  SchoolYear,
  Class as _Class,
  SchoolUnit,
  StudentTransactionData,
  TxnBulananMonth,
} from '@/types/master'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const formatRupiah = (v: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v)

const STATUS_BADGES: Record<string, string> = {
  belum_bayar: 'bg-yellow-100 text-yellow-800',
  cicilan: 'bg-blue-100 text-blue-800',
  lunas: 'bg-green-100 text-green-800',
}

const STATUS_LABELS: Record<string, string> = {
  belum_bayar: 'Belum Bayar',
  cicilan: 'Cicilan',
  lunas: 'Lunas',
}

const MONTH_ABBR = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

interface CartItem {
  billId: number
  billMonthId?: number
  amount: number
  label: string
  monthLabel?: string
}

export default function TransaksiBaruPage() {
  const [step, setStep] = useState<'search' | 'done'>('search')
  const [showSearchDialog, setShowSearchDialog] = useState(true)
  const [selectedStudent, setSelectedStudent] = useState<StudentSearchResult | null>(null)
  const [txnData, setTxnData] = useState<StudentTransactionData | null>(null)
  const [loadingTxn, setLoadingTxn] = useState(false)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [result, setResult] = useState<CreateTransactionResult | null>(null)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([])
  const [units, setUnits] = useState<SchoolUnit[]>([])
  const [allClasses, setAllClasses] = useState<_Class[]>([])

  const [searchQ, setSearchQ] = useState('')
  const [filterSchoolYearId, setFilterSchoolYearId] = useState('')
  const [filterUnitId, setFilterUnitId] = useState('__all__')
  const [filterClassId, setFilterClassId] = useState('__all__')
  const [searchResults, setSearchResults] = useState<StudentSearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const sid = searchParams.get('studentId')
    if (sid) {
      apiClient.get<StudentSearchResult[]>(`/master/students/search`, { params: { q: '' } })
        .then(r => {
          const s = r.data.find(s => s.id === parseInt(sid))
          if (s) handleSelectStudent(s)
        })
        .catch(() => {})
    }
  }, [])

  useEffect(() => {
    Promise.all([
      apiClient.get<SchoolYear[]>('/master/school-years'),
      apiClient.get<SchoolUnit[]>('/master/school-units'),
      apiClient.get<_Class[]>('/master/classes'),
    ]).then(([yRes, uRes, cRes]) => {
      setSchoolYears(yRes.data)
      setUnits(uRes.data)
      setAllClasses(cRes.data)
    }).catch(() => setError('Gagal memuat data filter.'))
  }, [])

  const activeSchoolYear = useMemo(() => schoolYears.find(y => y.isActive), [schoolYears])

  useEffect(() => {
    if (activeSchoolYear && !filterSchoolYearId) {
      setFilterSchoolYearId(String(activeSchoolYear.id))
    }
  }, [activeSchoolYear])

  const filteredClasses = useMemo(() => {
    if (filterUnitId && filterUnitId !== '__all__') return allClasses.filter(c => c.schoolUnitId === parseInt(filterUnitId))
    return allClasses
  }, [allClasses, filterUnitId])

  useEffect(() => {
    if (filterUnitId !== '__all__' && filterClassId !== '__all__') {
      const cls = allClasses.find(c => c.id === parseInt(filterClassId))
      if (cls && cls.schoolUnitId !== parseInt(filterUnitId)) setFilterClassId('__all__')
    }
  }, [filterUnitId])

  const doSearch = async () => {
    try {
      setSearching(true)
      const params: Record<string, string> = {}
      if (searchQ) params.q = searchQ
      if (filterSchoolYearId) params.schoolYearId = filterSchoolYearId
      if (filterUnitId && filterUnitId !== '__all__') params.unitId = filterUnitId
      if (filterClassId && filterClassId !== '__all__') params.classId = filterClassId
      const res = await apiClient.get<StudentSearchResult[]>('/master/students/search', { params })
      setSearchResults(res.data)
    } catch { setError('Gagal mencari siswa.') }
    finally { setSearching(false) }
  }

  useEffect(() => {
    const t = setTimeout(doSearch, searchQ ? 300 : 0)
    return () => clearTimeout(t)
  }, [searchQ, filterSchoolYearId, filterUnitId, filterClassId])

  const handleSelectStudent = async (student: StudentSearchResult) => {
    setShowSearchDialog(false)
    setSelectedStudent(student)
    setCartItems([])
    setError(null)
    try {
      setLoadingTxn(true)
      const res = await apiClient.get<StudentTransactionData>(`/billing/bills/student-transaction/${student.id}`)
      setTxnData(res.data)
    } catch { setError('Gagal memuat data transaksi.') }
    finally { setLoadingTxn(false) }
  }

  const resetAll = () => {
    setStep('search')
    setSelectedStudent(null)
    setTxnData(null)
    setCartItems([])
    setSearchQ('')
    setSearchResults([])
    setError(null)
    setResult(null)
    setNotes('')
    setShowSearchDialog(true)
  }

  const addToCart = (billId: number, paymentPostName: string, amount: number, billMonthId?: number, monthLabel?: string) => {
    setCartItems(prev => {
      const exists = prev.find(i => billMonthId ? i.billMonthId === billMonthId : (i.billId === billId && !i.billMonthId))
      if (exists) return prev
      return [...prev, { billId, billMonthId, amount, label: paymentPostName, monthLabel }]
    })
  }

  const removeFromCart = (index: number) => {
    setCartItems(prev => prev.filter((_, i) => i !== index))
  }

  const updateCartAmount = (index: number, amount: number) => {
    setCartItems(prev => prev.map((item, i) => i === index ? { ...item, amount } : item))
  }

  const cartTotal = useMemo(() => cartItems.reduce((s, i) => s + i.amount, 0), [cartItems])

  const isInCart = (billId: number, billMonthId?: number) =>
    cartItems.some(i => billMonthId ? i.billMonthId === billMonthId : (i.billId === billId && !i.billMonthId))

  const monthInBilling = (month: number, year: number) => {
    const now = new Date()
    const cy = now.getFullYear()
    const cm = now.getMonth() + 1
    if (year < cy) return true
    if (year === cy && month <= cm) return true
    return false
  }

  const monthCellClass = (m: TxnBulananMonth, billStatus: string) => {
    if (m.status === 'lunas') return 'bg-green-100 text-green-700'
    if (billStatus === 'cicilan') return 'bg-purple-100 text-purple-700 cursor-pointer hover:bg-purple-200'
    if (monthInBilling(m.month, m.year)) return 'bg-yellow-100 text-yellow-800 cursor-pointer hover:bg-yellow-200'
    return 'bg-gray-100 text-gray-400'
  }

  const handleSubmit = async () => {
    if (!selectedStudent) return
    try {
      setSaving(true)
      setError(null)
      const payload = {
        studentId: selectedStudent.id,
        items: cartItems.map(i => {
          const item: Record<string, unknown> = { billId: i.billId, amount: i.amount }
          if (i.billMonthId) item.billMonthId = i.billMonthId
          return item
        }),
        ...(notes ? { notes } : {}),
      }
      const res = await apiClient.post<CreateTransactionResult>('/transactions', payload)
      setResult(res.data)
      setStep('done')
    } catch { setError('Gagal menyimpan transaksi.') }
    finally { setSaving(false) }
  }

  const handleCetakKwitansi = () => {
    if (result) window.open(`/api/transactions/${result.id}/receipt`, '_blank')
  }

  return (<div className="p-6 animate-fade-in-up max-w-full">
      <h1 className="text-2xl font-bold text-gray-900">Transaksi Baru</h1>
      <p className="text-gray-500 mt-1">Catat pembayaran siswa</p>
      <p className="text-xs italic text-red-500 mt-1">
        Catat pembayaran siswa di sini. Cari siswa, pilih tagihan yang akan dibayar, lalu konfirmasi. Transaksi yang salah hanya bisa dibatalkan melalui Void dan tidak bisa dihapus.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm mt-6">{error}</div>
      )}

      <div className="flex flex-col min-h-0">

      {/* Search Dialog */}
      <Dialog open={showSearchDialog && !selectedStudent} onOpenChange={(open) => { if (!open && !selectedStudent) setShowSearchDialog(false) }}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Pilih Siswa</DialogTitle>
            <DialogDescription>Cari siswa berdasarkan nama, NIS, tahun pelajaran, unit, atau kelas.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-3">
              <div className="relative col-span-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <Input className="pl-10" placeholder="Ketik nama atau NIS..." value={searchQ} onChange={e => setSearchQ(e.target.value)} />
              </div>
              <Select value={filterSchoolYearId} onValueChange={setFilterSchoolYearId}>
                <SelectTrigger><SelectValue placeholder="Tahun Pelajaran" /></SelectTrigger>
                <SelectContent>{schoolYears.map(y => (<SelectItem key={y.id} value={String(y.id)}>{y.name}</SelectItem>))}</SelectContent>
              </Select>
              <Select value={filterUnitId} onValueChange={v => { setFilterUnitId(v); setFilterClassId('__all__') }}>
                <SelectTrigger><SelectValue placeholder="Unit Sekolah" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Semua</SelectItem>
                  {units.map(u => (<SelectItem key={u.id} value={String(u.id)}>{u.name}</SelectItem>))}
                </SelectContent>
              </Select>
              <Select value={filterClassId} onValueChange={setFilterClassId}>
                <SelectTrigger><SelectValue placeholder="Kelas" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Semua</SelectItem>
                  {filteredClasses.map(c => (<SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>))}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={doSearch} disabled={searching}>{searching ? 'Mencari...' : 'Cari'}</Button>
            </div>
            {searchResults.length > 0 && (
              <div className="border rounded-lg max-h-72 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-gray-50 sticky top-0"><th className="px-4 py-2 text-left text-xs font-medium text-gray-500">NIS</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Nama</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Kelas</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Unit</th></tr></thead>
                  <tbody>
                    {searchResults.map(s => (
                      <tr key={s.id} className="border-t border-gray-100 cursor-pointer hover:bg-accent/10 transition-colors" onClick={() => handleSelectStudent(s)}>
                        <td className="px-4 py-3 tabular-nums font-mono text-gray-600">{s.nis}</td>
                        <td className="px-4 py-3 font-medium text-gray-800">{s.name}</td>
                        <td className="px-4 py-3 text-gray-600">{s.activeClassName ?? '-'}</td>
                        <td className="px-4 py-3 text-gray-500">{s.activeUnitName ?? '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {searchResults.length === 0 && !searching && searchQ && (
              <p className="text-sm text-gray-400 text-center py-4">Tidak ada siswa ditemukan</p>
            )}
            {searchResults.length === 0 && !searching && !searchQ && (
              <p className="text-sm text-gray-400 text-center py-4">Klik Cari untuk menampilkan siswa</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Transaction View */}
      {selectedStudent && step === 'search' && (
        <div className="mt-6 space-y-4">
          {loadingTxn ? (
            <div className="space-y-3">
              {[0, 1, 2].map(i => (<div key={i} className="animate-pulse bg-gray-200 h-20 rounded-xl" />))}
            </div>
          ) : txnData ? (
            <>
              {/* Student Identity + Tunggakan */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{txnData.student.name}</p>
                    <p className="text-sm text-gray-500">NIS: {txnData.student.nis}</p>
                    <p className="text-xs text-gray-400">{txnData.student.activeClassName ?? '-'} — {txnData.student.activeUnitName ?? '-'}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={resetAll} className="text-gray-500">Ganti Siswa</Button>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-sm text-amber-700">Total Tunggakan</p>
                  <p className="tabular-nums text-2xl font-bold text-amber-800">{formatRupiah(txnData.totalTunggakan)}</p>
                  <p className="text-xs text-amber-600">
                    {txnData.bebas.filter(b => b.status !== 'lunas').length + txnData.bulanan.filter(b => b.status !== 'lunas').length} tagihan belum lunas
                  </p>
                </div>
              </div>

              {/* Bebas Bills Table */}
              {txnData.bebas.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-4 py-3 bg-gray-50 border-b">
                    <span className="font-medium text-gray-700 text-sm">Tagihan Bebas</span>
                    <span className="ml-2 inline-flex px-2 py-0.5 rounded-full text-xs bg-gray-200 text-gray-600">{txnData.bebas.length}</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Nama Pembayaran</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Total Tagihan</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Total Bayar</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Sisa</th>
                          <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {txnData.bebas.map(bill => {
                          const inCart = isInCart(bill.id)
                          return (
                            <tr
                              key={bill.id}
                              className={`border-b border-gray-50 cursor-pointer transition-colors ${inCart ? 'bg-accent/10 border-l-2 border-l-accent' : 'hover:bg-gray-50'}`}
                              onClick={() => { if (bill.status !== 'lunas' && bill.remaining > 0) addToCart(bill.id, bill.paymentPostName, bill.remaining) }}
                            >
                              <td className="px-4 py-3 font-medium text-gray-800">{bill.paymentPostName}</td>
                              <td className="px-4 py-3 text-right text-gray-600">{formatRupiah(bill.totalAmount)}</td>
                              <td className="px-4 py-3 text-right text-blue-600">{formatRupiah(bill.paidAmount)}</td>
                              <td className="px-4 py-3 text-right font-medium text-red-600">{formatRupiah(bill.remaining)}</td>
                              <td className="px-4 py-3 text-center"><span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGES[bill.status]}`}>{STATUS_LABELS[bill.status]}</span></td>
                            </tr>
                          )
                        })}
                        <tr className="bg-gray-50 font-medium">
                          <td className="px-4 py-3 text-gray-700">Subtotal</td>
                          <td className="px-4 py-3 text-right text-gray-800">{formatRupiah(txnData.bebas.reduce((s, b) => s + b.totalAmount, 0))}</td>
                          <td className="px-4 py-3 text-right text-blue-700">{formatRupiah(txnData.bebas.reduce((s, b) => s + b.paidAmount, 0))}</td>
                          <td className="px-4 py-3 text-right text-red-700">{formatRupiah(txnData.bebas.reduce((s, b) => s + b.remaining, 0))}</td>
                          <td></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Bulanan Bills Table */}
              {txnData.bulanan.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-4 py-3 bg-gray-50 border-b">
                    <span className="font-medium text-gray-700 text-sm">Tagihan Bulanan</span>
                    <span className="ml-2 inline-flex px-2 py-0.5 rounded-full text-xs bg-gray-200 text-gray-600">{txnData.bulanan.length}</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Nama Pembayaran</th>
                          {[7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5, 6].map(m => (
                            <th key={m} className="px-1 py-2 text-center text-xs font-medium text-gray-500 w-10">{MONTH_ABBR[m]}</th>
                          ))}
                          <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Total</th>
                          <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Bayar</th>
                          <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Sisa</th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {txnData.bulanan.map(bill => (
                          <tr key={bill.id} className="border-b border-gray-50">
                            <td className="px-3 py-2 font-medium text-gray-800 text-xs">
                              {bill.paymentPostName}
                            </td>
                            {[7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5, 6].map(monthNum => {
                              const m = bill.months.find(bm => bm.month === monthNum)
                              if (!m) return <td key={monthNum} className="px-1 py-2 text-center text-gray-300 text-xs">-</td>
                              const inCart = isInCart(bill.id, m.id)
                              const cellCls = monthCellClass(m, bill.status)
                              const canClick = m.status !== 'lunas' && monthInBilling(m.month, m.year)
                              const displayAmount = bill.status === 'cicilan' && m.paidAmount > 0 ? m.remaining : m.amount
                              return (
                                <td
                                  key={monthNum}
                                  className={`px-1 py-2 text-center text-xs tabular-nums font-mono border border-gray-100 ${cellCls} ${inCart ? 'ring-2 ring-accent ring-inset' : ''}`}
                                  onClick={() => { if (canClick) addToCart(bill.id, bill.paymentPostName, displayAmount, m.id, `${MONTH_ABBR[m.month]} ${m.year}`) }}
                                >
                                  {formatRupiah(displayAmount)}
                                </td>
                              )
                            })}
                            <td className="px-3 py-2 text-right tabular-nums text-gray-600 font-mono text-xs">{formatRupiah(bill.totalAmount)}</td>
                            <td className="px-3 py-2 text-right tabular-nums text-blue-600 font-mono text-xs">{formatRupiah(bill.paidAmount)}</td>
                            <td className="px-3 py-2 text-right tabular-nums text-red-600 font-mono text-xs">{formatRupiah(bill.remaining)}</td>
                            <td className="px-3 py-2 text-center"><span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGES[bill.status]}`}>{STATUS_LABELS[bill.status]}</span></td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-gray-50 font-medium text-xs">
                          <td className="px-3 py-2 text-gray-700">Subtotal</td>
                          {[7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5, 6].map(monthNum => {
                            const total = txnData.bulanan.reduce((s, bill) => {
                              const m = bill.months.find(bm => bm.month === monthNum)
                              return s + (m ? m.amount : 0)
                            }, 0)
                            return <td key={monthNum} className="px-1 py-2 text-center tabular-nums text-gray-800 font-mono">{total > 0 ? formatRupiah(total) : '-'}</td>
                          })}
                          <td className="px-3 py-2 text-right text-gray-800">{formatRupiah(txnData.bulanan.reduce((s, b) => s + b.totalAmount, 0))}</td>
                          <td className="px-3 py-2 text-right text-blue-700">{formatRupiah(txnData.bulanan.reduce((s, b) => s + b.paidAmount, 0))}</td>
                          <td className="px-3 py-2 text-right text-red-700">{formatRupiah(txnData.bulanan.reduce((s, b) => s + b.remaining, 0))}</td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                  <div className="px-4 py-2 bg-gray-50 border-t flex gap-4 text-xs text-gray-500">
                    <span className="inline-flex items-center gap-1"><span className="size-3 rounded bg-yellow-100 border border-yellow-300" /> Masuk Tagihan</span>
                    <span className="inline-flex items-center gap-1"><span className="size-3 rounded bg-purple-100 border border-purple-300" /> Cicilan</span>
                    <span className="inline-flex items-center gap-1"><span className="size-3 rounded bg-gray-100 border border-gray-300" /> Belum Masuk</span>
                    <span className="inline-flex items-center gap-1"><span className="size-3 rounded bg-green-100 border border-green-300" /> Lunas</span>
                  </div>
                </div>
              )}

              {txnData.bebas.length === 0 && txnData.bulanan.length === 0 && (
                <div className="text-center py-8 bg-white rounded-xl border border-gray-100">
                  <p className="text-gray-400">Semua tagihan sudah lunas</p>
                  <Button variant="outline" className="mt-3" onClick={resetAll}>Transaksi Baru</Button>
                </div>
              )}

              {/* Cart */}
              {cartItems.length > 0 && (
                <div className="sticky bottom-0 bg-white border-t-2 border-accent shadow-lg z-10">
                  <div className="px-4 py-2 bg-accent/5 border-b border-accent/20">
                    <span className="font-semibold text-accent text-sm">Keranjang Pembayaran ({cartItems.length} item)</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Pembayaran</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Bulan</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 w-40">Nominal</th>
                          <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 w-12">Hapus</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cartItems.map((item, idx) => (
                          <tr key={idx} className="border-b border-gray-50">
                            <td className="px-4 py-2 text-gray-800">{item.label}</td>
                            <td className="px-4 py-2 text-gray-500 text-xs">{item.monthLabel ?? '-'}</td>
                            <td className="px-4 py-2">
                              <Input type="number" className="w-36 h-8 text-sm" value={item.amount} onChange={e => updateCartAmount(idx, Number(e.target.value))} />
                            </td>
                            <td className="px-4 py-2 text-center">
                              <Button size="icon" variant="ghost" aria-label="Hapus item dari keranjang" onClick={() => removeFromCart(idx)}>
                                <X className="size-3.5" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td className="px-4 py-3 font-bold text-gray-900">Total</td>
                          <td></td>
                          <td className="px-4 py-3 font-bold text-accent text-right">{formatRupiah(cartTotal)}</td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                  <div className="px-4 py-3 border-t border-gray-100 flex items-end gap-4">
                    <div className="flex-1">
                      <Label className="text-xs">Catatan (opsional)</Label>
                      <Input placeholder="Pembayaran SPP..." value={notes} onChange={e => setNotes(e.target.value)} className="h-9 text-sm" />
                    </div>
                    <Button className="bg-accent hover:bg-accent/90 whitespace-nowrap" onClick={handleSubmit} disabled={saving || cartTotal <= 0}>
                      {saving ? 'Menyimpan...' : `Konfirmasi — ${formatRupiah(cartTotal)}`}
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>
      )}

      {/* Success */}
      {step === 'done' && result && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 mt-6 text-center">
          <CheckCircle className="size-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900">Pembayaran Berhasil</h2>
          <p className="text-gray-500 mt-1">Transaksi telah disimpan</p>
          <div className="bg-gray-50 rounded-xl p-4 mt-6 inline-block text-left">
            <div className="space-y-2">
              <div className="flex gap-4"><span className="text-sm text-gray-500 w-28">No. Transaksi</span><span className="text-sm tabular-nums font-mono font-bold text-gray-900">{result.transactionNumber}</span></div>
              <div className="flex gap-4"><span className="text-sm text-gray-500 w-28">Total</span><span className="text-sm font-bold text-accent">{formatRupiah(result.totalAmount)}</span></div>
              <div className="flex gap-4"><span className="text-sm text-gray-500 w-28">Status</span><span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">{result.status}</span></div>
              <div className="flex gap-4"><span className="text-sm text-gray-500 w-28">Tanggal</span><span className="text-sm text-gray-700">{new Date(result.createdAt).toLocaleDateString('id-ID')}</span></div>
            </div>
          </div>
          <div className="flex justify-center gap-3 mt-6">
            <Button className="bg-accent hover:bg-accent/90" onClick={handleCetakKwitansi}>Cetak Kwitansi</Button>
            <Button variant="outline" onClick={resetAll}>Transaksi Baru</Button>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}
