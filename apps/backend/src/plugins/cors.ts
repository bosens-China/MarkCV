import fp from 'fastify-plugin'
import cors from '@fastify/cors'
import { getEnv } from '../lib/env'

export default fp(async (fastify) => {
  const env = getEnv()
  await fastify.register(cors, {
    origin: env.FRONTEND_URL,
    credentials: true,
  })
})
