// @strict: true
// @declaration: true
// @target: esnext


const a = 0 as any as ({ id: number; description: null; } | { id: number; description: string; })[];
type A = { id: number; }[] & { id: number; description: string | null; }[];
a satisfies A;

