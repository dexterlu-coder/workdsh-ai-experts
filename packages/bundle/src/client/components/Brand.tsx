import * as React from 'react';
import { academyBrand, LogoMark } from 'workdsh-ui';

type BrandSlotProps = { readonly className?: string };

export function BrandName({ className }: BrandSlotProps) {
  return <span className={className} data-testid="academy-brand">{academyBrand.name}</span>;
}

export function BrandMark({ className }: BrandSlotProps) {
  return <LogoMark className={className} size={22} title={academyBrand.name} />;
}

export function DiagnosticsMark({ className }: BrandSlotProps) {
  return <LogoMark className={className} size={22} title={academyBrand.name} />;
}

export function HeroMark({ size = 34, className }: BrandSlotProps & { readonly size?: number }) {
  return <LogoMark className={className} size={size} title={academyBrand.name} />;
}
