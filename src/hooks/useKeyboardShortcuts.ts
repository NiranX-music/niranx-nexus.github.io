import { useEffect } from "react";

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  callback: () => void;
  description: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      for (const shortcut of shortcuts) {
        const modifiersMatch =
          (shortcut.ctrlKey ?? false) === event.ctrlKey &&
          (shortcut.metaKey ?? false) === event.metaKey &&
          (shortcut.shiftKey ?? false) === event.shiftKey &&
          (shortcut.altKey ?? false) === event.altKey;

        if (
          event.key.toLowerCase() === shortcut.key.toLowerCase() &&
          modifiersMatch
        ) {
          // Don't trigger if user is typing in an input/textarea
          const target = event.target as HTMLElement;
          if (
            target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.isContentEditable
          ) {
            continue;
          }

          event.preventDefault();
          shortcut.callback();
          break;
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts]);
}

// Helper to format shortcut display
export function formatShortcut(shortcut: KeyboardShortcut): string {
  const parts: string[] = [];
  const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;

  if (shortcut.ctrlKey) parts.push(isMac ? "⌃" : "Ctrl");
  if (shortcut.metaKey) parts.push(isMac ? "⌘" : "Ctrl");
  if (shortcut.altKey) parts.push(isMac ? "⌥" : "Alt");
  if (shortcut.shiftKey) parts.push(isMac ? "⇧" : "Shift");
  
  parts.push(shortcut.key.toUpperCase());

  return parts.join(isMac ? "" : "+");
}
