'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ApiService from '@/lib/service/ApiService';
import { AdminRoute } from '@/lib/service/guard';
import Pagination from '@/components/common/Pagination';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';

export default function ManageBookingsPage() {
    const { t } = useTranslation();
    const [bookings, setBookings] = useState<any[]>([]);
    const [filteredBookings, setFilteredBookings] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [bookingsPerPage] = useState(10);
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
            
            const checkIn = new Date(booking.checkInDate);
            const checkOut = new Date(booking.checkOutDate);
            const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
            stats.totalRevenue += nights * 100;

            if (new Date(booking.checkInDate) > new Date()) {
                stats.activeBookings++;
            }
        });

        setStats(stats);
    }, []);

    const filterBookings = useCallback(() => {
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

        setFilteredBookings(filtered);
        setCurrentPage(1);
    }, [bookings, filters]);

    const sortBookings = useCallback(() => {
        const sorted = [...filteredBookings].sort((a, b) => {
            let aValue: any = a[sortConfig.key as keyof typeof a];
            let bValue: any = b[sortConfig.key as keyof typeof b];

            if (sortConfig.key === 'user.name') {
                aValue = a.user?.name || '';
                bValue = b.user?.name || '';
            }

            if (sortConfig.key.includes('Date')) {
                aValue = new Date(aValue);
                bValue = new Date(bValue);
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

        setFilteredBookings(sorted);
    }, [filteredBookings, sortConfig]);

    const handleSort = (key: string) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const exportData = () => {
        if (!filteredBookings || filteredBookings.length === 0) {
            alert('No data to export. Please apply filters or wait for data to load.');
            return;
        }

        const data = filteredBookings.map(booking => ({
            'Booking Code': booking.bookingConfirmationCode,
            'Guest Name': booking.user?.name || 'N/A',
            'Email': booking.user?.email || 'N/A',
            'Check-in': booking.checkInDate,
            'Check-out': booking.checkOutDate,
            'Adults': booking.numOfAdults,
            'Children': booking.numOfChildren,
            'Total Guests': booking.totalNumOfGuest,
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
        const fetchBookings = async () => {
            try {
                const response = await ApiService.getAllBookings();
                const allBookings = response.bookingList || [];
                setBookings(allBookings);
                setFilteredBookings(allBookings);
                calculateStats(allBookings);
            } catch (error: any) {
                console.error('Error fetching bookings:', error.message);
            }
        };

        fetchBookings();
    }, [calculateStats]);

    useEffect(() => {
        if (bookings.length > 0) {
            filterBookings();
        }
    }, [bookings, filters, filterBookings]);

    useEffect(() => {
        if (filteredBookings.length > 0) {
            sortBookings();
        }
    }, [sortConfig, sortBookings]);

    const indexOfLastBooking = currentPage * bookingsPerPage;
    const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
    const currentBookings = filteredBookings.slice(indexOfFirstBooking, indexOfLastBooking);

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    const analytics = getAnalytics();

    return (
        <AdminRoute>
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
                        <p className="stat-number">${stats.totalRevenue.toLocaleString()}</p>
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
                                <option value="Delux">Delux</option>
                                <option value="Standard">Standard</option>
                                <option value="Suite">Suite</option>
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
                                <th onClick={() => handleSort('checkInDate')}>
                                    {t('admin.checkInDate')} {sortConfig.key === 'checkInDate' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th onClick={() => handleSort('checkOutDate')}>
                                    {t('admin.checkOutDate')} {sortConfig.key === 'checkOutDate' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th onClick={() => handleSort('totalNumOfGuest')}>
                                    {t('admin.guests')} {sortConfig.key === 'totalNumOfGuest' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th>{t('admin.status')}</th>
                                <th>{t('admin.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentBookings.map((booking) => (
                                <tr key={booking.id}>
                                    <td>{booking.bookingConfirmationCode}</td>
                                    <td>{booking.user?.name || 'N/A'}</td>
                                    <td>{booking.checkInDate}</td>
                                    <td>{booking.checkOutDate}</td>
                                    <td>
                                        {booking.numOfAdults || 0} {t('admin.adults')}, {booking.numOfChildren || 0} {t('admin.children')}
                                    </td>
                                    <td>
                                        <span className={`status-badge status-${getBookingStatus(booking).toLowerCase()}`}>
                                            {getBookingStatus(booking)}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className="manage-btn"
                                            onClick={() => router.push(`/admin/edit-booking/${booking.bookingConfirmationCode}`)}
                                        >
                                            {t('admin.manage')}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <Pagination
                    roomsPerPage={bookingsPerPage}
                    totalRooms={filteredBookings.length}
                    currentPage={currentPage}
                    paginate={paginate}
                />
            </div>
        </AdminRoute>
    );
}
