'use client';

import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ApiService from '@/lib/service/ApiService';
import { useTranslation } from 'react-i18next';
import { addDays } from 'date-fns';
import '@/lib/i18n';

interface RoomSearchProps {
  handleSearchResult: (results: any[]) => void;
}

export default function RoomSearch({ handleSearchResult }: RoomSearchProps) {
  const { t } = useTranslation();
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [roomType, setRoomType] = useState('ALL'); // по подразбиране всички типове
  const [roomTypes, setRoomTypes] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [isPackageError, setIsPackageError] = useState(false);

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

  const showError = (message: string, timeout = 5000, isPackage = false) => {
    setError(message);
    setIsPackageError(isPackage);
    setTimeout(() => {
      setError('');
      setIsPackageError(false);
    }, timeout);
  };

  const handleInternalSearch = async () => {
    if (!startDate || !endDate) {
      showError(t('login.fillAllFields'));
      return false;
    }
    const today = new Date();
    if (startDate < new Date(today.setHours(0,0,0,0))) {
      showError(t('rooms.selectCheckIn'));
      return false;
    }
    if (endDate <= startDate) {
      showError(t('rooms.selectCheckOut'));
      return false;
    }
    try {
      const formattedStartDate = startDate ? startDate.toISOString().split('T')[0] : null;
      const formattedEndDate = endDate ? endDate.toISOString().split('T')[0] : null;
      
      let aggregatedRooms: any[] = [];

      if (roomType === 'ALL') {
        // Търсим по всички типове стаи и обединяваме резултатите
        const responses = await Promise.all(
          roomTypes.map((type) =>
            ApiService.getAvailableRoomsByDateAndType(
              formattedStartDate!,
              formattedEndDate!,
              type
            )
          )
        );

        responses.forEach((response) => {
          if (response.statusCode === 200 && Array.isArray(response.roomList)) {
            aggregatedRooms = aggregatedRooms.concat(response.roomList);
          }
        });

        // премахваме дубликатите по room.id
        const seen = new Set<number>();
        aggregatedRooms = aggregatedRooms.filter((room: any) => {
          if (!room || typeof room.id !== 'number') return false;
          if (seen.has(room.id)) return false;
          seen.add(room.id);
          return true;
        });
      } else {
        const response = await ApiService.getAvailableRoomsByDateAndType(
          formattedStartDate!, 
          formattedEndDate!, 
          roomType
        );

        if (response.statusCode === 200 && Array.isArray(response.roomList)) {
          aggregatedRooms = response.roomList;
        }
      }

      if (!aggregatedRooms || aggregatedRooms.length === 0) {
        // Ако няма свободни стаи за нормална резервация, е възможно
        // датите да попадат в пакет с неразрушими настройки.
        // Показваме по-ясно съобщение и подсказваме за пакетите.
        showError(
          t('rooms.datesPartOfPackage') ||
            'Няма свободни стаи за тези дати. Възможно е да има пакетни предложения за този период.',
          15000,
          true
        );
        return;
      }

      handleSearchResult(aggregatedRooms);
      setError('');
    } catch (error: any) {
      showError(t('rooms.loading') + ': ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <section>
      <h3
        className="search-section-title"
        style={{ textAlign: 'center', marginBottom: '1.5rem', marginTop: '2rem' }}
      >
        {t('home.checkAvailability')}
      </h3>
      <div className="search-container">
        <div className="search-field">
          <label>{t('rooms.selectCheckIn')}</label>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            dateFormat="dd/MM/yyyy"
            placeholderText={t('rooms.selectCheckIn')}
            minDate={new Date()} 
          />
        </div>
        <div className="search-field">
          <label>{t('rooms.selectCheckOut')}</label>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            dateFormat="dd/MM/yyyy"
            placeholderText={t('rooms.selectCheckOut')}
            minDate={startDate ? addDays(startDate, 1) : new Date()}
          />
        </div>

        <div className="search-field">
          <label>{t('rooms.selectRoomType')}</label>
          <select value={roomType} onChange={(e) => setRoomType(e.target.value)}>
            <option value="ALL">
              {t('rooms.all')}
            </option>
            {roomTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <button className="home-search-button" onClick={handleInternalSearch}>
          {t('rooms.searchRooms')}
        </button>
      </div>
      {error && (
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <p
            className={isPackageError ? '' : 'error-message'}
            style={
              isPackageError
                ? { fontWeight: 'bold', color: '#555', marginBottom: '0.5rem' }
                : undefined
            }
          >
            {error}
          </p>
          {isPackageError && (
            <a
              href="/packages"
              style={{ color: '#00796b', textDecoration: 'underline', fontWeight: 'bold' }}
            >
              Виж пакетните предложения
            </a>
          )}
        </div>
      )}
    </section>
  );
}

