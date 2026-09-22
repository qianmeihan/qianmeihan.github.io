import type { ReactNode } from 'react';

interface SectionHeadingProps {
  title: ReactNode;
}

export function SectionHeading({ title }: SectionHeadingProps) {
  return (
    <header className="section-heading">
      <h2>{title}</h2>
    </header>
  );
}
