import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { AppBanner } from './AppBanner';

describe('AppBanner', () => {
  it('exposes status role and content', () => {
    render(<AppBanner title="Synced" message="Your data is up to date." tone="success" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Synced')).toBeInTheDocument();
    expect(screen.getByText('Your data is up to date.')).toBeInTheDocument();
  });

  it('calls onDismiss when the close button is pressed', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();

    render(
      <AppBanner
        title="Dismissible"
        message="Tap X to close."
        tone="info"
        onDismiss={onDismiss}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
