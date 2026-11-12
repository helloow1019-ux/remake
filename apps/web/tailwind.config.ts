import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: 'var(--paper)',
          muted: 'var(--paper-2)',
        },
        ink: {
          DEFAULT: 'var(--ink)',
        },
        leaf: {
          DEFAULT: 'var(--leaf)',
          hover: 'var(--leaf-hover)',
          light: '#52B788',
        },
        marigold: {
          DEFAULT: 'var(--marigold)',
          hover: 'var(--marigold-hover)',
        },
        chili: {
          DEFAULT: 'var(--chili)',
        },
        sky: {
          DEFAULT: 'var(--sky)',
        },
        card: {
          DEFAULT: 'var(--card)',
        },
        // Semantic aliases for components using kraft/forest/cardboard/caution
        kraft: {
          50: '#FDFBF7',
          100: '#F7F2E6',
          200: '#EFE5D0',
          300: '#DFD1B3',
          400: '#C7B188',
          500: '#A99060',
          600: '#8A7043',
          700: '#6C5430',
          750: '#2A3831',
          800: '#1F2A24',
          900: '#151D18',
        },
        forest: {
          DEFAULT: '#247A4B',
          green: '#247A4B',
          light: '#45D084',
          dark: '#185333',
        },
        cardboard: {
          DEFAULT: '#F59E0B',
          amber: '#F59E0B',
          brown: '#8D5B28',
        },
        caution: {
          DEFAULT: '#E14D2A',
          red: '#E14D2A',
          yellow: '#F59E0B',
        },
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        body: ['"DM Sans"', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['"DM Sans"', 'Inter', 'system-ui', 'sans-serif'],
        hand: ['Caveat', '"Patrick Hand"', 'cursive'],
        serif: ['Caveat', 'Georgia', 'serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        urdu: ['"Noto Nastaliq Urdu"', '"Noto Naskh Arabic"', 'serif'],
      },
      boxShadow: {
        sticker: '0 4px 0 rgba(27, 42, 34, 0.15), 0 2px 5px rgba(0, 0, 0, 0.06)',
        stamp: '2px 2px 0 currentColor',
        tape: '0 2px 6px rgba(0, 0, 0, 0.12)',
        kraft: '0 4px 0 rgba(27, 42, 34, 0.12), 0 8px 16px rgba(27, 42, 34, 0.05)',
      },
      borderWidth: {
        3: '3px',
        stitch: '2px',
      },
    },
  },
  plugins: [],
} satisfies Config;
