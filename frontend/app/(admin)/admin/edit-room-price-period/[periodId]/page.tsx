'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ApiService from '@/lib/service/ApiService';
import { AdminRoute } from '@/lib/service/guard';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';

export default function EditRoomPricePeriodPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const params = useParams();
    const periodId = params?.periodId as string;
    
    const [periodDetails, setPeriodDetails] = useState({
        roomType: '',
        startDate: '',
        endDate: '',
        price: '',
        description: '',
    });
    const [roomTypes, setRoomTypes] = useState<string[]>([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch room types
                const types = await ApiService.getRoomTypes();
                setRoomTypes(types || []);

                // Fetch period details
                if (periodId) {
                    const response = await ApiService.getRoomPricePeriodById(periodId);
                    if (response.statusCode === 200 && response.roomPricePeriod) {
                        const period = response.roomPricePeriod;
                        setPeriodDetails({
                            roomType: period.roomType || '',
                            startDate: period.startDate ? period.startDate.split('T')[0] : '',
                            endDate: period.endDate ? period.endDate.split('T')[0] : '',
                            price: period.price?.toString() || '',
                            description: period.description || '',
                        });
                    }
                }
            } catch (error: any) {
                console.error('Error fetching data:', error.message);
                setError(error.response?.data?.message || error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [periodId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setPeriodDetails(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    const updatePeriod = async () => {
        if (!periodDetails.roomType || !periodDetails.startDate || !periodDetails.endDate || !periodDetails.price) {
            setError(t('admin.errorFill') || 'Please fill in all required fields');
            setTimeout(() => setError(''), 5000);
            return;
        }

        if (new Date(periodDetails.endDate) <= new Date(periodDetails.startDate)) {
            setError(t('admin.endDateMustBeAfterStartDate') || 'End date must be after start date');
            setTimeout(() => setError(''), 5000);
            return;
        }

        if (parseFloat(periodDetails.price) <= 0) {
            setError(t('admin.priceMustBePositive') || 'Price must be greater than zero');
            setTimeout(() => setError(''), 5000);
            return;
        }

        try {
            const periodData = {
                roomType: periodDetails.roomType,
                startDate: periodDetails.startDate,
                endDate: periodDetails.endDate,
                price: parseFloat(periodDetails.price),
                description: periodDetails.description || null,
            };

            const response = await ApiService.updateRoomPricePeriod(periodId, periodData);

            if (response.statusCode === 200) {
                setSuccess(t('admin.successUpdatePricePeriod') || 'Price period updated successfully');
                setTimeout(() => {
                    router.push('/admin/manage-room-prices');
                }, 2000);
            } else {
                setError(response.message || 'Error updating price period');
                setTimeout(() => setError(''), 5000);
            }
        } catch (error: any) {
            console.error('Error updating price period:', error);
            if (error.response) {
                setError(error.response.data?.message || error.response.statusText || 'Error updating price period');
            } else if (error.request) {
                setError('No response from server. Please check your connection.');
            } else {
                setError(error.message || 'Error updating price period');
            }
            setTimeout(() => setError(''), 5000);
        }
    };

    if (loading) {
        return (
            <AdminRoute>
                <div className="edit-room-container">
                    <p>{t('admin.loading') || 'Loading...'}</p>
                </div>
            </AdminRoute>
        );
    }

    return (
        <AdminRoute>
            <div className="edit-room-container">
                <h2>{t('admin.editPricePeriod') || 'Edit Price Period'}</h2>
                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}
                <div className="edit-room-form">
                    <div className="form-group">
                        <label>{t('admin.roomType') || 'Room Type'} *</label>
                        <select
                            name="roomType"
                            value={periodDetails.roomType}
                            onChange={handleChange}
                            required
                        >
                            <option value="">{t('admin.selectRoomType') || 'Select Room Type'}</option>
                            {roomTypes.map((type) => (
                                <option key={type} value={type}>
                                    {type}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>{t('admin.startDate') || 'Start Date'} *</label>
                        <input
                            type="date"
                            name="startDate"
                            value={periodDetails.startDate}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>{t('admin.endDate') || 'End Date'} *</label>
                        <input
                            type="date"
                            name="endDate"
                            value={periodDetails.endDate}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>{t('admin.price') || 'Price'} (€) *</label>
                        <input
                            type="number"
                            name="price"
                            value={periodDetails.price}
                            onChange={handleChange}
                            placeholder="0.00"
                            step="0.01"
                            min="0.01"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>{t('admin.description') || 'Description'}</label>
                        <textarea
                            name="description"
                            value={periodDetails.description}
                            onChange={handleChange}
                            placeholder={t('admin.enterDescription') || 'Enter description (optional)'}
                            rows={3}
                        ></textarea>
                    </div>

                    <div className="form-actions">
                        <button onClick={updatePeriod} className="admin-button">
                            {t('admin.updatePricePeriod') || 'Update Price Period'}
                        </button>
                        <button onClick={() => router.push('/admin/manage-room-prices')} className="admin-button-secondary">
                            {t('admin.cancel') || 'Cancel'}
                        </button>
                    </div>
                </div>
            </div>
        </AdminRoute>
    );
}

