import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'Permissions-Policy': 'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()',
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin'
}

// Enhanced rate limiting with IP tracking
const rateLimit = new Map<string, { count: number; timestamp: number; suspicious: boolean }>()
const RATE_LIMIT = 100 // requests per window
const RATE_WINDOW = 60000 // 1 minute in milliseconds
const SUSPICIOUS_THRESHOLD = 5 // number of rate limit violations before marking as suspicious

// Initialize Supabase client for logging
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

const logSecurityEvent = async (
  eventType: string,
  details: Record<string, unknown>,
  severity: 'low' | 'medium' | 'high'
) => {
  try {
    await supabase.from('security_logs').insert({
      event_type: eventType,
      details,
      severity,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Failed to log security event:', error)
  }
}

const validateRequest = (req: Request) => {
  const contentType = req.headers.get('content-type')
  const method = req.method
  
  // Validate allowed methods
  if (!['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'].includes(method)) {
    throw new Error('Method not allowed')
  }

  // Validate content-type for requests with body
  if (['POST', 'PUT'].includes(method) && contentType) {
    if (!contentType.includes('application/json')) {
      throw new Error('Invalid content type')
    }
  }

  return true
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Validate request
    validateRequest(req)

    // Get client IP and user agent
    const clientIP = req.headers.get('x-real-ip') || 
                    req.headers.get('x-forwarded-for') || 
                    'unknown'
    const userAgent = req.headers.get('user-agent') || 'unknown'
    
    // Check rate limit
    const now = Date.now()
    const clientRate = rateLimit.get(clientIP) || { 
      count: 0, 
      timestamp: now,
      suspicious: false 
    }
    
    // Reset counter if window has passed
    if (now - clientRate.timestamp > RATE_WINDOW) {
      clientRate.count = 0
      clientRate.timestamp = now
    }
    
    // Check if client is suspicious
    if (clientRate.suspicious) {
      await logSecurityEvent('blocked_suspicious_ip', { clientIP, userAgent }, 'high')
      return new Response(
        JSON.stringify({ error: 'Access denied' }),
        { 
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    // Increment counter
    clientRate.count++
    rateLimit.set(clientIP, clientRate)
    
    // Check if rate limit exceeded
    if (clientRate.count > RATE_LIMIT) {
      // Increment violation counter
      clientRate.suspicious = true
      rateLimit.set(clientIP, clientRate)
      
      await logSecurityEvent('rate_limit_exceeded', { 
        clientIP, 
        userAgent,
        requestCount: clientRate.count 
      }, 'medium')

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
    
    await logSecurityEvent('security_error', { 
      error: error.message,
      path: new URL(req.url).pathname
    }, 'high')

    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})