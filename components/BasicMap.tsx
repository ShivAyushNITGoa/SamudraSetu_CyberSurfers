'use client'

interface BasicMapProps {
  className?: string
  height?: string
}

export default function BasicMap({ className = '', height = '400px' }: BasicMapProps) {
  return (
    <div 
      className={`w-full ${className}`}
      style={{ height: height }}
    >
      <iframe
        src="https://www.openstreetmap.org/export/embed.html?bbox=68.0,6.0,98.0,37.0&layer=mapnik&marker=12.9716,77.5946"
        width="100%"
        height="100%"
        style={{ border: 'none' }}
        title="OpenStreetMap"
        loading="lazy"
      />
    </div>
  )
}
