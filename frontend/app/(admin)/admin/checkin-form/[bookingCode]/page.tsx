"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ApiService from "@/lib/service/ApiService";
import { StaffRoute } from "@/lib/service/guard";
import { useTranslation } from "react-i18next";
import "@/lib/i18n";

interface BookingDetails {
  bookingConfirmationCode: string;
  checkInDate: string;
  checkOutDate: string;
  numOfAdults: number;
  numOfChildren: number;
  totalNumOfGuest: number;
  bookingDate?: string;
  room?: {
    id: number;
    roomType: string;
  };
  user?: {
    name?: string;
    email?: string;
    phoneNumber?: string;
  };
}

export default function CheckInFormPage() {
  const { t } = useTranslation();
  const params = useParams();
  const bookingCode = params?.bookingCode as string;

  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingCode) return;
      try {
        setLoading(true);
        const response = await ApiService.getBookingByConfirmationCode(bookingCode);
        if (response.statusCode === 200 && response.booking) {
          setBooking(response.booking);
        } else {
          setError(response.message || "Booking not found");
        }
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || "Error loading booking");
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingCode]);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("bg-BG", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <StaffRoute>
      <div style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto", marginBottom: "50px" }}>
        {/* Buttons visible only on screen, not on print */}
        <div style={{ marginBottom: "1.5rem", display: "flex", gap: "1rem", printColorAdjust: "exact" }} className="no-print">
          <button
            onClick={() => history.back()}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "4px",
              border: "1px solid #ccc",
              backgroundColor: "blue",
              cursor: "pointer",
            }}
          >
            ← {t("admin.backToBookings") || "Назад към резервациите"}
          </button>
          <button
            onClick={handlePrint}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "4px",
              border: "none",
              backgroundColor: "#00796b",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            {t("admin.printForm") || "Принтирай формуляра"}
          </button>
        </div>

        {loading && <p>{t("admin.loading") || "Зареждане..."}</p>}
        {error && !loading && <p className="error-message">{error}</p>}

        {booking && (
          <div
            style={{
              border: "1px solid #ddd",
              padding: "2rem",
              borderRadius: "8px",
              backgroundColor: "#fff",
              color: "#000",
            }}
          >
            <h1 style={{ textAlign: "center", marginBottom: "0.5rem", fontSize: "1.8rem" }}>
              Формуляр за настаняване
            </h1>
            <p style={{ textAlign: "center", marginBottom: "1.5rem" }}>Phegon Hotel</p>

            {/* 1. Данни за госта */}
            <h2 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>1. Данни за госта</h2>
            <p>Име и фамилия: ________________________________ {booking.user?.name && `(${booking.user.name})`}</p>
            <p>Дата на раждане: ______________________________</p>
            <p>Националност: _________________________________</p>
            <p>Адрес по лична карта: _________________________</p>
            <p>_______________________________________________</p>
            <p>Телефон: ______________________ {booking.user?.phoneNumber && `(${booking.user.phoneNumber})`}</p>
            <p>E-mail: _______________________ {booking.user?.email && `(${booking.user.email})`}</p>

            {/* 2. Документ за самоличност */}
            <h2 style={{ fontSize: "1.1rem", margin: "1.5rem 0 0.5rem" }}>2. Документ за самоличност</h2>
            <p>
              Вид документ:
              [ ] Лична карта   [ ] Паспорт   [ ] Друг: ______________________
            </p>
            <p>Номер на документа: ___________________________</p>
            <p>Издаден от (държава): ________________________</p>
            <p>Валиден до: ___________________________________</p>

            {/* 3. Данни за престоя */}
            <h2 style={{ fontSize: "1.1rem", margin: "1.5rem 0 0.5rem" }}>3. Данни за престоя</h2>
            <p>
              Номер на стая: ________________________________ {booking.room?.id && `(${booking.room.id})`}
            </p>
            <p>
              Тип стая: _____________________________________ {booking.room?.roomType && `(${booking.room.roomType})`}
            </p>
            <p>
              Дата на настаняване: __________________________ {booking.checkInDate && `(${formatDate(booking.checkInDate)})`}
            </p>
            <p>
              Дата на освобождаване: ________________________ {booking.checkOutDate && `(${formatDate(booking.checkOutDate)})`}
            </p>
            <p>
              Брой нощувки: ________________________________ {/* може да се изчисли ръчно от рецепцията */}
            </p>
            <p>
              Брой възрастни: ______________________________ {booking.numOfAdults ?? 0}
            </p>
            <p>
              Брой деца: ___________________________________ {booking.numOfChildren ?? 0}
            </p>
            <p>
              Код на резервацията (от системата): __________ {booking.bookingConfirmationCode}
            </p>

            {/* 4. Допълнителна информация */}
            <h2 style={{ fontSize: "1.1rem", margin: "1.5rem 0 0.5rem" }}>4. Допълнителна информация</h2>
            <p>Рег. номер на автомобил: ______________________</p>
            <p>Специални изисквания / бележки: _______________</p>
            <p>_______________________________________________</p>

            {/* 5. Съгласие и подпис */}
            <h2 style={{ fontSize: "1.1rem", margin: "1.5rem 0 0.5rem" }}>5. Съгласие и подпис</h2>
            <p style={{ marginBottom: "1rem" }}>
              С подписа си декларирам, че предоставените данни са верни и се съгласявам те да бъдат обработвани от
              хотела за целите на настаняването, съгласно действащото законодателство и правилата на хотела.
            </p>
            <p>
              Дата: _______________   Подпис на госта: _________________________
            </p>
            <p>
              Дата: _______________   Подпис на рецепционист: __________________
            </p>
          </div>
        )}
      </div>
    </StaffRoute>
  );
}
