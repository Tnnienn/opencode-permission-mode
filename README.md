# opencode-permission-mode

Dynamically switch opencode's permission mode at runtime — without editing `opencode.json`.

## Modes

| Mode | Behaviour |
|------|-----------|
| `free` | Allow everything — no prompts |
| `cautious` | Allow reads (read/glob/grep/list) and `git *` commands automatically; ask for everything else |
| `locked` | Allow reads only; deny writes and commands |
| `ask` | Vanilla opencode — ask for everything |

Default is **cautious**.

## Usage

Once installed, just tell opencode to switch modes:

```
Switch to free mode
Set permission mode to locked
Go back to cautious
```

The assistant will call the `set_permission_mode` tool automatically.

## How it works

The plugin intercepts opencode's `permission.ask` hook. Every time a tool invocation needs approval, the plugin checks the current mode and either allows, denies, or lets the default prompt through.

The mode is persisted to `~/.config/opencode/permission-mode.json` so it survives restarts.

## Install

```bash
npm install -g opencode-permission-mode
```

Or install from npm:

```bash
npm install opencode-permission-mode
```

Then add it to your `opencode.json`:

```json
{
  "plugin": ["opencode-permission-mode"]
}
```

## Build from source

```bash
git clone https://github.com/Tnnienn/opencode-permission-mode.git
cd opencode-permission-mode
npm install
npm run build
```

Then reference the built path in `opencode.json`:

```json
{
  "plugin": ["/path/to/opencode-permission-mode"]
}
```

## Build

```bash
npm run build
```

## License

MIT
