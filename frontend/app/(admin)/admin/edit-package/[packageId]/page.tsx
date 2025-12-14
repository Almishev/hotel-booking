'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ApiService from '@/lib/service/ApiService';
import { AdminRoute } from '@/lib/service/guard';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';

export default function EditPackagePage() {
    const { t } = useTranslation();
    const params = useParams();
    const router = useRouter();
    const packageId = params.packageId as string;
    
    const [packageDetails, setPackageDetails] = useState({
        roomId: '',
        name: '',
        startDate: '',
        endDate: '',
        packagePrice: '',
        description: '',
        isActive: true,
        allowPartialBookings: false,
    });
    const [rooms, setRooms] = useState<any[]>([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchPackage = async () => {
            try {
                const response = await ApiService.getHolidayPackageById(packageId);
                if (response.statusCode === 200 && response.holidayPackage) {
                    const pkg = response.holidayPackage;
                    setPackageDetails({
                        roomId: pkg.room?.id?.toString() || '',
                        name: pkg.name || '',
                        startDate: pkg.startDate || '',
                        endDate: pkg.endDate || '',
                        packagePrice: pkg.packagePrice?.toString() || '',
                        description: pkg.description || '',
                        isActive: pkg.isActive !== undefined ? pkg.isActive : true,
                        allowPartialBookings: pkg.allowPartialBookings !== undefined ? pkg.allowPartialBookings : false,
                    });
                }
            } catch (error: any) {
                setError(error.response?.data?.message || error.message);
            }
        };

        const fetchRooms = async () => {
            try {
                const response = await ApiService.getAllRooms();
                if (response.statusCode === 200) {
                    setRooms(response.roomList || []);
                }
            } catch (error: any) {
                console.error('Error fetching rooms:', error.message);
            }
        };

        fetchPackage();
        fetchRooms();
    }, [packageId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setPackageDetails(prevState => ({
            ...prevState,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
        }));
    };

    const handleRadioChange = (value: boolean) => {
        setPackageDetails(prevState => ({
            ...prevState,
            allowPartialBookings: value,
        }));
    };

    const updatePackage = async () => {
        if (!packageDetails.name || !packageDetails.startDate || 
            !packageDetails.endDate || !packageDetails.packagePrice) {
            setError(t('admin.errorFill'));
            setTimeout(() => setError(''), 5000);
            return;
        }

        if (new Date(packageDetails.endDate) <= new Date(packageDetails.startDate)) {
            setError(t('admin.endDateMustBeAfterStartDate'));
            setTimeout(() => setError(''), 5000);
            return;
        }

        if (!window.confirm(t('admin.updatePackage') + '?')) {
            return;
        }

        try {
            const response = await ApiService.updateHolidayPackage(packageId, {
                roomId: packageDetails.roomId ? parseInt(packageDetails.roomId) : undefined,
                name: packageDetails.name,
                startDate: packageDetails.startDate,
                endDate: packageDetails.endDate,
                packagePrice: parseFloat(packageDetails.packagePrice),
                description: packageDetails.description || undefined,
                isActive: packageDetails.isActive,
                allowPartialBookings: packageDetails.allowPartialBookings,
            });

            if (response.statusCode === 200) {
                setSuccess(t('admin.successUpdatePackage'));
                setTimeout(() => {
                    router.push('/admin/manage-packages');
                }, 2000);
            }
        } catch (error: any) {
            setError(error.response?.data?.message || error.message);
            setTimeout(() => setError(''), 5000);
        }
    };

    return (
        <AdminRoute>
            <div className="edit-room-container">
                <h2>{t('admin.editPackage')}</h2>
                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}
                <div className="edit-room-form">
                    <div className="form-group">
                        <label>{t('admin.selectRoom')}</label>
                        <select
                            name="roomId"
                            value={packageDetails.roomId}
                            onChange={handleChange}
                        >
                            <option value="">{t('admin.selectRoom')}</option>
                            {rooms.map(room => (
                                <option key={room.id} value={room.id}>
                                    {room.roomType} - €{room.roomPrice}/night (ID: {room.id})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>{t('admin.packageName')}</label>
                        <input
                            type="text"
                            name="name"
                            value={packageDetails.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>{t('admin.startDate')}</label>
                        <input
                            type="date"
                            name="startDate"
                            value={packageDetails.startDate}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>{t('admin.endDate')}</label>
                        <input
                            type="date"
                            name="endDate"
                            value={packageDetails.endDate}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>{t('admin.packagePrice')}</label>
                        <input
                            type="number"
                            name="packagePrice"
                            value={packageDetails.packagePrice}
                            onChange={handleChange}
                            step="0.01"
                            min="0"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>{t('admin.description')}</label>
                        <textarea
                            name="description"
                            value={packageDetails.description}
                            onChange={handleChange}
                        ></textarea>
                    </div>

                    <div className="form-group">
                        <label>
                            <input
                                type="checkbox"
                                name="isActive"
                                checked={packageDetails.isActive}
                                onChange={handleChange}
                            />
                            {t('admin.isActive')}
                        </label>
                    </div>

                    <div className="form-group">
                        <label>{t('admin.allowPartialBookings')}</label>
                        <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <input
                                    type="radio"
                                    name="allowPartialBookings"
                                    checked={packageDetails.allowPartialBookings === false}
                                    onChange={() => handleRadioChange(false)}
                                />
                                {t('admin.no')} - {t('admin.packageBlocksAllOverlapping')}
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <input
                                    type="radio"
                                    name="allowPartialBookings"
                                    checked={packageDetails.allowPartialBookings === true}
                                    onChange={() => handleRadioChange(true)}
                                />
                                {t('admin.yes')} - {t('admin.packageCanBeDestroyed')}
                            </label>
                        </div>
                    </div>

                    <button className="update-button" onClick={updatePackage}>
                        {t('admin.update')}
                    </button>
                </div>
            </div>
        </AdminRoute>
    );
}
