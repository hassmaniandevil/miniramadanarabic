'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface UserInfo {
  id: string;
  email: string | undefined;
}

interface FamilyInfo {
  id?: string;
  family_name?: string;
  profiles?: unknown[];
  [key: string]: unknown;
}

export default function DebugPage() {
  const [authStatus, setAuthStatus] = useState<string>('Checking...');
  const [userData, setUserData] = useState<UserInfo | null>(null);
  const [familyData, setFamilyData] = useState<FamilyInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient();

        // Check session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.log('Session:', session, 'Error:', sessionError);

        if (sessionError) {
          setAuthStatus('Session error: ' + sessionError.message);
          return;
        }

        if (!session) {
          setAuthStatus('No session found');
          return;
        }

        setAuthStatus('Authenticated');
        setUserData({
          id: session.user.id,
          email: session.user.email,
        });

        // Try to fetch family
        const { data: family, error: familyError } = await supabase
          .from('families')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        if (familyError) {
          setError('Family error: ' + familyError.message + ' (code: ' + familyError.code + ')');
        } else {
          setFamilyData(family);
        }

        // Try to fetch profiles if family exists
        if (family) {
          const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('*')
            .eq('family_id', family.id);

          if (profilesError) {
            setError(prev => (prev || '') + ' | Profiles error: ' + profilesError.message);
          } else {
            setFamilyData(prev => prev ? { ...prev, profiles } : null);
          }
        }
      } catch (err) {
        setError('Exception: ' + (err instanceof Error ? err.message : 'Unknown'));
      }
    };

    checkAuth();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-6">Debug Page</h1>

      <div className="space-y-4">
        <div className="p-4 bg-slate-800 rounded-lg">
          <h2 className="font-semibold text-amber-400">Auth Status</h2>
          <p>{authStatus}</p>
        </div>

        {userData && (
          <div className="p-4 bg-slate-800 rounded-lg">
            <h2 className="font-semibold text-amber-400">User Data</h2>
            <pre className="text-sm overflow-auto">{JSON.stringify(userData, null, 2)}</pre>
          </div>
        )}

        {familyData && (
          <div className="p-4 bg-slate-800 rounded-lg">
            <h2 className="font-semibold text-amber-400">Family Data</h2>
            <pre className="text-sm overflow-auto">{JSON.stringify(familyData, null, 2)}</pre>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-900/50 rounded-lg">
            <h2 className="font-semibold text-red-400">Errors</h2>
            <p>{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
