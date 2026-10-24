# Truco anotador

Aplicación móvil offline para anotar partidas de Truco argentino en Android, iOS y web.

## Funciones actuales

- Partidas 1v1, 2v2 y 3v3 a 15 o 30 puntos.
- Marcador tradicional con cuadrados de cinco trazos.
- Continuación de 15 a 30 sin perder el progreso.
- Aviso de mano PIKA PIKA en partidas 3v3 a 30.
- Nombres editables, reinicio y cambio de modalidad.
- Historial local con favoritos y limpieza automática a los siete días.
- Recuperación de la partida activa al volver a abrir la aplicación.

## Desarrollo

```powershell
npm.cmd install --cache .npm-cache
npm.cmd run start
```

Comprobaciones:

```powershell
npm.cmd run typecheck
npm.cmd test
npx.cmd expo-doctor
```

## Estructura

- `src/app`: rutas y composición de la aplicación.
- `src/features/game/domain`: reglas puras y modelos del juego.
- `src/features/game/data`: persistencia local.
- `src/features/game/components`: interfaz reutilizable.
- `src/features/game/screens`: coordinación de pantallas y estado.
- `src/theme`: identidad visual compartida.

La lógica de dominio no depende de React Native. Esto permite evolucionar el almacenamiento, incorporar estadísticas o integrar publicidad sin acoplarla al marcador.
