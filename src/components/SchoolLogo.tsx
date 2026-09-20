import React, { useState } from 'react';

interface SchoolLogoProps {
  logoUrl?: string;
  className?: string;
  alt?: string;
}

export const SchoolLogo: React.FC<SchoolLogoProps> = ({
  logoUrl,
  className = 'w-10 h-10',
  alt = 'School Logo',
}) => {
  const [hasError, setHasError] = useState(false);

  const isOfficialLogo =
    !logoUrl ||
    logoUrl === '/school-logo.svg' ||
    logoUrl === './school-logo.svg' ||
    logoUrl.endsWith('school-logo.svg');

  // If a custom or provided URL is given and has not errored, render it as an image
  if (logoUrl && !isOfficialLogo && !hasError) {
    return (
      <img
        src={logoUrl}
        alt={alt}
        className={`${className} object-contain shrink-0`}
        onError={() => setHasError(true)}
        referrerPolicy="no-referrer"
      />
    );
  }

  // Official Malai High School Vector SVG Emblem
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 500 500"
      className={`${className} shrink-0 select-none`}
      aria-label={alt}
    >
      <defs>
        {/* Arcs for text alignment */}
        <path id="upperLogoArc" d="M 68,250 A 182,182 0 1,1 432,250" fill="none" />
        <path id="lowerOuterLogoArc" d="M 75,250 A 175,175 0 0,0 425,250" fill="none" />
        <path id="lowerInnerLogoArc" d="M 370,250 A 120,120 0 0,1 130,250" fill="none" />
      </defs>

      {/* Background White Circle */}
      <circle cx="250" cy="250" r="242" fill="#ffffff" />

      {/* Outer Double Blue Rings */}
      <circle cx="250" cy="250" r="236" fill="none" stroke="#002b9e" strokeWidth="8" />
      <circle cx="250" cy="250" r="218" fill="none" stroke="#002b9e" strokeWidth="3.5" />

      {/* Inner Circle Border */}
      <circle cx="250" cy="250" r="144" fill="none" stroke="#002b9e" strokeWidth="3" />

      {/* Left Decorative Flower/Trefoil */}
      <g transform="translate(64, 250)">
        <circle cx="-5" cy="-7" r="6" fill="#002b9e" />
        <circle cx="-5" cy="7" r="6" fill="#002b9e" />
        <circle cx="6" cy="0" r="6" fill="#002b9e" />
        <circle cx="0" cy="0" r="2.5" fill="#ffffff" />
      </g>

      {/* Right Decorative Flower/Trefoil */}
      <g transform="translate(436, 250)">
        <circle cx="5" cy="-7" r="6" fill="#002b9e" />
        <circle cx="5" cy="7" r="6" fill="#002b9e" />
        <circle cx="-6" cy="0" r="6" fill="#002b9e" />
        <circle cx="0" cy="0" r="2.5" fill="#ffffff" />
      </g>

      {/* Upper Arched Text: វិទ្យាល័យ ម៉ាឡៃ */}
      <text fill="#002b9e" fontSize="36" fontWeight="bold" fontFamily="'Moul', 'Khmer OS Muol Light', serif" letterSpacing="1">
        <textPath href="#upperLogoArc" startOffset="50%" textAnchor="middle">
          វិទ្យាល័យ ម៉ាឡៃ
        </textPath>
      </text>

      {/* Lower Outer Arched Text: MALAI HIGH SCHOOL */}
      <text fill="#002b9e" fontSize="29" fontWeight="900" fontFamily="'Arial Black', Arial, sans-serif" letterSpacing="3.5">
        <textPath href="#lowerOuterLogoArc" startOffset="50%" textAnchor="middle">
          MALAI HIGH SCHOOL
        </textPath>
      </text>

      {/* Lower Inner Arched Text: Since 1991 */}
      <text fill="#002b9e" fontSize="20" fontWeight="bold" fontFamily="Arial, sans-serif" letterSpacing="1.5">
        <textPath href="#lowerInnerLogoArc" startOffset="50%" textAnchor="middle">
          Since 1991
        </textPath>
      </text>

      {/* Central Graphics: Fanning Open Book & Supporting Green Hand */}
      <g id="centerGraphics">
        {/* Top Fanning Pages (Left - Red Outlines) */}
        <path d="M 250,230 C 230,195 205,180 182,185 C 196,174 218,170 250,205 Z" fill="#ffffff" stroke="#e52521" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M 250,225 C 225,185 195,172 168,180 C 182,166 210,162 250,195 Z" fill="#ffffff" stroke="#e52521" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M 250,220 C 220,175 185,165 155,175 C 172,158 205,155 250,186 Z" fill="#ffffff" stroke="#e52521" strokeWidth="2.5" strokeLinejoin="round" />

        {/* Top Fanning Pages (Right - Blue Outlines) */}
        <path d="M 250,230 C 270,195 295,180 318,185 C 304,174 282,170 250,205 Z" fill="#ffffff" stroke="#0033cc" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M 250,225 C 275,185 305,172 332,180 C 318,166 290,162 250,195 Z" fill="#ffffff" stroke="#0033cc" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M 250,220 C 280,175 315,165 345,175 C 328,158 295,155 250,186 Z" fill="#ffffff" stroke="#0033cc" strokeWidth="2.5" strokeLinejoin="round" />

        {/* Left Book Page/Ribbon: Vibrant Red (#e52521) */}
        <path d="M 250,242 C 245,215 210,190 166,192 C 168,222 195,270 220,288 C 232,284 246,270 250,242 Z" fill="#e52521" />

        {/* Right Book Page/Ribbon: Royal Blue (#0033cc) */}
        <path d="M 250,242 C 255,215 290,190 334,192 C 332,222 305,270 280,288 C 268,284 254,270 250,242 Z" fill="#0033cc" />

        {/* Center Spine */}
        <path d="M 250,185 L 250,265" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />

        {/* Inner Page Curve Accents */}
        <path d="M 245,236 C 220,208 190,198 172,204" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 255,236 C 280,208 310,198 328,204" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />

        {/* Supporting Green Hand Underneath (#009b48) */}
        <path
          d="M 148,272 C 178,296 220,305 272,302 C 310,300 336,286 348,274 C 340,280 305,296 265,297 C 218,298 178,285 148,272 Z"
          fill="#009b48"
        />
        <path
          d="M 148,272 C 192,298 250,296 288,272 C 272,267 242,266 218,274 C 190,284 165,278 148,272 Z"
          fill="#ffffff"
        />
        <path
          d="M 148,272 C 180,292 225,302 268,298 C 305,294 335,280 350,268 C 332,284 298,306 250,306 C 200,306 168,288 148,272 Z"
          fill="#009b48"
        />
        {/* Hand Palm Swoop */}
        <path
          d="M 170,280 C 210,300 260,300 300,284 C 285,288 260,292 235,290 C 205,288 185,282 170,280 Z"
          fill="#007a38"
        />
      </g>
    </svg>
  );
};
