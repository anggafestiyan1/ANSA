import { brandIcon } from '../../brand-icon';

const SIZES = [192, 512];

export function generateStaticParams() {
  return SIZES.map((size) => ({ size: String(size) }));
}

export const dynamicParams = false;

export async function GET(_req: Request, ctx: { params: Promise<{ size: string }> }) {
  return brandIcon(Number((await ctx.params).size));
}
