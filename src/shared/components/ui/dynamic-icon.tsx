// src/shared/components/ui/dynamic-icon.tsx
import React from 'react';
import * as Icons from 'lucide-react';

type LucideIconName = keyof typeof Icons;
const FALLBACK_ICON: LucideIconName = 'Shield';

function normalizeIconName(value: string): string {
  return String(value ?? '')
    .trim()
    .replaceAll(/[-_]+/g, ' ')
    .replaceAll(/\s+/g, ' ')
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('');
}

interface DynamicIconProps {
  name: string;
  size?: number;
  className?: string;
}

export function DynamicIcon({ name, size = 20, className }: DynamicIconProps) {
  const normalized = normalizeIconName(name) as LucideIconName;
  // TypeScript estricto: inferimos que es un componente válido de Lucide
  const Icon = Icons[normalized] as React.ElementType;
  const Fallback = Icons[FALLBACK_ICON] as React.ElementType;

  const Component = Icon ?? Fallback;
  return <Component size={size} className={className} />;
}