import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html>
      <Head>
        <script src="https://cdn.rollbar.com/rollbarjs/refs/tags/v2.22.0/rollbar.min.js"></script>
        <script src={`${basePath}/js/rb-config.js`}></script>
        <script src={`${basePath}/js/logger.js`} ></script>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}