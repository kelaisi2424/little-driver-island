interface SoundToggleProps {
  muted: boolean;
  onToggle: () => void;
}

export default function SoundToggle({ muted, onToggle }: SoundToggleProps) {
  return (
    <button
      className="sound-toggle"
      onClick={onToggle}
      type="button"
      aria-label={muted ? '打开声音' : '关闭声音'}
    >
      {muted ? '🔇' : '🔊'}
    </button>
  );
}
