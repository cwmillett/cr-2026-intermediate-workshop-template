import type { PaginatedResponse, Game, Genre, Tag } from "../api/types"
import { getOfflineGamesByYear, getOfflineGameById, offlineGenres } from "./data"

const emptyPage: PaginatedResponse<never> = { count: 0, next: null, previous: null, results: [] }

export function offlineFetch<T>(path: string, params?: Record<string, string>): T {
  // /games/:id/screenshots, /games/:id/movies, /games/:id/game-series
  const subResourceMatch = path.match(/^\/games\/(\d+)\/(screenshots|movies|game-series)$/)
  if (subResourceMatch) {
    return emptyPage as T
  }

  // /games/:id
  const gameDetailMatch = path.match(/^\/games\/(\d+)$/)
  if (gameDetailMatch) {
    const id = Number(gameDetailMatch[1])
    const game = getOfflineGameById(id)
    if (!game) throw new Error(`Offline API: game ${id} not found`)
    return game as T
  }

  // /games (with dates param to extract year)
  if (path === "/games") {
    const dates = params?.dates
    if (dates) {
      // dates format: "YYYY-01-01,YYYY-12-31"
      const year = dates.split("-")[0]
      return getOfflineGamesByYear(year) as T
    }
    // No dates param — return all games
    return emptyPage as T
  }

  // /genres
  if (path === "/genres") {
    return {
      count: offlineGenres.length,
      next: null,
      previous: null,
      results: offlineGenres,
    } as PaginatedResponse<Genre> as T
  }

  // /tags
  if (path === "/tags") {
    return emptyPage as PaginatedResponse<Tag> as T
  }

  throw new Error(`Offline API: unhandled path ${path}`)
}
