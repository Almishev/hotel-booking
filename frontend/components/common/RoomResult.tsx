'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ApiService from '@/lib/service/ApiService';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';

interface RoomResultProps {
  roomSearchResults: any[];
  packageId?: string;
  checkInDate?: string;
  checkOutDate?: string;
}

export default function RoomResult({ roomSearchResults, packageId, checkInDate, checkOutDate }: RoomResultProps) {
    const { t } = useTranslation();
    const router = useRouter();
    const isAdmin = ApiService.isAdmin();
    const [packageDetails, setPackageDetails] = useState<any>(null);
    const [availableRoomIds, setAvailableRoomIds] = useState<Set<number>>(new Set());
    const [loadingAvailability, setLoadingAvailability] = useState(false);
    const [availabilityChecked, setAvailabilityChecked] = useState(false);
    const [roomPrices, setRoomPrices] = useState<Map<number, number>>(new Map());
    const [loadingPrices, setLoadingPrices] = useState(false);

    // Зареждане на детайлите на пакета и проверка на наличност
    useEffect(() => {
        const checkAvailability = async () => {
            if (!packageId || !roomSearchResults || roomSearchResults.length === 0) {
                setAvailableRoomIds(new Set());
                setAvailabilityChecked(false);
                setPackageDetails(null);
                return;
            }

            try {
                setLoadingAvailability(true);
                // Зареждане на детайлите на пакета
                const packageResponse = await ApiService.getHolidayPackageById(packageId);
                if (packageResponse.statusCode === 200 && packageResponse.holidayPackage) {
                    const pkg = packageResponse.holidayPackage;
                    setPackageDetails(pkg);

                    // Проверка на наличност за всяка уникална стая от резултатите
                    const uniqueRoomTypes = [...new Set(roomSearchResults.map((r: any) => r.roomType))];
                    const newAvailableIds = new Set<number>();
                    
                    // Проверка на наличност за всеки тип стая
                    await Promise.all(uniqueRoomTypes.map(async (roomType) => {
                        try {
                            const availableRoomsResponse = await ApiService.getAvailableRoomsByDateAndType(
                                pkg.startDate,
                                pkg.endDate,
                                roomType,
                                packageId
                            );
                            
                            if (availableRoomsResponse.statusCode === 200) {
                                if (availableRoomsResponse.roomList && Array.isArray(availableRoomsResponse.roomList)) {
                                    const availableRooms = availableRoomsResponse.roomList;
                                    availableRooms.forEach((r: any) => {
                                        newAvailableIds.add(r.id);
                                    });
                                }
                            }
                        } catch (error: any) {
                            console.error(`Error checking availability for room type ${roomType}:`, error);
                            // При грешка, считаме всички стаи от този тип за налични (fallback)
                            roomSearchResults.forEach((r: any) => {
                                if (r.roomType === roomType) {
                                    newAvailableIds.add(r.id);
                                }
                            });
                        }
                    }));

                    setAvailableRoomIds(newAvailableIds);
                    setAvailabilityChecked(true);
                } else {
                    setAvailabilityChecked(false);
                }
            } catch (error) {
                console.error('Error loading package details:', error);
                setAvailableRoomIds(new Set());
                setAvailabilityChecked(false);
            } finally {
                setLoadingAvailability(false);
            }
        };

        checkAvailability();
    }, [packageId, roomSearchResults]);

    // Изчисли периодичните цени за стаите, ако има избрани дати
    useEffect(() => {
        const calculatePrices = async () => {
            console.log('RoomResult - calculatePrices called', { 
                checkInDate, 
                checkOutDate, 
                roomCount: roomSearchResults?.length 
            });
            
            if (!checkInDate || !checkOutDate || !roomSearchResults || roomSearchResults.length === 0) {
                console.log('RoomResult - Missing dates or rooms, clearing prices');
                setRoomPrices(new Map());
                return;
            }

            try {
                setLoadingPrices(true);
                const priceMap = new Map<number, number>();

                // Изчисли цената за всяка стая
                await Promise.all(
                    roomSearchResults.map(async (room: any) => {
                        try {
                            console.log(`RoomResult - Calculating price for room ${room.id} (${room.roomType})`, {
                                checkInDate,
                                checkOutDate
                            });
                            
                            const response = await ApiService.calculateRoomPrice(
                                room.id.toString(),
                                checkInDate,
                                checkOutDate
                            );
                            
                            console.log(`RoomResult - Price calculation response for room ${room.id}:`, response);
                            
                            if (response.statusCode === 200 && response.priceCalculation) {
                                // Използвай averagePricePerNight, ако е налично, иначе изчисли от totalPrice
                                const calculation = response.priceCalculation;
                                let pricePerNight: number;
                                if (calculation.averagePricePerNight) {
                                    pricePerNight = parseFloat(calculation.averagePricePerNight.toString());
                                } else {
                                    const totalPrice = parseFloat(calculation.totalPrice.toString());
                                    const nights = calculation.numberOfNights || 1;
                                    pricePerNight = totalPrice / nights;
                                }
                                console.log(`RoomResult - Calculated price for room ${room.id}: €${pricePerNight}/night (base: €${room.roomPrice})`);
                                priceMap.set(room.id, pricePerNight);
                            } else {
                                console.warn(`RoomResult - No price calculation for room ${room.id}, using base price`);
                                // Fallback към базовата цена
                                priceMap.set(room.id, room.roomPrice);
                            }
                        } catch (error) {
                            console.error(`RoomResult - Error calculating price for room ${room.id}:`, error);
                            // Fallback към базовата цена
                            priceMap.set(room.id, room.roomPrice);
                        }
                    })
                );

                console.log('RoomResult - Final price map:', Array.from(priceMap.entries()));
                setRoomPrices(priceMap);
            } catch (error) {
                console.error('RoomResult - Error calculating room prices:', error);
            } finally {
                setLoadingPrices(false);
            }
        };

        calculatePrices();
    }, [checkInDate, checkOutDate, roomSearchResults]);

    const isRoomAvailable = (roomId: number) => {
        if (!packageId) {
            return true; // Ако няма пакет, всички стаи са налични
        }
        // Ако все още се зарежда или не е направена проверка, считаме стаята за налична
        if (loadingAvailability || !availabilityChecked) {
            return true;
        }
        // Ако проверката е завършена, проверяваме дали стаята е в списъка с налични
        return availableRoomIds.has(roomId);
    };
    
    return (
        <section className="room-results">
            {roomSearchResults && roomSearchResults.length > 0 && (
                <div className="room-list">
                    {roomSearchResults.map((room: any) => {
                        const available = isRoomAvailable(room.id);
                        // Показваме "Резервирано" само ако има пакет, проверката е завършена, и стаята не е налична
                        const showReserved = packageId && availabilityChecked && !loadingAvailability && !available;
                        
                        // Използвай периодичната цена, ако е изчислена, иначе базовата цена
                        const hasCalculatedPrice = roomPrices.has(room.id);
                        const displayPrice = hasCalculatedPrice ? roomPrices.get(room.id)! : room.roomPrice;
                        const showPeriodPrice = checkInDate && checkOutDate && hasCalculatedPrice;
                        const priceDiffers = Math.abs(displayPrice - room.roomPrice) > 0.01; // Използваме малък threshold за floating point сравнение
                        
                        console.log(`RoomResult - Rendering room ${room.id}:`, {
                            checkInDate,
                            checkOutDate,
                            hasCalculatedPrice,
                            displayPrice,
                            basePrice: room.roomPrice,
                            showPeriodPrice,
                            priceDiffers
                        });

                        return (
                            <div key={room.id} className="room-list-item">
                                <img className='room-list-item-image' src={room.roomPhotoUrl} alt={room.roomType} />
                                <div className="room-details">
                                    <h3>{room.roomType}</h3>
                                    {loadingPrices ? (
                                        <p>{t('rooms.price')}: {t('rooms.loading')}...</p>
                                    ) : showPeriodPrice && priceDiffers ? (
                                        <p>
                                            <span style={{ textDecoration: 'line-through', color: '#999', marginRight: '0.5rem' }}>
                                                {t('rooms.price')}: €{room.roomPrice} {t('rooms.perNight')}
                                            </span>
                                            <span style={{ fontWeight: 'bold', color: '#00796b' }}>
                                                {t('rooms.price')}: €{displayPrice.toFixed(2)} {t('rooms.perNight')}
                                            </span>
                                        </p>
                                    ) : (
                                        <p>{t('rooms.price')}: €{displayPrice.toFixed(2)} {t('rooms.perNight')}</p>
                                    )}
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
                                    ) : showReserved ? (
                                        <div style={{
                                            padding: '0.5rem 1rem',
                                            backgroundColor: '#f5f5f5',
                                            color: '#666',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px',
                                            fontSize: '0.9rem',
                                            fontWeight: 'bold',
                                            textAlign: 'center',
                                            cursor: 'not-allowed'
                                        }}>
                                            {t('rooms.reserved') || 'Резервирано'}
                                        </div>
                                    ) : (
                                        <button
                                            className="book-now-button"
                                            onClick={() => {
                                                const url = packageId 
                                                    ? `/room-details-book/${room.id}?packageId=${packageId}`
                                                    : `/room-details-book/${room.id}`;
                                                router.push(url);
                                            }}
                                            disabled={loadingAvailability}
                                        >
                                            {loadingAvailability ? (t('rooms.loading') || 'Зареждане...') : t('rooms.viewBookNow')}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
}

