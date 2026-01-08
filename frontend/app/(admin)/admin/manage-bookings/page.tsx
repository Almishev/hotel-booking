'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import ApiService from '@/lib/service/ApiService';
import { StaffRoute } from '@/lib/service/guard';
import Pagination from '@/components/common/Pagination';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';

export default function ManageBookingsPage() {
    const { t } = useTranslation();
    const [bookings, setBookings] = useState<any[]>([]);
    const [filteredBookings, setFilteredBookings] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [bookingsPerPage] = useState(10);
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    const [stats, setStats] = useState({
        totalBookings: 0,
        totalGuests: 0,
        totalAdults: 0,
        totalChildren: 0,
        totalRevenue: 0,
        activeBookings: 0
    });

    const [filters, setFilters] = useState({
        searchTerm: '',
        dateFrom: '',
        dateTo: '',
        roomType: 'all',
        guestCount: 'all',
        status: 'all'
    });

    const [sortConfig, setSortConfig] = useState({
        key: 'checkInDate',
        direction: 'desc' as 'asc' | 'desc'
    });

    const [analyticsDate, setAnalyticsDate] = useState({
        from: '',
        to: ''
    });

    const [roomTypes, setRoomTypes] = useState<string[]>([]);

    const calculateStats = useCallback((bookingsData: any[]) => {
        const stats = {
            totalBookings: bookingsData.length,
            totalGuests: 0,
            totalAdults: 0,
            totalChildren: 0,
            totalRevenue: 0,
            activeBookings: 0
        };

        bookingsData.forEach(booking => {
            stats.totalGuests += booking.totalNumOfGuest || 0;
            stats.totalAdults += booking.numOfAdults || 0;
            stats.totalChildren += booking.numOfChildren || 0;
            
            // If booking is for a holiday package, use package price for the room type
            if (booking.holidayPackage?.roomTypePrices && booking.room?.roomType) {
                const priceForRoomType = booking.holidayPackage.roomTypePrices[booking.room.roomType];
                if (priceForRoomType) {
                    stats.totalRevenue += parseFloat(priceForRoomType.toString());
                } else {
                    // Ако няма цена за този тип стая, изчисли от roomPrice
                    const checkIn = new Date(booking.checkInDate);
                    const checkOut = new Date(booking.checkOutDate);
                    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
                    const roomPricePerNight = booking.room?.roomPrice || 0;
                    stats.totalRevenue += nights * roomPricePerNight;
                }
            } else {
                // Otherwise, calculate from room price and nights
                const checkIn = new Date(booking.checkInDate);
                const checkOut = new Date(booking.checkOutDate);
                const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
                const roomPricePerNight = booking.room?.roomPrice || 0;
                stats.totalRevenue += nights * roomPricePerNight;
            }

            // Only calculate active bookings on client side to avoid hydration mismatch
            if (typeof window !== 'undefined' && new Date(booking.checkInDate) > new Date()) {
                stats.activeBookings++;
            }
        });

        setStats(stats);
    }, []);



    const handleSort = (key: string) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const exportData = () => {
        if (!sortedBookings || sortedBookings.length === 0) {
            alert(t('admin.noDataToExport') || 'No data to export. Please apply filters or wait for data to load.');
            return;
        }

        const data = sortedBookings.map(booking => ({
            'Booking Code': booking.bookingConfirmationCode,
            'Guest Name': booking.user?.name || 'N/A',
            'Email': booking.user?.email || 'N/A',
            'Booking Date': booking.bookingDate ? new Date(booking.bookingDate).toLocaleString() : 'N/A',
            'Check-in': booking.checkInDate,
            'Check-out': booking.checkOutDate,
            'Adults': booking.numOfAdults,
            'Children': booking.numOfChildren,
            'Total Guests': booking.totalNumOfGuest,
            'Total Price': `€${calculateBookingTotalPrice(booking).toFixed(2)}`,
            'Room Type': booking.room?.roomType || 'N/A',
            'Status': getBookingStatus(booking)
        }));

        const csvContent = "data:text/csv;charset=utf-8," 
            + Object.keys(data[0]).join(",") + "\n"
            + data.map(row => Object.values(row).join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `bookings_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getBookingStatus = (booking: any) => {
        if (!mounted) return 'Loading...'; // Prevent hydration mismatch
        const today = new Date();
        const checkIn = new Date(booking.checkInDate);
        const checkOut = new Date(booking.checkOutDate);

        if (checkIn > today) return 'Active';
        if (checkOut < today) return 'Completed';
        return 'Current';
    };

    const getAnalytics = () => {
        if (!analyticsDate.from || !analyticsDate.to) return null;

        const filtered = bookings.filter(booking => {
            const bookingDate = new Date(booking.checkInDate);
            return bookingDate >= new Date(analyticsDate.from) && 
                   bookingDate <= new Date(analyticsDate.to);
        });

        return {
            totalBookings: filtered.length,
            totalAdults: filtered.reduce((sum, b) => sum + (b.numOfAdults || 0), 0),
            totalChildren: filtered.reduce((sum, b) => sum + (b.numOfChildren || 0), 0),
            totalGuests: filtered.reduce((sum, b) => sum + (b.totalNumOfGuest || 0), 0)
        };
    };

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [bookingsResponse, roomTypesResponse] = await Promise.all([
                    ApiService.getAllBookings(),
                    ApiService.getRoomTypes()
                ]);

                const allBookings = bookingsResponse.bookingList || [];
                setBookings(allBookings);
                setFilteredBookings(allBookings);
                calculateStats(allBookings);

                const types = roomTypesResponse || [];
                setRoomTypes(types);
            } catch (error: any) {
                console.error('Error fetching bookings or room types:', error.message);
            }
        };

        fetchData();
    }, [calculateStats]);

    // Use useMemo for filtering to avoid infinite loops
    const filteredBookingsMemo = useMemo(() => {
        let filtered = [...bookings];

        if (filters.searchTerm) {
            filtered = filtered.filter(booking =>
                booking.bookingConfirmationCode?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                booking.user?.name?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                booking.user?.email?.toLowerCase().includes(filters.searchTerm.toLowerCase())
            );
        }

        if (filters.dateFrom) {
            filtered = filtered.filter(booking => 
                new Date(booking.checkInDate) >= new Date(filters.dateFrom)
            );
        }
        if (filters.dateTo) {
            filtered = filtered.filter(booking => 
                new Date(booking.checkInDate) <= new Date(filters.dateTo)
            );
        }

        if (filters.roomType && filters.roomType !== 'all') {
            filtered = filtered.filter(booking => 
                booking.room?.roomType === filters.roomType
            );
        }

        if (filters.guestCount && filters.guestCount !== 'all') {
            filtered = filtered.filter(booking => 
                booking.totalNumOfGuest === parseInt(filters.guestCount)
            );
        }

        if (filters.status !== 'all') {
            const today = new Date();
            if (filters.status === 'active') {
                filtered = filtered.filter(booking => 
                    new Date(booking.checkInDate) > today
                );
            } else if (filters.status === 'completed') {
                filtered = filtered.filter(booking => 
                    new Date(booking.checkOutDate) < today
                );
            } else if (filters.status === 'current') {
                filtered = filtered.filter(booking => {
                    const checkIn = new Date(booking.checkInDate);
                    const checkOut = new Date(booking.checkOutDate);
                    return checkIn <= today && checkOut >= today;
                });
            }
        }

        return filtered;
    }, [bookings, filters, mounted]);

    // Use useMemo for sorting instead of useCallback to avoid infinite loops
    const sortedBookings = useMemo(() => {
        const sorted = [...filteredBookingsMemo].sort((a, b) => {
            let aValue: any = a[sortConfig.key as keyof typeof a];
            let bValue: any = b[sortConfig.key as keyof typeof b];

            if (sortConfig.key === 'user.name') {
                aValue = a.user?.name || '';
                bValue = b.user?.name || '';
            }

            // За всички полета, които са дати, сравняваме по timestamp (число),
            // иначе получаваме Date обекти и сортирането връща винаги 0.
            if (sortConfig.key.includes('Date')) {
                const aTime = aValue ? new Date(aValue).getTime() : NaN;
                const bTime = bValue ? new Date(bValue).getTime() : NaN;

                if (!isNaN(aTime) && !isNaN(bTime)) {
                    return sortConfig.direction === 'asc' ? aTime - bTime : bTime - aTime;
                }
                return 0;
            }

            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
            }

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return sortConfig.direction === 'asc' 
                    ? aValue.localeCompare(bValue) 
                    : bValue.localeCompare(aValue);
            }

            return 0;
        });

        return sorted;
    }, [filteredBookingsMemo, sortConfig]);

    // Update filteredBookings state when memoized value changes (for backward compatibility)
    useEffect(() => {
        setFilteredBookings(filteredBookingsMemo);
        setCurrentPage(1);
    }, [filteredBookingsMemo]);

    const indexOfLastBooking = currentPage * bookingsPerPage;
    const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
    const currentBookings = sortedBookings.slice(indexOfFirstBooking, indexOfLastBooking);

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    const formatDateTime = (dateTimeString: string | null | undefined) => {
        if (!dateTimeString) return 'N/A';
        try {
            const date = new Date(dateTimeString);
            return date.toLocaleString('bg-BG', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return dateTimeString;
        }
    };

    const calculateBookingTotalPrice = (booking: any) => {
        // Използвай съхранената цена, ако е налична (включва периодичните цени)
        if (booking.totalPrice != null) {
            return parseFloat(booking.totalPrice.toString());
        }
        
        // Fallback: If booking is for a holiday package, use package price for the room type
        if (booking.holidayPackage?.roomTypePrices && booking.room?.roomType) {
            const priceForRoomType = booking.holidayPackage.roomTypePrices[booking.room.roomType];
            if (priceForRoomType) {
                return parseFloat(priceForRoomType.toString());
            }
        }
        
        // Fallback: Otherwise, calculate from room price and nights
        if (!booking.checkInDate || !booking.checkOutDate) {
            return 0;
        }
        
        // Try to get room price from booking.room.roomPrice
        let roomPricePerNight = 0;
        if (booking.room?.roomPrice) {
            roomPricePerNight = booking.room.roomPrice;
        } else {
            // If room data is not available, return 0
            return 0;
        }
        
        const checkIn = new Date(booking.checkInDate);
        const checkOut = new Date(booking.checkOutDate);
        const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
        
        return nights * roomPricePerNight;
    };

    const analytics = getAnalytics();

    return (
        <StaffRoute>
            <div className='admin-dashboard'>
                <h2>{t('admin.dashboardTitle')}</h2>
                
                <div className="dashboard-stats">
                    <div className="stat-card">
                        <h3>{t('admin.totalBookings')}</h3>
                        <p className="stat-number">{stats.totalBookings}</p>
                    </div>
                    <div className="stat-card">
                        <h3>{t('admin.totalGuests')}</h3>
                        <p className="stat-number">{stats.totalGuests}</p>
                        <p className="stat-detail">{t('admin.adults')}: {stats.totalAdults} | {t('admin.children')}: {stats.totalChildren}</p>
                    </div>
                    <div className="stat-card">
                        <h3>{t('admin.totalRevenue')}</h3>
                        <p className="stat-number">€{mounted ? stats.totalRevenue.toLocaleString() : '0'}</p>
                    </div>
                    <div className="stat-card">
                        <h3>{t('admin.activeBookings')}</h3>
                        <p className="stat-number">{stats.activeBookings}</p>
                    </div>
                </div>

                <div className="analytics-section">
                    <h3>{t('admin.analytics')}</h3>
                    <div className="analytics-filters">
                        <input
                            type="date"
                            value={analyticsDate.from}
                            onChange={(e) => setAnalyticsDate(prev => ({ ...prev, from: e.target.value }))}
                            placeholder={t('admin.dateFrom')}
                        />
                        <input
                            type="date"
                            value={analyticsDate.to}
                            onChange={(e) => setAnalyticsDate(prev => ({ ...prev, to: e.target.value }))}
                            placeholder={t('admin.dateTo')}
                        />
                    </div>
                    {analytics && (
                        <div className="analytics-results">
                            <p><strong>{t('admin.periodBookings')}:</strong> {analytics.totalBookings}</p>
                            <p><strong>{t('admin.periodAdults')}:</strong> {analytics.totalAdults}</p>
                            <p><strong>{t('admin.periodChildren')}:</strong> {analytics.totalChildren}</p>
                            <p><strong>{t('admin.periodTotalGuests')}:</strong> {analytics.totalGuests}</p>
                        </div>
                    )}
                </div>

                <div className="filters-section">
                    <h3>{t('admin.filters')}</h3>
                    <div className="filters-grid">
                        <div className="filter-group">
                            <label>{t('admin.search')}</label>
                            <input
                                type="text"
                                value={filters.searchTerm}
                                onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                                placeholder={t('admin.searchPlaceholder')}
                            />
                        </div>
                        <div className="filter-group">
                            <label>{t('admin.dateFrom')}</label>
                            <input
                                type="date"
                                value={filters.dateFrom}
                                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                            />
                        </div>
                        <div className="filter-group">
                            <label>{t('admin.dateTo')}</label>
                            <input
                                type="date"
                                value={filters.dateTo}
                                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                            />
                        </div>
                        <div className="filter-group">
                            <label>{t('admin.roomType')}</label>
                            <select
                                value={filters.roomType}
                                onChange={(e) => setFilters(prev => ({ ...prev, roomType: e.target.value }))}
                            >
                                <option value="all">{t('admin.allRoomTypes')}</option>
                                {roomTypes.map((type) => (
                                    <option key={type} value={type}>
                                        {type}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>{t('admin.guestCount')}</label>
                            <select
                                value={filters.guestCount}
                                onChange={(e) => setFilters(prev => ({ ...prev, guestCount: e.target.value }))}
                            >
                                <option value="all">{t('admin.allGuests')}</option>
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                                <option value="5">5+</option>
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>{t('admin.status')}</label>
                            <select
                                value={filters.status}
                                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                            >
                                <option value="all">{t('admin.allStatuses')}</option>
                                <option value="active">{t('admin.active')}</option>
                                <option value="current">{t('admin.current')}</option>
                                <option value="completed">{t('admin.completed')}</option>
                            </select>
                        </div>
                    </div>
                    <button className="export-btn" onClick={exportData}>
                        {t('admin.exportData')}
                    </button>
                </div>

                <div className="bookings-table-container">
                    <h3>{t('admin.bookingsList')}</h3>
                    <table className="bookings-table">
                        <thead>
                            <tr>
                                <th onClick={() => handleSort('bookingConfirmationCode')}>
                                    {t('admin.bookingCode')} {sortConfig.key === 'bookingConfirmationCode' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th onClick={() => handleSort('user.name')}>
                                    {t('admin.guestName')} {sortConfig.key === 'user.name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th onClick={() => handleSort('bookingDate')}>
                                    {t('admin.bookingDate')} {sortConfig.key === 'bookingDate' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th onClick={() => handleSort('checkInDate')}>
                                    {t('admin.checkInDate')} {sortConfig.key === 'checkInDate' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th onClick={() => handleSort('checkOutDate')}>
                                    {t('admin.checkOutDate')} {sortConfig.key === 'checkOutDate' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th onClick={() => handleSort('totalNumOfGuest')}>
                                    {t('admin.guests')} {sortConfig.key === 'totalNumOfGuest' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th>{t('admin.totalPrice')}</th>
                                <th>{t('admin.status')}</th>
                                <th>{t('admin.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentBookings.map((booking) => (
                                <tr key={booking.id}>
                                    <td>{booking.bookingConfirmationCode}</td>
                                    <td>{booking.user?.name || 'N/A'}</td>
                                    <td>{formatDateTime(booking.bookingDate)}</td>
                                    <td>{booking.checkInDate}</td>
                                    <td>{booking.checkOutDate}</td>
                                    <td>
                                        {booking.numOfAdults || 0} {t('admin.adults')}, {booking.numOfChildren || 0} {t('admin.children')}
                                    </td>
                                    <td>
                                        {(() => {
                                            const totalPrice = calculateBookingTotalPrice(booking);
                                            return totalPrice > 0 ? `€${totalPrice.toFixed(2)}` : 'N/A';
                                        })()}
                                    </td>
                                    <td>
                                        <span className={`status-badge status-${getBookingStatus(booking).toLowerCase()}`}>
                                            {getBookingStatus(booking)}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                            <button
                                                className="manage-btn"
                                                onClick={() => router.push(`/admin/edit-booking/${booking.bookingConfirmationCode}`)}
                                            >
                                                {t('admin.manage')}
                                            </button>
                                            <button
                                                className="manage-btn"
                                                style={{ backgroundColor: '#00796b' }}
                                                onClick={() => router.push(`/admin/checkin-form/${booking.bookingConfirmationCode}`)}
                                            >
                                                {t('admin.printCheckInForm')}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <Pagination
                    roomsPerPage={bookingsPerPage}
                    totalRooms={sortedBookings.length}
                    currentPage={currentPage}
                    paginate={paginate}
                />
            </div>
        </StaffRoute>
    );
}
