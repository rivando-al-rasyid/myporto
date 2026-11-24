'use client'

import { startTransition, useEffect, useState } from 'react'

export function CurrentYear() {
  const [year, setYear] = useState<number | null>(null)

  useEffect(() => {
    startTransition(() => {
      setYear(new Date().getFullYear())
    })
  }, [])

  return <span suppressHydrationWarning>{year ?? ''}</span>
}
