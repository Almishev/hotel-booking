'use client';

export default function StructuredData() {
  const hotelSchema = {
    "@context": "https://schema.org",
    "@type": "Hotel",
    "name": "Phegon Hotel",
    "description": "Experience luxury and comfort at Phegon Hotel. Book your perfect room with our easy online booking system.",
    "url": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    "image": `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/assets/images/hotel.webp`,
    "address": {
      "@type": "PostalAddress",
      // Add actual address when available
    },
    "amenityFeature": [
      {
        "@type": "LocationFeatureSpecification",
        "name": "Air Conditioning",
        "value": true
      },
      {
        "@type": "LocationFeatureSpecification",
        "name": "WiFi",
        "value": true
      },
      {
        "@type": "LocationFeatureSpecification",
        "name": "Parking",
        "value": true
      },
      {
        "@type": "LocationFeatureSpecification",
        "name": "Mini Bar",
        "value": true
      }
    ],
    "checkinTime": "14:00",
    "checkoutTime": "11:00",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(hotelSchema) }}
    />
  );
}

