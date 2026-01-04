'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ApiService from '@/lib/service/ApiService';
import { AdminRoute } from '@/lib/service/guard';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';

export default function ManageRoomPricesPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const [periods, setPeriods] = useState<any[]>([]);
    const [roomTypes, setRoomTypes] = useState<string[]>([]);
    const [selectedRoomType, setSelectedRoomType] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch room types
                const types = await ApiService.getRoomTypes();
                setRoomTypes(types);

                // Fetch all periods
                const response = await ApiService.getAllRoomPricePeriods();
                if (response.statusCode === 200) {
                    setPeriods(response.roomPricePeriodList || []);
                }
            } catch (error: any) {
                console.error('Error fetching data:', error.message);
                setError(error.response?.data?.message || error.message);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const fetchPeriodsByType = async () => {
            if (selectedRoomType) {
                try {
                    const response = await ApiService.getRoomPricePeriodsByRoomType(selectedRoomType);
                    if (response.statusCode === 200) {
                        setPeriods(response.roomPricePeriodList || []);
                    }
                } catch (error: any) {
                    console.error('Error fetching periods:', error.message);
                    setError(error.response?.data?.message || error.message);
                }
            } else {
                // Fetch all periods
                try {
                    const response = await ApiService.getAllRoomPricePeriods();
                    if (response.statusCode === 200) {
                        setPeriods(response.roomPricePeriodList || []);
                    }
                } catch (error: any) {
                    console.error('Error fetching periods:', error.message);
                    setError(error.response?.data?.message || error.message);
                }
            }
        };

        fetchPeriodsByType();
    }, [selectedRoomType]);

    const handleDelete = async (periodId: number) => {
        if (!window.confirm(t('admin.confirmDeletePricePeriod') || 'Are you sure you want to delete this price period?')) {
            return;
        }

        try {
            const response = await ApiService.deleteRoomPricePeriod(periodId.toString());
            if (response.statusCode === 200) {
                setSuccess(t('admin.successDeletePricePeriod') || 'Price period deleted successfully');
                setTimeout(() => {
                    setSuccess('');
                    // Refresh periods list
                    if (selectedRoomType) {
                        const fetchPeriods = async () => {
                            const response = await ApiService.getRoomPricePeriodsByRoomType(selectedRoomType);
                            if (response.statusCode === 200) {
                                setPeriods(response.roomPricePeriodList || []);
                            }
                        };
                        fetchPeriods();
                    } else {
                        const fetchPeriods = async () => {
                            const response = await ApiService.getAllRoomPricePeriods();
                            if (response.statusCode === 200) {
                                setPeriods(response.roomPricePeriodList || []);
                            }
                        };
                        fetchPeriods();
                    }
                }, 2000);
            }
        } catch (error: any) {
            setError(error.response?.data?.message || error.message);
            setTimeout(() => setError(''), 5000);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('bg-BG');
    };

    return (
        <AdminRoute>
            <div className="admin-page">
                <h1>{t('admin.manageRoomPrices') || 'Manage Room Price Periods'}</h1>
                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}
                
                <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div>
                        <label style={{ marginRight: '10px' }}>{t('admin.filterByRoomType') || 'Filter by Room Type:'}</label>
                        <select 
                            value={selectedRoomType} 
                            onChange={(e) => setSelectedRoomType(e.target.value)}
                            style={{ padding: '5px', marginRight: '10px' }}
                        >
                            <option value="">{t('admin.all') || 'All'}</option>
                            {roomTypes.map((type) => (
                                <option key={type} value={type}>
                                    {type}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button 
                        className="admin-button" 
                        onClick={() => router.push('/admin/add-room-price-period')}
                    >
                        {t('admin.addPricePeriod') || 'Add Price Period'}
                    </button>
                </div>

                <div className="price-periods-list">
                    {periods.length === 0 ? (
                        <p>{t('admin.noPricePeriods') || 'No price periods found'}</p>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    <th>{t('admin.roomType') || 'Room Type'}</th>
                                    <th>{t('admin.startDate') || 'Start Date'}</th>
                                    <th>{t('admin.endDate') || 'End Date'}</th>
                                    <th>{t('admin.price') || 'Price'}</th>
                                    <th>{t('admin.description') || 'Description'}</th>
                                    <th>{t('admin.actions') || 'Actions'}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {periods.map((period: any) => (
                                    <tr key={period.id}>
                                        <td>{period.roomType}</td>
                                        <td>{formatDate(period.startDate)}</td>
                                        <td>{formatDate(period.endDate)}</td>
                                        <td>€{period.price}</td>
                                        <td>{period.description || '-'}</td>
                                        <td>
                                            <button 
                                                onClick={() => router.push(`/admin/edit-room-price-period/${period.id}`)}
                                                style={{ marginRight: '10px' }}
                                            >
                                                {t('admin.edit') || 'Edit'}
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(period.id)}
                                                style={{ backgroundColor: '#dc3545', color: 'white' }}
                                            >
                                                {t('admin.delete') || 'Delete'}
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

