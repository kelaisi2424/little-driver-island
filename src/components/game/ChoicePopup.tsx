interface ChoicePopupProps {
  title: string;
  options: Array<{
    label: string;
    value: string;
  }>;
  hint?: string;
  onChoose: (value: string) => void;
}

export default function ChoicePopup({
  title,
  options,
  hint,
  onChoose,
}: ChoicePopupProps) {
  return (
    <div className="choice-popup">
      <div className="choice-card">
        <h2>{title}</h2>
        <div className="choice-buttons">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => onChoose(option.value)}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
        {hint && <p>{hint}</p>}
      </div>
    </div>
  );
}
