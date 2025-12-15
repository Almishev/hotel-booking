'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ApiService from '@/lib/service/ApiService';
import Pagination from '@/components/common/Pagination';
import RoomResult from '@/components/common/RoomResult';
import RoomSearch from '@/components/common/RoomSearch';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';

function AllRoomsContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const packageId = searchParams.get('packageId');
  const urlRoomType = searchParams.get('roomType');
  const [rooms, setRooms] = useState<any[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<any[]>([]);
  const [roomTypes, setRoomTypes] = useState<string[]>([]);
  const [selectedRoomType, setSelectedRoomType] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [roomsPerPage] = useState(5);

  const handleSearchResult = (results: any[]) => {
    setRooms(results);
    setFilteredRooms(results);
  };

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

  // Ако има packageId и roomType в URL, филтрирай стаите
  useEffect(() => {
    if (urlRoomType && rooms.length > 0) {
      setSelectedRoomType(urlRoomType);
      filterRooms(urlRoomType);
    }
  }, [urlRoomType, rooms]);

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
    <div className='all-rooms'>
      <h2>{t('rooms.allRooms')}</h2>
      <div className='all-room-filter-div'>
        <label>{t('rooms.filterByType')}</label>
        <select value={selectedRoomType} onChange={handleRoomTypeChange}>
          <option value="">{t('rooms.all')}</option>
          {roomTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>
      
      {!(packageId && urlRoomType) && (
        <RoomSearch handleSearchResult={handleSearchResult} />
      )}
      <RoomResult roomSearchResults={currentRooms} packageId={packageId || undefined} />

      <Pagination
        roomsPerPage={roomsPerPage}
        totalRooms={filteredRooms.length}
        currentPage={currentPage}
        paginate={paginate}
      />
    </div>
  );
}

export default function AllRoomsPage() {
  return (
    <Suspense fallback={<div className='all-rooms'><p>Loading...</p></div>}>
      <AllRoomsContent />
    </Suspense>
  );
}

