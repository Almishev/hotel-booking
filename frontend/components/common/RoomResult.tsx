'use client';

import { useRouter } from 'next/navigation';
import ApiService from '@/lib/service/ApiService';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';

interface RoomResultProps {
  roomSearchResults: any[];
}

export default function RoomResult({ roomSearchResults }: RoomResultProps) {
    const { t } = useTranslation();
    const router = useRouter();
    const isAdmin = ApiService.isAdmin();
    
    return (
        <section className="room-results">
            {roomSearchResults && roomSearchResults.length > 0 && (
                <div className="room-list">
                    {roomSearchResults.map((room: any) => (
                        <div key={room.id} className="room-list-item">
                            <img className='room-list-item-image' src={room.roomPhotoUrl} alt={room.roomType} />
                            <div className="room-details">
                                <h3>{room.roomType}</h3>
                                <p>{t('rooms.price')}: €{room.roomPrice} {t('rooms.perNight')}</p>
                                <p>{t('rooms.description')}: {room.roomDescription}</p>
                            </div>

                            <div className='book-now-div'>
                                {isAdmin ? (
                                    <button
                                        className="edit-room-button"
                                        onClick={() => router.push(`/admin/edit-room/${room.id}`)}
                                    >
                                        {t('rooms.editRoom')}
                                    </button>
                                ) : (
                                    <button
                                        className="book-now-button"
                                        onClick={() => router.push(`/room-details-book/${room.id}`)}
                                    >
                                        {t('rooms.viewBookNow')}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}

