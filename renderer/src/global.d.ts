export {};

declare global {
  interface Window {
    electronAPI?: {
      setDisplayMode: (mode: "normal" | "compact") => void;
    };
  }
}
