'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ApiService from './ApiService';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [ready, setReady] = useState(false);
    const [allowed, setAllowed] = useState(false);

    useEffect(() => {
        const isAuth = ApiService.isAuthenticated();
        setAllowed(isAuth);
        setReady(true);
        if (!isAuth) {
            router.push('/login');
        }
    }, [router]);

    // Първоначално връщаме null и на сървъра, и на клиента,
    // за да няма разминаване при hydration.
    if (!ready) {
        return null;
    }

    if (!allowed) {
        return null;
    }

    return <>{children}</>;
}

export function AdminRoute({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [ready, setReady] = useState(false);
    const [allowed, setAllowed] = useState(false);

    useEffect(() => {
        const isAdmin = ApiService.isAdmin();
        setAllowed(isAdmin);
        setReady(true);
        if (!isAdmin) {
            router.push('/login');
        }
    }, [router]);

    if (!ready) {
        return null;
    }

    if (!allowed) {
        return null;
    }

    return <>{children}</>;
}

// Route for staff (ADMIN or EDITOR) – e.g. reception
export function StaffRoute({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [ready, setReady] = useState(false);
    const [allowed, setAllowed] = useState(false);

    useEffect(() => {
        const canAccess = ApiService.isAdmin() || ApiService.isEditor();
        setAllowed(canAccess);
        setReady(true);
        if (!canAccess) {
            router.push('/login');
        }
    }, [router]);

    if (!ready) {
        return null;
    }

    if (!allowed) {
        return null;
    }

    return <>{children}</>;
}

