import { AlertTriangle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface AlertDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  actionLabel?: string
  onAction: () => void
  loading?: boolean
  disabled?: boolean
  children?: React.ReactNode
}

export function AlertDialog({
  open,
  onOpenChange,
  title,
  description,
  actionLabel = "Hapus",
  onAction,
  loading = false,
  disabled = false,
  children,
}: AlertDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader className="text-center sm:text-center">
          <AlertTriangle className="mx-auto mb-3 size-10 text-red-500" />
          <DialogTitle className="text-red-700">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {children && <div className="space-y-4 pt-2">{children}</div>}
        <DialogFooter className="sm:justify-center gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Batal
          </Button>
          <Button
            variant="destructive"
            onClick={onAction}
            disabled={loading || disabled}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? "Memproses..." : actionLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
