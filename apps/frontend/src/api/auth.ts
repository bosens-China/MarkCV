import { apiRequest } from './client';

export interface AuthUser {
  id: string;
  githubId: string;
  login: string;
  name: string | null;
  avatarUrl: string | null;
  email: string | null;
}

export function fetchCurrentUser() {
  return apiRequest<AuthUser>('/auth/me');
}

export function logout() {
  return apiRequest<{ ok: true }>('/auth/logout', {
    method: 'POST',
  });
}
