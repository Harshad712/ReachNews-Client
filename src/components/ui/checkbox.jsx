export function Checkbox({ checked, onCheckedChange }) {
    return (
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
        className="w-5 h-5 accent-blue-500"
      />
    );
  }
  