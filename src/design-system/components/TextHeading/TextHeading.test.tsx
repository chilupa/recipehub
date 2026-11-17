import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TextHeading } from './TextHeading';

describe('TextHeading', () => {
  it('exposes heading role and level without using h1-h6', () => {
    const { container } = render(
      <TextHeading level={2} className="section-title">
        Updates
      </TextHeading>,
    );

    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveTextContent('Updates');
    expect(heading.tagName).toBe('P');
    expect(container.querySelector('h1, h2, h3, h4, h5, h6')).toBeNull();
  });
});
