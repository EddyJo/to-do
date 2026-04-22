import { useEffect, useState } from 'react'

interface ToastProps {
  message: string
  duration?: number
  onDismiss: () => void
}

export function Toast({ message, duration = 2200, onDismiss }: ToastProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
    const t = setTimeout(() => {
      setVisible(false)
      setTimeout(onDismiss, 200)
    }, duration)
    return () => clearTimeout(t)
  }, [duration, onDismiss])

  return (
    <div style={{
      position: 'fixed', bottom: '28px', left: '50%',
      transform: `translateX(-50%) translateY(${visible ? 0 : '8px'})`,
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.18s ease, transform 0.18s ease',
      background: '#1e1e1e', border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: '6px', padding: '9px 16px',
      fontSize: '13px', color: '#e8e8e8',
      zIndex: 9999, whiteSpace: 'nowrap',
      boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
      pointerEvents: 'none',
    }}>
      {message}
    </div>
  )
}

export function useToast() {
  const [toast, setToast] = useState<string | null>(null)

  function showToast(msg: string) {
    setToast(msg)
  }

  function dismissToast() {
    setToast(null)
  }

  return { toast, showToast, dismissToast }
}
