'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ApiService from '@/lib/service/ApiService';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';
import Link from 'next/link';

export default function PackageDetailsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const packageId = params.packageId as string;
  
  const [packageDetails, setPackageDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPackage = async () => {
      try {
        setLoading(true);
        const response = await ApiService.getHolidayPackageById(packageId);
        if (response.statusCode === 200 && response.holidayPackage) {
          setPackageDetails(response.holidayPackage);
        } else {
          setError(response.message || 'Package not found');
        }
      } catch (error: any) {
        console.error('Error fetching package:', error.message);
        setError(error.response?.data?.message || error.message || 'Error loading package');
      } finally {
        setLoading(false);
      }
    };

    if (packageId) {
      fetchPackage();
    }
  }, [packageId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('bg-BG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleBookPackage = (roomType: string) => {
    router.push(`/rooms?packageId=${packageId}&roomType=${encodeURIComponent(roomType)}`);
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>{t('packages.loading')}</p>
      </div>
    );
  }

  if (error || !packageDetails) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p className="error-message">{error || t('packages.noPackages')}</p>
        <Link href="/packages" style={{ marginTop: '1rem', display: 'inline-block', color: '#00796b' }}>
          {t('packages.backToPackages') || '← Back to Packages'}
        </Link>
      </div>
    );
  }

  // Generate structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Offer",
    "name": packageDetails.name,
    "description": packageDetails.description || `${packageDetails.name} package at Phegon Hotel`,
    "priceCurrency": "EUR",
    "availability": packageDetails.isActive ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    "validFrom": packageDetails.startDate,
    "validThrough": packageDetails.endDate,
    "image": packageDetails.packagePhotoUrl || "",
  };

  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <main
        className="package-detail-page"
        style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', marginBottom: '50px' }}
      >
        <Link 
          href="/packages" 
          style={{ 
            display: 'inline-block', 
            marginBottom: '2rem', 
            color: '#00796b',
            textDecoration: 'none',
            fontSize: '1rem'
          }}
        >
          ← {t('packages.backToPackages') || 'Back to Packages'}
        </Link>

        <article
          itemScope
          itemType="https://schema.org/Offer"
          className="package-detail-card"
          style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '2rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            backgroundColor: '#fff',
            position: 'relative'
          }}
        >
          {packageDetails.packagePhotoUrl && (
            <img 
              src={packageDetails.packagePhotoUrl} 
              alt={packageDetails.name}
              itemProp="image"
              className="package-detail-image"
              style={{
                position: 'absolute',
                top: '2rem',
                right: '2rem',
                width: '200px',
                height: '200px',
                objectFit: 'cover',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                zIndex: 1
              }}
            />
          )}
          
          <div
            className="package-detail-content"
            style={{ paddingRight: packageDetails.packagePhotoUrl ? '240px' : '0' }}
          >
            <h1 itemProp="name" style={{ marginBottom: '1rem', color: '#00796b', fontSize: '2rem' }}>
              {packageDetails.name}
            </h1>
            
            <p style={{ marginBottom: '1rem', color: '#666', fontSize: '1.1rem' }}>
              <strong>{t('packages.dates')}:</strong> 
              <time itemProp="validFrom" dateTime={packageDetails.startDate} style={{ marginLeft: '0.5rem' }}>
                {formatDate(packageDetails.startDate)}
              </time> - 
              <time itemProp="validThrough" dateTime={packageDetails.endDate} style={{ marginLeft: '0.5rem' }}>
                {formatDate(packageDetails.endDate)}
              </time>
            </p>
            
            {packageDetails.description && (
              <div 
                itemProp="description" 
                style={{ 
                  marginBottom: '2rem', 
                  color: '#555', 
                  fontSize: '1rem',
                  lineHeight: '1.6'
                }}
              >
                <h2 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', color: '#00796b' }}>
                  {t('packages.description') || 'Description'}
                </h2>
                <p>{packageDetails.description}</p>
              </div>
            )}
          </div>
          
          <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '2px solid #eee' }}>
            <h2 style={{ fontWeight: 'bold', marginBottom: '1rem', color: '#00796b', fontSize: '1.5rem' }}>
              {t('packages.pricesByRoomType')}:
            </h2>
            {packageDetails.roomTypePrices ? (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {Object.entries(packageDetails.roomTypePrices).map(([roomType, price]: [string, any]) => (
                  <div 
                    key={roomType} 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '1rem',
                      backgroundColor: '#f9f9f9',
                      borderRadius: '8px',
                      border: '1px solid #eee'
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#333' }}>
                        {roomType}
                      </span>
                      <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#00796b', marginLeft: '1rem' }}>
                        €{price}
                      </span>
                    </div>
                    <button
                      onClick={() => handleBookPackage(roomType)}
                      aria-label={`${t('packages.bookNow')} - ${packageDetails.name} - ${roomType}`}
                      style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: '#00796b',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        transition: 'background-color 0.3s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#005a4f'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#00796b'}
                    >
                      {t('packages.bookNow')}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#999' }}>{t('packages.noPricesAvailable') || 'No prices available'}</p>
            )}
          </div>
        </article>
      </main>
    </>
  );
}
