export type ModelConfig = {
  modelName: string
  env_config?: {
    remoteHost: string
    remotePathTemplate: string
  }
  base?: string
}

export enum OCRAction {
  Init = 'init',
  Predict = 'predict'
}

export type OCRInitEvent = {
  action: OCRAction.Init
  model_config: ModelConfig
}

export type OCRPredictEvent = {
  action: OCRAction.Predict
  image: File
  key: string
}

export type OCRInputEvent
  = | OCRInitEvent
    | OCRPredictEvent

export type OCRResult = string
