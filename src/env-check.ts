const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY'
] as const

export function checkEnvVars() {
  const missingVars = requiredEnvVars.filter(varName => !import.meta.env[varName])
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`)
  }
  
  // Log environment status (without exposing sensitive values)
  console.log('Environment check passed:', requiredEnvVars.map(varName => ({
    name: varName,
    exists: Boolean(import.meta.env[varName])
  })))
} 