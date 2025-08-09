import { Routes, Route, useParams, useNavigate } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import LandingPage from './LandingPage';
import DataCollection from './DataCollection';
import ResultsPage from './ResultsPageEnhanced';
import PaymentPrompt from './PaymentPrompt';
import Disclaimer from './Disclaimer';
import HealthRegistration from './components/HealthRegistration';
import UserDashboard from './components/UserDashboard';
import { CaptureProvider } from './context/CaptureContext';

// Wrapper components to handle params
const DashboardWrapper = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  return <UserDashboard userId={userId} onLogout={() => navigate('/')} />;
};

const RegistrationWrapper = () => {
  const navigate = useNavigate();
  return <HealthRegistration onRegistrationComplete={(user) => navigate(`/dashboard/${user.id}`)} />;
};

function App() {
  return (
    <CaptureProvider>
      <CssBaseline />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<RegistrationWrapper />} />
        <Route path="/dashboard/:userId" element={<DashboardWrapper />} />
        <Route path="/collect" element={<DataCollection />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/pay" element={<PaymentPrompt />} />
        <Route path="/disclaimer" element={<Disclaimer />} />
      </Routes>
    </CaptureProvider>
  );
}

export default App;
