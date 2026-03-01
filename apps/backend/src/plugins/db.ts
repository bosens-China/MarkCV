import fp from 'fastify-plugin'
import postgres from 'postgres'
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import * as schema from '../db/schema'
import { getEnv } from '../lib/env'

export default fp(async (fastify) => {
  const env = getEnv()
  if (!env.DATABASE_URL) {
    fastify.log.warn('未配置 DATABASE_URL，数据库功能不可用')
    fastify.decorate(
      'db',
      new Proxy({} as PostgresJsDatabase<typeof schema>, {
        get() {
          throw new Error('数据库未初始化，请先配置 DATABASE_URL')
        },
      }),
    )
    return
  }

  const sql = postgres(env.DATABASE_URL, {
    max: 10,
    idle_timeout: 20,
    prepare: false,
  })

  const db = drizzle(sql, { schema })
  fastify.decorate('db', db)

  fastify.addHook('onClose', async () => {
    await sql.end()
  })
})

declare module 'fastify' {
  interface FastifyInstance {
    db: PostgresJsDatabase<typeof schema>
  }
}
