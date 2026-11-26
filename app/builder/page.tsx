'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function BuilderIndex() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/builder/dashboard')
  }, [router])

  return null
}