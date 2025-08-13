import { defineStore } from "pinia"
import { ref, computed } from "vue"

export const useMediaStore = defineStore("media", () => {
  const movies = ref([
    {
      id: 1,
      title: "The Matrix",
      genre: "Sci-Fi",
      year: 1999,
      duration: "2h 16m",
      rating: 8.7,
      thumbnail: "/matrix-movie-poster.png",
      description:
        "A computer programmer discovers that reality as he knows it is actually a simulation controlled by machines, and he must join a rebellion to free humanity.",
      isFavorite: false,
    },
    {
      id: 2,
      title: "Inception",
      genre: "Thriller",
      year: 2010,
      duration: "2h 28m",
      rating: 8.8,
      thumbnail: "/inception-movie-poster.png",
      description:
        "A skilled thief who enters people's dreams to steal secrets is given the inverse task of planting an idea deep within a target's subconscious.",
      isFavorite: true,
    },
    {
      id: 3,
      title: "Interstellar",
      genre: "Sci-Fi",
      year: 2014,
      duration: "2h 49m",
      rating: 8.6,
      thumbnail: "/interstellar-inspired-poster.png",
      description:
        "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival as Earth faces environmental collapse.",
      isFavorite: false,
    },
    {
      id: 4,
      title: "Blade Runner 2049",
      genre: "Sci-Fi",
      year: 2017,
      duration: "2h 44m",
      rating: 8.0,
      thumbnail: "/blade-runner-2049-poster.png",
      description:
        "A young blade runner discovers a long-buried secret that leads him to track down former blade runner Rick Deckard.",
      isFavorite: false,
    },
    {
      id: 5,
      title: "Dune",
      genre: "Sci-Fi",
      year: 2021,
      duration: "2h 35m",
      rating: 8.1,
      thumbnail: "/inspired-by-dune-poster.png",
      description:
        "Paul Atreides leads nomadic tribes in a revolt against the galactic emperor and his father's evil nemesis.",
      isFavorite: true,
    },
    {
      id: 6,
      title: "Mad Max: Fury Road",
      genre: "Action",
      year: 2015,
      duration: "2h 0m",
      rating: 8.1,
      thumbnail: "/mad-max-inspired-poster.png",
      description:
        "In a post-apocalyptic wasteland, Max teams up with a mysterious woman to flee from a tyrannical warlord.",
      isFavorite: false,
    },
  ])

  const music = ref([
    {
      id: 1,
      title: "Bohemian Rhapsody",
      artist: "Queen",
      album: "A Night at the Opera",
      duration: "5:55",
      thumbnail: "/queen-album-cover.png",
      isFavorite: true,
    },
    {
      id: 2,
      title: "Hotel California",
      artist: "Eagles",
      album: "Hotel California",
      duration: "6:30",
      thumbnail: "/generic-band-album-cover.png",
      isFavorite: false,
    },
    {
      id: 3,
      title: "Stairway to Heaven",
      artist: "Led Zeppelin",
      album: "Led Zeppelin IV",
      duration: "8:02",
      thumbnail: "/generic-rock-album.png",
      isFavorite: true,
    },
    {
      id: 4,
      title: "Imagine",
      artist: "John Lennon",
      album: "Imagine",
      duration: "3:07",
      thumbnail: "/john-lennon-imagine-album-cover.png",
      isFavorite: false,
    },
    {
      id: 5,
      title: "Sweet Child O' Mine",
      artist: "Guns N' Roses",
      album: "Appetite for Destruction",
      duration: "5:03",
      thumbnail: "/guns-n-roses-appetite-for-destruction.png",
      isFavorite: true,
    },
    {
      id: 6,
      title: "Billie Jean",
      artist: "Michael Jackson",
      album: "Thriller",
      duration: "4:54",
      thumbnail: "/thriller-album-cover.png",
      isFavorite: false,
    },
    {
      id: 7,
      title: "Smells Like Teen Spirit",
      artist: "Nirvana",
      album: "Nevermind",
      duration: "5:01",
      thumbnail: "/generic-baby-underwater.png",
      isFavorite: true,
    },
    {
      id: 8,
      title: "Purple Haze",
      artist: "Jimi Hendrix",
      album: "Are You Experienced",
      duration: "2:50",
      thumbnail: "/are-you-experienced-album.png",
      isFavorite: false,
    },
  ])

  const searchQuery = ref("")
  const searchHistory = ref([])
  const searchSuggestions = ref([])
  const currentlyPlaying = ref(null)

  // Filter and sort state
  const movieFilters = ref({
    genre: "all",
    year: "all",
    rating: "all",
    sortBy: "title",
    sortOrder: "asc",
  })

  const musicFilters = ref({
    artist: "all",
    album: "all",
    sortBy: "title",
    sortOrder: "asc",
  })

  const movieGenres = computed(() => {
    const genres = [...new Set(movies.value.map((movie) => movie.genre))]
    return ["all", ...genres]
  })

  const movieYears = computed(() => {
    const years = [...new Set(movies.value.map((movie) => movie.year))].sort((a, b) => b - a)
    return ["all", ...years]
  })

  const musicArtists = computed(() => {
    const artists = [...new Set(music.value.map((track) => track.artist))]
    return ["all", ...artists]
  })

  const musicAlbums = computed(() => {
    const albums = [...new Set(music.value.map((track) => track.album))]
    return ["all", ...albums]
  })

  const filteredAndSortedMovies = computed(() => {
    let filtered = movies.value

    // Apply search filter
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(
        (movie) =>
          movie.title.toLowerCase().includes(query) ||
          movie.genre.toLowerCase().includes(query) ||
          movie.description.toLowerCase().includes(query),
      )
    }

    // Apply genre filter
    if (movieFilters.value.genre !== "all") {
      filtered = filtered.filter((movie) => movie.genre === movieFilters.value.genre)
    }

    // Apply year filter
    if (movieFilters.value.year !== "all") {
      filtered = filtered.filter((movie) => movie.year === movieFilters.value.year)
    }

    // Apply rating filter
    if (movieFilters.value.rating !== "all") {
      const rating = Number.parseFloat(movieFilters.value.rating)
      filtered = filtered.filter((movie) => movie.rating >= rating)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[movieFilters.value.sortBy]
      let bValue = b[movieFilters.value.sortBy]

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (movieFilters.value.sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

    return filtered
  })

  const filteredAndSortedMusic = computed(() => {
    let filtered = music.value

    // Apply search filter
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(
        (track) =>
          track.title.toLowerCase().includes(query) ||
          track.artist.toLowerCase().includes(query) ||
          track.album.toLowerCase().includes(query),
      )
    }

    // Apply artist filter
    if (musicFilters.value.artist !== "all") {
      filtered = filtered.filter((track) => track.artist === musicFilters.value.artist)
    }

    // Apply album filter
    if (musicFilters.value.album !== "all") {
      filtered = filtered.filter((track) => track.album === musicFilters.value.album)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[musicFilters.value.sortBy]
      let bValue = b[musicFilters.value.sortBy]

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (musicFilters.value.sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

    return filtered
  })

  const setSearchQuery = (query) => {
    searchQuery.value = query

    // Add to search history if not empty and not already in history
    if (query.trim() && !searchHistory.value.includes(query.trim())) {
      searchHistory.value.unshift(query.trim())
      // Keep only last 10 searches
      if (searchHistory.value.length > 10) {
        searchHistory.value = searchHistory.value.slice(0, 10)
      }
    }

    // Generate suggestions
    generateSearchSuggestions(query)
  }

  const generateSearchSuggestions = (query) => {
    if (!query.trim()) {
      searchSuggestions.value = []
      return
    }

    const suggestions = new Set()
    const queryLower = query.toLowerCase()

    // Add movie suggestions
    movies.value.forEach((movie) => {
      if (movie.title.toLowerCase().includes(queryLower)) {
        suggestions.add(movie.title)
      }
      if (movie.genre.toLowerCase().includes(queryLower)) {
        suggestions.add(movie.genre)
      }
    })

    // Add music suggestions
    music.value.forEach((track) => {
      if (track.title.toLowerCase().includes(queryLower)) {
        suggestions.add(track.title)
      }
      if (track.artist.toLowerCase().includes(queryLower)) {
        suggestions.add(track.artist)
      }
      if (track.album.toLowerCase().includes(queryLower)) {
        suggestions.add(track.album)
      }
    })

    searchSuggestions.value = Array.from(suggestions).slice(0, 8)
  }

  const clearSearchHistory = () => {
    searchHistory.value = []
  }

  const setMovieFilters = (filters) => {
    movieFilters.value = { ...movieFilters.value, ...filters }
  }

  const setMusicFilters = (filters) => {
    musicFilters.value = { ...musicFilters.value, ...filters }
  }

  const resetMovieFilters = () => {
    movieFilters.value = {
      genre: "all",
      year: "all",
      rating: "all",
      sortBy: "title",
      sortOrder: "asc",
    }
  }

  const resetMusicFilters = () => {
    musicFilters.value = {
      artist: "all",
      album: "all",
      sortBy: "title",
      sortOrder: "asc",
    }
  }

  const favoriteMovies = computed(() => {
    return movies.value.filter((movie) => movie.isFavorite)
  })

  const favoriteMusic = computed(() => {
    return music.value.filter((track) => track.isFavorite)
  })

  const playMedia = (media) => {
    currentlyPlaying.value = media
  }

  const stopMedia = () => {
    currentlyPlaying.value = null
  }

  const toggleFavorite = (mediaId, type) => {
    if (type === "movie") {
      const movie = movies.value.find((m) => m.id === mediaId)
      if (movie) {
        movie.isFavorite = !movie.isFavorite
      }
    } else if (type === "music") {
      const track = music.value.find((t) => t.id === mediaId)
      if (track) {
        track.isFavorite = !track.isFavorite
      }
    }
  }

  const addToPlaylist = (mediaId, playlistId) => {
    // Implementation for adding media to playlists
    console.log(`Adding media ${mediaId} to playlist ${playlistId}`)
  }

  const removeFromPlaylist = (mediaId, playlistId) => {
    // Implementation for removing media from playlists
    console.log(`Removing media ${mediaId} from playlist ${playlistId}`)
  }

  const getRecentlyAdded = (limit = 6) => {
    const allMedia = [...movies.value, ...music.value]
    return allMedia.slice(-limit).reverse()
  }

  const getRecommendations = (limit = 6) => {
    // Simple recommendation based on favorites
    const favoriteGenres = favoriteMovies.value.map((m) => m.genre)
    const favoriteArtists = favoriteMusic.value.map((m) => m.artist)

    const recommendedMovies = movies.value.filter((movie) => favoriteGenres.includes(movie.genre) && !movie.isFavorite)

    const recommendedMusic = music.value.filter((track) => favoriteArtists.includes(track.artist) && !track.isFavorite)

    return [...recommendedMovies, ...recommendedMusic].slice(0, limit)
  }

  return {
    movies,
    music,
    searchQuery,
    searchHistory,
    searchSuggestions,
    currentlyPlaying,
    movieFilters,
    musicFilters,
    movieGenres,
    movieYears,
    musicArtists,
    musicAlbums,
    filteredAndSortedMovies,
    filteredAndSortedMusic,
    favoriteMovies,
    favoriteMusic,
    setSearchQuery,
    generateSearchSuggestions,
    clearSearchHistory,
    setMovieFilters,
    setMusicFilters,
    resetMovieFilters,
    resetMusicFilters,
    playMedia,
    stopMedia,
    toggleFavorite,
    addToPlaylist,
    removeFromPlaylist,
    getRecentlyAdded,
    getRecommendations,
  }
})
