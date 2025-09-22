import { FC } from 'react';
import clsx from 'clsx';

import styles from './button.module.scss';

export enum ButtonTypeEnum {
  Primary = 'primary',
  Secondary = 'secondary',
  Transparent = 'transparent',
}

export interface ButtonProps {
  label: string;
  type?: ButtonTypeEnum;
  isDisabled?: boolean;
  className?: string;
  onClick?: () => void;
}

export const Button: FC<ButtonProps> = ({
  label,
  type = ButtonTypeEnum.Primary,
  isDisabled = false,
  className,
  onClick,
}) => (
  <button
    className={clsx(
      'h8',
      className,
      styles.button,
      styles[type]
    )}
    disabled={isDisabled}
    onClick={onClick}
  >
    {label}
  </button>
);
