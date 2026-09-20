/**
 * Student Avatar Generator Utility
 * Generates deterministic, stylish vector avatars based on the student's Khmer & Latin name.
 */

export interface AvatarOptions {
  aspectRatio?: 'square' | '3x4'; // 'square' for lists/tables, '3x4' for ID cards & dossiers
  size?: number; // base size
}

interface ColorPair {
  id: string;
  from: string;
  to: string;
  accent: string;
  text: string;
}

const COLOR_PALETTES: ColorPair[] = [
  { id: 'indigo', from: '#4338ca', to: '#312e81', accent: '#a5b4fc', text: '#ffffff' },
  { id: 'blue', from: '#1d4ed8', to: '#1e3a8a', accent: '#93c5fd', text: '#ffffff' },
  { id: 'sky', from: '#0369a1', to: '#0c4a6e', accent: '#7dd3fc', text: '#ffffff' },
  { id: 'teal', from: '#0f766e', to: '#134e4a', accent: '#5eead4', text: '#ffffff' },
  { id: 'emerald', from: '#047857', to: '#064e3b', accent: '#6ee7b7', text: '#ffffff' },
  { id: 'violet', from: '#6d28d9', to: '#4c1d95', accent: '#c4b5fd', text: '#ffffff' },
  { id: 'purple', from: '#7e22ce', to: '#581c87', accent: '#d8b4fe', text: '#ffffff' },
  { id: 'rose', from: '#be123c', to: '#881337', accent: '#fda4af', text: '#ffffff' },
  { id: 'pink', from: '#be185d', to: '#831843', accent: '#f9a8d4', text: '#ffffff' },
  { id: 'amber', from: '#b45309', to: '#78350f', accent: '#fcd34d', text: '#ffffff' },
  { id: 'cyan', from: '#0e7490', to: '#164e63', accent: '#67e8f9', text: '#ffffff' },
];

/**
 * Deterministic hash function for student name string
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Extracts initials or key monogram characters from student's Khmer and Latin names
 */
export function getStudentInitials(nameKhmer: string, nameLatin?: string): {
  khmerMain: string;
  khmerSub: string;
  latinInitials: string;
} {
  const cleanKhmer = (nameKhmer || '').trim();
  const cleanLatin = (nameLatin || '').trim();

  // Khmer: split by space or zero-width space
  const khmerParts = cleanKhmer.split(/\s+/).filter(Boolean);
  let khmerMain = 'ស';
  let khmerSub = '';

  if (khmerParts.length >= 2) {
    // Given name is usually the last word in Khmer
    const lastName = khmerParts[0];
    const firstName = khmerParts[khmerParts.length - 1];
    khmerMain = firstName.charAt(0) || 'ស';
    khmerSub = lastName.charAt(0);
  } else if (khmerParts.length === 1 && cleanKhmer.length > 0) {
    khmerMain = cleanKhmer.charAt(0);
  }

  // Latin initials e.g. "Chea Pisey" -> "CP"
  const latinParts = cleanLatin.split(/\s+/).filter(Boolean);
  let latinInitials = '';
  if (latinParts.length >= 2) {
    latinInitials = (latinParts[0].charAt(0) + latinParts[latinParts.length - 1].charAt(0)).toUpperCase();
  } else if (latinParts.length === 1) {
    latinInitials = latinParts[0].slice(0, 2).toUpperCase();
  }

  return { khmerMain, khmerSub, latinInitials };
}

/**
 * Gets a deterministic color palette based on name and optional gender hint
 */
export function getStudentPalette(name: string, gender?: string): ColorPair {
  const seed = (name || '').trim();
  const hash = hashString(seed || 'student');

  if (gender === 'ស្រី') {
    // Bias towards warm / rose / purple / teal palettes for female
    const femaleIndices = [0, 5, 6, 7, 8, 3];
    const pickedIndex = femaleIndices[hash % femaleIndices.length];
    return COLOR_PALETTES[pickedIndex];
  } else if (gender === 'ប្រុស') {
    // Bias towards indigo / blue / sky / emerald / cyan for male
    const maleIndices = [0, 1, 2, 4, 9, 10];
    const pickedIndex = maleIndices[hash % maleIndices.length];
    return COLOR_PALETTES[pickedIndex];
  }

  return COLOR_PALETTES[hash % COLOR_PALETTES.length];
}

