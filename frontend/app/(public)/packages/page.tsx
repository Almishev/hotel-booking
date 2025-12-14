'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

  const handleBookPackage = (pkg: any) => {
    // Navigate to room details page with package info
    router.push(`/room-details-book/${pkg.room.id}?packageId=${pkg.id}`);
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
      "image": pkg.room?.roomPhotoUrl || "",
    }))
  };

  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', marginBottom: '50px' }}>
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
          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
            {packages.map((pkg: any) => (
              <article
                key={pkg.id}
                itemScope
                itemType="https://schema.org/Offer"
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: '#fff'
                }}
              >
                {pkg.room?.roomPhotoUrl && (
                  <img
                    src={pkg.room.roomPhotoUrl}
                    alt={`${pkg.name} - ${pkg.room?.roomType} at Phegon Hotel`}
                    itemProp="image"
                    style={{
                      width: '100%',
                      height: '200px',
                      objectFit: 'cover',
                      borderRadius: '4px',
                      marginBottom: '1rem'
                    }}
                  />
                )}
                
                <h2 itemProp="name" style={{ marginBottom: '0.5rem', color: '#00796b' }}>
                  {pkg.name}
                </h2>
                
                <p style={{ marginBottom: '0.5rem', color: '#666' }}>
                  <strong>{t('packages.room')}:</strong> <span itemProp="category">{pkg.room?.roomType}</span>
                </p>
                
                <p style={{ marginBottom: '0.5rem', color: '#666' }}>
                  <strong>{t('packages.dates')}:</strong> 
                  <time itemProp="validFrom" dateTime={pkg.startDate}>{formatDate(pkg.startDate)}</time> - 
                  <time itemProp="validThrough" dateTime={pkg.endDate}> {formatDate(pkg.endDate)}</time>
                </p>
                
                {pkg.description && (
                  <p itemProp="description" style={{ marginBottom: '1rem', color: '#555', flexGrow: 1 }}>
                    {pkg.description}
                  </p>
                )}
                
                <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #eee' }}>
                  <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#00796b', marginBottom: '1rem' }}>
                    {t('packages.price')}: 
                    <span itemProp="price" content={pkg.packagePrice}>€{pkg.packagePrice}</span>
                    <meta itemProp="priceCurrency" content="EUR" />
                  </p>
                  
                  <button
                    onClick={() => handleBookPackage(pkg)}
                    aria-label={`${t('packages.bookNow')} - ${pkg.name}`}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
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
              </article>
            ))}
          </section>
        )}
      </main>
    </>
  );
}
