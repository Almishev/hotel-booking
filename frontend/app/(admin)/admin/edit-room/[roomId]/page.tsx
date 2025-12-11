'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ApiService from '@/lib/service/ApiService';
import { AdminRoute } from '@/lib/service/guard';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';

export default function EditRoomPage() {
    const { t } = useTranslation();
    const params = useParams();
    const router = useRouter();
    const roomId = params.roomId as string;
    
    const [roomDetails, setRoomDetails] = useState({
        roomType: '',
        roomPrice: '',
        roomDescription: '',
    });
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchRoom = async () => {
            try {
                const response = await ApiService.getRoomById(roomId);
                setRoomDetails({
                    roomType: response.room.roomType,
                    roomPrice: response.room.roomPrice,
                    roomDescription: response.room.roomDescription,
                });
                setPreview(response.room.roomPhotoUrl);
            } catch (error: any) {
                setError(error.response?.data?.message || error.message);
            }
        };
        fetchRoom();
    }, [roomId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setRoomDetails(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    const updateRoom = async () => {
        try {
            const formData = new FormData();
            formData.append('roomType', roomDetails.roomType);
            formData.append('roomPrice', roomDetails.roomPrice);
            formData.append('roomDescription', roomDetails.roomDescription);
            if (file) {
                formData.append('photo', file);
            }

            const response = await ApiService.updateRoom(roomId, formData);
            if (response.statusCode === 200) {
                setSuccess(t('admin.successUpdate'));
                setTimeout(() => {
                    router.push('/admin/manage-rooms');
                }, 2000);
            }
        } catch (error: any) {
            setError(error.response?.data?.message || error.message);
        }
    };

    const deleteRoom = async () => {
        if (!window.confirm(t('admin.confirmAcheive'))) {
            return;
        }
        try {
            const response = await ApiService.deleteRoom(roomId);
            if (response.statusCode === 200) {
                router.push('/admin/manage-rooms');
            }
        } catch (error: any) {
            setError(error.response?.data?.message || error.message);
        }
    };

    return (
        <AdminRoute>
            <div className="edit-room-container">
                <h2>{t('admin.editRoom')}</h2>
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
                        <input
                            type="text"
                            name="roomType"
                            value={roomDetails.roomType}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>{t('admin.roomPrice')}</label>
                        <input
                            type="text"
                            name="roomPrice"
                            value={roomDetails.roomPrice}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>{t('admin.roomDescription')}</label>
                        <textarea
                            name="roomDescription"
                            value={roomDetails.roomDescription}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button type="button" className="update-button" onClick={updateRoom}>
                        {t('admin.update')}
                    </button>
                    <button type="button" className="delete-button" onClick={deleteRoom}>
                        {t('admin.delete')}
                    </button>
                </div>
            </div>
        </AdminRoute>
    );
}

