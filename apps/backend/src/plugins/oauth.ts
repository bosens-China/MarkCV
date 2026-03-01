import fp from 'fastify-plugin'
import oauthPlugin from '@fastify/oauth2'
import { getEnv } from '../lib/env'

export default fp(async (fastify) => {
  const env = getEnv()

  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
    fastify.log.warn('未配置 GitHub OAuth 环境变量，OAuth 路由将不可用')
    return
  }

  await fastify.register(oauthPlugin, {
    name: 'githubOAuth2',
    scope: ['read:user', 'user:email'],
    credentials: {
      client: {
        id: env.GITHUB_CLIENT_ID,
        secret: env.GITHUB_CLIENT_SECRET,
      },
      auth: oauthPlugin.GITHUB_CONFIGURATION,
    },
    startRedirectPath: '/api/v1/auth/github/login',
    callbackUri: env.GITHUB_CALLBACK_URL,
  })
})

declare module 'fastify' {
  interface FastifyInstance {
    githubOAuth2?: {
      getAccessTokenFromAuthorizationCodeFlow: (
        request: import('fastify').FastifyRequest,
      ) => Promise<{ token: { access_token: string } }>
    }
  }
}
