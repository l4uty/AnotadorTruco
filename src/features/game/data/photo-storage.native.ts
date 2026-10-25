import { Directory, File, Paths } from 'expo-file-system';

export async function persistMatchPhoto(sourceUri: string, gameId: string, _unmirrorFrontCamera = false): Promise<string> {
  const photosDirectory = new Directory(Paths.document, 'match-photos');
  photosDirectory.create({ idempotent: true, intermediates: true });
  const extension = Paths.extname(sourceUri).toLowerCase();
  const safeExtension = /^\.(jpe?g|png|heic|webp)$/.test(extension) ? extension : '.jpg';
  const destination = new File(photosDirectory, `${gameId}-${Date.now()}${safeExtension}`);
  await new File(sourceUri).copy(destination);
  return destination.uri;
}

export async function deleteMatchPhoto(uri?: string | null): Promise<void> {
  if (!uri) return;
  try {
    const file = new File(uri);
    if (file.exists) file.delete();
  } catch {
    // A missing photo must never prevent the history from loading.
  }
}

export async function resolveMatchPhoto(uri: string): Promise<string | null> {
  try {
    return new File(uri).exists ? uri : null;
  } catch {
    return null;
  }
}

export function releaseResolvedPhoto(): void {}
