import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    service: 'ff-hr',
    status: 'healthy',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    port: 6860,
    description: 'Furfield Human Resources Microservice'
  })
}