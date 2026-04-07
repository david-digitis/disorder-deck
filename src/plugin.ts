import streamDeck from '@elgato/streamdeck';
import { overlayClient, OverlayState } from './overlay-client.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Resolve path to imgs/actions/ relative to compiled JS location (bin/)
const __dirname_ = dirname(fileURLToPath(import.meta.url));
const iconsDir = join(__dirname_, '..', 'imgs', 'actions');

// Cache loaded GIFs as base64 data URIs
const gifCache = new Map<string, string>();

function loadGif(name: string): string {
  if (gifCache.has(name)) return gifCache.get(name)!;
  try {
    const data = readFileSync(join(iconsDir, `${name}.gif`));
    const uri = `data:image/gif;base64,${data.toString('base64')}`;
    gifCache.set(name, uri);
    return uri;
  } catch {
    streamDeck.logger.error(`Failed to load icon: ${name}.gif`);
    return '';
  }
}

let currentState: OverlayState = {
  adminTab: 'op',
  tsLiveMode: 'normal',
  tsConnected: false,
  voiceCount: 0,
  whisperActive: false,
  fleetVisible: false,
  tsLiveVisible: true,
};

function updateButtons() {
  for (const action of streamDeck.actions) {
    const id = action.manifestId;
    let gif = '';
    switch (id) {
      case 'com.digitis.disorder-deck.toggle-admin-tab':
        gif = currentState.adminTab === 'op' ? 'admin-op' : 'admin-all';
        break;
      case 'com.digitis.disorder-deck.toggle-fleet':
        gif = currentState.fleetVisible ? 'fleet-on' : 'fleet-off';
        break;
      case 'com.digitis.disorder-deck.toggle-ts-live':
        gif = currentState.tsLiveVisible ? 'tslive-on' : 'tslive-off';
        break;
      case 'com.digitis.disorder-deck.toggle-ts-mode':
        gif = currentState.tsLiveMode === 'normal' ? 'mode-normal' : 'mode-fdg';
        break;
      case 'com.digitis.disorder-deck.trigger-help':
        gif = 'help';
        break;
      case 'com.digitis.disorder-deck.trigger-dead':
        gif = `status-${currentState.selfStatus || 'none'}`;
        break;
      case 'com.digitis.disorder-deck.check-raid':
        gif = 'raid-check';
        break;
      case 'com.digitis.disorder-deck.raid-off':
        gif = 'raid-off';
        break;
      case 'com.digitis.disorder-deck.rally':
        gif = 'rally';
        break;
      case 'com.digitis.disorder-deck.reset-status':
        gif = 'reset-status';
        break;
      case 'com.digitis.disorder-deck.screenshot':
        gif = 'screenshot';
        break;
      case 'com.digitis.disorder-deck.toggle-clip':
        gif = currentState.clipRecording ? 'clip-on' : 'clip-off';
        break;
      case 'com.digitis.disorder-deck.toggle-auto-ping':
        gif = currentState.autoPingActive ? 'ping-on' : 'ping-off';
        break;
      case 'com.digitis.disorder-deck.toggle-overlay':
        gif = 'overlay-show';
        break;
      case 'com.digitis.disorder-deck.quit-overlay':
        gif = 'quit';
        break;
    }
    if (gif) {
      const data = loadGif(gif);
      if (data) action.setImage(data);
    }
  }
}

// Connect to Disorder Overlay
overlayClient.connect();

overlayClient.on('connected', () => {
  streamDeck.logger.info('Connected to Disorder Overlay');
});

overlayClient.on('disconnected', () => {
  streamDeck.logger.info('Disconnected from Disorder Overlay');
});

overlayClient.on('stateChanged', (state: OverlayState) => {
  currentState = state;
  updateButtons();
});

// Key presses
streamDeck.actions.onKeyDown((ev) => {
  streamDeck.logger.info(`Key: ${ev.action.manifestId}`);

  const commands: Record<string, string> = {
    'com.digitis.disorder-deck.toggle-admin-tab': 'toggle-admin-tab',
    'com.digitis.disorder-deck.toggle-fleet': 'toggle-fleet',
    'com.digitis.disorder-deck.toggle-ts-live': 'toggle-ts-live',
    'com.digitis.disorder-deck.toggle-ts-mode': 'toggle-ts-live-mode',
    'com.digitis.disorder-deck.trigger-help': 'trigger-help',
    'com.digitis.disorder-deck.trigger-dead': 'trigger-dead',
    'com.digitis.disorder-deck.check-raid': 'check-raid',
    'com.digitis.disorder-deck.raid-off': 'raid-off',
    'com.digitis.disorder-deck.rally': 'rally',
    'com.digitis.disorder-deck.reset-status': 'reset-all-status',
    'com.digitis.disorder-deck.screenshot': 'take-screenshot',
    'com.digitis.disorder-deck.toggle-clip': 'toggle-clip',
    'com.digitis.disorder-deck.toggle-auto-ping': 'toggle-auto-ping',
    'com.digitis.disorder-deck.toggle-overlay': 'toggle-overlay',
    'com.digitis.disorder-deck.quit-overlay': 'quit-overlay',
  };

  const command = commands[ev.action.manifestId];
  if (command) {
    overlayClient.send(command);
    if (command === 'trigger-help') ev.action.showOk();
  }
});

// Set initial icons when buttons appear
streamDeck.actions.onWillAppear(() => {
  updateButtons();
});

// Start the Stream Deck plugin
streamDeck.connect();
