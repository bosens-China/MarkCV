import { sql } from 'drizzle-orm'
import { FastifyPluginAsync } from 'fastify'

const healthRoute: FastifyPluginAsync = async (fastify) => {
  fastify.get('/health', async () => {
    await fastify.db.execute(sql`select 1`)
    return {
      ok: true,
      service: 'mark-cv-api',
      now: new Date().toISOString(),
    }
  })
}

export default healthRoute
