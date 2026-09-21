import type { ReactNode } from 'react';

interface SectionHeadingProps {
  number: string;
  title: ReactNode;
  aside?: ReactNode;
}

export function SectionHeading({ number, title, aside }: SectionHeadingProps) {
  return (
    <header className="section-heading">
      <div>
        <span className="section-heading__number" aria-hidden="true">
          {number}
        </span>
        <h2>{title}</h2>
      </div>
      {aside ? <p className="section-heading__aside">{aside}</p> : null}
    </header>
  );
}
