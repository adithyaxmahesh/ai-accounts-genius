import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Permissions-Policy': 'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()'
}

// Simple in-memory rate limiting
const rateLimit = new Map<string, { count: number; timestamp: number }>()
const RATE_LIMIT = 100 // requests per window
const RATE_WINDOW = 60000 // 1 minute in milliseconds

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get client IP (in production, you'd want to use X-Forwarded-For or similar)
    const clientIP = req.headers.get('x-real-ip') || 'unknown'
    
    // Check rate limit
    const now = Date.now()
    const clientRate = rateLimit.get(clientIP) || { count: 0, timestamp: now }
    
    // Reset counter if window has passed
    if (now - clientRate.timestamp > RATE_WINDOW) {
      clientRate.count = 0
      clientRate.timestamp = now
    }
    
    // Increment counter
    clientRate.count++
    rateLimit.set(clientIP, clientRate)
    
    // Check if rate limit exceeded
    if (clientRate.count > RATE_LIMIT) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { 
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Add security headers to all responses
    const response = await fetch(req.url, {
      method: req.method,
      headers: req.headers,
      body: req.body
    })

    // Clone the response to add security headers
    const secureResponse = new Response(response.body, response)
    Object.entries(corsHeaders).forEach(([key, value]) => {
      secureResponse.headers.set(key, value)
    })

    return secureResponse

  } catch (error) {
    console.error('Security middleware error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})