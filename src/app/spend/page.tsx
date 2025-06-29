'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/Layout';
import { AccountSpendManager } from '@/components/AccountSpendManager';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserSession } from '@/types/user';
import { 
  DollarSign, 
  User,
  LogOut,
  ArrowLeft
} from 'lucide-react';

export default function SpendPage() {
  const router = useRouter();
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const sessionData = localStorage.getItem('user_session');
    
    if (!token || !sessionData) {
      router.push('/auth');
      return;
    }

    try {
      const session = JSON.parse(sessionData) as UserSession;
      setUserSession(session);
      setIsLoading(false);
    } catch (error) {
      console.error('Invalid session data:', error);
      router.push('/auth');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_session');
    router.push('/auth');
  };

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!userSession) {
    return null;
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
          
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
                <DollarSign className="h-8 w-8 text-green-600" />
                <span>Account Spend</span>
              </h1>
              <p className="text-gray-600">
                Monitor and analyze your advertising spend across different time periods
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">{userSession.email}</span>
            </div>
            {userSession.selected_account && (
              <Badge variant="outline">
                {userSession.selected_account.account_name}
              </Badge>
            )}
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Account Spend Manager Component */}
        <AccountSpendManager userSession={userSession} />
      </div>
    </Layout>
  );
}
