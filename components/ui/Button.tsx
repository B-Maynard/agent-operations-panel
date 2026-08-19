import { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'

const variants: Record<Variant, string> = {
  primary: 'bg-[#1f6feb] text-white hover:bg-[#58a6ff]',
  secondary: 'bg-transparent text-[#e6edf3] border border-[#30363d] hover:border-[#58a6ff]',
  danger: 'bg-[#f85149] text-white hover:bg-[#ff7b72]',
  ghost: 'bg-transparent text-[#58a6ff] border border-[#1f6feb] hover:bg-[rgba(31,111,235,0.15)]',
}

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`min-h-11 rounded-md px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    />
  )
}