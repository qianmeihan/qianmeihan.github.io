import { SiGithub } from '@icons-pack/react-simple-icons';

interface BrandIconProps {
  brand: 'linkedin' | 'github';
  size?: number;
}

export function BrandIcon({ brand, size = 16 }: BrandIconProps) {
  if (brand === 'github') return <SiGithub aria-hidden="true" className="brand-icon brand-icon--github" size={size} />;

  return (
    <svg aria-hidden="true" className="brand-icon brand-icon--linkedin" height={size} viewBox="0 0 24 24" width={size} fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.35V9h3.414v1.561h.049c.476-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 .001-4.124 2.062 2.062 0 0 1-.001 4.124zM3.56 9h3.55v11.452H3.56V9zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}
