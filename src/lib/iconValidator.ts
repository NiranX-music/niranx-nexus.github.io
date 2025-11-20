import * as LucideIcons from "lucide-react";

// Get all valid lucide icon names
export const validLucideIcons = Object.keys(LucideIcons).filter(
  (key) => typeof (LucideIcons as any)[key] === 'function' && key !== 'createLucideIcon'
);

// Validate if an icon name exists in lucide-react
export function isValidLucideIcon(iconName: string): boolean {
  return validLucideIcons.includes(iconName);
}

// Get a valid fallback icon name
export function getValidIconOrFallback(iconName: string | null | undefined): string {
  if (!iconName) return 'Star';
  if (isValidLucideIcon(iconName)) return iconName;
  
  // Map common invalid icons to valid alternatives
  const iconMap: Record<string, string> = {
    'History': 'ScrollText',
    'Save': 'Save',
    'File': 'FileText',
  };
  
  return iconMap[iconName] || 'Star';
}

// Get the icon component safely
export function getLucideIcon(iconName: string | null | undefined) {
  const validName = getValidIconOrFallback(iconName);
  return (LucideIcons as any)[validName] as React.ComponentType<any>;
}
