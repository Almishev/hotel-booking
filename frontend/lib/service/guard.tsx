'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ApiService from './ApiService';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const router = useRouter();

    useEffect(() => {
        if (!ApiService.isAuthenticated()) {
            router.push('/login');
        }
    }, [router]);

    if (!ApiService.isAuthenticated()) {
        return null;
    }

    return <>{children}</>;
}

export function AdminRoute({ children }: { children: React.ReactNode }) {
    const router = useRouter();

    useEffect(() => {
        if (!ApiService.isAdmin()) {
            router.push('/login');
        }
    }, [router]);

    if (!ApiService.isAdmin()) {
        return null;
    }

    return <>{children}</>;
}

