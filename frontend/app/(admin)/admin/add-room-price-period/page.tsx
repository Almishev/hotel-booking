'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ApiService from '@/lib/service/ApiService';
import { AdminRoute } from '@/lib/service/guard';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';

export default function AddRoomPricePeriodPage() {
    const { t } = useTranslation();
    const router = useRouter();
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

    useEffect(() => {
        const fetchRoomTypes = async () => {
            try {
                const types = await ApiService.getRoomTypes();
                setRoomTypes(types || []);
            } catch (error: any) {
                console.error('Error fetching room types:', error.message);
            }
        };
        fetchRoomTypes();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setPeriodDetails(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    const addPeriod = async () => {
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

            const response = await ApiService.addRoomPricePeriod(periodData);

            if (response.statusCode === 200) {
                setSuccess(t('admin.successAddPricePeriod') || 'Price period added successfully');
                setTimeout(() => {
                    router.push('/admin/manage-room-prices');
                }, 2000);
            } else {
                setError(response.message || 'Error adding price period');
                setTimeout(() => setError(''), 5000);
            }
        } catch (error: any) {
            console.error('Error adding price period:', error);
            if (error.response) {
                setError(error.response.data?.message || error.response.statusText || 'Error adding price period');
            } else if (error.request) {
                setError('No response from server. Please check your connection.');
            } else {
                setError(error.message || 'Error adding price period');
            }
            setTimeout(() => setError(''), 5000);
        }
    };

    return (
        <AdminRoute>
            <div className="edit-room-container">
                <h2>{t('admin.addPricePeriod') || 'Add Price Period'}</h2>
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
                        <button onClick={addPeriod} className="admin-button">
                            {t('admin.addPricePeriod') || 'Add Price Period'}
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

