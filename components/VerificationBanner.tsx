'use client'

// components/VerificationBanner.tsx
// Shows a banner when user lands on homepage after email verification
// Reads ?verified=success|already|invalid|error from URL

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

type VerifiedState = 'success' | 'already' | 'invalid' | 'error' | null

const MESSAGES: Record<NonNullable<VerifiedState>, { icon: string; title: string; body: string; color: string; bg: string }> = {
  success: {
    icon:  '🎉',
    title: 'Email confirmed!',
    body:  'You\'re now subscribed to Parent in the Loop. Your welcome email is on its way!',
    color: '#276227',
    bg:    '#D4EDDA',
  },
  already: {
    icon:  'ℹ️',
    title: 'Already verified',
    body:  'This email is already confirmed and active — you\'re good to go!',
    color: '#1a5276',
    bg:    '#D6EAF8',
  },
  invalid: {
    icon:  '⚠️',
    title: 'Invalid link',
    body:  'This verification link is invalid or has expired. Try subscribing again.',
    color: '#7D6608',
    bg:    '#FEF9E7',
  },
  error: {
    icon:  '❌',
    title: 'Something went wrong',
    body:  'We could not verify your email. Please try subscribing again.',
    color: '#922B21',
    bg:    '#FADBD8',
  },
}

export default function VerificationBanner() {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const [state, setState] = useState<VerifiedState>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const v = searchParams.get('verified') as VerifiedState
    if (v && MESSAGES[v]) {
      setState(v)
      setVisible(true)

      // Auto-dismiss after 8s for success/already
      if (v === 'success' || v === 'already') {
        const t = setTimeout(() => dismiss(), 8000)
        return () => clearTimeout(t)
      }
    }
  }, [searchParams])

  function dismiss() {
    setVisible(false)
    // Remove ?verified param from URL without reload
    const url = new URL(window.location.href)
    url.searchParams.delete('verified')
    url.searchParams.delete('email')
    router.replace(url.pathname + (url.search ? url.search : ''), { scroll: false })
  }

  if (!state || !visible) return null

  const msg = MESSAGES[state]

  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        position:     'fixed',
        top:          '1.5rem',
        left:         '50%',
        transform:    'translateX(-50%)',
        zIndex:       9999,
        width:        'calc(100% - 2rem)',
        maxWidth:     '520px',
        background:   msg.bg,
        border:       `1.5px solid ${msg.color}33`,
        borderRadius: '14px',
        padding:      '1rem 1.25rem',
        boxShadow:    '0 8px 32px rgba(0,0,0,0.12)',
        display:      'flex',
        alignItems:   'flex-start',
        gap:          '0.75rem',
        animation:    'slideDown 0.3s ease',
        fontFamily:   "'Segoe UI', Arial, sans-serif",
      }}
    >
      <span style={{ fontSize: '1.5rem', flexShrink: 0, marginTop: '1px' }}>{msg.icon}</span>
      <div style={{ flex: 1 }}>
        <p style={{ fontWeight: 700, color: msg.color, margin: '0 0 2px', fontSize: '0.95rem' }}>
          {msg.title}
        </p>
        <p style={{ color: msg.color, margin: 0, fontSize: '0.85rem', lineHeight: 1.5, opacity: 0.9 }}>
          {msg.body}
        </p>
      </div>
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        style={{
          background:  'none',
          border:      'none',
          cursor:      'pointer',
          color:       msg.color,
          fontSize:    '1.1rem',
          opacity:     0.7,
          padding:     '0',
          flexShrink:  0,
          lineHeight:  1,
        }}
      >
        ✕
      </button>

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateX(-50%) translateY(-12px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  )
}
