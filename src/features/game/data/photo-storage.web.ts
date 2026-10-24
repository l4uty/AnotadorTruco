const DATABASE_NAME = 'truco-photos';
const STORE_NAME = 'match-photos';
const URI_PREFIX = 'idb-photo://';

function isIosBrowser(): boolean {
  const appleMobileDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const ipadUsingDesktopMode = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  return appleMobileDevice || ipadUsingDesktopMode;
}

async function removeIosMirrorEffect(blob: Blob): Promise<Blob> {
  if (!isIosBrowser()) return blob;

  const sourceUrl = URL.createObjectURL(blob);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error('No se pudo procesar la foto tomada.'));
      element.src = sourceUrl;
    });

    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext('2d');
    if (!context) return blob;

    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    context.drawImage(image, 0, 0);

    return await new Promise<Blob>((resolve) => {
      canvas.toBlob((correctedBlob) => resolve(correctedBlob ?? blob), 'image/jpeg', 0.9);
    });
  } finally {
    URL.revokeObjectURL(sourceUrl);
  }
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function photoKey(uri: string): string | null {
  return uri.startsWith(URI_PREFIX) ? uri.slice(URI_PREFIX.length) : null;
}

export async function persistMatchPhoto(sourceUri: string, gameId: string): Promise<string> {
  const response = await fetch(sourceUri);
  const blob = await removeIosMirrorEffect(await response.blob());
  const key = `${gameId}-${Date.now()}`;
  const database = await openDatabase();

  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).put(blob, key);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  database.close();
  return `${URI_PREFIX}${key}`;
}

export async function deleteMatchPhoto(uri?: string | null): Promise<void> {
  if (!uri) return;
  const key = photoKey(uri);
  if (!key) return;
  try {
    const database = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readwrite');
      transaction.objectStore(STORE_NAME).delete(key);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
    database.close();
  } catch {
    // A missing photo must never prevent the history from loading.
  }
}

export async function resolveMatchPhoto(uri: string): Promise<string | null> {
  const key = photoKey(uri);
  if (!key) return uri;
  const database = await openDatabase();
  const blob = await new Promise<Blob | undefined>((resolve, reject) => {
    const request = database.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(key);
    request.onsuccess = () => resolve(request.result as Blob | undefined);
    request.onerror = () => reject(request.error);
  });
  database.close();
  return blob ? URL.createObjectURL(blob) : null;
}

export function releaseResolvedPhoto(uri: string): void {
  if (uri.startsWith('blob:')) URL.revokeObjectURL(uri);
}
