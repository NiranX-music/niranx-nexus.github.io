import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				sans: ['Space Grotesk', 'system-ui', 'sans-serif'],
				display: ['Orbitron', 'Space Grotesk', 'system-ui', 'sans-serif'],
				mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					glow: 'hsl(var(--primary-glow))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))',
					glow: 'hsl(var(--accent-glow))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				success: {
					DEFAULT: 'hsl(var(--success))',
					foreground: 'hsl(var(--success-foreground))'
				},
				warning: {
					DEFAULT: 'hsl(var(--warning))',
					foreground: 'hsl(var(--warning-foreground))'
				},
				sidebar: 'hsl(var(--sidebar))',
				'sidebar-foreground': 'hsl(var(--sidebar-foreground))',
				'sidebar-accent': 'hsl(var(--sidebar-accent))',
				'sidebar-accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
				'sidebar-border': 'hsl(var(--sidebar-border))',
				'sidebar-ring': 'hsl(var(--sidebar-ring))'
			},
			backgroundImage: {
				'gradient-primary': 'var(--gradient-primary)',
				'gradient-accent': 'var(--gradient-accent)',
				'gradient-bg': 'var(--gradient-bg)',
				'gradient-card': 'var(--gradient-card)'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0', opacity: '0' },
					to: { height: 'var(--radix-accordion-content-height)', opacity: '1' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)', opacity: '1' },
					to: { height: '0', opacity: '0' }
				},
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(8px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'slide-up': {
					'0%': { opacity: '0', transform: 'translateY(16px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'slide-in-right': {
					'0%': { opacity: '0', transform: 'translateX(-16px)' },
					'100%': { opacity: '1', transform: 'translateX(0)' }
				},
				'slide-in-left': {
					'0%': { opacity: '0', transform: 'translateX(16px)' },
					'100%': { opacity: '1', transform: 'translateX(0)' }
				},
				'scale-in': {
					'0%': { opacity: '0', transform: 'scale(0.96)' },
					'100%': { opacity: '1', transform: 'scale(1)' }
				},
				'bounce-gentle': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-4px)' }
				},
				'pulse-scale': {
					'0%, 100%': { transform: 'scale(1)' },
					'50%': { transform: 'scale(1.04)' }
				},
				'rotate-slow': {
					'0%': { transform: 'rotate(0deg)' },
					'100%': { transform: 'rotate(360deg)' }
				},
				'shimmer': {
					'0%': { backgroundPosition: '-200% 0' },
					'100%': { backgroundPosition: '200% 0' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-8px)' }
				},
				'glow-pulse': {
					'0%, 100%': { boxShadow: '0 0 12px hsl(170 100% 50% / 0.3)' },
					'50%': { boxShadow: '0 0 28px hsl(170 100% 50% / 0.6)' }
				},
				'slide-rotate': {
					'0%': { transform: 'translateX(-100%) rotate(-8deg)', opacity: '0' },
					'100%': { transform: 'translateX(0) rotate(0deg)', opacity: '1' }
				},
				'flip-in': {
					'0%': { transform: 'perspective(400px) rotateY(90deg)', opacity: '0' },
					'100%': { transform: 'perspective(400px) rotateY(0deg)', opacity: '1' }
				},
				'wobble': {
					'0%, 100%': { transform: 'rotate(0deg)' },
					'25%': { transform: 'rotate(3deg)' },
					'75%': { transform: 'rotate(-3deg)' }
				},
				'cyber-scan': {
					'0%': { transform: 'translateY(-100%)', opacity: '0.5' },
					'50%': { opacity: '1' },
					'100%': { transform: 'translateY(100%)', opacity: '0.5' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.25s ease-out',
				'accordion-up': 'accordion-up 0.25s ease-out',
				'fade-in': 'fade-in 0.4s ease-out',
				'slide-up': 'slide-up 0.5s ease-out',
				'slide-in-right': 'slide-in-right 0.4s ease-out',
				'slide-in-left': 'slide-in-left 0.4s ease-out',
				'scale-in': 'scale-in 0.35s ease-out',
				'bounce-gentle': 'bounce-gentle 2.5s ease-in-out infinite',
				'pulse-scale': 'pulse-scale 2.5s ease-in-out infinite',
				'rotate-slow': 'rotate-slow 4s linear infinite',
				'shimmer': 'shimmer 3s linear infinite',
				'float': 'float 5s ease-in-out infinite',
				'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
				'slide-rotate': 'slide-rotate 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
				'flip-in': 'flip-in 0.5s ease-out',
				'wobble': 'wobble 0.6s ease-in-out',
				'cyber-scan': 'cyber-scan 3s linear infinite'
			},
			perspective: {
				'3d': '1200px',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
