import { useMemo } from 'react';
import './styles.css';

const modes = ['normal', 'compact', 'stealth'] as const;

export const App: React.FC = () => {
  const plannedFeatures = useMemo(
    () => [
      '右下常駐の透過ウィンドウ',
      'normal / compact / stealth の表示モード',
      'Firebase Auth（メール＋パスワード）による1度きりのログイン',
      'Google Calendar から今日の予定を取得',
      '開始前のデスクトップ通知',
      '将来の自然文イベント追加の余白を残す'
    ],
    []
  );

  return (
    <div className="app">
      <header className="hero">
        <h1>AIエージェント プロトタイプ v0.2</h1>
        <p>Electron + React + TypeScript 構成のスケルトンです。</p>
      </header>

      <section className="panel">
        <h2>表示モード</h2>
        <ul className="chips">
          {modes.map((mode) => (
            <li key={mode} className="chip">
              {mode}
            </li>
          ))}
        </ul>
        <p className="note">この段階では UI の骨組みのみ。次のステップで切り替えを実装します。</p>
      </section>

      <section className="panel">
        <h2>予定している機能</h2>
        <ul className="bullet">
          {plannedFeatures.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="panel">
        <h2>開発の進め方</h2>
        <ol className="steps">
          <li>プロジェクト構成とパッケージセットアップ（このステップ）</li>
          <li>Electron メインプロセスで右下ウィンドウを生成</li>
          <li>preload と IPC 設計</li>
          <li>React UI でモード切り替え</li>
          <li>Firebase Auth 連携</li>
          <li>Google Calendar API 連携</li>
          <li>通知機能とスケジューラ</li>
        </ol>
      </section>
    </div>
  );
};
