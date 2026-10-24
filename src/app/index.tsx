import { TrucoApp } from '@/features/game/screens/truco-app';
import type { Metadata } from 'expo-router/server';

export function generateMetadata(): Metadata {
  return {
    title: 'Truco anotador',
    description: 'Anotador de Truco argentino para partidas de 1v1, 2v2 y 3v3.',
  };
}

export default function HomeScreen() {
  return <TrucoApp />;
}
