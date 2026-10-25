import { ScrollViewStyleReset, useServerDocumentContext } from 'expo-router/html';
import { PropsWithChildren } from 'react';

export default function Root({ children }: PropsWithChildren) {
  const { headNodes, bodyNodes, htmlAttributes, bodyAttributes } = useServerDocumentContext();

  return (
    <html lang="es-AR" {...htmlAttributes}>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=contain" />
        <meta name="theme-color" content="#090a0d" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
        <meta name="apple-mobile-web-app-title" content="Truco" />
        <link rel="manifest" href="./manifest.json" />
        <link rel="icon" type="image/png" sizes="1024x1024" href="./truco-favicon-v2.png" />
        <link rel="apple-touch-icon" href="./truco-favicon-v2.png" />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: `
          html, body, #root { width: 100%; height: 100%; min-height: 0; margin: 0; background: #090a0d; -webkit-text-size-adjust: 100%; text-size-adjust: 100%; }
          body { overflow: hidden; overscroll-behavior: none; -webkit-tap-highlight-color: transparent; }
          @supports (height: 100dvh) {
            html, body, #root { height: 100dvh; max-height: 100dvh; }
          }
        ` }} />
        {headNodes}
      </head>
      <body {...bodyAttributes}>
        {children}
        {bodyNodes}
      </body>
    </html>
  );
}
