import { FastifyError } from 'fastify'
import { ZodError, type ZodType } from 'zod'

export function parseWithZod<T>(schema: ZodType<T>, input: unknown): T {
  const parsed = schema.safeParse(input)
  if (parsed.success) {
    return parsed.data
  }

  const message = parsed.error.issues
    .map((issue) => `${issue.path.join('.') || 'root'}: ${issue.message}`)
    .join('; ')

  const error = new Error(`请求参数校验失败: ${message}`) as FastifyError & {
    statusCode?: number
    cause?: ZodError
  }
  error.statusCode = 400
  error.cause = parsed.error
  throw error
}
