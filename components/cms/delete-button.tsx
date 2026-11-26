'use client'

import { Button } from '@/components/ui/button'

export function DeleteButton({
  action,
  id,
  label = 'Delete',
  confirmText = 'Delete this item? This cannot be undone.',
}: {
  action: (formData: FormData) => void | Promise<void>
  id: string
  label?: string
  confirmText?: string
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(confirmText)) e.preventDefault()
      }}
    >
      <input type="hidden" name="id" value={id} />
      <Button type="submit" variant="destructive" size="sm">
        {label}
      </Button>
    </form>
  )
}
