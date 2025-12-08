import React, { useState } from "react";
import "./styles.css";

type DisplayMode = "normal" | "compact";

const App: React.FC = () => {
  const [mode, setMode] = useState<DisplayMode>("normal");

  const handleModeChange = (next: DisplayMode) => {
    setMode(next);

    // 後で Electron 側とつなぐ用（まだ実装してなくてもOK）
    if (window.electronAPI?.setDisplayMode) {
      window.electronAPI.setDisplayMode(next);
    }
  };

  return (
    <div className={`agent-root agent-root--${mode}`}>
      {mode === "normal" ? (
        <div className="agent-card">
          <div className="agent-header">
            <div className="agent-title">AIエージェント プロトタイプ v0.2</div>
            <div className="agent-subtitle">
              Electron + React + TypeScript
              <br />
              構成のスケルトンです。
            </div>
          </div>

          <div className="agent-section">
            <div className="agent-section-title">表示モード</div>
            <div className="agent-mode-buttons">
              <button
                className={
                  mode === "normal"
                    ? "agent-mode-button agent-mode-button--active"
                    : "agent-mode-button"
                }
                onClick={() => handleModeChange("normal")}
              >
                NORMAL
              </button>
              <button
                className={
                  mode === "compact"
                    ? "agent-mode-button agent-mode-button--active"
                    : "agent-mode-button"
                }
                onClick={() => handleModeChange("compact")}
              >
                COMPACT
              </button>
            </div>
          </div>

          <div className="agent-footer">
            この段階では UI の骨組みのみ
          </div>
        </div>
      ) : (
        <div className="agent-compact">
          <div className="agent-compact-circle">
            <span className="agent-compact-face">🤖</span>
          </div>
          <div className="agent-compact-tooltip">
            NORMALに戻すにはクリック
          </div>

          <button
            className="agent-compact-overlay"
            onClick={() => handleModeChange("normal")}
            aria-label="NORMALモードに戻す"
          />
        </div>
      )}
    </div>
  );
};

export default App;
