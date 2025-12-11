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
  const [roomType, setRoomType] = useState('');
  const [roomTypes, setRoomTypes] = useState<string[]>([]);
  const [error, setError] = useState('');

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

  const showError = (message: string, timeout = 5000) => {
    setError(message);
    setTimeout(() => {
      setError('');
    }, timeout);
  };

  const handleInternalSearch = async () => {
    if (!startDate || !endDate || !roomType) {
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
      const response = await ApiService.getAvailableRoomsByDateAndType(
        formattedStartDate!, 
        formattedEndDate!, 
        roomType
      );

      if (response.statusCode === 200) {
        if (response.roomList.length === 0) {
          showError(t('rooms.noRooms'));
          return;
        }
        handleSearchResult(response.roomList);
        setError('');
      }
    } catch (error: any) {
      showError(t('rooms.loading') + ': ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <section>
      <h3 className="search-section-title">{t('home.checkAvailability')}</h3>
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
            <option disabled value="">
              {t('rooms.selectRoomType')}
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
      {error && <p className="error-message">{error}</p>}
    </section>
  );
}

