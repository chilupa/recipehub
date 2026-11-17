import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { AppSelect } from './AppSelect';

describe('AppSelect', () => {
  it('renders the selected label without ion-select chrome', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <AppSelect
        ariaLabel="Theme"
        value="light"
        options={[
          { value: 'light', label: 'Light' },
          { value: 'dark', label: 'Dark' },
          { value: 'system', label: 'System' },
        ]}
        onChange={onChange}
      />,
    );

    expect(screen.getByRole('button', { name: 'Theme' })).toHaveTextContent('Light');
    expect(document.querySelector('ion-select')).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Theme' }));
    expect(document.querySelector('ion-alert.app-select-alert')).toHaveAttribute('is-open');
  });
});
