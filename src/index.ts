import type { Plugin } from "@opencode-ai/plugin";
import { tool } from "@opencode-ai/plugin/tool";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { homedir } from "os";

const MODE_FILE = join(
  process.env.XDG_CONFIG_HOME || join(homedir(), ".config"),
  "opencode",
  "permission-mode.json",
);

type Mode = "free" | "cautious" | "locked" | "ask";
const DEFAULT_MODE: Mode = "cautious";

function loadMode(): Mode {
  try {
    if (existsSync(MODE_FILE)) {
      return JSON.parse(readFileSync(MODE_FILE, "utf-8")).mode;
    }
  } catch {
    // corrupt file, fall back to default
  }
  return DEFAULT_MODE;
}

function saveMode(mode: Mode) {
  try {
    mkdirSync(join(MODE_FILE, ".."), { recursive: true });
  } catch {
    // directory already exists
  }
  writeFileSync(MODE_FILE, JSON.stringify({ mode }, null, 2));
}

export default (async () => {
  let mode: Mode = loadMode();

  return {
    tool: {
      set_permission_mode: tool({
        description:
          "Switch the assistant's permission mode at runtime. " +
          "'free' = allow everything, 'cautious' = allow reads, ask for writes/commands, " +
          "'locked' = allow reads only, deny everything else, 'ask' = vanilla opencode (ask for everything).",
        args: {
          mode: tool.schema
            .string()
            .describe("The permission mode: free, cautious, locked, ask"),
        },
        async execute({ mode: newMode }) {
          if (!["free", "cautious", "locked", "ask"].includes(newMode)) {
            return `Invalid mode "${newMode}". Valid modes: free, cautious, locked, ask.`;
          }
          mode = newMode as Mode;
          saveMode(mode);
          return `Permission mode set to: ${mode}`;
        },
      }),
    },

    "permission.ask": async (input, output) => {
      const toolName = input.type;
      const isReadOnly = ["read", "glob", "grep", "list"].includes(toolName);
      const patterns = input.pattern
        ? Array.isArray(input.pattern)
          ? input.pattern
          : [input.pattern]
        : [];
      const isGit =
        toolName === "bash" && patterns.some((p) => /^git\s/.test(p));

      switch (mode) {
        case "free":
          output.status = "allow";
          break;
        case "locked":
          output.status = isReadOnly ? "allow" : "deny";
          break;
        case "cautious":
          if (isReadOnly || isGit) {
            output.status = "allow";
          }
          break;
        case "ask":
          break;
      }
    },
  };
}) satisfies Plugin;
