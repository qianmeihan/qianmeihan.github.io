import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EducationSection } from './EducationSection';
import { EngineeringSection } from './EngineeringSection';
import { ExperienceSection } from './ExperienceSection';
import { IndustryContextSection } from './IndustryContextSection';
import { PatentSection } from './PatentSection';
import { SkillsSection } from './SkillsSection';

describe('optional portfolio sections', () => {
  it.each([
    ['experience', <ExperienceSection key="experience" items={[]} locale="zh" />],
    ['engineering', <EngineeringSection key="engineering" items={[]} locale="zh" />],
    ['patents', <PatentSection key="patents" items={[]} locale="zh" />],
    ['skills', <SkillsSection key="skills" groups={[]} locale="zh" />],
    ['education', <EducationSection key="education" items={[]} locale="zh" />],
    [
      'industry context',
      <IndustryContextSection key="industry" items={[]} locale="zh" />,
    ],
  ])('does not render an empty %s block', (_name, element) => {
    const { container } = render(element);
    expect(container).toBeEmptyDOMElement();
  });
});
