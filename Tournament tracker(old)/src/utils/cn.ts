// Tiny utility to combine class names
export const cn = (...args: (string | false | null | undefined)[]) =>
  args.filter(Boolean).join(' ');
