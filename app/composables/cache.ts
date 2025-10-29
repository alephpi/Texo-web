import { RemoteSource, ModelList } from './constants'

async function listCaches() {
  // Open the cache
  const cache = await caches.open('transformers-cache')

  // Get all the cached requests (keys)
  const requests = await cache.keys()

  // Print their URLs
  return Array.from(requests.map(request => request.url))
}

export async function checkCache() {
  const cached_files = await listCaches()
  for (const config of Object.values(RemoteSource)) {
    const allIncluded = ModelList
      .map(file => config.base! + file)
      .every(url => cached_files.includes(url))
    if (allIncluded) return config
  }
  return null
}
