import fp from 'fastify-plugin'
import cookie from '@fastify/cookie'
import { getEnv } from '../lib/env'

export default fp(async (fastify) => {
  const env = getEnv()
  await fastify.register(cookie, {
    secret: env.COOKIE_SECRET,
    hook: 'onRequest',
  })
})
