'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ApiService from '@/lib/service/ApiService';
import { AdminRoute } from '@/lib/service/guard';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';

export default function ManagePackagesPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const [packages, setPackages] = useState<any[]>([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchPackages = async () => {
            try {
                const response = await ApiService.getAllHolidayPackages();
                if (response.statusCode === 200) {
                    setPackages(response.holidayPackageList || []);
                }
            } catch (error: any) {
                console.error('Error fetching packages:', error.message);
                setError(error.response?.data?.message || error.message);
            }
        };

        fetchPackages();
    }, []);

    const handleDelete = async (packageId: number) => {
        if (!window.confirm(t('admin.confirmDeletePackage'))) {
            return;
        }

        try {
            const response = await ApiService.deleteHolidayPackage(packageId.toString());
            if (response.statusCode === 200) {
                setSuccess(t('admin.successDeletePackage'));
                setTimeout(() => {
                    setSuccess('');
                    // Refresh packages list
                    const fetchPackages = async () => {
                        const response = await ApiService.getAllHolidayPackages();
                        if (response.statusCode === 200) {
                            setPackages(response.holidayPackageList || []);
                        }
                    };
                    fetchPackages();
                }, 2000);
            }
        } catch (error: any) {
            setError(error.response?.data?.message || error.message);
            setTimeout(() => setError(''), 5000);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    return (
        <AdminRoute>
            <div className="admin-page">
                <h1>{t('admin.managePackages')}</h1>
                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}
                
                <div style={{ marginBottom: '20px' }}>
                    <button 
                        className="admin-button" 
                        onClick={() => router.push('/admin/add-package')}
                    >
                        {t('admin.addPackage')}
                    </button>
                </div>

                <div className="packages-list">
                    {packages.length === 0 ? (
                        <p>{t('admin.noPackages')}</p>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    <th>{t('admin.packageName')}</th>
                                    <th>{t('admin.startDate')}</th>
                                    <th>{t('admin.endDate')}</th>
                                    <th>{t('admin.packagePrices')}</th>
                                    <th>{t('admin.isActive')}</th>
                                    <th>{t('admin.allowPartialBookings')}</th>
                                    <th>{t('admin.actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {packages.map((pkg: any) => (
                                    <tr key={pkg.id}>
                                        <td>{pkg.name}</td>
                                        <td>{formatDate(pkg.startDate)}</td>
                                        <td>{formatDate(pkg.endDate)}</td>
                                        <td>
                                            {pkg.roomTypePrices ? (
                                                <div>
                                                    {Object.entries(pkg.roomTypePrices).map(([roomType, price]: [string, any]) => (
                                                        <div key={roomType} style={{ marginBottom: '0.25rem' }}>
                                                            <strong>{roomType}:</strong> €{price}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                'N/A'
                                            )}
                                        </td>
                                        <td>{pkg.isActive ? t('admin.yes') : t('admin.no')}</td>
                                        <td>{pkg.allowPartialBookings ? t('admin.yes') : t('admin.no')}</td>
                                        <td>
                                            <button 
                                                onClick={() => router.push(`/admin/edit-package/${pkg.id}`)}
                                                style={{ marginRight: '10px' }}
                                            >
                                                {t('admin.edit')}
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(pkg.id)}
                                                style={{ backgroundColor: '#dc3545', color: 'white' }}
                                            >
                                                {t('admin.delete')}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </AdminRoute>
    );
}
