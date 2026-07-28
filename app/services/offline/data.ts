import type { Game, GameDetail, Genre, PaginatedResponse } from "../api/types"

import nesGames from "./data/nes-games.json"
import atari2600Games from "./data/atari-2600-games.json"
import segaMasterSystemGames from "./data/sega-master-system-games.json"
import segaGenesisGames from "./data/sega-genesis-games.json"
import gameBoyGames from "./data/game-boy-games.json"
import snesGames from "./data/snes-games.json"
import colecovisionGames from "./data/colecovision-games.json"
import turbografx16Games from "./data/turbografx-16-games.json"
import segaCdGames from "./data/sega-cd-games.json"

type GameResult = Record<string, unknown>
type YearFixture = { count: number; next: null; previous: null; results: GameResult[] }

const platformDataSets = [
  nesGames,
  atari2600Games,
  segaMasterSystemGames,
  segaGenesisGames,
  gameBoyGames,
  snesGames,
  colecovisionGames,
  turbografx16Games,
  segaCdGames,
] as Record<string, YearFixture>[]

// Merge all platform datasets, taking every 4th game per platform (~25%)
const gamesByYear: Record<string, YearFixture> = {}

for (const dataset of platformDataSets) {
  // Flatten all years for this platform, take every 4th, then bucket by year
  const allForPlatform: { year: string; game: GameResult }[] = []
  for (const [year, fixture] of Object.entries(dataset)) {
    for (const game of fixture.results) {
      allForPlatform.push({ year, game })
    }
  }
  const subset = allForPlatform.filter((_, i) => i % 4 === 0)
  for (const { year, game } of subset) {
    if (!gamesByYear[year]) {
      gamesByYear[year] = { count: 0, next: null, previous: null, results: [] }
    }
    gamesByYear[year].results.push(game)
    gamesByYear[year].count = gamesByYear[year].results.length
  }
}

const emptyPage: PaginatedResponse<Game> = { count: 0, next: null, previous: null, results: [] }

// All games flat, for lookups by ID
const allGames: GameResult[] = Object.values(gamesByYear).flatMap((y) => y.results)

function getPlaceholderImage(gameId: number): string {
  return `https://picsum.photos/seed/offline-${gameId % 5}/600/400`
}

function applyPlaceholderImage(game: GameResult): GameResult {
  const id = game.id as number
  return {
    ...game,
    background_image: getPlaceholderImage(id),
  }
}

export function getOfflineGamesByYear(year: string): PaginatedResponse<Game> {
  const page = gamesByYear[year]
  if (!page) return emptyPage

  return {
    count: page.count,
    next: null,
    previous: null,
    results: page.results.map((g) => applyPlaceholderImage(g)) as unknown as Game[],
  }
}

export function getOfflineGameById(id: number): GameDetail | undefined {
  const game = allGames.find((g) => g.id === id)
  if (!game) return undefined

  const withImage = applyPlaceholderImage(game)
  return {
    ...withImage,
    description: "",
    description_raw: "",
    name_original: withImage.name,
    background_image_additional: null,
    website: "",
    developers: [],
    publishers: [],
    screenshots_count: 0,
    movies_count: 0,
    creators_count: 0,
    achievements_count: 0,
    parent_achievements_count: "0",
    reddit_url: "",
    reddit_name: "",
    reddit_description: "",
    reddit_logo: "",
    reddit_count: 0,
    twitch_count: "0",
    youtube_count: "0",
    alternative_names: [],
    metacritic_url: "",
    metacritic_platforms: [],
    parents_count: 0,
    additions_count: 0,
    game_series_count: 0,
  } as unknown as GameDetail
}

// Derive genres from included games
function deriveGenres(): Genre[] {
  const genreMap = new Map<number, Genre>()
  for (const game of allGames) {
    const genres = game.genres as { id: number; name: string; slug: string }[] | undefined
    if (!genres) continue
    for (const g of genres) {
      const existing = genreMap.get(g.id)
      if (existing) {
        existing.games_count++
      } else {
        genreMap.set(g.id, {
          id: g.id,
          name: g.name,
          slug: g.slug,
          games_count: 1,
          image_background: getPlaceholderImage(g.id),
        })
      }
    }
  }
  return Array.from(genreMap.values())
}

export const offlineGenres = deriveGenres()
