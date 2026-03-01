// =============================================================================
// Guttenberg Manuscripts API
// Manuscript upload, Refinery import, preflight reports, and version management.
// =============================================================================

import client from './client';
import { Manuscript, ManuscriptVersion } from './types';

/**
 * Upload a new manuscript file.
 * Accepts multipart/form-data with the manuscript file and associated metadata.
 *
 * @param formData - A FormData object containing the file (field name: 'file')
 *   and optional fields such as 'title' and 'change_note'.
 * @returns The created Manuscript record including preflight status.
 */
export const uploadManuscript = async (
  formData: FormData,
): Promise<Manuscript> => {
  const { data } = await client.post<Manuscript>(
    '/manuscripts/upload/',
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    },
  );
  return data;
};

/**
 * Import a manuscript from the Refinery editing platform.
 *
 * @param importData - Must include `refinery_manuscript_id` and optionally `title_id`
 *   to link the imported manuscript to an existing Guttenberg title.
 * @returns The created Manuscript record.
 */
export const importFromRefinery = async (
  importData: {
    refinery_manuscript_id: string;
    title_id?: string;
  },
): Promise<Manuscript> => {
  const { data } = await client.post<Manuscript>(
    '/manuscripts/import_refinery/',
    importData,
  );
  return data;
};

/**
 * Retrieve the preflight quality report for a manuscript.
 * The report includes checks for formatting, structure, and common errors.
 *
 * @param manuscriptId - The manuscript to retrieve the report for.
 */
export const getPreflightReport = async (
  manuscriptId: string,
): Promise<Manuscript['preflight_report']> => {
  const { data } = await client.get<Manuscript['preflight_report']>(
    `/manuscripts/${manuscriptId}/preflight/`,
  );
  return data;
};

/**
 * List all versions of a manuscript, ordered by version number descending.
 *
 * @param manuscriptId - The manuscript whose versions to retrieve.
 */
export const getVersions = async (
  manuscriptId: string,
): Promise<ManuscriptVersion[]> => {
  const { data } = await client.get<ManuscriptVersion[]>(
    `/manuscripts/${manuscriptId}/versions/`,
  );
  return data;
};

/**
 * Restore a manuscript to a previous version.
 * This creates a new version that is a copy of the specified historical version.
 *
 * @param manuscriptId - The manuscript to restore.
 * @param versionId - The version to restore to.
 * @returns The newly created ManuscriptVersion.
 */
export const restoreVersion = async (
  manuscriptId: string,
  versionId: string,
): Promise<ManuscriptVersion> => {
  const { data } = await client.post<ManuscriptVersion>(
    `/manuscripts/${manuscriptId}/restore/${versionId}/`,
  );
  return data;
};
