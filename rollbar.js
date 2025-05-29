import Rollbar from 'rollbar';

let rollbar = null;

if (typeof window !== 'undefined') {
  rollbar = new Rollbar({
    accessToken: process.env.NEXT_PUBLIC_ROLLBAR_ACCESS_TOKEN,
    captureUncaught: true,
    captureUnhandledRejections: true,
  });
}

export default rollbar;
