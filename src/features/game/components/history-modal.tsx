import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { palette } from '@/theme/palette';
import { HistoryEntry } from '../domain/types';
import { AppBackground } from './app-background';
import { MatchPhoto } from './match-photo';
import { AppModal, RusticButton, uiStyles } from './ui';

const formatter = new Intl.DateTimeFormat('es-AR', {
  day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
});

export function HistoryModal({ visible, entries, onClose, onToggleFavorite, onDelete }: {
  visible: boolean;
  entries: HistoryEntry[];
  onClose: () => void;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [failedPhotoIds, setFailedPhotoIds] = useState<Set<string>>(() => new Set());
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill}>
      <AppBackground>
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
                    <View style={styles.actions}>
                      <Pressable accessibilityRole="button" accessibilityLabel={item.favorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                        onPress={() => onToggleFavorite(item.id)} hitSlop={8} style={styles.starButton}>
                        <Text style={[styles.star, item.favorite && styles.starActive]}>{item.favorite ? '★' : '☆'}</Text>
                      </Pressable>
                      <Pressable accessibilityRole="button" accessibilityLabel="Eliminar partida del historial"
                        onPress={() => setPendingDeleteId(item.id)} hitSlop={8} style={styles.deleteButton}>
                        <Text style={styles.deleteText}>Eliminar</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              );
            }}
          />
        </SafeAreaView>
      </AppBackground>

      <Modal visible={Boolean(selectedPhoto)} transparent animationType="fade" onRequestClose={() => setSelectedPhoto(null)}>
        <Pressable accessibilityRole="button" accessibilityLabel="Cerrar foto" style={styles.photoViewer}
          onPress={() => setSelectedPhoto(null)}>
          {selectedPhoto && <MatchPhoto storedUri={selectedPhoto} style={styles.fullPhoto} resizeMode="contain" />}
          <Text style={styles.closePhoto}>Tocá para cerrar</Text>
        </Pressable>
      </Modal>

      <AppModal visible={Boolean(pendingDeleteId)} onRequestClose={() => setPendingDeleteId(null)}>
        <Text style={uiStyles.modalTitle}>¿Eliminar esta partida?</Text>
        <Text style={uiStyles.modalText}>Se borrará del historial junto con su foto. Esta acción no se puede deshacer.</Text>
        <View style={uiStyles.row}>
          <RusticButton style={styles.confirmButton} onPress={() => setPendingDeleteId(null)}>Cancelar</RusticButton>
          <RusticButton style={styles.confirmButton} variant="danger" onPress={() => {
            if (pendingDeleteId) onDelete(pendingDeleteId);
            setPendingDeleteId(null);
          }}>Eliminar</RusticButton>
        </View>
      </AppModal>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingTop: 4 },
  title: { color: palette.text, fontSize: 22, fontWeight: '600' }, headerSpacer: { width: 88 },
  note: { color: palette.textMuted, fontSize: 12, textAlign: 'center', marginHorizontal: 24, marginTop: 4 },
  list: { padding: 18, gap: 12, flexGrow: 1 }, empty: { color: palette.textMuted, textAlign: 'center', marginTop: 80 },
  card: { backgroundColor: 'rgba(20, 23, 28, 0.88)', borderWidth: 1, borderColor: palette.line, borderRadius: 16, overflow: 'hidden' },
  photo: { width: '100%', height: 170, backgroundColor: palette.surfaceSoft },
  cardTop: { flexDirection: 'row', alignItems: 'center', padding: 15 }, cardText: { flex: 1, gap: 5 },
  date: { color: palette.textMuted, fontSize: 12 }, result: { color: palette.text, fontSize: 17, fontWeight: '500' }, meta: { color: palette.textMuted, fontSize: 13 },
  starButton: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }, star: { color: palette.textMuted, fontSize: 32 },
  starActive: { color: palette.accentBright },
  actions: { alignItems: 'center', gap: 4 },
  deleteButton: { minWidth: 66, minHeight: 34, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  deleteText: { color: palette.danger, fontSize: 12, fontWeight: '600' },
  confirmButton: { flex: 1 },
  photoViewer: { flex: 1, backgroundColor: 'rgba(3, 4, 6, 0.97)', alignItems: 'center', justifyContent: 'center', padding: 18 },
  fullPhoto: { width: '100%', height: '82%' }, closePhoto: { color: palette.textMuted, fontSize: 13, marginTop: 12 },
});
