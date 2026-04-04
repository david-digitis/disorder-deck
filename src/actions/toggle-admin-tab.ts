import { KeyDownEvent, SingletonAction } from '@elgato/streamdeck';
import { overlayClient } from '../overlay-client.js';

export class ToggleAdminTab extends SingletonAction {
  override async onKeyDown(ev: KeyDownEvent): Promise<void> {
    overlayClient.send('toggle-admin-tab');
  }
}
