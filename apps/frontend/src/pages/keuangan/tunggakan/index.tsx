import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api'
import type { SchoolYear, TunggakanSummary, TunggakanSummaryGroup } from '@/types/master'

const formatRupiah = (v: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v)

const SummaryTable = ({ title, data }: { title: string; data: TunggakanSummaryGroup[] }) => {
  const totalSum = data.reduce((s, r) => s + r.total, 0)
  const paidSum = data.reduce((s, r) => s + r.paid, 0)
  const remainSum = data.reduce((s, r) => s + r.remaining, 0)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b">
        <span className="font-medium text-gray-700 text-sm">{title}</span>
        <span className="ml-2 inline-flex px-2 py-0.5 rounded-full text-xs bg-gray-200 text-gray-600">{data.length}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">{title}</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Total Tagihan</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Total Bayar</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Total Tunggakan</th>
            </tr>
          </thead>
          <tbody>
            {data.map((r, i) => (
              <tr key={i} className="border-b border-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{r.label}</td>
                <td className="px-4 py-3 text-right text-gray-600">{formatRupiah(r.total)}</td>
                <td className="px-4 py-3 text-right text-blue-600">{formatRupiah(r.paid)}</td>
                <td className="px-4 py-3 text-right font-medium text-red-600">{formatRupiah(r.remaining)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50 font-medium">
              <td className="px-4 py-3 text-gray-700">Total</td>
              <td className="px-4 py-3 text-right text-gray-800">{formatRupiah(totalSum)}</td>
              <td className="px-4 py-3 text-right text-blue-700">{formatRupiah(paidSum)}</td>
              <td className="px-4 py-3 text-right text-red-700">{formatRupiah(remainSum)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}

export default function TunggakanPage() {
  const [data, setData] = useState<TunggakanSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([])
  const [filterSchoolYearId, setFilterSchoolYearId] = useState('')

  const fetchData = async () => {
    try {
      setLoading(true)
      const params: Record<string, string> = {}
      if (filterSchoolYearId) params.schoolYearId = filterSchoolYearId
      const res = await apiClient.get<TunggakanSummary>('/billing/bills/tunggakan/summary', { params })
      setData(res.data)
      setError(null)
    } catch {
      setError('Gagal memuat data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    apiClient.get<SchoolYear[]>('/master/school-years').then(r => setSchoolYears(r.data)).catch(() => {})
  }, [])

  useEffect(() => { fetchData() }, [filterSchoolYearId])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900">Tunggakan</h1>
      <p className="text-gray-500 mt-1">Ringkasan tagihan dan tunggakan</p>

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mt-4">
        <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-700 min-w-[180px]" value={filterSchoolYearId} onChange={(e) => setFilterSchoolYearId(e.target.value)}>
          <option value="">Semua Tahun Pelajaran</option>
          {schoolYears.map((y) => (<option key={y.id} value={y.id}>{y.name}</option>))}
        </select>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm mt-4">{error}</div>}

      {loading ? (
        <div className="space-y-4 mt-4">
          {[0, 1, 2, 3].map(i => (<div key={i} className="animate-pulse bg-gray-200 h-32 rounded-xl" />))}
        </div>
      ) : data ? (
        <div className="space-y-6 mt-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <p className="text-sm text-gray-500">Total Tagihan</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{formatRupiah(data.totalTagihan)}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <p className="text-sm text-gray-500">Total Pembayaran</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{formatRupiah(data.totalPembayaran)}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-red-100 p-5 bg-red-50/30">
              <p className="text-sm text-red-500">Total Tunggakan</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{formatRupiah(data.totalTunggakan)}</p>
            </div>
          </div>

          {/* Tables */}
          {data.byYear.length > 0 && <SummaryTable title="Tahun Pelajaran" data={data.byYear} />}
          {data.byPos.length > 0 && <SummaryTable title="POS Keuangan" data={data.byPos} />}
          {data.byPembayaran.length > 0 && <SummaryTable title="Pembayaran" data={data.byPembayaran} />}
          {data.byUnit.length > 0 && <SummaryTable title="Unit" data={data.byUnit} />}
          {data.byClass.length > 0 && <SummaryTable title="Kelas" data={data.byClass} />}
        </div>
      ) : null}
    </div>
  )
}
