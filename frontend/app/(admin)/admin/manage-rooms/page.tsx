'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ApiService from '@/lib/service/ApiService';
import { AdminRoute } from '@/lib/service/guard';
import Pagination from '@/components/common/Pagination';
import RoomResult from '@/components/common/RoomResult';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';

export default function ManageRoomPage() {
  const { t } = useTranslation();
  const [rooms, setRooms] = useState<any[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<any[]>([]);
  const [roomTypes, setRoomTypes] = useState<string[]>([]);
  const [selectedRoomType, setSelectedRoomType] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [roomsPerPage] = useState(5);
  const router = useRouter();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await ApiService.getAllRooms();
        const allRooms = response.roomList;
        setRooms(allRooms);
        setFilteredRooms(allRooms);
      } catch (error: any) {
        console.error('Error fetching rooms:', error.message);
      }
    };

    const fetchRoomTypes = async () => {
      try {
        const types = await ApiService.getRoomTypes();
        setRoomTypes(types);
      } catch (error: any) {
        console.error('Error fetching room types:', error.message);
      }
    };

    fetchRooms();
    fetchRoomTypes();
  }, []);

  const handleRoomTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRoomType(e.target.value);
    filterRooms(e.target.value);
  };

  const filterRooms = (type: string) => {
    if (type === '') {
      setFilteredRooms(rooms);
    } else {
      const filtered = rooms.filter((room) => room.roomType === type);
      setFilteredRooms(filtered);
    }
    setCurrentPage(1);
  };

  const indexOfLastRoom = currentPage * roomsPerPage;
  const indexOfFirstRoom = indexOfLastRoom - roomsPerPage;
  const currentRooms = filteredRooms.slice(indexOfFirstRoom, indexOfLastRoom);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <AdminRoute>
      <div className='all-rooms'>
        <h2>{t('rooms.allRooms')}</h2>
        <div className='all-room-filter-div' style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className='filter-select-div'>
            <label>{t('rooms.filterByType')}</label>
            <select value={selectedRoomType} onChange={handleRoomTypeChange}>
              <option value="">{t('rooms.all')}</option>
              {roomTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <button className='add-room-button' onClick={() => router.push('/admin/add-room')}>
              {t('admin.addRoom')}
            </button>
          </div>
        </div>
        <RoomResult roomSearchResults={currentRooms} />
        <Pagination
          roomsPerPage={roomsPerPage}
          totalRooms={filteredRooms.length}
          currentPage={currentPage}
          paginate={paginate}
        />
      </div>
    </AdminRoute>
  );
}

