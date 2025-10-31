import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Simple localStorage cache with TTL
export function getCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const { value, expiresAt } = JSON.parse(raw) as { value: T; expiresAt?: number }
    if (expiresAt && Date.now() > expiresAt) {
      localStorage.removeItem(key)
      return null
    }
    return value
  } catch {
    return null
  }
}

export function setCache<T>(key: string, value: T, ttlMs = 60_000) {
  try {
    const payload = JSON.stringify({ value, expiresAt: Date.now() + ttlMs })
    localStorage.setItem(key, payload)
  } catch {}
}

// Request deduplication: prevents multiple simultaneous requests for the same resource
const pendingRequests = new Map<string, Promise<any>>()

export async function dedupeRequest<T>(
  key: string,
  fetcher: () => Promise<T>
): Promise<T> {
  // If a request is already in progress, return the same promise
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key)!
  }

  // Create new request and store it
  const promise = fetcher().finally(() => {
    // Clean up after request completes
    pendingRequests.delete(key)
  })

  pendingRequests.set(key, promise)
  return promise
}