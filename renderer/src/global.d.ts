declare global {
  interface Window {
    agentAPI: {
      ping: () => string;
    };
  }
}

export {};
