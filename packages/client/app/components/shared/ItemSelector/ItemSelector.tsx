import React, { FC } from 'react';

import styles from './ItemSelector.module.scss';

type AccordionProps = {
  text: string;
  callbackHandler: () => void;
};

export const ItemSelector: FC<AccordionProps> = ({ text, callbackHandler }) => {
  return (
    <div className={styles.item} onClick={callbackHandler}>
      <div className={styles.header}>
        {text}
        <div className={styles.arrowContainer}>
          <span>Переглянути</span>
          <img src="/images/pointer-right.svg" className={styles.arrow} alt="arrwo"/>
        </div>
      </div>
    </div>
  );
};
