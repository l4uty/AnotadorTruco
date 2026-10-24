import { useEffect, useRef, useState } from 'react';
import { Image, ImageResizeMode, ImageStyle, StyleProp } from 'react-native';

import { releaseResolvedPhoto, resolveMatchPhoto } from '../data/photo-storage';

export function MatchPhoto({ storedUri, style, resizeMode = 'cover', onError }: {
  storedUri: string;
  style: StyleProp<ImageStyle>;
  resizeMode?: ImageResizeMode;
  onError?: () => void;
}) {
  const [resolvedUri, setResolvedUri] = useState<string | null>(null);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    let active = true;
    let disposableUri: string | null = null;
    void resolveMatchPhoto(storedUri).then((uri) => {
      if (!active) {
        if (uri) releaseResolvedPhoto(uri);
        return;
      }
      if (!uri) onErrorRef.current?.();
      disposableUri = uri;
      setResolvedUri(uri);
    }).catch(() => onErrorRef.current?.());

    return () => {
      active = false;
      if (disposableUri) releaseResolvedPhoto(disposableUri);
    };
  }, [storedUri]);

  if (!resolvedUri) return null;
  return <Image source={{ uri: resolvedUri }} style={style} resizeMode={resizeMode} onError={() => onErrorRef.current?.()} />;
}
