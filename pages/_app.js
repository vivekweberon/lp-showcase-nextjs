import { Provider, ErrorBoundary } from '@rollbar/react';

import { clientConfig } from '@/rollbar';

export default function App({ Component, pageProps }) {
  return (
    <Provider config={clientConfig}>
      <ErrorBoundary
        level="critical"
        errorMessage="example error boundary message"
        fallbackUI={() => (
          <p style={{ color: 'red' }}>Oops, there was an error.</p>
        )}
        extra={{ more: 'data' }}
        callback={() => console.log('an exception was sent to rollbar')}
      >
        <Component {...pageProps} />
      </ErrorBoundary>
    </Provider>
  );
}