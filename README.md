# ChatGPT Web Shortcuts

A tiny unpacked Chrome extension that adds keyboard shortcuts to the ChatGPT Web composer.

It is designed for `chatgpt.com` in Chrome, especially Chrome-created ChatGPT PWA/app windows.

## Shortcuts

Model selector:

- `Option+1`: Instant
- `Option+2`: Medium
- `Option+3`: High
- `Option+4`: Extra High
- `Option+5`: Pro Extended

Composer tools:

- `Command+Option+1`: Create image
- `Command+Option+2`: Deep research
- `Command+Option+3`: Web search
- `Command+Option+4`: Agent mode
- `Command+Option+5`: Create task

## Supported Page

- Last verified against ChatGPT Web on: `2026-06-22` Asia/Shanghai
- Tested target: `https://chatgpt.com/*`
- Legacy match included: `https://chat.openai.com/*`
- UI language targeted: English labels such as `Instant`, `Medium`, `Add files and more`, and `Deep research`

This extension depends on ChatGPT Web's current DOM and accessibility labels. It may break without notice if OpenAI changes the page structure, labels, menu behavior, or plan UI.

## Account And Plan Boundaries

This extension only clicks controls that already exist in your ChatGPT Web UI.

It does not unlock, bypass, enable, emulate, or purchase any ChatGPT feature, plan, model, tool, or quota.

Known boundaries:

- It cannot enable Pro mode for an account that does not support Pro mode.
- It cannot make paid or unavailable model tiers appear for a free account.
- Free accounts may not be able to select the listed intelligence tiers.
- Plus accounts should only expect the tiers actually exposed by their ChatGPT UI. As of the current known UI, Plus availability is expected to be limited to `Instant`, `Medium`, and `High`; this is controlled by OpenAI and may change.
- Pro-only entries such as `Extra High`, `Pro Extended`, and some tools only work when the active account already has access.
- Regional rollout, experiments, workspace policies, account flags, or temporary service changes can change what appears.

## Install

1. Download or clone this repository.
2. Open Chrome and go to `chrome://extensions`.
3. Enable Developer mode.
4. Click Load unpacked.
5. Select this repository folder.
6. Open or reload `https://chatgpt.com`.

For a Chrome-created ChatGPT PWA/app window, close and reopen the PWA after loading or reloading the extension.

## Update After Local Changes

1. Go to `chrome://extensions`.
2. Click the reload icon on `ChatGPT Web Shortcuts`.
3. Reload or reopen the ChatGPT page/PWA window.

## How It Works

The content script listens for keyboard events inside the ChatGPT page.

For model shortcuts, it finds the bottom composer model pill, opens the menu, and clicks the matching `menuitemradio`.

For tool shortcuts, it finds the composer `Add files and more` button. `Create image`, `Deep research`, and `Web search` are selected from the first menu. `Agent mode` and `Create task` are selected through the `More` submenu.

The selector logic avoids ChatGPT's dynamic `radix-*` IDs and prefers visible text, ARIA roles, and composer-local controls.

## Privacy

This extension has no background service worker, no analytics, and no remote server.

It runs a content script only on the matched ChatGPT origins in `manifest.json`. It does not intentionally collect, store, upload, or transmit conversation content.

## Disclaimer

This is an unofficial community project. It is not affiliated with, endorsed by, sponsored by, or supported by OpenAI.

ChatGPT, OpenAI, and related names are trademarks or registered trademarks of their respective owners.

Use this extension at your own risk. ChatGPT Web can change at any time, and this extension may stop working or click the wrong UI if the page changes materially.

## License

MIT. See [LICENSE](LICENSE).
