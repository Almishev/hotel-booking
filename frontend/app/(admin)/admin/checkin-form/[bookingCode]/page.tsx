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
            ← {t("admin.backToBookings")}
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
            {t("admin.printForm")}
          </button>
        </div>

        {loading && <p>{t("admin.loading")}</p>}
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
              {t('admin.checkInFormTitle')}
            </h1>
            <p style={{ textAlign: "center", marginBottom: "1.5rem" }}>Phegon Hotel</p>

            {/* 1. Данни за госта */}
            <h2 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>{t('admin.guestData')}</h2>
            <p>{t('admin.fullName')}: ________________________________ {booking.user?.name && `(${booking.user.name})`}</p>
            <p>{t('admin.dateOfBirth')}: ______________________________</p>
            <p>{t('admin.nationality')}: _________________________________</p>
            <p>{t('admin.addressFromId')}: _________________________</p>
            <p>_______________________________________________</p>
            <p>{t('admin.phone')}: ______________________ {booking.user?.phoneNumber && `(${booking.user.phoneNumber})`}</p>
            <p>{t('admin.email')}: _______________________ {booking.user?.email && `(${booking.user.email})`}</p>

            {/* 2. Документ за самоличност */}
            <h2 style={{ fontSize: "1.1rem", margin: "1.5rem 0 0.5rem" }}>{t('admin.identityDocument')}</h2>
            <p>
              {t('admin.documentType')}:
              [ ] {t('admin.idCard')}   [ ] {t('admin.passport')}   [ ] {t('admin.other')}: ______________________
            </p>
            <p>{t('admin.documentNumber')}: ___________________________</p>
            <p>{t('admin.issuedBy')}: ________________________</p>
            <p>{t('admin.validUntil')}: ___________________________________</p>

            {/* 3. Данни за престоя */}
            <h2 style={{ fontSize: "1.1rem", margin: "1.5rem 0 0.5rem" }}>{t('admin.stayData')}</h2>
            <p>
              {t('admin.roomNumber')}: ________________________________ {booking.room?.id && `(${booking.room.id})`}
            </p>
            <p>
              {t('admin.roomType')}: _____________________________________ {booking.room?.roomType && `(${booking.room.roomType})`}
            </p>
            <p>
              {t('admin.checkInDate')}: __________________________ {booking.checkInDate && `(${formatDate(booking.checkInDate)})`}
            </p>
            <p>
              {t('admin.checkOutDate')}: ________________________ {booking.checkOutDate && `(${formatDate(booking.checkOutDate)})`}
            </p>
            <p>
              {t('admin.numberOfNights')}: ________________________________ {/* може да се изчисли ръчно от рецепцията */}
            </p>
            <p>
              {t('admin.numberOfAdults')}: ______________________________ {booking.numOfAdults ?? 0}
            </p>
            <p>
              {t('admin.numberOfChildren')}: ___________________________________ {booking.numOfChildren ?? 0}
            </p>
            <p>
              {t('admin.bookingCodeSystem')}: __________ {booking.bookingConfirmationCode}
            </p>

            {/* 4. Допълнителна информация */}
            <h2 style={{ fontSize: "1.1rem", margin: "1.5rem 0 0.5rem" }}>{t('admin.additionalInfo')}</h2>
            <p>{t('admin.carRegistration')}: ______________________</p>
            <p>{t('admin.specialRequirements')}: _______________</p>
            <p>_______________________________________________</p>

            {/* 5. Съгласие и подпис */}
            <h2 style={{ fontSize: "1.1rem", margin: "1.5rem 0 0.5rem" }}>{t('admin.consentAndSignature')}</h2>
            <p style={{ marginBottom: "1rem" }}>
              {t('admin.consentText')}
            </p>
            <p>
              {t('admin.date')}: _______________   {t('admin.guestSignature')}: _________________________
            </p>
            <p>
              {t('admin.date')}: _______________   {t('admin.receptionistSignature')}: __________________
            </p>
          </div>
        )}
      </div>
    </StaffRoute>
  );
}
