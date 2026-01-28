"use client";

import { apartments } from "@/data/ApartmentsData";
import Link from "next/link";

export const ApartmentMapComponent = ({ id }: { id: string }) => {
  const apartment = apartments.find((el) => el.id === id);
  
  if (!apartment?.address) {
    return null;
  }

  const getEmbedUrl = () => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
    const address = encodeURIComponent(apartment.address);
    
    if (apiKey) {
      return `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${address}&zoom=15`;
    } else {
      return `https://maps.google.com/maps?q=${address}&output=embed`;
    }
  };

  return (
    <div className="w-full rounded-xl overflow-hidden border border-gray-200">
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <h3 className="font-semibold mb-1">Розташування</h3>
        <p className="text-gray-600 text-sm">{apartment.address}</p>
      </div>
      
      <div className="h-80">
        <iframe
          src={getEmbedUrl()}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full h-full"
          title={`Карта: ${apartment.address}`}
        />
      </div>
      
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <Link href={apartment.mapUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-flex items-center gap-1">
          Відкрити в Google Maps
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </Link>
      </div>
    </div>
  );
};