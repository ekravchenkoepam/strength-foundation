import React, { FC } from 'react';

import styles from './ItemSelector.module.scss';

type AccordionProps = {
  text: string;
  callbackHandler: () => void;
  actionLabel?: string;
};

export const ItemSelector: FC<AccordionProps> = ({ text, callbackHandler, actionLabel = 'Переглянути' }) => {
  return (
    <div className={styles.item} onClick={callbackHandler}>
      <div className={styles.header}>
        {text}
        <div className={styles.arrowContainer}>
          <span>{actionLabel}</span>
          <img src="/images/pointer-right.svg" className={styles.arrow} alt="arrow" />
        </div>
      </div>
    </div>
  );
};
