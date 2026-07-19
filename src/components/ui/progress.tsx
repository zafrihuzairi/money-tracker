export function Progress({ value }: { value: number }) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-black/[0.06]">
      <div
        className="h-full rounded-full bg-gradient-to-r from-gold-400 to-gold-600 transition-all duration-500 motion-reduce:transition-none"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
