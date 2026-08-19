import { NextRequest, NextResponse } from 'next/server'
import { createTemplate, listTemplates } from '@/lib/store'
import { detectVariables } from '@/lib/utils'
import { requireAuth, unauthorized } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  if (!requireAuth(req)) return unauthorized()
  return NextResponse.json(listTemplates())
}

export async function POST(req: NextRequest) {
  if (!requireAuth(req)) return unauthorized()
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  const name = typeof body?.name === 'string' ? body.name : ''
  const prompt = typeof body?.prompt === 'string' ? body.prompt : ''
  if (!name || !prompt) {
    return NextResponse.json({ error: 'name and prompt are required' }, { status: 400 })
  }
  const template = createTemplate({ name, prompt, variables: detectVariables(prompt) })
  return NextResponse.json(template, { status: 201 })
}