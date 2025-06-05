import Rollbar from 'rollbar';

const rollbar = new Rollbar({
  accessToken: 'a369216935fe434cb70adca043caf58dae1824f3f9c85ebab328f55fba0d366c13fb124a5c15f323a0f1f390bcb24c5b',
  captureUncaught: true,
  captureUnhandledRejections: true,
  retryInterval: 5000,
  autoInstrument: {
    network: true,
    log: true,
    dom: true,
    navigation: true,
    connectivity: true,
    contentSecurityPolicy: true,
    errorOnContentSecurityPolicy: true
  }, 
  payload: {
      environment: ''
  }
});

export default rollbar;
