// rollbarClient.js
import Rollbar from 'rollbar';

const rollbar = new Rollbar({
  accessToken: process.env.NEXT_PUBLIC_ROLLBAR_ACCESS_TOKEN,
  captureUncaught: true,
  captureUnhandledRejections: true,
});

export default rollbar;
