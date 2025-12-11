'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ApiService from '@/lib/service/ApiService';
import { AdminRoute } from '@/lib/service/guard';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';

export default function AddRoomPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const [roomDetails, setRoomDetails] = useState({
        roomType: '',
        roomPrice: '',
        roomDescription: '',
    });
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [roomTypes, setRoomTypes] = useState<string[]>([]);
    const [newRoomType, setNewRoomType] = useState(false);

    useEffect(() => {
        const fetchRoomTypes = async () => {
            try {
                const types = await ApiService.getRoomTypes();
                setRoomTypes(types);
            } catch (error: any) {
                console.error('Error fetching room types:', error.message);
            }
        };
        fetchRoomTypes();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setRoomDetails(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleRoomTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (e.target.value === 'new') {
            setNewRoomType(true);
            setRoomDetails(prevState => ({ ...prevState, roomType: '' }));
        } else {
            setNewRoomType(false);
            setRoomDetails(prevState => ({ ...prevState, roomType: e.target.value }));
        }
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

    const addRoom = async () => {
        if (!roomDetails.roomType || !roomDetails.roomPrice || !roomDetails.roomDescription) {
            setError(t('admin.errorFill'));
            setTimeout(() => setError(''), 5000);
            return;
        }

        if (!window.confirm(t('admin.addRoom') + '?')) {
            return;
        }

        try {
            const formData = new FormData();
            formData.append('roomType', roomDetails.roomType);
            formData.append('roomPrice', roomDetails.roomPrice);
            formData.append('roomDescription', roomDetails.roomDescription);

            if (file) {
                formData.append('photo', file);
            }

            const response = await ApiService.addRoom(formData);
            if (response.statusCode === 200) {
                setSuccess(t('admin.successAdd'));
                setTimeout(() => {
                    router.push('/admin/manage-rooms');
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
                <h2>{t('admin.addRoom')}</h2>
                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}
                <div className="edit-room-form">
                    <div className="form-group">
                        {preview && (
                            <img src={preview} alt="Room Preview" className="room-photo-preview" />
                        )}
                        <input
                            type="file"
                            name="roomPhoto"
                            onChange={handleFileChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>{t('admin.roomType')}</label>
                        <select value={roomDetails.roomType} onChange={handleRoomTypeChange}>
                            <option value="">{t('admin.selectRoomType')}</option>
                            {roomTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                            <option value="new">{t('admin.otherRoomType')}</option>
                        </select>
                        {newRoomType && (
                            <input
                                type="text"
                                name="roomType"
                                placeholder={t('admin.enterNewRoomType')}
                                value={roomDetails.roomType}
                                onChange={handleChange}
                            />
                        )}
                    </div>
                    <div className="form-group">
                        <label>{t('admin.roomPrice')}</label>
                        <input
                            type="text"
                            name="roomPrice"
                            value={roomDetails.roomPrice}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>{t('admin.roomDescription')}</label>
                        <textarea
                            name="roomDescription"
                            value={roomDetails.roomDescription}
                            onChange={handleChange}
                        ></textarea>
                    </div>
                    <button className="update-button" onClick={addRoom}>{t('admin.add')}</button>
                </div>
            </div>
        </AdminRoute>
    );
}

