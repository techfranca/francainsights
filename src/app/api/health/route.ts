import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      database: 'unknown',
      app: 'ok',
    },
  }

  try {
    const supabase = createAdminClient()
    const { error } = await supabase.from('clients').select('id').limit(1)
    
    health.services.database = error ? 'error' : 'ok'
  } catch {
    health.services.database = 'error'
  }

  const allOk = Object.values(health.services).every((s) => s === 'ok')
  health.status = allOk ? 'ok' : 'degraded'

  return NextResponse.json(health, {
    status: allOk ? 200 : 503,
  })
}
