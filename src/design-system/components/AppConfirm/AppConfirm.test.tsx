import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { AppConfirm } from './AppConfirm';

describe('AppConfirm', () => {
  it('passes title and message to the alert when open', () => {
    render(
      <AppConfirm
        isOpen
        title="Delete item?"
        message="This cannot be undone."
        onConfirm={vi.fn()}
        onDidDismiss={vi.fn()}
      />,
    );

    const alert = document.querySelector('ion-alert.app-confirm');
    expect(alert).not.toBeNull();
    expect(alert).toHaveAttribute('header', 'Delete item?');
    expect(alert).toHaveAttribute('message', 'This cannot be undone.');
    expect(alert).toHaveAttribute('is-open');
  });
});
