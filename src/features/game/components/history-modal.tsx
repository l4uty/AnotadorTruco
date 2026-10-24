import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { palette } from '@/theme/palette';
import { HistoryEntry } from '../domain/types';
import { MatchPhoto } from './match-photo';
import { RusticButton } from './ui';
import { WoodBackground } from './wood-background';

const formatter = new Intl.DateTimeFormat('es-AR', {
  day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
});

export function HistoryModal({ visible, entries, onClose, onToggleFavorite }: {
  visible: boolean; entries: HistoryEntry[]; onClose: () => void; onToggleFavorite: (id: string) => void;
}) {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [failedPhotoIds, setFailedPhotoIds] = useState<Set<string>>(() => new Set());
  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill}>
      <WoodBackground>
        <SafeAreaView style={styles.safe}>
          <View style={styles.header}>
            <RusticButton variant="ghost" onPress={onClose} accessibilityLabel="Cerrar historial">‹ Volver</RusticButton>
            <Text style={styles.title}>Historial</Text>
            <View style={styles.headerSpacer} />
          </View>
          <Text style={styles.note}>Las partidas sin estrella se eliminan después de 7 días.</Text>
          <FlatList
            data={entries} keyExtractor={(item) => item.id} contentContainerStyle={styles.list}
            ListEmptyComponent={<Text style={styles.empty}>Todavía no hay partidas terminadas.</Text>}
            renderItem={({ item }) => {
              const winner = item.teams[item.winner];
              return (
                <View style={styles.card}>
                  {item.photoUri && !failedPhotoIds.has(item.id) && (
                    <Pressable accessibilityRole="button" accessibilityLabel="Ver foto de la partida"
                      onPress={() => setSelectedPhoto(item.photoUri ?? null)}>
                      <MatchPhoto storedUri={item.photoUri} style={styles.photo}
                        onError={() => setFailedPhotoIds((current) => new Set(current).add(item.id))} />
                    </Pressable>
                  )}
                  <View style={styles.cardTop}>
                    <View style={styles.cardText}>
                      <Text style={styles.date}>{formatter.format(new Date(item.finishedAt))}</Text>
                      <Text style={styles.result}>{item.teams.us.name} {item.teams.us.score} · {item.teams.them.score} {item.teams.them.name}</Text>
                      <Text style={styles.meta}>{item.mode} · a {item.target} · Ganó {winner.name}</Text>
                    </View>
                    <Pressable accessibilityRole="button" accessibilityLabel={item.favorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                      onPress={() => onToggleFavorite(item.id)} hitSlop={12} style={styles.starButton}>
                      <Text style={[styles.star, item.favorite && styles.starActive]}>{item.favorite ? '★' : '☆'}</Text>
                    </Pressable>
                  </View>
                </View>
              );
            }}
          />
        </SafeAreaView>
      </WoodBackground>

      <Modal visible={Boolean(selectedPhoto)} transparent animationType="fade" onRequestClose={() => setSelectedPhoto(null)}>
        <Pressable accessibilityRole="button" accessibilityLabel="Cerrar foto" style={styles.photoViewer}
          onPress={() => setSelectedPhoto(null)}>
          {selectedPhoto && <MatchPhoto storedUri={selectedPhoto} style={styles.fullPhoto} resizeMode="contain" />}
          <Text style={styles.closePhoto}>Tocá para cerrar</Text>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingTop: 4 },
  title: { color: palette.cream, fontSize: 22 }, headerSpacer: { width: 88 },
  note: { color: palette.creamMuted, fontSize: 12, textAlign: 'center', marginHorizontal: 24, marginTop: 4 },
  list: { padding: 18, gap: 12, flexGrow: 1 }, empty: { color: palette.creamMuted, textAlign: 'center', marginTop: 80 },
  card: { backgroundColor: 'rgba(39, 17, 8, 0.72)', borderWidth: 1, borderColor: palette.line, borderRadius: 9, overflow: 'hidden' },
  photo: { width: '100%', height: 170, backgroundColor: palette.woodDark },
  cardTop: { flexDirection: 'row', alignItems: 'center', padding: 15 }, cardText: { flex: 1, gap: 5 },
  date: { color: palette.creamMuted, fontSize: 12 }, result: { color: palette.cream, fontSize: 17 }, meta: { color: palette.creamMuted, fontSize: 13 },
  starButton: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }, star: { color: palette.creamMuted, fontSize: 32 },
  starActive: { color: palette.cream },
  photoViewer: { flex: 1, backgroundColor: 'rgba(10, 5, 2, 0.96)', alignItems: 'center', justifyContent: 'center', padding: 18 },
  fullPhoto: { width: '100%', height: '82%' }, closePhoto: { color: palette.creamMuted, fontSize: 13, marginTop: 12 },
});
