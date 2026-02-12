import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useWorld } from '../context/WorldContext';
import { useAuth } from '../context/AuthContext';
import { listWorlds } from '../utils/worldFirestore';

export default function WorldSelect() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    createWorld,
    createLocalWorld,
    loadWorld,
    loading,
    error,
    meta,
  } = useWorld();
  const { user } = useAuth();
  const [worldList, setWorldList] = useState([]);
  const [createName, setCreateName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      listWorlds({ createdBy: user.uid }).then(setWorldList).catch(() => setWorldList([]));
    } else {
      setWorldList([]);
    }
  }, [user?.uid]);

  const handleCreateWorld = async (e) => {
    e.preventDefault();
    if (creating || loading) return;
    setCreating(true);
    const name = (createName || '').trim() || 'New World';
    const worldId = await createWorld(name, { createdBy: user?.uid ?? null });
    setCreating(false);
    if (worldId) navigate(`/world/${worldId}/career`);
  };

  const handlePlayOffline = () => {
    const worldId = createLocalWorld('Offline World');
    navigate(`/world/${worldId}/career`);
  };

  const handleEnterWorld = async (worldId) => {
    await loadWorld(worldId);
    navigate(`/world/${worldId}/career`);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '560px', margin: '0 auto' }}>
      <h1>{t('worlds.title')}</h1>
      <p>{t('worlds.subtitle')}</p>
      <Link to="/" style={{ display: 'inline-block', marginBottom: '1.5rem' }}>← {t('nav.back')}</Link>

      {error && (
        <p style={{ color: 'var(--color-error, #c00)', marginBottom: '1rem' }}>
          {t('worlds.error')}: {error.message}
        </p>
      )}

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>{t('worlds.create')}</h2>
        <form onSubmit={handleCreateWorld}>
          <input
            type="text"
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
            placeholder={t('worlds.createPlaceholder')}
            style={{ padding: '0.5rem 0.75rem', marginRight: '0.5rem', minWidth: '180px' }}
            className="touch-target"
          />
          <button
            type="submit"
            disabled={creating || loading}
            style={{ padding: '0.5rem 1rem', minHeight: '44px', minWidth: '44px' }}
            className="touch-target"
          >
            {creating || loading ? t('worlds.loading') : t('worlds.create')}
          </button>
        </form>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <button
          type="button"
          onClick={handlePlayOffline}
          disabled={loading}
          style={{ padding: '0.75rem 1rem', minHeight: '44px' }}
          className="touch-target"
        >
          {t('worlds.playOffline')}
        </button>
      </section>

      {user && worldList.length > 0 && (
        <section>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>{t('worlds.myWorlds')}</h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {worldList.map((w) => (
              <li key={w.id} style={{ marginBottom: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => handleEnterWorld(w.id)}
                  style={{ padding: '0.5rem 0.75rem', minHeight: '44px', textAlign: 'left', width: '100%' }}
                  className="touch-target"
                >
                  {w.name || w.id} — {t('worlds.enterWorld')}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
