import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useSearchParams, useNavigate } from 'react-router-dom';
import { useStore } from './store';
import DisclaimerModal from './components/DisclaimerModal';
import { hasAcknowledged } from './disclaimer';
import Home from './screens/Home';
import RoleSelection from './screens/RoleSelection';
import TriageScribe from './screens/TriageScribe';
import CommandDashboard from './screens/CommandDashboard';
import TreatmentAreas from './screens/TreatmentAreas';
import TransportQueue from './screens/TransportQueue';
import AfterActionReview from './screens/AfterActionReview';
import Tutorial from './screens/Tutorial';
import About from './screens/About';

function RequireSession({ children }: { children: React.ReactNode }) {
  const joinCode = useStore((s) => s.joinCode);
  if (!joinCode) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function RequireRole({ children }: { children: React.ReactNode }) {
  const joinCode = useStore((s) => s.joinCode);
  const role = useStore((s) => s.role);
  if (!joinCode) return <Navigate to="/" replace />;
  if (!role) return <Navigate to="/roles" replace />;
  return <>{children}</>;
}

function JoinCodeHandler() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const joinSession = useStore((s) => s.joinSession);
  const joinCode = searchParams.get('join');

  useEffect(() => {
    if (joinCode) {
      let cancelled = false;
      joinSession(joinCode).then((success) => {
        if (cancelled) return;
        if (success) {
          navigate('/roles', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      });
      return () => { cancelled = true; };
    }
  }, [joinCode, joinSession, navigate]);

  return null;
}

export default function App() {
  const [showDisclaimer, setShowDisclaimer] = useState(!hasAcknowledged());

  return (
    <BrowserRouter>
      <JoinCodeHandler />
      {showDisclaimer && (
        <DisclaimerModal onAccept={() => setShowDisclaimer(false)} />
      )}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/roles" element={
          <RequireSession><RoleSelection /></RequireSession>
        } />
        <Route path="/scribe" element={
          <RequireRole><TriageScribe /></RequireRole>
        } />
        <Route path="/dashboard" element={
          <RequireRole><CommandDashboard /></RequireRole>
        } />
        <Route path="/treatment" element={
          <RequireRole><TreatmentAreas /></RequireRole>
        } />
        <Route path="/transport" element={
          <RequireRole><TransportQueue /></RequireRole>
        } />
        <Route path="/review" element={
          <RequireRole><AfterActionReview /></RequireRole>
        } />
        <Route path="/tutorial" element={<Tutorial />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  );
}
