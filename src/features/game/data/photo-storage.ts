// TypeScript contract and unsupported-platform fallback.
// Metro selects photo-storage.native.ts or photo-storage.web.ts at runtime.
export async function persistMatchPhoto(_sourceUri: string, _gameId: string, _unmirrorFrontCamera = false): Promise<string> {
  throw new Error('Photo storage is not available on this platform.');
}

export async function deleteMatchPhoto(_uri?: string | null): Promise<void> {}

export async function resolveMatchPhoto(_uri: string): Promise<string | null> {
  return null;
}

export function releaseResolvedPhoto(_uri?: string): void {}
