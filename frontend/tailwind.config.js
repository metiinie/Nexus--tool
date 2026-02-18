/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./App.tsx",
        "./frontend/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            colors: {
                background: '#030712', // Dark slate 950
                surface: '#0f172a', // Slate 900
                primary: '#06b6d4', // Cyan 500
                secondary: '#d946ef', // Fuchsia 500
                accent: '#8b5cf6', // Violet 500
                success: '#10b981', // Emerald 500
            },
            boxShadow: {
                'glow-primary': '0 0 20px -5px rgba(6, 182, 212, 0.5)',
                'glow-secondary': '0 0 20px -5px rgba(217, 70, 239, 0.5)',
            }
        },
    },
    plugins: [],
}
