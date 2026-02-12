import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function WorldSelect() {
  const { t } = useTranslation();
  return (
    <div style={{ padding: '2rem' }}>
      <h1>{t('worlds.title')}</h1>
      <p>{t('worlds.subtitle')}</p>
      <Link to="/">← {t('nav.back')}</Link>
    </div>
  );
}
