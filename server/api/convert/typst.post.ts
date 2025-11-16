import { getPandocManager } from '../../utils/pandocManager'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { latex } = body

  if (!latex || typeof latex !== 'string') {
    throw createError({
      statusCode: 400,
      message: 'Missing or invalid latex parameter'
    })
  }

  try {
    const manager = getPandocManager()
    const typstCode = await manager.convert(latex, {
      timeout: 20000
    })

    return {
      success: true,
      output: typstCode
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : 'Pandoc conversion failed'
    })
  }
})

