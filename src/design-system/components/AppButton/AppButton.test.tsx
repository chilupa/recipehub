import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { AppButton } from './AppButton';

describe('AppButton', () => {
  it('renders children', () => {
    render(<AppButton>Save changes</AppButton>);
    expect(screen.getByText('Save changes')).toBeInTheDocument();
  });

  it('fires onClick when enabled', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<AppButton onClick={onClick}>Continue</AppButton>);
    await user.click(screen.getByText('Continue'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not fire onClick while loading', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <AppButton loading onClick={onClick}>
        Continue
      </AppButton>,
    );
    await user.click(screen.getByText('Continue'));
    expect(onClick).not.toHaveBeenCalled();
  });
});
