import streamDeck from '@elgato/streamdeck';
import { overlayClient, OverlayState } from './overlay-client.js';
import { iconAdminTab, iconFleetTab, iconTsMode, iconHelp, iconDead, iconResetDead, iconToggleOverlay, iconQuit } from './icons.js';

let currentState: OverlayState = {
  adminTab: 'op',
  fleetTab: 'fleet',
  tsLiveMode: 'normal',
  tsConnected: false,
  voiceCount: 0,
  whisperActive: false,
};

// Update all visible buttons based on current state
function updateButtons() {
  for (const action of streamDeck.actions) {
    const id = action.manifestId;
    switch (id) {
      case 'com.digitis.disorder-deck.toggle-admin-tab':
        action.setImage(iconAdminTab(currentState.adminTab));
        break;
      case 'com.digitis.disorder-deck.toggle-fleet-tab':
        action.setImage(iconFleetTab(currentState.fleetTab));
        break;
      case 'com.digitis.disorder-deck.toggle-ts-mode':
        action.setImage(iconTsMode(currentState.tsLiveMode));
        break;
      case 'com.digitis.disorder-deck.trigger-help':
        action.setImage(iconHelp());
        break;
      case 'com.digitis.disorder-deck.trigger-dead':
        action.setImage(iconDead(false));
        break;
      case 'com.digitis.disorder-deck.reset-dead':
        action.setImage(iconResetDead());
        break;
      case 'com.digitis.disorder-deck.toggle-overlay':
        action.setImage(iconToggleOverlay(true));
        break;
      case 'com.digitis.disorder-deck.quit-overlay':
        action.setImage(iconQuit());
        break;
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
    'com.digitis.disorder-deck.toggle-fleet-tab': 'toggle-fleet-tab',
    'com.digitis.disorder-deck.toggle-ts-mode': 'toggle-ts-live-mode',
    'com.digitis.disorder-deck.trigger-help': 'trigger-help',
    'com.digitis.disorder-deck.trigger-dead': 'trigger-dead',
    'com.digitis.disorder-deck.reset-dead': 'reset-dead',
    'com.digitis.disorder-deck.toggle-overlay': 'toggle-overlay',
    'com.digitis.disorder-deck.quit-overlay': 'quit-overlay',
  };

  const command = commands[ev.action.manifestId];
  if (command) {
    overlayClient.send(command);
    // Immediate visual feedback
    if (command === 'trigger-help') ev.action.showOk();
  }
});

// Set initial icons when buttons appear
streamDeck.actions.onWillAppear(() => {
  updateButtons();
});

// Start the Stream Deck plugin
streamDeck.connect();
