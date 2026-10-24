import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { palette } from '@/theme/palette';
import { HistoryEntry } from '../domain/types';
import { RusticButton } from './ui';
import { WoodBackground } from './wood-background';

const formatter = new Intl.DateTimeFormat('es-AR', {
  day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
});

export function HistoryModal({ visible, entries, onClose, onToggleFavorite }: {
  visible: boolean; entries: HistoryEntry[]; onClose: () => void; onToggleFavorite: (id: string) => void;
}) {
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
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 }, header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingTop: 4 },
  title: { color: palette.cream, fontSize: 22 }, headerSpacer: { width: 88 },
  note: { color: palette.creamMuted, fontSize: 12, textAlign: 'center', marginHorizontal: 24, marginTop: 4 },
  list: { padding: 18, gap: 12, flexGrow: 1 }, empty: { color: palette.creamMuted, textAlign: 'center', marginTop: 80 },
  card: { backgroundColor: 'rgba(39, 17, 8, 0.72)', borderWidth: 1, borderColor: palette.line, borderRadius: 9, padding: 15 },
  cardTop: { flexDirection: 'row', alignItems: 'center' }, cardText: { flex: 1, gap: 5 }, date: { color: palette.creamMuted, fontSize: 12 },
  result: { color: palette.cream, fontSize: 17 }, meta: { color: palette.creamMuted, fontSize: 13 },
  starButton: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }, star: { color: palette.creamMuted, fontSize: 32 },
  starActive: { color: palette.cream },
});
