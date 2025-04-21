import { Html, Head, Main, NextScript } from 'next/document'
import Script from 'next/script'
import { basePath } from '@/next.config'

export default function Document() {
  return (
    <Html>
      <Head />
      <body>
        <Main />
        <NextScript />
        <Script src={`${basePath}/js/rb-config.js`} strategy="beforeInteractive" />
      </body>
    </Html>
  )
}