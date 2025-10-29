import type { ModelConfig } from './types'

export const RemoteSource: Record<Region, ModelConfig> = {
  global: {
    modelName: 'alephpi/FormulaNet',
    env_config: {
      remoteHost: 'https://huggingface.co/',
      remotePathTemplate: '{model}/resolve/{revision}'
    },
    base: 'https://huggingface.co/alephpi/FormulaNet/resolve/main/'
  },
  cn: {
    modelName: 'alephpi/FormulaNet',
    env_config: {
      remoteHost: 'https://gh.llkk.cc/https://raw.githubusercontent.com/',
      remotePathTemplate: 'alephpi/Texo-web/refs/heads/master/models/model/'
    },
    base: 'https://gh.llkk.cc/https://raw.githubusercontent.com/alephpi/Texo-web/refs/heads/master/models/model/'
  }
}

export const ModelList = ['config.json', 'generation_config.json', 'onnx/encoder_model.onnx', 'onnx/decoder_model_merged.onnx', 'tokenizer.json', 'tokenizer_config.json']
