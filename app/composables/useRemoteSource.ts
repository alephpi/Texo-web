import type { ModelConfig } from './types'

export type Region = 'cn' | 'global'

const RemoteSource: Record<Region, ModelConfig> = {
  global: {
    modelName: 'alephpi/FormulaNet',
    env_config: {
      remoteHost: 'https://huggingface.co/',
      remotePathTemplate: '{model}/resolve/{revision}'
    },
    test_link: 'https://huggingface.co/alephpi/FormulaNet/resolve/main/config.json'
  },
  cn: {
    modelName: 'alephpi/FormulaNet',
    env_config: {
      remoteHost: 'https://gh.llkk.cc/https://github.com/',
      remotePathTemplate: 'alephpi/Texo-web/raw/refs/heads/master/models/models'
    },
    test_link: 'https://gh.llkk.cc/https://github.com/alephpi/Texo-web/raw/refs/heads/master/models/model/config.json'
  }
}

export const useSource = async () => {
  let source = ''
  try {
    source = RemoteSource['global'].test_link!
    const response = await fetch(source)
    if (response.ok) {
      console.log(`model loading source set to ${source}`)
      return RemoteSource['global']
    }
  } catch (error) {
    console.warn('Global source failed:', error)
  }

  try {
    source = RemoteSource['cn'].test_link!
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
