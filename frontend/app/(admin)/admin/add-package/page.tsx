'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ApiService from '@/lib/service/ApiService';
import { AdminRoute } from '@/lib/service/guard';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';

export default function AddPackagePage() {
    const { t } = useTranslation();
    const router = useRouter();
    const [packageDetails, setPackageDetails] = useState({
        name: '',
        startDate: '',
        endDate: '',
        description: '',
        allowPartialBookings: false,
    });
    const [roomTypes, setRoomTypes] = useState<string[]>([]);
    const [roomTypePrices, setRoomTypePrices] = useState<Record<string, string>>({});
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchRoomTypes = async () => {
            try {
                const types = await ApiService.getRoomTypes();
                setRoomTypes(types || []);
                // Инициализиране на цените за всеки тип стая
                const initialPrices: Record<string, string> = {};
                types.forEach((type: string) => {
                    initialPrices[type] = '';
                });
                setRoomTypePrices(initialPrices);
            } catch (error: any) {
                console.error('Error fetching room types:', error.message);
            }
        };
        fetchRoomTypes();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setPackageDetails(prevState => ({
            ...prevState,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
        }));
    };

    const handleRoomTypePriceChange = (roomType: string, price: string) => {
        setRoomTypePrices(prev => ({
            ...prev,
            [roomType]: price,
        }));
    };

    const handleRadioChange = (value: boolean) => {
        setPackageDetails(prevState => ({
            ...prevState,
            allowPartialBookings: value,
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        } else {
            setFile(null);
            setPreview(null);
        }
    };

    const addPackage = async () => {
        if (!packageDetails.name || !packageDetails.startDate || !packageDetails.endDate) {
            setError(t('admin.errorFill'));
            setTimeout(() => setError(''), 5000);
            return;
        }

        // Проверка дали всички типове стаи имат цена
        const missingPrices = roomTypes.filter(type => !roomTypePrices[type] || roomTypePrices[type].trim() === '');
        if (missingPrices.length > 0) {
            setError(t('admin.enterPriceForAllRoomTypes') || 'Please enter price for all room types');
            setTimeout(() => setError(''), 5000);
            return;
        }

        if (new Date(packageDetails.endDate) <= new Date(packageDetails.startDate)) {
            setError(t('admin.endDateMustBeAfterStartDate'));
            setTimeout(() => setError(''), 5000);
            return;
        }

        if (!window.confirm(t('admin.addPackage') + '?')) {
            return;
        }

        try {
            const formData = new FormData();
            formData.append('name', packageDetails.name);
            formData.append('startDate', packageDetails.startDate);
            formData.append('endDate', packageDetails.endDate);
            if (packageDetails.description) {
                formData.append('description', packageDetails.description);
            }
            formData.append('allowPartialBookings', packageDetails.allowPartialBookings.toString());
            
            // Добавяне на цените за всеки тип стая
            Object.entries(roomTypePrices).forEach(([roomType, price]) => {
                formData.append(`roomTypePrice_${roomType}`, price);
            });
            
            // Добавяне на снимката, ако е избрана
            if (file) {
                formData.append('photo', file);
            }

            const response = await ApiService.addHolidayPackage(formData);

            if (response.statusCode === 200) {
                setSuccess(t('admin.successAddPackage'));
                setTimeout(() => {
                    router.push('/admin/manage-packages');
                }, 2000);
            } else {
                setError(response.message || 'Error adding package');
                setTimeout(() => setError(''), 5000);
            }
        } catch (error: any) {
            console.error('Error adding package:', error);
            if (error.response) {
                // Server responded with error
                setError(error.response.data?.message || error.response.statusText || 'Error adding package');
            } else if (error.request) {
                // Request was made but no response received
                setError('No response from server. Please check your connection.');
            } else {
                // Something else happened
                setError(error.message || 'Error adding package');
            }
            setTimeout(() => setError(''), 5000);
        }
    };

    return (
        <AdminRoute>
            <div className="edit-room-container">
                <h2>{t('admin.addPackage')}</h2>
                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}
                <div className="edit-room-form">
                    <div className="form-group">
                        <label>{t('admin.packageName')}</label>
                        <input
                            type="text"
                            name="name"
                            value={packageDetails.name}
                            onChange={handleChange}
                            placeholder={t('admin.enterPackageName')}
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
                        <label>{t('admin.description')}</label>
                        <textarea
                            name="description"
                            value={packageDetails.description}
                            onChange={handleChange}
                            placeholder={t('admin.enterDescription')}
                        ></textarea>
                    </div>

                    <div className="form-group">
                        <label>{t('admin.packagePhoto') || 'Package Photo'}</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                        {preview && (
                            <div style={{ marginTop: '10px' }}>
                                <img 
                                    src={preview} 
                                    alt="Preview" 
                                    style={{ maxWidth: '300px', maxHeight: '300px', objectFit: 'cover', borderRadius: '8px' }}
                                />
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>{t('admin.packagePricesByRoomType')}</label>
                        {roomTypes.length === 0 ? (
                            <p>{t('admin.loadingRoomTypes') || 'Loading room types...'}</p>
                        ) : (
                            roomTypes.map((roomType) => (
                                <div key={roomType} style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                                        {t('admin.packagePrice')} - {roomType}:
                                    </label>
                                    <input
                                        type="number"
                                        value={roomTypePrices[roomType] || ''}
                                        onChange={(e) => handleRoomTypePriceChange(roomType, e.target.value)}
                                        placeholder="0.00"
                                        step="0.01"
                                        min="0"
                                        required
                                        style={{ width: '100%', padding: '0.5rem' }}
                                    />
                                </div>
                            ))
                        )}
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

                    <button className="update-button" onClick={addPackage}>
                        {t('admin.add')}
                    </button>
                </div>
            </div>
        </AdminRoute>
    );
}
