'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ApiService from '@/lib/service/ApiService';
import { StaffRoute } from '@/lib/service/guard';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';

interface RoomOption {
  id: number;
  roomType: string;
}

export default function AddBookingPage() {
  const { t, i18n } = useTranslation();
  const router = useRouter();

  const [rooms, setRooms] = useState<RoomOption[]>([]);
  const [availableRooms, setAvailableRooms] = useState<RoomOption[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [roomPackages, setRoomPackages] = useState<any[]>([]); // пакети, валидни за избраните дати
  const [selectedPackageId, setSelectedPackageId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [availabilityStatus, setAvailabilityStatus] = useState<'idle' | 'checking' | 'available' | 'unavailable' | 'error'>('idle');
  const [availabilityMessage, setAvailabilityMessage] = useState('');

  const [form, setForm] = useState({
    roomId: '',
    checkInDate: '',
    checkOutDate: '',
    numOfAdults: 1,
    numOfChildren: 0,
    guestName: '',
    guestEmail: '',
    guestPhoneNumber: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roomsResponse, packagesResponse] = await Promise.all([
          ApiService.getAllRooms(),
          ApiService.getAllHolidayPackages()
        ]);

        const list = roomsResponse.roomList || [];
        setRooms(list.map((r: any) => ({ id: r.id, roomType: r.roomType })));
        setAvailableRooms(list.map((r: any) => ({ id: r.id, roomType: r.roomType })));

        const pkgList = (packagesResponse.holidayPackageList || []).filter(
          (p: any) => p.isActive
        );
        setPackages(pkgList);
      } catch (err: any) {
        console.error('Error fetching rooms or packages:', err.message);
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'numOfAdults' || name === 'numOfChildren' ? Number(value) : value,
    }));
  };

  const handlePackageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedPackageId(value);

    const pkg = roomPackages.find((p: any) => String(p.id) === value);
    if (pkg) {
      // Автоматично попълваме датите на престоя според пакета
      setForm(prev => ({
        ...prev,
        checkInDate: pkg.startDate || prev.checkInDate,
        checkOutDate: pkg.endDate || prev.checkOutDate,
      }));
    }
  };

  const handleSubmit = async () => {
    if (!form.roomId || !form.checkInDate || !form.checkOutDate || !form.guestName || !form.guestEmail || !form.guestPhoneNumber) {
      setError(t('admin.errorFill'));
      setTimeout(() => setError(''), 5000);
      return;
    }

    if (new Date(form.checkOutDate) <= new Date(form.checkInDate)) {
      setError(t('rooms.invalidDates') || 'Invalid dates');
      setTimeout(() => setError(''), 5000);
      return;
    }

    const confirmMessage = t('admin.confirmAddBooking') || 'Да добавим ли тази резервация?';
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      const payload: any = {
        roomId: Number(form.roomId), // not used by backend but kept for clarity
        checkInDate: form.checkInDate,
        checkOutDate: form.checkOutDate,
        numOfAdults: form.numOfAdults,
        numOfChildren: form.numOfChildren,
        guestName: form.guestName,
        guestEmail: form.guestEmail,
        guestPhoneNumber: form.guestPhoneNumber,
        language: i18n.language?.split('-')[0] || 'bg',
      };

      if (selectedPackageId) {
        payload.holidayPackageId = Number(selectedPackageId);
      }

      const response = await ApiService.adminCreateBooking(form.roomId, payload);

      if (response.statusCode === 200) {
        setSuccess(t('rooms.bookingSuccess', { code: response.bookingConfirmationCode }) || 'Booking created successfully');
        setTimeout(() => {
          router.push('/admin/manage-bookings');
        }, 2500);
      } else {
        const msg: string = response.message || 'Error creating booking';
        if (msg.includes('Holiday package is no longer available')) {
          setError(t('rooms.packageNoLongerAvailable') || 'Пакетът вече не е наличен за тези дати.');
        } else if (msg.includes('holiday package') || msg.includes('These dates are part of a holiday package')) {
          setError(t('rooms.datesPartOfPackage') || 'Тези дати са част от пакетно предложение. Моля, използвайте пакета или изберете други дати.');
        } else if (msg.includes('Room not Available')) {
          setError(t('rooms.roomNotAvailable') || 'Стаята не е налична за избрания период.');
        } else {
          setError(msg);
        }
        setTimeout(() => setError(''), 5000);
      }
    } catch (err: any) {
      console.error('Error creating booking:', err);
      const msg: string = err.response?.data?.message || err.message || 'Error creating booking';
      if (msg.includes('Holiday package is no longer available')) {
        setError(t('rooms.packageNoLongerAvailable') || 'Пакетът вече не е наличен за тези дати.');
      } else if (msg.includes('holiday package') || msg.includes('These dates are part of a holiday package')) {
        setError(t('rooms.datesPartOfPackage') || 'Тези дати са част от пакетно предложение. Моля, използвайте пакета или изберете други дати.');
      } else if (msg.includes('Room not Available')) {
        setError(t('rooms.roomNotAvailable') || 'Стаята не е налична за избрания период.');
      } else {
        setError(msg);
      }
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleCheckAvailability = async () => {
    if (!form.roomId || !form.checkInDate || !form.checkOutDate) {
      setError(t('admin.errorFill'));
      setTimeout(() => setError(''), 4000);
      return;
    }

    const selectedRoom = rooms.find((r) => String(r.id) === form.roomId);
    if (!selectedRoom) {
      setError('Невалидна стая.');
      setTimeout(() => setError(''), 4000);
      return;
    }

    // Ако е избран пакет и датите съвпадат с датите на пакета,
    // приемаме, че това е пакетна резервация и я разрешаваме,
    // дори стандартната проверка да счита стаята за "блокирана от пакет".
    if (selectedPackageId) {
      const pkg =
        roomPackages.find((p: any) => String(p.id) === selectedPackageId) ||
        packages.find((p: any) => String(p.id) === selectedPackageId);

      if (pkg) {
        const sameStart = form.checkInDate === pkg.startDate;
        const sameEnd = form.checkOutDate === pkg.endDate;

        if (sameStart && sameEnd) {
          setAvailabilityStatus('available');
          setAvailabilityMessage(
            'Стаята е част от избрания пакет за тези дати. Можете да продължите с пакетната резервация.'
          );
          return;
        }
      }
    }

    try {
      setAvailabilityStatus('checking');
      setAvailabilityMessage('');

      const response = await ApiService.getAvailableRoomsByDateAndType(
        form.checkInDate,
        form.checkOutDate,
        selectedRoom.roomType
      );

      if (response.statusCode === 200) {
        const list = response.roomList || [];
        const isAvailable = list.some((room: any) => room.id === Number(form.roomId));
        if (isAvailable) {
          setAvailabilityStatus('available');
          setAvailabilityMessage(
            t('admin.roomAvailableForDates') || 'Стаята е свободна за избраните дати.'
          );
        } else {
          setAvailabilityStatus('unavailable');
          setAvailabilityMessage(
            t('admin.roomUnavailableForDates') ||
              'Стаята е заета или блокирана от пакет за тези дати.'
          );
        }
      } else {
        setAvailabilityStatus('error');
        setAvailabilityMessage(response.message || 'Грешка при проверка на наличността.');
      }
    } catch (err: any) {
      console.error('Error checking availability:', err);
      setAvailabilityStatus('error');
      setAvailabilityMessage(
        err.response?.data?.message || err.message || 'Грешка при проверка на наличността.'
      );
    }
  };

  // Когато потребителят избере дати, филтрираме списъка със стаи
  useEffect(() => {
    const updateAvailableRoomsForDates = async () => {
      if (!form.checkInDate || !form.checkOutDate) {
        // Ако няма избрани дати – показваме всички стаи
        setAvailableRooms(rooms);
        setRoomPackages([]);
        setSelectedPackageId('');
        return;
      }

      if (rooms.length === 0) {
        setAvailableRooms([]);
        setRoomPackages([]);
        setSelectedPackageId('');
        return;
      }

      // намери всички активни пакети, които точно съвпадат с тези дати
      // нормализираме датите до формат YYYY-MM-DD, защото от бекенда
      // може да дойдат и с време (напр. "2026-03-01T00:00:00")
      const normalizeDate = (value: any) => {
        if (!value) return '';
        if (typeof value === 'string') {
          return value.length >= 10 ? value.slice(0, 10) : value;
        }
        try {
          const d = new Date(value);
          return isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
        } catch {
          return '';
        }
      };

      const checkInNorm = normalizeDate(form.checkInDate);
      const checkOutNorm = normalizeDate(form.checkOutDate);

      const pkgsForDates = packages.filter((p: any) => {
        if (!p.isActive) return false;
        const pkgStart = normalizeDate(p.startDate);
        const pkgEnd = normalizeDate(p.endDate);
        return pkgStart === checkInNorm && pkgEnd === checkOutNorm;
      });
      setRoomPackages(pkgsForDates);

      // ако текущо избраният пакет вече не е валиден за тези дати – изчисти избора
      if (
        selectedPackageId &&
        !pkgsForDates.some((p: any) => String(p.id) === selectedPackageId)
      ) {
        setSelectedPackageId('');
      }

      // Ако е избран пакет и датите съвпадат с неговите – показваме
      // само стаите, които са свободни за този пакет и са от тип,
      // поддържан от него. Тук викаме бекенда с packageId, за да
      // разграничи пакетните блокировки от другите резервации.
      if (selectedPackageId) {
        const pkg =
          roomPackages.find((p: any) => String(p.id) === selectedPackageId) ||
          packages.find((p: any) => String(p.id) === selectedPackageId);

        if (pkg) {
          const sameStart = form.checkInDate === pkg.startDate;
          const sameEnd = form.checkOutDate === pkg.endDate;

          if (sameStart && sameEnd && pkg.roomTypePrices) {
            const allowedTypes = Object.keys(pkg.roomTypePrices);

            try {
              const responses = await Promise.all(
                allowedTypes.map((type) =>
                  ApiService.getAvailableRoomsByDateAndType(
                    checkInNorm,
                    checkOutNorm,
                    type,
                    String(pkg.id)
                  )
                )
              );

              const availableForPackage: RoomOption[] = [];
              responses.forEach((res) => {
                if (res.statusCode === 200 && Array.isArray(res.roomList)) {
                  res.roomList.forEach((r: any) => {
                    availableForPackage.push({ id: r.id, roomType: r.roomType });
                  });
                }
              });

              setAvailableRooms(availableForPackage);

              // Ако избраната стая не е сред позволените и свободни – изчистваме
              if (
                form.roomId &&
                !availableForPackage.some((r) => String(r.id) === form.roomId)
              ) {
                setForm((prev) => ({ ...prev, roomId: '' }));
              }
              return;
            } catch (err: any) {
              console.error('Error loading available rooms for package:', err);
              // при грешка падaме към общата логика по-долу
            }
          }
        }
      }

      try {
        // Вземаме уникалните типове стаи
        const uniqueTypes = Array.from(new Set(rooms.map((r) => r.roomType)));
        const responses = await Promise.all(
          uniqueTypes.map((type) =>
            ApiService.getAvailableRoomsByDateAndType(
              form.checkInDate,
              form.checkOutDate,
              type
            )
          )
        );

        const available: RoomOption[] = [];
        responses.forEach((res) => {
          if (res.statusCode === 200 && Array.isArray(res.roomList)) {
            res.roomList.forEach((r: any) => {
              available.push({ id: r.id, roomType: r.roomType });
            });
          }
        });

        setAvailableRooms(available);

        // Ако избраната стая вече не е свободна за тези дати – изчистваме избора и пакетите
        if (
          form.roomId &&
          !available.some((r) => String(r.id) === form.roomId)
        ) {
          setForm((prev) => ({ ...prev, roomId: '' }));
          setRoomPackages([]);
          setSelectedPackageId('');
        }
      } catch (err: any) {
        console.error('Error loading available rooms for dates:', err);
        // При грешка връщаме всички стаи, за да не блокираме рецепцията
        setAvailableRooms(rooms);
      }
    };

    updateAvailableRoomsForDates();
  }, [form.checkInDate, form.checkOutDate, rooms, selectedPackageId, packages]);

  if (loading) {
    return (
      <StaffRoute>
        <div style={{ padding: '2rem' }}>
          <p>{t('admin.loading') || 'Зареждане...'}</p>
        </div>
      </StaffRoute>
    );
  }

  return (
    <StaffRoute>
      <div className="edit-room-container">
        <h2>{t('admin.addBooking') || 'Нова резервация от рецепция'}</h2>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}

        <div className="edit-room-form">
          <div className="form-group">
            <label>{t('admin.checkInDate')}</label>
            <input type="date" name="checkInDate" value={form.checkInDate} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>{t('admin.checkOutDate')}</label>
            <input type="date" name="checkOutDate" value={form.checkOutDate} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>{t('admin.selectRoom') || 'Избери стая'}</label>
            <select
              name="roomId"
              value={form.roomId}
              onChange={handleChange}
              required
              disabled={!form.checkInDate || !form.checkOutDate || availableRooms.length === 0}
            >
              <option value="">
                {!form.checkInDate || !form.checkOutDate
                  ? 'Първо изберете дати'
                  : availableRooms.length === 0
                  ? 'Няма свободни стаи за тези дати'
                  : `-- ${t('admin.selectRoom') || 'Избери стая'} --`}
              </option>
              {availableRooms.map((room) => (
                <option key={room.id} value={room.id}>
                  #{room.id} - {room.roomType}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Пакетно предложение (по избор)</label>
            <select
              name="holidayPackageId"
              value={selectedPackageId}
              onChange={handlePackageChange}
              disabled={roomPackages.length === 0}
            >
              <option value="">
                {roomPackages.length > 0
                  ? '-- Изберете пакет за тези дати --'
                  : 'Няма активни пакети за избраните дати'}
              </option>
              {roomPackages.map((pkg: any) => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.name} ({pkg.startDate} - {pkg.endDate})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>{t('admin.adults')}</label>
            <input type="number" name="numOfAdults" min={1} value={form.numOfAdults} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>{t('admin.children')}</label>
            <input type="number" name="numOfChildren" min={0} value={form.numOfChildren} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>{t('register.name')}</label>
            <input type="text" name="guestName" value={form.guestName} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>{t('register.email')}</label>
            <input type="email" name="guestEmail" value={form.guestEmail} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>{t('register.phoneNumber') || 'Телефон'}</label>
            <input type="text" name="guestPhoneNumber" value={form.guestPhoneNumber} onChange={handleChange} required />
          </div>

          <div className="form-group" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #eee' }}>
            <label style={{ fontWeight: 'bold' }}>
              {t('admin.checkAvailabilityReception') || 'Провери наличност за избраната стая и дати'}
            </label>
            <button
              type="button"
              className="home-search-button"
              style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}
              onClick={handleCheckAvailability}
            >
              {availabilityStatus === 'checking'
                ? t('home.checkAvailability') || 'Проверка...'
                : t('home.checkAvailability') || 'Провери за наличност'}
            </button>
            {availabilityMessage && (
              <p
                style={{
                  marginTop: '0.5rem',
                  fontWeight: 'bold',
                  color:
                    availabilityStatus === 'available'
                      ? '#2e7d32'
                      : availabilityStatus === 'unavailable'
                      ? '#c62828'
                      : '#555',
                }}
              >
                {availabilityMessage}
              </p>
            )}
          </div>

          <button className="update-button" onClick={handleSubmit}>
            {t('admin.add') || 'Създай резервация'}
          </button>
        </div>
      </div>
    </StaffRoute>
  );
}
