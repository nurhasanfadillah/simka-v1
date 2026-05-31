import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, Download, FileSpreadsheet, CheckCircle, XCircle, ArrowLeft } from 'lucide-react'
import { apiClient } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ImportPreviewRow, ImportCommitResponse } from '@/types/master'

const YEAR_OPTIONS = Array.from({ length: 31 }, (_, i) => 2000 + i)

export default function SiswaImportPage() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [entryYear, setEntryYear] = useState<number>(new Date().getFullYear())
  const [file, setFile] = useState<File | null>(null)
  const [previewRows, setPreviewRows] = useState<ImportPreviewRow[]>([])
  const [loading, setLoading] = useState<'idle' | 'uploading' | 'committing'>('idle')
  const [result, setResult] = useState<ImportCommitResponse | null>(null)
  const [error, setError] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) {
      setFile(f)
      setPreviewRows([])
      setResult(null)
      setError('')
    }
  }

  const handleUpload = async () => {
    if (!file) return
    setLoading('uploading')
    setError('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('entryYear', String(entryYear))
      const { data } = await apiClient.post('/master/students/import/preview', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setPreviewRows(data.rows)
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Gagal mengupload file'
      setError(msg)
      setPreviewRows([])
    } finally {
      setLoading('idle')
    }
  }

  const handleCommit = async () => {
    const validRows = previewRows.filter((r) => r.status === 'valid' && r.data)
    if (validRows.length === 0) return
    setLoading('committing')
    setError('')
    try {
      const { data } = await apiClient.post<ImportCommitResponse>('/master/students/import/commit', {
        entryYear,
        rows: validRows.map((r) => r.data),
      })
      setResult(data)
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Gagal menyimpan data'
      setError(msg)
    } finally {
      setLoading('idle')
    }
  }

  const validCount = previewRows.filter((r) => r.status === 'valid').length
  const errorCount = previewRows.filter((r) => r.status === 'error').length

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/master/siswa')}>
          <ArrowLeft className="size-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Import Data Siswa</h1>
          <p className="text-xs italic text-gray-400 mt-1">
            Unggah file Excel (.xlsx) data siswa. Unduh template terlebih dahulu untuk format yang benar. Maksimal 500 siswa per import.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
          {error}
        </div>
      )}

      {!result && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tahun Masuk *</Label>
              <Select value={String(entryYear)} onValueChange={(v) => setEntryYear(Number(v))}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tahun" />
                </SelectTrigger>
                <SelectContent>
                  {YEAR_OPTIONS.map((y) => (
                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                className="border-[#00A651] text-accent hover:bg-accent hover:text-white"
                onClick={() => window.open('/api/master/students/template', '_blank')}
              >
                <Download className="size-4 mr-2" />
                Download Template
              </Button>
            </div>
          </div>

          <div
            className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[#00A651] transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx"
              className="hidden"
              onChange={handleFileChange}
            />
            <FileSpreadsheet className="size-10 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-600">
              {file ? file.name : 'Klik untuk memilih file .xlsx'}
            </p>
            {file && (
              <p className="text-xs text-gray-400 mt-1">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            )}
          </div>

          <Button
            className="w-full bg-accent hover:bg-accent/90"
            disabled={!file || loading !== 'idle'}
            onClick={handleUpload}
          >
            {loading === 'uploading' ? (
              <>Memproses...</>
            ) : (
              <>
                <Upload className="size-4 mr-2" />
                Upload & Preview
              </>
            )}
          </Button>
        </div>
      )}

      {previewRows.length > 0 && !result && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1 text-sm font-medium text-green-700 bg-green-50 px-3 py-1 rounded-full">
                <CheckCircle className="size-4" /> {validCount} Valid
              </span>
              {errorCount > 0 && (
                <span className="inline-flex items-center gap-1 text-sm font-medium text-red-700 bg-red-50 px-3 py-1 rounded-full">
                  <XCircle className="size-4" /> {errorCount} Gagal
                </span>
              )}
            </div>
            <Button
              className="bg-accent hover:bg-accent/90"
              disabled={validCount === 0 || loading !== 'idle'}
              onClick={handleCommit}
            >
              {loading === 'committing' ? 'Menyimpan...' : `Import ${validCount} Data Valid`}
            </Button>
          </div>

          <div className="border border-gray-200 rounded-xl overflow-hidden max-h-[500px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="px-4 py-2.5 text-left font-medium text-gray-600">#</th>
                  <th className="px-4 py-2.5 text-left font-medium text-gray-600">Nama</th>
                  <th className="px-4 py-2.5 text-left font-medium text-gray-600">JK</th>
                  <th className="px-4 py-2.5 text-left font-medium text-gray-600">Tgl Lahir</th>
                  <th className="px-4 py-2.5 text-left font-medium text-gray-600">Nama Ortu</th>
                  <th className="px-4 py-2.5 text-left font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {previewRows.map((row) => (
                  <tr
                    key={row.row}
                    className={
                      row.status === 'valid' ? 'bg-green-50/30' : 'bg-red-50/30'
                    }
                  >
                    <td className="px-4 py-2.5 text-gray-500">{row.row}</td>
                    <td className="px-4 py-2.5 font-medium">{row.data?.name ?? '-'}</td>
                    <td className="px-4 py-2.5">{row.data?.gender ?? '-'}</td>
                    <td className="px-4 py-2.5">{row.data?.birthDate ?? '-'}</td>
                    <td className="px-4 py-2.5">{row.data?.parentName ?? '-'}</td>
                    <td className="px-4 py-2.5">
                      {row.status === 'valid' ? (
                        <span className="inline-flex items-center gap-1 text-green-700 font-medium">
                          <CheckCircle className="size-4" /> Valid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-600 font-medium" title={row.errors?.join(', ')}>
                          <XCircle className="size-4" /> {row.errors?.join(', ')}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {result && (
        <div className="bg-white border border-green-200 rounded-xl p-8 text-center space-y-4">
          <CheckCircle className="size-16 text-green-500 mx-auto" />
          <h2 className="text-xl font-bold text-gray-900">Import Selesai</h2>
          <p className="text-gray-600">
            Berhasil mengimpor <span className="font-bold text-green-700">{result.success}</span> siswa
            {result.failed > 0 && (
              <>, <span className="font-bold text-red-600">{result.failed}</span> gagal</>
            )}
          </p>
          <Button
            className="bg-accent hover:bg-accent/90"
            onClick={() => navigate('/master/siswa')}
          >
            Kembali ke Data Siswa
          </Button>
        </div>
      )}
    </div>
  )
}
