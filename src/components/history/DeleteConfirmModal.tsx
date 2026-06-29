import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

interface DeleteConfirmModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  loading: boolean
}

export function DeleteConfirmModal({ open, onClose, onConfirm, loading }: DeleteConfirmModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Bekräfta borttagning" size="sm">
      <div className="space-y-5">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Är du säker på att du vill ta bort denna registrering? Det går inte att ångra.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onClose} disabled={loading}>
            Avbryt
          </Button>
          <Button variant="danger" className="flex-1" onClick={onConfirm} loading={loading}>
            Ta bort
          </Button>
        </div>
      </div>
    </Modal>
  )
}
