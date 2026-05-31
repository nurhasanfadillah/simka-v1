import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

interface DeleteErrorModalProps {
  open: boolean
  onClose: () => void
  relatedData: Record<string, number>
}

const LABEL_MAP: Record<string, string> = {
  tagihan: 'Tagihan',
  template: 'Template Pembayaran',
  kelas: 'Kelas',
  siswa: 'Siswa',
  pengguna: 'Pengguna',
}

export function DeleteErrorModal({ open, onClose, relatedData }: DeleteErrorModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Tidak Dapat Dihapus
          </DialogTitle>
          <DialogDescription asChild>
            <div>
              <p className="text-sm text-gray-600 mt-1">
                Data ini masih memiliki data terkait yang harus dihapus terlebih dahulu:
              </p>
              <ul className="mt-3 space-y-1">
                {Object.entries(relatedData).map(([key, val]) => (
                  <li key={key} className="text-sm text-gray-800 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
                    {LABEL_MAP[key] ?? key}: <span className="font-semibold">{val} data</span>
                  </li>
                ))}
              </ul>
            </div>
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={onClose}>Tutup</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
