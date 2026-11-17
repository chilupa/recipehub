import { IonAlert } from '@ionic/react';
import { useState } from 'react';
import type { ReactElement } from 'react';

import { AppIcon } from '../AppIcon';

import './AppSelect.css';

export interface AppSelectOption<T extends string = string> {
  value: T;
  label: string;
}

export interface AppSelectProps<T extends string = string> {
  value: T;
  options: AppSelectOption<T>[];
  onChange: (value: T) => void;
  /** Accessible name when no visible label is shown. */
  ariaLabel: string;
  /** Alert dialog header. Defaults to ariaLabel. */
  header?: string;
  placeholder?: string;
  disabled?: boolean;
  cancelText?: string;
  okText?: string;
  className?: string;
}

export function AppSelect<T extends string = string>({
  value,
  options,
  onChange,
  ariaLabel,
  header,
  placeholder = 'Select',
  disabled = false,
  cancelText = 'Cancel',
  okText = 'OK',
  className,
}: AppSelectProps<T>): ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const selectedLabel = options.find((option) => option.value === value)?.label;
  const classes = ['app-select', className].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      <button
        type="button"
        className="app-select__trigger"
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        disabled={disabled}
        onClick={() => setIsOpen(true)}
      >
        <span className="app-select__value">{selectedLabel ?? placeholder}</span>
        <AppIcon name="chevronDownOutline" size="sm" />
      </button>

      <IonAlert
        className="app-select-alert"
        isOpen={isOpen}
        header={header ?? ariaLabel}
        inputs={options.map((option) => ({
          type: 'radio' as const,
          label: option.label,
          value: option.value,
          checked: option.value === value,
        }))}
        buttons={[
          {
            text: cancelText,
            role: 'cancel',
          },
          {
            text: okText,
            handler: (selected: T) => {
              if (selected != null) {
                onChange(selected);
              }
            },
          },
        ]}
        onDidDismiss={() => setIsOpen(false)}
      />
    </div>
  );
}
