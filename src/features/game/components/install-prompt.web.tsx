import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { palette } from '@/theme/palette';
import { AppModal, RusticButton, uiStyles } from './ui';

const NEVER_ASK_KEY = '@truco/install-prompt-never/v1';

type InstallChoice = { outcome: 'accepted' | 'dismissed'; platform: string };
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<InstallChoice>;
};

function isInstalled(): boolean {
  const standaloneNavigator = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia('(display-mode: standalone)').matches || standaloneNavigator.standalone === true;
}

function isMobileBrowser(): boolean {
  const mobileUserAgent = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  const ipadUsingDesktopMode = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  return mobileUserAgent || ipadUsingDesktopMode;
}

function isIosBrowser(): boolean {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

export function InstallPrompt() {
  const [visible, setVisible] = useState(false);
  const [instructionsVisible, setInstructionsVisible] = useState(false);
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const ios = typeof navigator !== 'undefined' && isIosBrowser();

  useEffect(() => {
    if (!isMobileBrowser() || isInstalled() || localStorage.getItem(NEVER_ASK_KEY) === 'true') return;

    const showPromptTimer = window.setTimeout(() => setVisible(true), 0);

    const captureInstallEvent = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };
    const markAsInstalled = () => {
      localStorage.setItem(NEVER_ASK_KEY, 'true');
      setVisible(false);
      setInstructionsVisible(false);
    };

    window.addEventListener('beforeinstallprompt', captureInstallEvent);
    window.addEventListener('appinstalled', markAsInstalled);
    void navigator.serviceWorker?.register('./sw.js');

    return () => {
      window.clearTimeout(showPromptTimer);
      window.removeEventListener('beforeinstallprompt', captureInstallEvent);
      window.removeEventListener('appinstalled', markAsInstalled);
    };
  }, []);

  const addToHomeScreen = async () => {
    setVisible(false);
    if (!installEvent) {
      setInstructionsVisible(true);
      return;
    }

    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    setInstallEvent(null);
    if (choice.outcome === 'accepted') localStorage.setItem(NEVER_ASK_KEY, 'true');
  };

  const neverAskAgain = () => {
    localStorage.setItem(NEVER_ASK_KEY, 'true');
    setVisible(false);
  };

  return (
    <>
      <AppModal visible={visible} onRequestClose={() => setVisible(false)}>
        <Text style={uiStyles.modalTitle}>Añadir Truco a tu pantalla</Text>
        <Text style={uiStyles.modalText}>Creá un acceso directo para abrir el anotador como una aplicación desde tu celular.</Text>
        <RusticButton variant="filled" onPress={() => void addToHomeScreen()}>Añadir</RusticButton>
        <View style={styles.actions}>
          <RusticButton style={styles.action} variant="ghost" onPress={neverAskAgain}>Cancelar</RusticButton>
          <RusticButton style={styles.action} variant="outline" onPress={() => setVisible(false)}>Recordar más tarde</RusticButton>
        </View>
      </AppModal>

      <AppModal visible={instructionsVisible} onRequestClose={() => setInstructionsVisible(false)}>
        <Text style={uiStyles.modalTitle}>Añadir a pantalla de inicio</Text>
        {ios ? (
          <View style={styles.instructions}>
            <Text style={styles.instruction}>1. Tocá el botón Compartir de Safari.</Text>
            <Text style={styles.instruction}>2. Elegí “Añadir a pantalla de inicio”.</Text>
            <Text style={styles.instruction}>3. Tocá “Añadir” para confirmar.</Text>
          </View>
        ) : (
          <Text style={uiStyles.modalText}>Abrí el menú de tu navegador y elegí “Instalar aplicación” o “Añadir a pantalla de inicio”.</Text>
        )}
        <RusticButton variant="filled" onPress={() => setInstructionsVisible(false)}>Entendido</RusticButton>
      </AppModal>
    </>
  );
}

const styles = StyleSheet.create({
  actions: { gap: 8 },
  action: { width: '100%' },
  instructions: { gap: 10, paddingVertical: 4 },
  instruction: { color: palette.text, fontSize: 15, lineHeight: 21 },
});
