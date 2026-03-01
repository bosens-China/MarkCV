import 'dotenv/config';
import Fastify from 'fastify';
import app, { options } from './app';
import { getEnv } from './lib/env';

const env = getEnv();

// 修复 Windows 中文主机名乱码问题
const getCleanHostname = () => {
  const hostname =
    process.env.COMPUTERNAME || process.env.HOSTNAME || 'localhost';
  // 如果是中文环境，使用简单的标识替代
  try {
    // 检查是否包含非 ASCII 字符
    if (/[^\x00-\x7F]/.test(hostname)) {
      return 'local-machine';
    }
    return hostname;
  } catch {
    return 'local-machine';
  }
};

const fastify = Fastify({
  ...options,
  logger: {
    level: env.NODE_ENV === 'development' ? 'debug' : 'info',
    // 自定义日志输出，避免 hostname 乱码
    formatters: {
      level: (label) => ({ level: label }),
      bindings: () => ({
        pid: process.pid,
        hostname: getCleanHostname(),
      }),
    },
  },
});

void fastify.register(app, options);

const start = async () => {
  try {
    await fastify.listen({
      port: env.PORT,
      host: '0.0.0.0',
    });
    fastify.log.info(
      {
        env: env.NODE_ENV,
        port: env.PORT,
      },
      'Backend server started',
    );
  } catch (error) {
    fastify.log.error({ err: error }, 'Failed to start backend server');
    process.exit(1);
  }
};

const shutdown = async (signal: string) => {
  fastify.log.info({ signal }, 'Shutting down backend server');
  try {
    await fastify.close();
    fastify.log.info('Backend server closed');
    process.exit(0);
  } catch (error) {
    fastify.log.error({ err: error }, 'Failed to close backend server');
    process.exit(1);
  }
};

process.on('SIGINT', () => {
  void shutdown('SIGINT');
});

process.on('SIGTERM', () => {
  void shutdown('SIGTERM');
});

void start();
