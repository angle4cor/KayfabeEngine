import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function WriteRP() {
  const { worldId } = useParams();
  const { t } = useTranslation();
  return (
    <div style={{ padding: '2rem' }}>
      <h1>{t('rp.writeTitle')}</h1>
      <p>World: {worldId}</p>
      <Link to="/">← {t('nav.back')}</Link>
    </div>
  );
}
