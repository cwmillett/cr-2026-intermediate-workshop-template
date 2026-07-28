const BASE_URL = "https://cr-2026-retro-games-api.expo.app/api"

export async function rawgFetch<T>(path: string, params?: Record<string, string>): Promise<T> {
  if (process.env.EXPO_PUBLIC_OFFLINE_API === "true") {
    const { offlineFetch } = require("../offline/offlineFetch")
    return offlineFetch<T>(path, params)
  }

  const url = new URL(`${BASE_URL}${path}`)
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v)
    }
  }
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}
