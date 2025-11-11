'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Sidebar from './Sidebar';
import Header from './Header';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface UserInfo {
  username: string;
  is_superuser: boolean;
}

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
      fetchUserInfo();
    }
  }, []);

  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setUserInfo({
        username: response.data.username,
        is_superuser: response.data.is_superuser
      });
    } catch (error) {
      // Silently handle auth errors (user not logged in)
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setUsername(null);
    setUserInfo(null);
    alert('로그아웃되었습니다.');
    router.push('/');
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden ml-16">
        <Header
          onMenuClick={() => {}}
          username={username}
          userInfo={userInfo}
          onLogout={handleLogout}
        />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
