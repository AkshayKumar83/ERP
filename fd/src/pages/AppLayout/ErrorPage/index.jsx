
import { Link } from 'react-router-dom';
import styles from './style.module.scss';

const ErrorPage = () => {
  return (
    <div className={styles['error__container']}>
      <div className={styles['error__content']}>
        <h1 className={styles['error__code']}>404</h1>
        <h2 className={styles['error__message']}>Page Not Found</h2>
        <p className={styles['error__description']}>
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className={styles['home__link']}>Go to Home</Link>
      </div>
    </div>
  );
};

export default ErrorPage;
