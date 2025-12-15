'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ApiService from '@/lib/service/ApiService';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';

export default function PackagesPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        const response = await ApiService.getAllHolidayPackages();
        if (response.statusCode === 200) {
          // Filter only active packages
          const activePackages = (response.holidayPackageList || []).filter(
            (pkg: any) => pkg.isActive === true
          );
          setPackages(activePackages);
        }
      } catch (error: any) {
        console.error('Error fetching packages:', error.message);
        setError(error.response?.data?.message || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('bg-BG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleBookPackage = (pkg: any, roomType: string) => {
    // Пренасочване към страницата за стаи с филтър за този тип стая и packageId
    router.push(`/rooms?packageId=${pkg.id}&roomType=${encodeURIComponent(roomType)}`);
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>{t('packages.loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p className="error-message">{error}</p>
      </div>
    );
  }

  // Generate structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": t('packages.title'),
    "description": "Holiday packages and special offers at Phegon Hotel",
    "itemListElement": packages.map((pkg: any, index: number) => ({
      "@type": "Offer",
      "position": index + 1,
      "name": pkg.name,
      "description": pkg.description || `${pkg.name} package at Phegon Hotel`,
      "price": pkg.packagePrice,
      "priceCurrency": "EUR",
      "availability": pkg.isActive ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "validFrom": pkg.startDate,
      "validThrough": pkg.endDate,
      "url": typeof window !== 'undefined' ? `${window.location.origin}/room-details-book/${pkg.room?.id}?packageId=${pkg.id}` : "",
      "image": pkg.packagePhotoUrl || pkg.room?.roomPhotoUrl || "",
    }))
  };

  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <main
        className="packages-page"
        style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', marginBottom: '50px' }}
      >
        <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <h1 style={{ marginBottom: '0.5rem' }}>
            {t('packages.title')}
          </h1>
          <p style={{ color: '#666', fontSize: '1.1rem' }}>
            {t('packages.subtitle') || 'Discover our exclusive holiday packages with special prices and fixed dates'}
          </p>
        </header>
        
        {packages.length === 0 ? (
          <section style={{ textAlign: 'center', padding: '3rem' }}>
            <p>{t('packages.noPackages')}</p>
          </section>
        ) : (
          <section
            className="packages-grid"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '2rem' }}
          >
            {packages.map((pkg: any) => (
              <article
                key={pkg.id}
                itemScope
                itemType="https://schema.org/Offer"
                className="package-card"
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: '#fff',
                  position: 'relative'
                }}
              >
                {pkg.packagePhotoUrl && (
                  <img 
                    src={pkg.packagePhotoUrl} 
                    alt={pkg.name}
                    itemProp="image"
                    className="package-card-image"
                    style={{
                      position: 'absolute',
                      top: '1rem',
                      right: '1rem',
                      width: '120px',
                      height: '120px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      zIndex: 1
                    }}
                  />
                )}
                <div
                  className="package-card-content"
                  style={{ paddingRight: pkg.packagePhotoUrl ? '140px' : '0' }}
                >
                  <h2 itemProp="name" style={{ marginBottom: '0.5rem', color: '#00796b' }}>
                    <Link 
                      href={`/packages/${pkg.id}`}
                      title={t('packages.viewMore')}
                      style={{ 
                        color: '#00796b', 
                        textDecoration: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontWeight: 'bold',
                        fontSize: '1.3rem'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.color = '#005a4f';
                        e.currentTarget.style.textDecoration = 'underline';
                        e.currentTarget.style.transform = 'translateX(3px)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.color = '#00796b';
                        e.currentTarget.style.textDecoration = 'none';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}
                    >
                      {pkg.name}
                      <span style={{ fontSize: '1rem', transition: 'transform 0.3s ease' }}>→</span>
                    </Link>
                  </h2>
                  
                  <p style={{ marginBottom: '0.5rem', color: '#666' }}>
                    <strong>{t('packages.dates')}:</strong>{' '}
                    <time
                      itemProp="validFrom"
                      dateTime={pkg.startDate}
                      style={{ color: '#ff8c00', fontWeight: 'bold' }}
                    >
                      {formatDate(pkg.startDate)}
                    </time>{' '}
                    -{' '}
                    <time
                      itemProp="validThrough"
                      dateTime={pkg.endDate}
                      style={{ color: '#ff8c00', fontWeight: 'bold' }}
                    >
                      {formatDate(pkg.endDate)}
                    </time>
                  </p>
                  
                  {pkg.description && (
                    <p itemProp="description" style={{ marginBottom: '1rem', color: '#555', flexGrow: 1 }}>
                      {pkg.description.length > 120 ? (
                        <>
                          {pkg.description.substring(0, 120)}...{' '}
                          <Link 
                            href={`/packages/${pkg.id}`}
                            style={{
                              color: '#00796b',
                              textDecoration: 'none',
                              fontSize: '0.9rem',
                              fontWeight: 'normal',
                              cursor: 'pointer'
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.textDecoration = 'underline';
                              e.currentTarget.style.color = '#005a4f';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.textDecoration = 'none';
                              e.currentTarget.style.color = '#00796b';
                            }}
                          >
                            {t('packages.viewMoreShort')}
                          </Link>
                        </>
                      ) : (
                        pkg.description
                      )}
                    </p>
                  )}
                </div>
                
                <div
                  className="package-card-prices"
                  style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #eee' }}
                >
                  <p style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: '#00796b' }}>
                    {t('packages.pricesByRoomType')}:
                  </p>
                  {pkg.roomTypePrices ? (
                    Object.entries(pkg.roomTypePrices).map(([roomType, price]: [string, any]) => (
                      <div key={roomType} style={{ marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#666' }}><strong>{roomType}:</strong></span>
                        <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#00796b' }}>
                          €{price}
                        </span>
                        <button
                          onClick={() => handleBookPackage(pkg, roomType)}
                          aria-label={`${t('packages.bookNow')} - ${pkg.name} - ${roomType}`}
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#00796b',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: 'bold',
                            transition: 'background-color 0.3s',
                            marginLeft: '1rem'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#005a4f'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#00796b'}
                        >
                          {t('packages.bookNow')}
                        </button>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: '#999' }}>{t('packages.noPricesAvailable') || 'No prices available'}</p>
                  )}
                </div>
              </article>
            ))}
          </section>
        )}
      </main>
    </>
  );
}
