import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import GlobalLoader from '../components/loaders/GlobalLoader.jsx';
import LoginPage from '../pages/auth/LoginPage.jsx';
import OESLandingPage from '../pages/oes/OESLandingPage.jsx';
import OESLayout from '../pages/oes/OESLayout.jsx';
import { OESAttempt, OESExams, OESHelp, OESOverview, OESQuestionBank, OESResults } from '../pages/oes/OESWorkspace.jsx';
import useAuthStore from '../store/auth.store.js';

function PrivateRoute() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  return isLoggedIn ? <Outlet/> : <Navigate to="/login" replace/>;
}

function ExaminerRoute() {
  const role = useAuthStore((s) => s.user?.platformRole);
  return role === 'ADMIN' ? <Outlet/> : <Navigate to="/dashboard" replace/>;
}

function StudentRoute() {
  const role = useAuthStore((s) => s.user?.platformRole);
  return role !== 'ADMIN' ? <Outlet/> : <Navigate to="/dashboard" replace/>;
}

export default function AppRoutes() {
  const hydrated = useAuthStore((s) => s.hydrated);
  if (!hydrated) return <GlobalLoader showTagline={false}/>;
  return <Routes>
    <Route path="/" element={<OESLandingPage/>}/>
    <Route path="/login" element={<LoginPage/>}/>
    <Route path="/register" element={<Navigate to="/login" replace/>}/>
    <Route element={<PrivateRoute/>}><Route element={<OESLayout/>}>
      <Route path="/dashboard" element={<OESOverview/>}/>
      <Route path="/dashboard/results" element={<OESResults/>}/>
      <Route path="/dashboard/results/:attemptId" element={<OESResults/>}/>
      <Route path="/dashboard/help" element={<OESHelp/>}/>
      <Route element={<ExaminerRoute/>}>
        <Route path="/dashboard/questions" element={<OESQuestionBank/>}/>
        <Route path="/dashboard/exams" element={<OESExams/>}/>
      </Route>
      <Route element={<StudentRoute/>}><Route path="/dashboard/attempt/:examId" element={<OESAttempt/>}/></Route>
    </Route></Route>
    <Route path="*" element={<Navigate to="/dashboard" replace/>}/>
  </Routes>;
}
