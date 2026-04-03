import React from 'react';
import styles from './index.less';

interface FieldProps {
  label?: React.ReactNode;
  value?: React.ReactNode;
  [key: string]: any;
}

const Field = ({ label, value, ...rest }: FieldProps) => (
  <div className={styles.field} {...rest}>
    <span className={styles.label}>{label}</span>
    <span className={styles.number}>{value}</span>
  </div>
);

export default Field;
