import Image from "next/image";
import React from "react";

interface MapCardProps {
  imageUrl: string;
  location: string;
}

const MapCard = ({ imageUrl, location }: MapCardProps) => {
  const src =
    imageUrl ||
    "https://preview.redd.it/silver-line-now-fully-live-on-apple-maps-and-the-transit-app-v0-h1778rzdvrwf1.png?width=640&crop=smart&auto=webp&s=b83347f8227c453e247ceb73220ffeec1335a45e";

  return (
    <div className="h-52 rounded-xl border bg-[hsl(0,0%,100%)] dark:bg-card flex flex-col items-center justify-center gap-2.5 p-3">
      <div className="relative w-full flex-1 rounded-lg overflow-hidden bg-black/[0.12] dark:bg-white/[0.03]">
        <Image
          src={src}
          alt={location}
          fill
          sizes="280px"
          style={{ objectFit: "cover", filter: "grayscale(0.4) brightness(0.75)" }}
        />
      </div>
      <div className="flex items-center gap-1.5 w-full px-0.5">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="shrink-0 text-muted-foreground">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
        </svg>
        <span className="text-xs font-medium text-muted-foreground truncate">{location}</span>
      </div>
    </div>
  );
};

export default MapCard;
