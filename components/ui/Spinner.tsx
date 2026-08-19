export function Spinner({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-block h-4 w-4 animate-spin rounded-full border-2 border-[#30363d] border-t-[#58a6ff] ${className}`}
      role="status"
      aria-label="Loading"
    />
  )
}