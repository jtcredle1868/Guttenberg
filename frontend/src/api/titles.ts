import client from './client';
import { Title, PreflightResult, Format } from './types';

export const getTitles = () =>
  client.get<Title[]>('/titles');

export const getTitle = (id: string) =>
  client.get<Title>(`/titles/${id}`);

export const createTitle = (data: Partial<Title>) =>
  client.post<Title>('/titles', data);

export const updateTitle = (id: string, data: Partial<Title>) =>
  client.put<Title>(`/titles/${id}`, data);

export const deleteTitle = (id: string) =>
  client.delete(`/titles/${id}`);

export const uploadManuscript = (titleId: string, file: File) => {
  const form = new FormData();
  form.append('file', file);
  return client.post<{ fileUrl: string }>(`/titles/${titleId}/manuscript`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const getPreflightResults = (titleId: string) =>
  client.get<PreflightResult>(`/titles/${titleId}/preflight`);

export const requestFormat = (titleId: string, data: { type: string; trimSize?: string; template?: string }) =>
  client.post<Format>(`/titles/${titleId}/formats`, data);

export const uploadCover = (titleId: string, file: File) => {
  const form = new FormData();
  form.append('file', file);
  return client.post<{ coverUrl: string }>(`/titles/${titleId}/cover`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
