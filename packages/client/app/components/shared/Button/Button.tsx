import clsx from 'clsx';
import Link from 'next/link';
import { FC } from 'react';

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
  href?: string;
  onClick?: () => void;
}

export const Button: FC<ButtonProps> = ({
  label,
  type = ButtonTypeEnum.Primary,
  isDisabled = false,
  className,
  href,
  onClick,
}) => {
  const buttonClassName = clsx('h8', styles.button, styles[type], className);

  if (href && !isDisabled) {
    return (
      <Link href={href} className={buttonClassName} onClick={onClick}>
        {label}
      </Link>
    );
  }

  return (
    <button className={buttonClassName} disabled={isDisabled} onClick={onClick}>
      {label}
    </button>
  );
};