/**
 * Generates an SVG Data URI for the student profile photo placeholder
 */
export function generateStudentAvatarSvg(
  nameKhmer: string,
  nameLatin?: string,
  gender?: string,
  options: AvatarOptions = {}
): string {
  const { aspectRatio = 'square' } = options;
  const isCard = aspectRatio === '3x4';
  const width = 120;
  const height = isCard ? 160 : 120;

  const palette = getStudentPalette(nameKhmer || nameLatin || 'សិស្ស', gender);
  const { khmerMain, khmerSub, latinInitials } = getStudentInitials(nameKhmer, nameLatin);

  const gradId = `grad_${hashString((nameKhmer || '') + (nameLatin || ''))}`;
  const ringId = `ring_${hashString((nameKhmer || '') + '_ring')}`;

  const cx = width / 2;
  const cy = isCard ? 65 : 60;
  const radius = isCard ? 38 : 42;

  // Modern SVG Avatar Graphic
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${palette.from}" />
      <stop offset="100%" stop-color="${palette.to}" />
    </linearGradient>
    <linearGradient id="${ringId}" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${palette.accent}" stop-opacity="0.6" />
      <stop offset="100%" stop-color="${palette.accent}" stop-opacity="0.1" />
    </linearGradient>
  </defs>

  <!-- Background Canvas -->
  <rect width="${width}" height="${height}" fill="url(#${gradId})" rx="${isCard ? '8' : '0'}" />

  <!-- Subtle Geometric Elements -->
  <circle cx="${cx}" cy="${cy}" r="${radius + 10}" fill="none" stroke="url(#${ringId})" stroke-width="2" stroke-dasharray="4 4" />
  <circle cx="${cx}" cy="${cy}" r="${radius}" fill="#ffffff" fill-opacity="0.12" stroke="${palette.accent}" stroke-opacity="0.4" stroke-width="1.5" />
  
  <!-- Stylized Monogram Graphic -->
  <text 
    x="${cx}" 
    y="${cy + (isCard ? 13 : 14)}" 
    font-family="system-ui, -apple-system, 'Siemreap', 'Kantumruy Pro', 'Battambang', sans-serif" 
    font-size="${isCard ? '38' : '40'}" 
    font-weight="bold" 
    fill="#ffffff" 
    text-anchor="middle"
    letter-spacing="0"
  >${khmerMain}</text>

  ${
    khmerSub
      ? `<text 
          x="${cx + radius - 6}" 
          y="${cy - radius + 14}" 
          font-family="system-ui, sans-serif" 
          font-size="11" 
          font-weight="700" 
          fill="${palette.accent}" 
          text-anchor="middle"
        >${khmerSub}</text>`
      : ''
  }

  ${
    isCard
      ? `<!-- Bottom Badge for 3x4 Portrait Card -->
         <rect x="${cx - 40}" y="${height - 32}" width="80" height="20" rx="10" fill="#ffffff" fill-opacity="0.18" stroke="${palette.accent}" stroke-opacity="0.3" />
         <text 
           x="${cx}" 
           y="${height - 18}" 
           font-family="system-ui, sans-serif" 
           font-size="10" 
           font-weight="bold" 
           letter-spacing="1" 
           fill="#ffffff" 
           text-anchor="middle"
         >${latinInitials || (gender === 'ស្រី' ? 'STUDENT' : 'STUDENT')}</text>`
      : ''
  }
</svg>
  `.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Returns student's photoUrl, avatarPlaceholder, or generates a new avatar SVG on the fly
 */
export function getStudentAvatarUrl(
  student?: {
    nameKhmer?: string;
    nameLatin?: string;
    gender?: string;
    photoUrl?: string;
    avatarPlaceholder?: string;
  } | null,
  aspectRatio: 'square' | '3x4' = 'square'
): string {
  if (!student) {
    return generateStudentAvatarSvg('សិស្ស', undefined, undefined, { aspectRatio });
  }

  if (student.photoUrl && student.photoUrl.trim()) {
    return student.photoUrl;
  }

  if (student.avatarPlaceholder && student.avatarPlaceholder.trim()) {
    return student.avatarPlaceholder;
  }

  return generateStudentAvatarSvg(
    student.nameKhmer || 'សិស្ស',
    student.nameLatin,
    student.gender,
    { aspectRatio }
  );
}
