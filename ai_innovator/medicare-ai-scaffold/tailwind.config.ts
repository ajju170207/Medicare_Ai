import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary:    '#0057D9',
          primaryHover:'#0047B8',
          secondary:  '#00B894',
          danger:     '#E53E3E',
          warning:    '#DD6B20',
          surface:    '#F7F9FC',
          card:       '#FFFFFF',
          border:     '#E4E8EF',
          muted:      '#8A94A6',
          text:       '#1A202C',
          textLight:  '#4A5568',
        },
        severity: {
          mild:     '#00B894',
          moderate: '#DD6B20',
          severe:   '#E53E3E',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'Noto Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      borderRadius: {
        card:  '12px',
        pill:  '9999px',
        input: '8px',
      },
      spacing: {
        '4.5': '1.125rem',
        '13':  '3.25rem',
        '18':  '4.5rem',
      },
      boxShadow: {
        card:   '0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.06)',
        cardHover: '0 4px 12px 0 rgba(0,0,0,0.10)',
        sidebar:'4px 0 24px 0 rgba(0,0,0,0.06)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to:   { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to:   { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          from: { transform: 'translateX(100%)' },
          to:   { transform: 'translateX(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
      },
      animation: {
        'accordion-down':  'accordion-down 0.2s ease-out',
        'accordion-up':    'accordion-up 0.2s ease-out',
        'fade-in':         'fade-in 0.3s ease-out',
        'slide-in-right':  'slide-in-right 0.25s ease-out',
        shimmer:           'shimmer 1.5s infinite linear',
      },
    },
  },
  plugins: [],
}

export default config
