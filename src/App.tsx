import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Guitar as Hospital, Pill as Pills, Users, Activity, Home, LogOut } from 'lucide-react';
import { supabase } from './lib/supabase';

// Import components
import Dashboard from './components/Dashboard';
import Hospitals from './components/Hospitals';
import Medications from './components/Medications';
import Patients from './components/Patients';
import Usage from './components/Usage';
import Auth from './components/Auth';

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (!session) {
    return <Auth />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Sidebar */}
        <nav className="fixed top-0 left-0 h-full w-64 bg-white shadow-lg">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-blue-600">Medic Source</h1>
            <p className="text-sm text-gray-500">Supply Chain Management</p>
          </div>
          <ul className="space-y-2 p-4">
            <li>
              <Link to="/" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-600">
                <Home size={20} />
                <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link to="/hospitals" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-600">
                <Hospital size={20} />
                <span>Hospitals</span>
              </Link>
            </li>
            <li>
              <Link to="/medications" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-600">
                <Pills size={20} />
                <span>Medications</span>
              </Link>
            </li>
            <li>
              <Link to="/patients" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-600">
                <Users size={20} />
                <span>Patients</span>
              </Link>
            </li>
            <li>
              <Link to="/usage" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-600">
                <Activity size={20} />
                <span>Usage Tracking</span>
              </Link>
            </li>
          </ul>
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-red-50 text-red-600 hover:text-red-700 w-full"
            >
              <LogOut size={20} />
              <span>Sign Out</span>
            </button>
          </div>
        </nav>

        {/* Main content */}
        <div className="ml-64 p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/hospitals" element={<Hospitals />} />
            <Route path="/medications" element={<Medications />} />
            <Route path="/patients" element={<Patients />} />
            <Route path="/usage" element={<Usage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;