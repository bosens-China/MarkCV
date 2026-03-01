import { and, desc, eq } from 'drizzle-orm'
import { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { resumes, resumeVersions } from '../../db/schema'
import { parseWithZod } from '../../utils/validate'

const createResumeBodySchema = z.object({
  title: z.string().trim().min(1).max(120),
  content: z.string().default(''),
  themeColor: z.string().default('#111827'),
  pageMargin: z.number().int().min(5).max(50).default(20),
  lineHeight: z.number().min(1).max(3).default(1.5),
  currentFont: z.string().default('font-sans'),
  customCss: z.string().default(''),
})

const updateResumeBodySchema = createResumeBodySchema.partial()

const idParamSchema = z.object({
  id: z.string().uuid(),
})

const versionIdParamSchema = z.object({
  id: z.string().uuid(),
  versionId: z.string().uuid(),
})

const createVersionBodySchema = z.object({
  title: z.string().trim().min(1).max(120).optional(),
  content: z.string().optional(),
})

const resumeRoutes: FastifyPluginAsync = async (fastify) => {
  const resolveUserId = (request: FastifyRequest, reply: FastifyReply) => {
    const rawUserId = request.cookies.markcv_uid
    if (!rawUserId) {
      reply.unauthorized('未登录')
      return null
    }

    const parsed = z.string().uuid().safeParse(rawUserId)
    if (!parsed.success) {
      reply.unauthorized('登录状态无效')
      return null
    }

    return parsed.data
  }

  fastify.get('/', async (request, reply) => {
    const userId = resolveUserId(request, reply)
    if (!userId) return

    const result = await fastify.db
      .select()
      .from(resumes)
      .where(eq(resumes.userId, userId))
      .orderBy(desc(resumes.updatedAt))

    return { items: result }
  })

  fastify.post('/', async (request, reply) => {
    const userId = resolveUserId(request, reply)
    if (!userId) return
    const body = parseWithZod(createResumeBodySchema, request.body)

    const [created] = await fastify.db
      .insert(resumes)
      .values({
        userId,
        title: body.title,
        content: body.content,
        themeColor: body.themeColor,
        pageMargin: body.pageMargin,
        lineHeight: body.lineHeight,
        currentFont: body.currentFont,
        customCss: body.customCss,
      })
      .returning()

    return reply.code(201).send(created)
  })

  fastify.get('/:id', async (request, reply) => {
    const userId = resolveUserId(request, reply)
    if (!userId) return
    const params = parseWithZod(idParamSchema, request.params)

    const [item] = await fastify.db
      .select()
      .from(resumes)
      .where(and(eq(resumes.id, params.id), eq(resumes.userId, userId)))
      .limit(1)

    if (!item) {
      return reply.notFound('简历不存在')
    }

    return item
  })

  fastify.patch('/:id', async (request, reply) => {
    const userId = resolveUserId(request, reply)
    if (!userId) return
    const params = parseWithZod(idParamSchema, request.params)
    const body = parseWithZod(updateResumeBodySchema, request.body)

    const [updated] = await fastify.db
      .update(resumes)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(and(eq(resumes.id, params.id), eq(resumes.userId, userId)))
      .returning()

    if (!updated) {
      return reply.notFound('简历不存在')
    }

    return updated
  })

  fastify.delete('/:id', async (request, reply) => {
    const userId = resolveUserId(request, reply)
    if (!userId) return
    const params = parseWithZod(idParamSchema, request.params)

    const [deleted] = await fastify.db
      .delete(resumes)
      .where(and(eq(resumes.id, params.id), eq(resumes.userId, userId)))
      .returning({ id: resumes.id })

    if (!deleted) {
      return reply.notFound('简历不存在')
    }

    return reply.code(204).send()
  })

  fastify.get('/:id/versions', async (request, reply) => {
    const userId = resolveUserId(request, reply)
    if (!userId) return
    const params = parseWithZod(idParamSchema, request.params)

    const [target] = await fastify.db
      .select({ id: resumes.id })
      .from(resumes)
      .where(and(eq(resumes.id, params.id), eq(resumes.userId, userId)))
      .limit(1)

    if (!target) {
      return reply.notFound('简历不存在')
    }

    const versions = await fastify.db
      .select()
      .from(resumeVersions)
      .where(eq(resumeVersions.resumeId, params.id))
      .orderBy(desc(resumeVersions.createdAt))

    return { items: versions }
  })

  fastify.post('/:id/versions', async (request, reply) => {
    const userId = resolveUserId(request, reply)
    if (!userId) return
    const params = parseWithZod(idParamSchema, request.params)
    const body = parseWithZod(createVersionBodySchema, request.body)

    const [target] = await fastify.db
      .select()
      .from(resumes)
      .where(and(eq(resumes.id, params.id), eq(resumes.userId, userId)))
      .limit(1)

    if (!target) {
      return reply.notFound('简历不存在')
    }

    const [created] = await fastify.db
      .insert(resumeVersions)
      .values({
        resumeId: params.id,
        title: body.title ?? target.title,
        content: body.content ?? target.content,
      })
      .returning()

    return reply.code(201).send(created)
  })

  fastify.post('/:id/restore/:versionId', async (request, reply) => {
    const userId = resolveUserId(request, reply)
    if (!userId) return
    const params = parseWithZod(versionIdParamSchema, request.params)

    const [target] = await fastify.db
      .select()
      .from(resumes)
      .where(and(eq(resumes.id, params.id), eq(resumes.userId, userId)))
      .limit(1)

    if (!target) {
      return reply.notFound('简历不存在')
    }

    const [version] = await fastify.db
      .select()
      .from(resumeVersions)
      .where(
        and(
          eq(resumeVersions.id, params.versionId),
          eq(resumeVersions.resumeId, params.id),
        ),
      )
      .limit(1)

    if (!version) {
      return reply.notFound('版本不存在')
    }

    const [updated] = await fastify.db
      .update(resumes)
      .set({
        title: version.title,
        content: version.content,
        updatedAt: new Date(),
      })
      .where(eq(resumes.id, params.id))
      .returning()

    return updated
  })
}

export default resumeRoutes
