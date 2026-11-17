import { Network } from '@capacitor/network';

export async function getNetworkStatus(): Promise<{ connected: boolean; connectionType: string }> {
  const status = await Network.getStatus();
  return {
    connected: status.connected,
    connectionType: status.connectionType,
  };
}

export function addNetworkListener(
  listener: (status: { connected: boolean; connectionType: string }) => void,
): Promise<{ remove: () => Promise<void> }> {
  return Network.addListener('networkStatusChange', (status) => {
    listener({
      connected: status.connected,
      connectionType: status.connectionType,
    });
  });
}
