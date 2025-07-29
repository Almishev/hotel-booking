import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ApiService from '../../service/ApiService';
import Pagination from '../common/Pagination';

const ManageBookingsPage = () => {
    const { t } = useTranslation();
    const [bookings, setBookings] = useState([]);
    const [filteredBookings, setFilteredBookings] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [bookingsPerPage] = useState(10);
    const navigate = useNavigate();

    // Dashboard Statistics
    const [stats, setStats] = useState({
        totalBookings: 0,
        totalGuests: 0,
        totalAdults: 0,
        totalChildren: 0,
        totalRevenue: 0,
        activeBookings: 0
    });

    // Filters
    const [filters, setFilters] = useState({
        searchTerm: '',
        dateFrom: '',
        dateTo: '',
        roomType: 'all',
        guestCount: 'all',
        status: 'all'
    });

    // Sorting
    const [sortConfig, setSortConfig] = useState({
        key: 'checkInDate',
        direction: 'desc'
    });

    // Date range for analytics
    const [analyticsDate, setAnalyticsDate] = useState({
        from: '',
        to: ''
    });

    // Calculate statistics
    const calculateStats = useCallback((bookingsData) => {
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
            
            // Calculate revenue (assuming $100 per night as average)
            const checkIn = new Date(booking.checkInDate);
            const checkOut = new Date(booking.checkOutDate);
            const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
            stats.totalRevenue += nights * 100;

            // Count active bookings (future bookings)
            if (new Date(booking.checkInDate) > new Date()) {
                stats.activeBookings++;
            }
        });

        setStats(stats);
    }, []);

    // Filter bookings
    const filterBookings = () => {
        console.log('filterBookings called with:', { bookings: bookings.length, filters });
        let filtered = [...bookings];

        // Search by booking code
        if (filters.searchTerm) {
            filtered = filtered.filter(booking =>
                booking.bookingConfirmationCode?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                booking.user?.name?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                booking.user?.email?.toLowerCase().includes(filters.searchTerm.toLowerCase())
            );
        }

        // Filter by date range
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

        // Filter by room type
        if (filters.roomType && filters.roomType !== 'all') {
            filtered = filtered.filter(booking => 
                booking.room?.roomType === filters.roomType
            );
        }

        // Filter by guest count
        if (filters.guestCount && filters.guestCount !== 'all') {
            filtered = filtered.filter(booking => 
                booking.totalNumOfGuest === parseInt(filters.guestCount)
            );
        }

        // Filter by status
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

        console.log('Filtered result:', filtered.length);
        setFilteredBookings(filtered);
        setCurrentPage(1);
    };

    // Sort bookings
    const sortBookings = useCallback(() => {
        const sorted = [...filteredBookings].sort((a, b) => {
            let aValue = a[sortConfig.key];
            let bValue = b[sortConfig.key];

            // Handle date sorting
            if (sortConfig.key.includes('Date')) {
                aValue = new Date(aValue);
                bValue = new Date(bValue);
            }

            // Handle numeric sorting
            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
            }

            // Handle string sorting
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return sortConfig.direction === 'asc' 
                    ? aValue.localeCompare(bValue) 
                    : bValue.localeCompare(aValue);
            }

            return 0;
        });

        setFilteredBookings(sorted);
    }, [filteredBookings, sortConfig]);

    // Handle sort
    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    // Export data
    const exportData = () => {
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

    // Get booking status
    const getBookingStatus = (booking) => {
        const today = new Date();
        const checkIn = new Date(booking.checkInDate);
        const checkOut = new Date(booking.checkOutDate);

        if (checkIn > today) return 'Active';
        if (checkOut < today) return 'Completed';
        return 'Current';
    };

    // Get analytics for date range
    const getAnalytics = () => {
        if (!analyticsDate.from || !analyticsDate.to) return null;

        const filtered = bookings.filter(booking => {
            const bookingDate = new Date(booking.checkInDate);
            return bookingDate >= new Date(analyticsDate.from) && 
                   bookingDate <= new Date(analyticsDate.to);
        });

        const analytics = {
            totalBookings: filtered.length,
            totalAdults: filtered.reduce((sum, b) => sum + (b.numOfAdults || 0), 0),
            totalChildren: filtered.reduce((sum, b) => sum + (b.numOfChildren || 0), 0),
            totalGuests: filtered.reduce((sum, b) => sum + (b.totalNumOfGuest || 0), 0)
        };

        return analytics;
    };

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                console.log('Fetching bookings...');
                const response = await ApiService.getAllBookings();
                console.log('API Response:', response);
                const allBookings = response.bookingList;
                console.log('All Bookings:', allBookings);
                setBookings(allBookings);
                setFilteredBookings(allBookings);
                calculateStats(allBookings);
            } catch (error) {
                console.error('Error fetching bookings:', error.message);
            }
        };

        fetchBookings();
    }, [calculateStats]);

    useEffect(() => {
        if (bookings.length > 0) {
            filterBookings();
        }
    }, [bookings, filters]);

    useEffect(() => {
        sortBookings();
    }, [sortBookings]);

    const indexOfLastBooking = currentPage * bookingsPerPage;
    const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
    const currentBookings = filteredBookings.slice(indexOfFirstBooking, indexOfLastBooking);
    
    console.log('Filtered Bookings:', filteredBookings);
    console.log('Current Bookings:', currentBookings);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const analytics = getAnalytics();

    return (
        <div className='admin-dashboard'>
            <h2>{t('admin.dashboardTitle')}</h2>
            
            {/* Dashboard Statistics */}
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

            {/* Analytics Section */}
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

            {/* Filters Section */}
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

            {/* Bookings Table */}
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
                                        onClick={() => navigate(`/admin/edit-booking/${booking.bookingConfirmationCode}`)}
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
    );
};

export default ManageBookingsPage;
