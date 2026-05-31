import { useEffect, useState, useCallback } from 'react'
import { Eye, Ban, Trash2 } from 'lucide-react'
import axios from 'axios'
import { apiClient } from '@/lib/api'
import { DeleteErrorModal } from '@/components/ui/delete-error-modal'
import type { Transaction, TransactionDetail } from '@/types/master'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AlertDialog } from '@/components/ui/alert-dialog'

const formatRupiah = (v: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v)

export default function RiwayatPage() {
  const [data, setData] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState('')
  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [filterDateTo, setFilterDateTo] = useState('')

  const [detailModal, setDetailModal] = useState<TransactionDetail | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  const [voidTx, setVoidTx] = useState<Transaction | null>(null)
  const [voidReason, setVoidReason] = useState('')
  const [voiding, setVoiding] = useState(false)
  const [deletingTx, setDeletingTx] = useState(false)
  const [deleteErrorData, setDeleteErrorData] = useState<Record<string, number> | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const params: Record<string, string> = {}
      if (filterStatus) params.status = filterStatus
      if (filterDateFrom) params.dateFrom = filterDateFrom
      if (filterDateTo) params.dateTo = filterDateTo
      const res = await apiClient.get<Transaction[]>('/transactions', { params })
      setData(res.data)
      setError(null)
    } catch {
      setError('Gagal memuat data.')
    } finally {
      setLoading(false)
    }
  }, [filterStatus, filterDateFrom, filterDateTo])

  useEffect(() => { fetchData() }, [fetchData])

  const openDetail = async (tx: Transaction) => {
    try {
      setLoadingDetail(true)
      const res = await apiClient.get<TransactionDetail>(`/transactions/${tx.id}`)
      setDetailModal(res.data)
    } catch {
      setError('Gagal memuat detail.')
    } finally {
      setLoadingDetail(false)
    }
  }

  const openVoid = (tx: Transaction) => {
    setDetailModal(null)
    setVoidTx(tx)
    setVoidReason('')
  }

  const handleVoid = async () => {
    if (!voidTx || voidReason.length < 3) return
    try {
      setVoiding(true)
      await apiClient.post(`/transactions/${voidTx.id}/void`, { voidReason })
      setVoidTx(null)
      await fetchData()
    } catch {
      setError('Gagal void transaksi.')
    } finally {
      setVoiding(false)
    }
  }

  const handleDeleteTransaction = async (id: number) => {
    try {
      setDeletingTx(true)
      await apiClient.delete(`/transactions/${id}`)
      await fetchData()
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        setDeleteErrorData(err.response.data.relatedData ?? { status: 1 })
      } else {
        setError('Gagal menghapus transaksi.')
      }
    } finally {
      setDeletingTx(false)
    }
  }

  return (<div className="p-6 animate-fade-in-up">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Riwayat Pembayaran</h1>
          <p className="text-gray-500 mt-1">Riwayat semua transaksi pembayaran</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Semua Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="aktif">Aktif</SelectItem>
              <SelectItem value="void">Void</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="date"
            className="w-36"
            value={filterDateFrom}
            onChange={e => setFilterDateFrom(e.target.value)}
          />
          <span className="text-gray-400 text-sm">s/d</span>
          <Input
            type="date"
            className="w-36"
            value={filterDateTo}
            onChange={e => setFilterDateTo(e.target.value)}
          />
        </div>
      </div>
      <p className="text-xs italic text-red-500 mb-4">
        Daftar semua transaksi pembayaran yang tercatat. Untuk membatalkan transaksi yang salah, gunakan tombol Void — tindakan ini tidak dapat diurungkan dan akan mempengaruhi status tagihan siswa.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm mb-6">{error}</div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto hover:shadow-md transition-shadow duration-200">
        <table>
          <thead>
            <tr>
              {['No. Transaksi', 'Siswa', 'NIS', 'Nominal', 'Status', 'Tanggal', 'Aksi'].map(col => (
                <th key={col} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={7} className="px-6 py-4"><div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" /><div className="mt-2 h-4 bg-gray-200 rounded animate-pulse w-1/2" /></td></tr>
              ))
            ) : data.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-400">Belum ada transaksi</td></tr>
            ) : (
              data.map(tx => (
                <tr key={tx.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm tabular-nums text-gray-700 font-mono">{tx.transactionNumber}</td>
                  <td className="px-6 py-4 text-sm text-gray-800 font-medium">{tx.studentName}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{tx.nis}</td>
                  <td className="px-6 py-4 text-sm tabular-nums font-semibold text-accent">{formatRupiah(tx.totalAmount)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${tx.status === 'aktif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(tx.createdAt).toLocaleDateString('id-ID')}</td>
                  <td className="px-6 py-4 flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => openDetail(tx)} disabled={loadingDetail}>
                      <Eye className="size-3.5 mr-1" />Detail
                    </Button>
                    {tx.status === 'void' && (
                      <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleDeleteTransaction(tx.id)} disabled={deletingTx}>
                        <Trash2 className="size-3.5 mr-1" />Hapus
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <DeleteErrorModal open={deleteErrorData !== null} onClose={() => setDeleteErrorData(null)} relatedData={deleteErrorData ?? {}} />

      {/* Detail Modal */}
      <Dialog open={!!detailModal} onOpenChange={() => setDetailModal(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{detailModal?.transactionNumber} — {detailModal?.studentName}</DialogTitle>
          </DialogHeader>
          {detailModal && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3 text-sm bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-150">
                <div><span className="text-gray-500">NIS:</span> <span className="tabular-nums font-mono">{detailModal.nis}</span></div>
                <div><span className="text-gray-500">Total:</span> <span className="tabular-nums font-semibold text-accent">{formatRupiah(detailModal.totalAmount)}</span></div>
                <div><span className="text-gray-500">Status:</span> <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${detailModal.status === 'aktif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{detailModal.status}</span></div>
                <div><span className="text-gray-500">Tanggal:</span> {new Date(detailModal.createdAt).toLocaleDateString('id-ID')}</div>
                {detailModal.notes && (
                  <div className="col-span-2"><span className="text-gray-500">Catatan:</span> {detailModal.notes}</div>
                )}
              </div>
              {detailModal.items.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Item Pembayaran</h4>
                  <div className="border rounded-lg overflow-hidden">
                    <table>
                      <thead>
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Tagihan ID</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Bulan ID</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Nominal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detailModal.items.map(item => (
                          <tr key={item.id} className="border-t border-gray-100">
                            <td className="px-3 py-2 tabular-nums text-gray-700 font-mono">{item.billId}</td>
                            <td className="px-3 py-2 text-gray-500">{item.billMonthId ?? '-'}</td>
                            <td className="px-3 py-2 text-gray-700">{formatRupiah(item.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {detailModal.status === 'aktif' && (
                <Button variant="outline" className="w-full border-red-200 text-red-600 hover:bg-red-50" onClick={() => openVoid(detailModal)}>
                  <Ban className="size-4 mr-2" />Void Transaksi
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!voidTx}
        onOpenChange={(open) => { if (!open) setVoidTx(null) }}
        title="Void Transaksi?"
        description={`Anda akan membatalkan transaksi ${voidTx?.transactionNumber}. Status akan berubah menjadi "void" dan tagihan dikembalikan. Tindakan ini permanen dan tidak dapat diurungkan.`}
        actionLabel="Void"
        onAction={handleVoid}
        loading={voiding}
        disabled={voidReason.length < 3}
      >
        <div className="space-y-2">
          <Label>Alasan Void *</Label>
          <Input
            placeholder="Minimal 3 karakter"
            value={voidReason}
            onChange={e => setVoidReason(e.target.value)}
          />
          {voidReason.length > 0 && voidReason.length < 3 && (
            <p className="text-sm text-red-500">Minimal 3 karakter</p>
          )}
        </div>
      </AlertDialog>
    </div>
  )
}
