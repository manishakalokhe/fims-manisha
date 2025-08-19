import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Camera } from 'lucide-react';
import { SignInForm } from './components/SignInForm';
import { FIMSDashboard } from './components/FIMSDashboard';
import { supabase } from './lib/supabase';
import type { User } from '@supabase/supabase-js';

function App() {
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already signed in
    const checkUser = async () => {
      try {
        if (!supabase) {
          console.error('Supabase client not initialized. Please check your environment variables.');
          setIsLoading(false);
          return;
        }
        
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error('Error checking user:', error);
        // Clear stale session data if JWT is invalid
        await supabase.auth.signOut();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignInSuccess = () => {
    // User state will be updated by the auth state listener
  };

  const handleSignOut = () => {
    setUser(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // If user is authenticated, show FIMS Dashboard directly
  if (user) {
    return <FIMSDashboard user={user} onSignOut={handleSignOut} />;
  }

  // Show FIMS-specific sign-in page
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* FIMS Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-r from-blue-600 to-blue-400 p-3 rounded-full shadow-lg">
                <Camera className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent mb-2">
              FIMS
            </h1>
            <p className="text-gray-600 text-sm mb-2">
              {t('systems.fims.fullName')}
            </p>
            <p className="text-gray-500 text-xs">
              {t('systems.fims.description')}
            </p>
          </div>

          {/* Sign In Form */}
          <SignInForm onSignInSuccess={handleSignInSuccess} />

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              {t('auth.secureAccess', 'Secure access to field inspection management system')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;