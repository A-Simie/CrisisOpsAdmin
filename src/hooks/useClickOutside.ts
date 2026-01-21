import { useEffect, useRef } from 'react'

export function useClickOutside<T extends HTMLElement>(
  callback: () => void,
  active: boolean = true
) {
  const ref = useRef<T>(null)

  useEffect(() => {
    if (!active) return

    const handleClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback()
      }
    }

    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [callback, active])

  return ref
}
