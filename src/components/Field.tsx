export function Input({ label, value, onChange, type = "text", readOnly }: { label: string; value: string; onChange: (v: string) => void; type?: string; readOnly?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        readOnly={readOnly}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-input bg-secondary px-3 py-2.5 outline-none focus:border-primary read-only:opacity-60"
      />
    </label>
  );
}
