import { eq } from 'drizzle-orm'
import { FastifyPluginAsync } from 'fastify'
import { users } from '../../db/schema'
import { getEnv } from '../../lib/env'

interface GitHubUserProfile {
  id: number
  login: string
  name: string | null
  avatar_url: string | null
}

interface GitHubEmail {
  email: string
  primary: boolean
  verified: boolean
}

const authRoutes: FastifyPluginAsync = async (fastify) => {
  const env = getEnv()

  // GitHub OAuth 回调处理
  fastify.get('/github/callback', async (request, reply) => {
    if (!fastify.githubOAuth2) {
      return reply.status(503).send({ error: 'GitHub OAuth 未配置' })
    }

    const tokenResult =
      await fastify.githubOAuth2.getAccessTokenFromAuthorizationCodeFlow(request)
    const accessToken = tokenResult.token.access_token

    const profileResp = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'mark-cv-api',
      },
    })

    if (!profileResp.ok) {
      return reply.status(502).send({ error: '获取 GitHub 用户信息失败' })
    }

    const profile = (await profileResp.json()) as GitHubUserProfile

    let primaryEmail: string | null = null
    const emailResp = await fetch('https://api.github.com/user/emails', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'mark-cv-api',
      },
    })
    if (emailResp.ok) {
      const emails = (await emailResp.json()) as GitHubEmail[]
      const primary = emails.find((item) => item.primary && item.verified)
      primaryEmail = primary?.email ?? null
    }

    const githubId = String(profile.id)
    const [existing] = await fastify.db
      .select()
      .from(users)
      .where(eq(users.githubId, githubId))
      .limit(1)

    const [currentUser] = existing
      ? await fastify.db
          .update(users)
          .set({
            login: profile.login,
            name: profile.name,
            avatarUrl: profile.avatar_url,
            email: primaryEmail,
            updatedAt: new Date(),
          })
          .where(eq(users.id, existing.id))
          .returning()
      : await fastify.db
          .insert(users)
          .values({
            githubId,
            login: profile.login,
            name: profile.name,
            avatarUrl: profile.avatar_url,
            email: primaryEmail,
          })
          .returning()

    reply.setCookie('markcv_uid', currentUser.id, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30,
    })

    return reply.redirect(`${env.FRONTEND_URL}/`)
  })

  // 获取当前登录用户信息
  fastify.get('/me', async (request, reply) => {
    const userId = request.cookies.markcv_uid
    if (!userId) {
      return reply.status(401).send({ error: '未登录' })
    }

    const [currentUser] = await fastify.db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    if (!currentUser) {
      return reply.status(401).send({ error: '登录状态无效' })
    }

    return {
      id: currentUser.id,
      githubId: currentUser.githubId,
      login: currentUser.login,
      name: currentUser.name,
      avatarUrl: currentUser.avatarUrl,
      email: currentUser.email,
    }
  })

  // 登出
  fastify.post('/logout', async (_request, reply) => {
    reply.clearCookie('markcv_uid', { path: '/' })
    return { ok: true }
  })
}

export default authRoutes
