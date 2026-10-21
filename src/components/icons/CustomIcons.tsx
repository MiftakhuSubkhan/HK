import React from 'react';

// Stylized Cow Face Icon matching the header of the mockup
export function CowFaceIcon({ className = "w-7 h-7 text-white" }: { className?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Cow Horns */}
      <path d="M5 9C4 6 2.5 5 2 5C3 7 4 8 5 9" />
      <path d="M19 9C20 6 21.5 5 22 5C21 7 20 8 19 9" />
      {/* Cow Ears */}
      <path d="M4 11C2 11.5 1 13 1.5 14C2.5 14 3.5 13 4.5 12" />
      <path d="M20 11C22 11.5 23 13 22.5 14C21.5 14 20.5 13 19.5 12" />
      {/* Cow Head Shape */}
      <path d="M5 9C5 7 7 6 12 6C17 6 19 7 19 9C19 12 18.5 15 18 16C16.5 16 15 15.5 12 15.5C9 15.5 7.5 16 6 16C5.5 15 5 12 5 9Z" />
      {/* Eyes */}
      <circle cx="8.5" cy="11.5" r="1" fill="currentColor" />
      <circle cx="15.5" cy="11.5" r="1" fill="currentColor" />
      {/* Muzzle / Nose */}
      <path d="M7 16C7 15.5 8.5 15 12 15C15.5 15 17 15.5 17 16C17 18.5 15.5 20 12 20C8.5 20 7 18.5 7 16Z" />
      {/* Nostrils */}
      <ellipse cx="10" cy="17.5" rx="0.8" ry="0.6" fill="currentColor" />
      <ellipse cx="14" cy="17.5" rx="0.8" ry="0.6" fill="currentColor" />
    </svg>
  );
}

// Polar / Sack icon
export function SackIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M8 4C8 3 9.5 2 12 2C14.5 2 16 3 16 4L17 7H7L8 4Z" />
      <path d="M6 7L4 18C4 20 7 22 12 22C17 22 20 20 20 18L18 7" />
      <path d="M7 7H17" />
      <circle cx="12" cy="14" r="1.5" fill="currentColor" />
    </svg>
  );
}

// Pelet / Pellets Cluster icon
export function PelletIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="7" r="2.5" fill="currentColor" />
      <circle cx="7.5" cy="16" r="2.5" fill="currentColor" />
      <circle cx="16.5" cy="16" r="2.5" fill="currentColor" />
      <path d="M12 9.5V13.5M9.5 15L14.5 15" stroke="currentColor" strokeWidth="1" strokeDasharray="1 1" />
    </svg>
  );
}

// Leaf / Bran Daun icon
export function LeafIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
  );
}
