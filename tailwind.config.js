/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}', './Librarian/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['Manrope', 'sans-serif'],
      },
    },
  },
  plugins: [
    function ({ addBase }) {
      addBase({
        ':root': {
          colorScheme: 'light',
          fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          fontSynthesis: 'none',
          textRendering: 'optimizeLegibility',
          background: '#f3eee8',
          color: '#342a23',
        },
        body: {
          minWidth: '320px',
          minHeight: '100vh',
          margin: '0',
          background: '#f3eee8',
          color: '#342a23',
        },
        'button, input, select, textarea': { font: 'inherit' },
        '[class~="bg-[#f4f5f2]"]': { backgroundColor: '#f3eee8 !important' },
        '[class~="bg-[#f8fafc]"], [class~="bg-[#f8fafc]/70"], [class~="bg-[#f8fafc]/85"]': {
          backgroundColor: '#fbf8f4 !important',
        },
        '[class~="bg-[#fbfbfa]"]': { backgroundColor: '#fbf8f4 !important' },
        '[class~="bg-[#e2e8f0]"]': { backgroundColor: '#eee5dc !important' },
        '[class~="bg-[#173b63]"], [class~="bg-[#64748b]"], [class~="bg-sky-700"]': {
          backgroundColor: '#684a37 !important',
        },
        '[class~="bg-[#111f39]"]': { backgroundColor: '#342a23 !important' },
        '[class~="bg-[#94a3b8]"], [class~="bg-sky-100"]': { backgroundColor: '#e8d8c8 !important' },
        '[class~="bg-sky-50"]': { backgroundColor: '#f3e8dd !important' },
        '[class~="text-sky-700"]': { color: '#684a37 !important' },
        '[class~="text-[#173b63]"]': { color: '#342a23 !important' },
        '[class~="text-[#64748b]"]': { color: '#806f61 !important' },
        '[class~="text-[#94a3b8]"]': { color: '#a78363 !important' },
        '[class~="border-[#e2e8f0]"]': { borderColor: '#e5dbd1 !important' },
        '[class~="border-[#173b63]"], [class~="border-sky-400"]': { borderColor: '#987255 !important' },
        '[class*="hover:bg-[#e2e8f0]"]:hover, [class*="hover:bg-[#f8fafc]"]:hover': {
          backgroundColor: '#eee5dc !important',
        },
        '[class*="hover:bg-sky-800"]:hover': { backgroundColor: '#50392c !important' },
        '[class*="hover:text-sky-800"]:hover': { color: '#50392c !important' },
        '[class*="focus:border-sky-400"]:focus, [class*="focus-within:border-sky-400"]:focus-within': {
          borderColor: '#987255 !important',
        },
        '[class*="rgba(14,116,144"]': { boxShadow: '0 10px 18px rgba(93,64,51,0.22) !important' },
        'aside[class*="fixed inset-y-0"] [class*="hover:bg-[#f8fafc]"]:hover': {
          backgroundColor: 'rgb(255 255 255 / 8%) !important',
        },
        '[class~="focus:border-[#315c99]"]:focus': { borderColor: '#987255 !important' },
      })
    },
  ],
}
