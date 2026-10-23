
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import styles from './style.module.scss';
import SelectField from '../../../components/GenricComponents/Form/Select';

const ChangeFinYear = ({ isOpen, onClose }) => {
  const [finYear, setFinYear] = useState("");

  useEffect(() => {
    // Add/remove class to body to prevent scrolling when modal is open
    if (isOpen) {
      document.body.classList.add(styles.noScroll);
    } else {
      document.body.classList.remove(styles.noScroll);
    }

    return () => {
      document.body.classList.remove(styles.noScroll);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>Change Finance Year</h2>
          <button className={styles.closeButton} onClick={onClose}>
            &times;
          </button>
        </div>
        <div className={styles.content}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Finance Year</label>
            <SelectField
              name="fin_year"
              value={finYear}
              onChange={(e) => setFinYear(e.target.value)}
              options={[
                { value: '2023-2024', label: '2023-2024' },
                { value: '2022-2023', label: '2022-2023' },
              ]}
              required={true}
            />
          </div>
        </div>
        <div className={styles.footer}>
          <button className={styles.button} onClick={onClose}>
            Cancel
          </button>
          <button className={styles.button} onClick={() => {/* Handle OK action */}}>
            OK
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default ChangeFinYear;