import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Home() {
  const { t } = useTranslation();
  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1>{t('app.title')}</h1>
      <p>{t('home.tagline')}</p>
      <nav style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <Link to="/worlds" className="touch-target" style={{ padding: '0.75rem 1rem', background: 'var(--color-accent)', color: '#000', borderRadius: '4px' }}>
          {t('nav.worlds')}
        </Link>
      </nav>
    </div>
  );
}
