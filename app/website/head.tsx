export default function Head() {
  return (
    <>
      {/* DNS prefetch & preconnect for map tile/CDN hosts */}
      <link rel="dns-prefetch" href="https://tile.openstreetmap.org" />
      <link rel="preconnect" href="https://tile.openstreetmap.org" crossOrigin="anonymous" />

      <link rel="dns-prefetch" href="https://a.tile.openstreetmap.org" />
      <link rel="dns-prefetch" href="https://b.tile.openstreetmap.org" />
      <link rel="dns-prefetch" href="https://c.tile.openstreetmap.org" />

      <link rel="dns-prefetch" href="https://basemaps.cartocdn.com" />
      <link rel="preconnect" href="https://basemaps.cartocdn.com" crossOrigin="anonymous" />

      <link rel="dns-prefetch" href="https://server.arcgisonline.com" />
      <link rel="preconnect" href="https://server.arcgisonline.com" crossOrigin="anonymous" />

      <link rel="dns-prefetch" href="https://tile.opentopomap.org" />
      <link rel="preconnect" href="https://tile.opentopomap.org" crossOrigin="anonymous" />

      <link rel="dns-prefetch" href="https://cdnjs.cloudflare.com" />
      <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossOrigin="anonymous" />

      {/* Hint early fetch of Leaflet CSS (already imported globally) */}
      <link rel="preload" as="style" href="/node_modules/leaflet/dist/leaflet.css" />
    </>
  )
}


