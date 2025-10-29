import { ModelList } from './constants'

export type Region = 'cn' | 'global'

export const useSource = async () => {
  // check if cache is available
  const model_config = await checkCache()
  if (model_config) {
    console.log('model cached, no need to load from remote')
    return model_config
  }
  let source = ''
  try {
    source = RemoteSource['global'].base! + ModelList[0]
    const response = await fetch(source)
    if (response.ok) {
      console.log(`model loading source set to ${source}`)
      return RemoteSource['global']
    }
  } catch (error) {
    console.warn('Global source failed:', error)
  }

  try {
    source = RemoteSource['cn'].base! + ModelList[0]
    const response = await fetch(source)
    if (response.ok) {
      console.log(`model loading source set to ${source}`)
      return RemoteSource['cn']
    }
  } catch (error) {
    console.warn('CN source failed:', error)
  }

  throw new Error('No remote source available, please report this issue to the developer.')
}
