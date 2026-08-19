import { HTMLAttributes } from 'react'

export function Card({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-lg border border-[#30363d] bg-[#161b22] shadow-[0_2px_6px_rgba(0,0,0,0.3)] ${className}`}
      {...props}
    />
  )
}