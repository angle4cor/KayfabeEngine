import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';

function WorldRedirect() {
  const { worldId } = useParams();
  return <Navigate to={`/world/${worldId}/career`} replace />;
}
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { WorldProvider } from './context/WorldContext';

const Home = lazy(() => import('./pages/Home'));
const WorldSelect = lazy(() => import('./pages/WorldSelect'));
const MyCareer = lazy(() => import('./pages/MyCareer'));
const WriteRP = lazy(() => import('./pages/WriteRP'));
const ShowView = lazy(() => import('./pages/ShowView'));
const Roster = lazy(() => import('./pages/Roster'));

function Loading() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-dim, #888)' }}>
      Loading…
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <WorldProvider>
          <BrowserRouter>
            <Suspense fallback={<Loading />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/worlds" element={<WorldSelect />} />
                <Route path="/world/:worldId" element={<WorldRedirect />} />
                <Route path="/world/:worldId/career" element={<MyCareer />} />
                <Route path="/world/:worldId/write-rp" element={<WriteRP />} />
                <Route path="/world/:worldId/show/:showId" element={<ShowView />} />
                <Route path="/world/:worldId/roster" element={<Roster />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </WorldProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}
