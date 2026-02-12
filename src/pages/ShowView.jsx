import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function ShowView() {
  const { worldId, showId } = useParams();
  const { t } = useTranslation();
  return (
    <div style={{ padding: '2rem' }}>
      <h1>{t('show.title')}</h1>
      <p>World: {worldId} / Show: {showId}</p>
      <Link to="/">← {t('nav.back')}</Link>
    </div>
  );
}
