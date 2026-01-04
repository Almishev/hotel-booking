'use client';

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import ApiService from '@/lib/service/ApiService';
import { StaffRoute } from '@/lib/service/guard';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';

interface RoomSummary {
    id: number;
    roomType: string;
}

interface BookingSummary {
    id: number;
    room?: {
        id: number;
        roomType: string;
    };
    checkInDate: string;
    checkOutDate: string;
}

export default function AdminPage() {
    const { t } = useTranslation();
    const [adminName, setAdminName] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const [rooms, setRooms] = useState<RoomSummary[]>([]);
    const [bookings, setBookings] = useState<BookingSummary[]>([]);
    const [startDate, setStartDate] = useState<string>(''); // начало на периода за календара
    const [endDate, setEndDate] = useState<string>('');     // край на периода за календара
    const [reportDate, setReportDate] = useState<string>(''); // дата за справките
    const [showCalendarModal, setShowCalendarModal] = useState<boolean>(false); // показване на модал с календара
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [profile, roomsResponse, bookingsResponse] = await Promise.all([
                    ApiService.getUserProfile(),
                    ApiService.getAllRooms(),
                    ApiService.getAllBookings()
                ]);

                setAdminName(profile.user.name);
                setIsAdmin(ApiService.isAdmin());

                const roomList = roomsResponse.roomList || [];
                setRooms(roomList.map((r: any) => ({
                    id: r.id,
                    roomType: r.roomType
                })));

                const bookingList = bookingsResponse.bookingList || [];
                setBookings(bookingList);

                // инициално задаваме период: днес + следващите 14 дни
                const today = new Date();
                const todayISO = today.toISOString().slice(0, 10);
                const after14 = new Date(today);
                after14.setDate(today.getDate() + 13);
                const after14ISO = after14.toISOString().slice(0, 10);
                setStartDate(todayISO);
                setEndDate(after14ISO);
                setReportDate(todayISO);
            } catch (error: any) {
                console.error('Error fetching admin dashboard data:', error.message);
            }
        };

        fetchData();
    }, []);

    // генерираме масив с дни в избрания диапазон
    const days = useMemo(() => {
        const result: Date[] = [];
        if (!startDate || !endDate) return result;

        const start = new Date(startDate);
        const end = new Date(endDate);
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);
        if (end < start) return result;

        const current = new Date(start);
        while (current <= end) {
            result.push(new Date(current));
            current.setDate(current.getDate() + 1);
        }
        return result;
    }, [startDate, endDate]);

    const formatDayLabel = (date: Date) => {
        return date.toLocaleDateString('bg-BG', {
            day: '2-digit',
            month: '2-digit'
        });
    };

    const isRoomOccupiedOnDate = (roomId: number, date: Date) => {
        return bookings.some((b) => {
            if (!b.room || b.room.id !== roomId) return false;
            const checkIn = new Date(b.checkInDate);
            const checkOut = new Date(b.checkOutDate);
            checkIn.setHours(0, 0, 0, 0);
            checkOut.setHours(0, 0, 0, 0);
            // приемаме, че checkIn е включително, checkOut е изключително
            return date >= checkIn && date < checkOut;
        });
    };

    // помощни функции за справките
    const parseISODate = (value: string) => {
        if (!value) return null;
        const d = new Date(value);
        if (isNaN(d.getTime())) return null;
        d.setHours(0, 0, 0, 0);
        return d;
    };

    const getReportDataForDate = (isoDate: string) => {
        const target = parseISODate(isoDate);
        if (!target) {
            return {
                stayingBookings: [] as BookingSummary[],
                arrivingBookings: [] as BookingSummary[],
                departingBookings: [] as BookingSummary[]
            };
        }

        const stayingBookings = bookings.filter((b) => {
            if (!b.room) return false;
            const checkIn = parseISODate(b.checkInDate);
            const checkOut = parseISODate(b.checkOutDate);
            if (!checkIn || !checkOut) return false;
            // checkIn ≤ target < checkOut
            return target >= checkIn && target < checkOut;
        });

        const arrivingBookings = bookings.filter((b) => {
            const checkIn = parseISODate(b.checkInDate);
            if (!checkIn) return false;
            return checkIn.getTime() === target.getTime();
        });

        const departingBookings = bookings.filter((b) => {
            const checkOut = parseISODate(b.checkOutDate);
            if (!checkOut) return false;
            return checkOut.getTime() === target.getTime();
        });

        return { stayingBookings, arrivingBookings, departingBookings };
    };

    const report = getReportDataForDate(reportDate);

    const handlePrintReport = () => {
        if (typeof window !== 'undefined') {
            window.print();
        }
    };

    const handlePrintCalendar = () => {
        if (typeof window !== 'undefined') {
            window.print();
        }
    };

    return (
        <StaffRoute>
            <div className="admin-page">
                <h1 className="welcome-message">{t('admin.welcome', { name: adminName })}</h1>
                <div className="admin-actions">
                    {isAdmin && (
                        <button className="admin-button" onClick={() => router.push('/admin/manage-rooms')}>
                            {t('admin.manageRooms')}
                        </button>
                    )}
                    <button className="admin-button" onClick={() => router.push('/admin/manage-bookings')}>
                        {t('admin.manageBookings')}
                    </button>
                    <button className="admin-button" onClick={() => router.push('/admin/add-booking')}>
                        {t('admin.addBooking')}
                    </button>
                    {isAdmin && (
                        <>
                            <button className="admin-button" onClick={() => router.push('/admin/manage-packages')}>
                                {t('admin.managePackages')}
                            </button>
                            <button className="admin-button" onClick={() => router.push('/admin/manage-room-prices')}>
                                {t('admin.manageRoomPrices') || 'Manage Room Prices'}
                            </button>
                        </>
                    )}
                    <button
                        className="admin-button"
                        onClick={() => setShowCalendarModal(true)}
                    >
                        {t('admin.occupancyCalendar')}
                    </button>
                </div>

                {/* Модален прозорец с календар за заетост по стаи за избран период */}
                {showCalendarModal && (
                    <div
                        className="calendar-modal-overlay"
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000
                        }}
                    >
                        <div
                            className="calendar-modal-content"
                            style={{
                                backgroundColor: '#fff',
                                borderRadius: '8px',
                                maxWidth: '95%',
                                maxHeight: '90%',
                                width: '1200px',
                                padding: '1.5rem',
                                overflow: 'auto',
                                boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h2 style={{ margin: 0 }}>{t('admin.occupancyCalendarTitle')}</h2>
                                <button
                                    type="button"
                                    onClick={() => setShowCalendarModal(false)}
                                    style={{
                                        border: '1px solid #ccc',
                                        borderRadius: '50%',
                                        width: '32px',
                                        height: '32px',
                                        background: 'blue',
                                        fontSize: '1.2rem',
                                        cursor: 'pointer',
                                        lineHeight: '30px',
                                        textAlign: 'center'
                                    }}
                                    aria-label={t('admin.closeCalendar')}
                                >
                                    ×
                                </button>
                            </div>

                            <div className="calendar-date-inputs" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.25rem' }}>{t('admin.fromDate')}</label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.25rem' }}>{t('admin.toDate')}</label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                    />
                                </div>
                                {(!startDate || !endDate || days.length === 0) && (
                                    <span style={{ color: '#c62828', fontSize: '0.9rem' }}>
                                        {t('admin.selectValidPeriod')}
                                    </span>
                                )}
                            </div>

                            <div className="calendar-table-wrapper" style={{ overflowX: 'auto' }}>
                                <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: '600px' }}>
                                    <thead>
                                        <tr>
                                            <th style={{ border: '1px solid #ddd', padding: '0.5rem', backgroundColor: '#f5f5f5' }}>
                                                {t('admin.room')}
                                            </th>
                                            {days.map((day) => (
                                                <th
                                                    key={day.toISOString()}
                                                    style={{ border: '1px solid #ddd', padding: '0.5rem', backgroundColor: '#f5f5f5', textAlign: 'center' }}
                                                >
                                                    {formatDayLabel(day)}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rooms.map((room) => (
                                            <tr key={room.id}>
                                                <td style={{ border: '1px solid #ddd', padding: '0.5rem', whiteSpace: 'nowrap' }}>
                                                    #{room.id} - {room.roomType}
                                                </td>
                                                {days.map((day) => {
                                                    const occupied = isRoomOccupiedOnDate(room.id, day);
                                                    return (
                                                        <td
                                                            key={room.id + '-' + day.toISOString()}
                                                            style={{
                                                                border: '1px solid #eee',
                                                                padding: '0.3rem',
                                                                textAlign: 'center',
                                                                backgroundColor: occupied ? '#ffcdd2' : '#c8e6c9',
                                                                color: '#333',
                                                                fontSize: '0.8rem'
                                                            }}
                                                        >
                                                            {occupied ? t('admin.occupied') : t('admin.available')}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Допълнителен бутон за затваряне долу, за по-лесен достъп */}
                            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <button
                                    type="button"
                                    onClick={handlePrintCalendar}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        borderRadius: '4px',
                                        border: 'none',
                                        backgroundColor: '#00796b',
                                        color: '#fff',
                                        cursor: 'pointer',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    {t('admin.printCalendar')}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowCalendarModal(false)}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        borderRadius: '4px',
                                        border: '1px solid #ccc',
                                        backgroundColor: 'blue',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {t('admin.close')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Справки по дата */}
                <div style={{ marginTop: '2rem', marginBottom: '2rem' }}>
                    <h2 style={{ marginBottom: '1rem' }}>{t('admin.reportsForDate')}</h2>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.25rem' }}>{t('admin.dateForReport')}</label>
                            <input
                                type="date"
                                value={reportDate}
                                onChange={(e) => setReportDate(e.target.value)}
                            />
                        </div>
                        <button
                            type="button"
                            onClick={handlePrintReport}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '4px',
                                border: 'none',
                                backgroundColor: '#00796b',
                                color: '#fff',
                                cursor: 'pointer'
                            }}
                        >
                            {t('admin.printReport')}
                        </button>
                    </div>

                    {/* Справка: колко човека и от кои стаи нощуват в хотела */}
                    <div style={{ marginBottom: '1.5rem', border: '1px solid #ddd', borderRadius: '8px', padding: '1rem', backgroundColor: '#fafafa' }}>
                        <h3 style={{ marginBottom: '0.5rem' }}>{t('admin.stayingGuests')}</h3>
                        <p style={{ marginBottom: '0.5rem' }}>
                            {t('admin.totalReservations')}: <strong>{report.stayingBookings.length}</strong>
                        </p>
                        <p style={{ marginBottom: '0.5rem' }}>
                            {t('admin.totalRooms')}: <strong>{new Set(report.stayingBookings.map(b => b.room?.id)).size}</strong>
                        </p>
                        <p style={{ marginBottom: '0.5rem' }}>
                            {t('admin.guestCountNote')}
                        </p>
                        <ul style={{ paddingLeft: '1.2rem', margin: 0 }}>
                            {report.stayingBookings.map((b) => (
                                <li key={b.id}>
                                    {t('admin.roomStayInfo', { roomId: b.room?.id, roomType: b.room?.roomType, checkIn: b.checkInDate, checkOut: b.checkOutDate })}
                                </li>
                            ))}
                            {report.stayingBookings.length === 0 && <li>{t('admin.noStayingGuests')}</li>}
                        </ul>
                    </div>

                    {/* Справка: колко стаи се освобождават */}
                    <div style={{ marginBottom: '1.5rem', border: '1px solid #ddd', borderRadius: '8px', padding: '1rem', backgroundColor: '#fafafa' }}>
                        <h3 style={{ marginBottom: '0.5rem' }}>{t('admin.departingRooms')}</h3>
                        <p style={{ marginBottom: '0.5rem' }}>
                            {t('admin.totalDepartingRooms')}: <strong>{new Set(report.departingBookings.map(b => b.room?.id)).size}</strong>
                        </p>
                        <ul style={{ paddingLeft: '1.2rem', margin: 0 }}>
                            {report.departingBookings.map((b) => (
                                <li key={b.id}>
                                    {t('admin.roomDepartureInfo', { roomId: b.room?.id, roomType: b.room?.roomType, checkOut: b.checkOutDate })}
                                </li>
                            ))}
                            {report.departingBookings.length === 0 && <li>{t('admin.noDepartingRooms')}</li>}
                        </ul>
                    </div>

                    {/* Справка: колко стаи пристигат */}
                    <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1rem', backgroundColor: '#fafafa' }}>
                        <h3 style={{ marginBottom: '0.5rem' }}>{t('admin.arrivingRooms')}</h3>
                        <p style={{ marginBottom: '0.5rem' }}>
                            {t('admin.totalArrivingRooms')}: <strong>{new Set(report.arrivingBookings.map(b => b.room?.id)).size}</strong>
                        </p>
                        <ul style={{ paddingLeft: '1.2rem', margin: 0 }}>
                            {report.arrivingBookings.map((b) => (
                                <li key={b.id}>
                                    {t('admin.roomArrivalInfo', { roomId: b.room?.id, roomType: b.room?.roomType, checkIn: b.checkInDate })}
                                </li>
                            ))}
                            {report.arrivingBookings.length === 0 && <li>{t('admin.noArrivingRooms')}</li>}
                        </ul>
                    </div>
                </div>
            </div>
        </StaffRoute>
    );
}

