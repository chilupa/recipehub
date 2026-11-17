import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AppBadge } from './AppBadge';

describe('AppBadge', () => {
  it('renders badge content', () => {
    render(<AppBadge>New</AppBadge>);
    expect(screen.getByText('New')).toBeInTheDocument();
  });
});
