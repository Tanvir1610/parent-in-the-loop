'use client'

// components/AgeGroupFilter.tsx
// Filter articles by child age group — report section 5.3

import { useState } from 'react'

export interface AgeGroup {
  value: string
  label: string
  emoji: string
  desc:  string
}

export const AGE_GROUPS: AgeGroup[] = [
  { value: 'all',   label: 'All Ages',  emoji: '👨‍👩‍👧‍👦', desc: 'For every family' },
  { value: '5-7',   label: '5–7',       emoji: '🌱',      desc: 'AI as a tool' },
  { value: '8-10',  label: '8–10',      emoji: '🔍',      desc: 'How AI learns' },
  { value: '11-13', label: '11–13',     emoji: '⚖️',      desc: 'Decision making' },
  { value: '14-16', label: '14–16',     emoji: '🛡️',      desc: 'Ethics & society' },
  { value: '17+',   label: '17+',       emoji: '🚀',      desc: 'Build & critique' },
]

interface Props {
  selected:  string
  onChange:  (val: string) => void
  className?: string
}

export default function AgeGroupFilter({ selected, onChange, className }: Props) {
  return (
    <div className={className} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
      <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#B79D84', marginRight: 4 }}>
        Child's age:
      </span>
      {AGE_GROUPS.map(ag => {
        const active = selected === ag.value
        return (
          <button
            key={ag.value}
            onClick={() => onChange(ag.value)}
            title={ag.desc}
            style={{
              display:      'flex',
              alignItems:   'center',
              gap:          '5px',
              padding:      '6px 14px',
              borderRadius: '99px',
              border:       `1.5px solid ${active ? '#7C63B8' : '#EDE8E1'}`,
              background:   active ? '#7C63B8' : '#fff',
              color:        active ? '#fff'    : '#555',
              fontWeight:   active ? 700       : 400,
              fontSize:     '0.82rem',
              cursor:       'pointer',
              transition:   'all 0.15s',
              whiteSpace:   'nowrap',
            }}
          >
            <span>{ag.emoji}</span>
            <span>{ag.label}</span>
          </button>
        )
      })}
    </div>
  )
}
