import { readFile } from 'node:fs/promises';
import { definitionFromDocuments } from '../authoring/documents.js';
import type { DefaultTemplate } from '../domain/templates.js';

interface PrebuiltPackageRecord {
  readonly expertId: string;
  readonly packageDocuments: Readonly<Record<string, string>>;
}

interface PrebuiltManifest {
  readonly packages?: readonly PrebuiltPackageRecord[];
}

/** Load build-generated expert packages without creating a second authoring format. */
export async function loadPrebuiltExpertTemplates(): Promise<readonly DefaultTemplate[]> {
  const url = new URL('../../resources/generated/expert-packages.json', import.meta.url);
  let manifest: PrebuiltManifest;
  try {
    manifest = JSON.parse(await readFile(url, 'utf8')) as PrebuiltManifest;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw error;
  }
  if (!Array.isArray(manifest.packages)) throw new Error('experts/prebuilt-manifest-invalid');
  return manifest.packages.map((entry) => {
    if (!entry || typeof entry.expertId !== 'string' || !entry.packageDocuments || typeof entry.packageDocuments !== 'object') {
      throw new Error('experts/prebuilt-entry-invalid');
    }
    return { id: entry.expertId, definition: definitionFromDocuments(entry.packageDocuments) };
  });
}
