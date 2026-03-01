import { apiRequest } from './client';

export interface ResumeApiModel {
  id: string;
  title: string;
  content: string;
  themeColor: string;
  pageMargin: number;
  lineHeight: number;
  currentFont: string;
  customCss: string;
  createdAt: string;
  updatedAt: string;
}

export interface ResumeListResponse {
  items: ResumeApiModel[];
}

export interface ResumeVersionApiModel {
  id: string;
  resumeId: string;
  title: string;
  content: string;
  createdAt: string;
}

export interface ResumeVersionListResponse {
  items: ResumeVersionApiModel[];
}

export interface CreateResumePayload {
  title: string;
  content: string;
  themeColor: string;
  pageMargin: number;
  lineHeight: number;
  currentFont: string;
  customCss: string;
}

export type UpdateResumePayload = Partial<CreateResumePayload>;

export function fetchResumeList() {
  return apiRequest<ResumeListResponse>('/resumes');
}

export function fetchResumeById(id: string) {
  return apiRequest<ResumeApiModel>(`/resumes/${id}`);
}

export function createResume(payload: CreateResumePayload) {
  return apiRequest<ResumeApiModel>('/resumes', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateResume(id: string, payload: UpdateResumePayload) {
  return apiRequest<ResumeApiModel>(`/resumes/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function deleteResume(id: string) {
  return apiRequest<void>(`/resumes/${id}`, {
    method: 'DELETE',
  });
}

export function fetchResumeVersions(id: string) {
  return apiRequest<ResumeVersionListResponse>(`/resumes/${id}/versions`);
}

export function createResumeVersion(
  id: string,
  payload?: { title?: string; content?: string },
) {
  return apiRequest<ResumeVersionApiModel>(`/resumes/${id}/versions`, {
    method: 'POST',
    body: JSON.stringify(payload || {}),
  });
}

export function restoreResumeVersion(id: string, versionId: string) {
  return apiRequest<ResumeApiModel>(`/resumes/${id}/restore/${versionId}`, {
    method: 'POST',
  });
}
