import { NextResponse } from 'next/server'
import { getRun } from '@/lib/store'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const run = getRun(id)
  if (!run) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(run)
}