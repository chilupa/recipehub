import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { AppEmptyState } from './AppEmptyState';

describe('AppEmptyState', () => {
  it('renders title and description', () => {
    render(<AppEmptyState title="No results" description="Try adjusting your filters." />);
    expect(screen.getByText('No results')).toBeInTheDocument();
    expect(screen.getByText('Try adjusting your filters.')).toBeInTheDocument();
  });

  it('invokes action callback', async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    render(<AppEmptyState title="Empty" actionLabel="Retry" onAction={onAction} />);
    await user.click(screen.getByText('Retry'));
    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
