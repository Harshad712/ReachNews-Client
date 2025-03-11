import { NhostClient } from '@nhost/nhost-js';

const nhost = new NhostClient({
  subdomain: 'gglrioqykbigsyblybib',
  region: 'ap-south-1',
  clientStorageType: 'localStorage',
  clientStorage: localStorage,
  autoSignIn: true,
  autoRefreshToken: true,
  start: true,
  clientStorageGetter: (key) => localStorage.getItem(key),
  clientStorageSetter: (key, value) => localStorage.setItem(key, value),
  clientStorageRemover: (key) => localStorage.removeItem(key),
});

export default nhost;