# OpenStreetMap Integration Guide

## Overview

SamudraSetu now uses OpenStreetMap (OSM) as the primary mapping solution, providing a completely free and open-source alternative to commercial mapping services. This eliminates the need for API keys and provides unlimited usage.

## Features

### 🗺️ **Multiple Tile Layers**
- **Standard Map**: Classic OpenStreetMap tiles
- **Satellite View**: High-resolution satellite imagery
- **Terrain View**: Topographic map with elevation data

### 🎯 **Advanced Map Features**
- **Custom Markers**: Color-coded by hazard type and severity
- **Clustering**: Automatic grouping of nearby reports
- **Heatmaps**: Visual representation of hazard density
- **Popups**: Detailed information on marker click
- **Layer Control**: Easy switching between map styles

### 🌍 **Geocoding Services**
- **Reverse Geocoding**: Convert coordinates to addresses using Nominatim
- **Free Service**: No API key required
- **Global Coverage**: Works worldwide

## Components

### 1. OpenStreetMap Component (`components/OpenStreetMap.tsx`)
Main mapping component with full feature set:

```typescript
<OpenStreetMap
  reports={reports}
  viewMode="markers" // 'markers' | 'clusters' | 'heatmap'
  onReportClick={handleReportClick}
  className="w-full h-full"
/>
```

**Features:**
- Multiple view modes (markers, clusters, heatmap)
- Custom hazard type markers
- Interactive popups
- Layer switching
- Responsive design

### 2. SimpleMap Component (`components/SimpleMap.tsx`)
Lightweight map for basic use cases:

```typescript
<SimpleMap
  center={[12.9716, 77.5946]}
  zoom={6}
  markers={[
    {
      position: [12.9716, 77.5946],
      popup: "Sample marker",
      icon: customIcon
    }
  ]}
  height="300px"
/>
```

## Implementation Details

### Tile Layers
```typescript
// Standard OpenStreetMap
'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'

// Satellite (Esri)
'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'

// Terrain (OpenTopoMap)
'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'
```

### Custom Markers
```typescript
const createCustomIcon = (hazardType: string, severity: string) => {
  const color = getHazardColor(hazardType)
  const size = getMarkerSize(severity)
  
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="...">${hazardType.charAt(0).toUpperCase()}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  })
}
```

### Geocoding Integration
```typescript
// Reverse geocoding using Nominatim
const response = await fetch(
  `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
)
const data = await response.json()
const address = data.display_name
```

## Usage Examples

### Dashboard Integration
```typescript
// In dashboard page
const Map = dynamic(() => import('@/components/OpenStreetMap'), { 
  ssr: false,
  loading: () => <div className="h-96 bg-gray-200 animate-pulse rounded-lg" />
})

// Usage
<Map 
  reports={reports}
  viewMode={mapView}
  onReportClick={(report) => console.log('Report clicked:', report)}
/>
```

### Citizen Map Integration
```typescript
// In citizen map page
const Map = dynamic(() => import('@/components/OpenStreetMap'), { ssr: false })

// Usage with facilities
<Map 
  reports={issues}
  viewMode="markers"
  onReportClick={handleIssueClick}
/>
```

### Report Form Integration
```typescript
// In report form for geocoding
const getAddressFromCoordinates = async (lat: number, lng: number) => {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
  )
  const data = await response.json()
  return data.display_name
}
```

## Configuration

### Environment Variables
No mapping API keys are required! The system uses free OpenStreetMap services.

```env
# No mapping configuration needed
# OpenStreetMap is completely free to use
```

### Leaflet Configuration
```typescript
// Map initialization
const map = L.map(container, {
  center: [12.9716, 77.5946], // India center
  zoom: 6,
  zoomControl: true,
  attributionControl: true
})

// Add tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  maxZoom: 19
}).addTo(map)
```

## Performance Optimizations

### 1. Dynamic Imports
```typescript
// Load map component only when needed
const Map = dynamic(() => import('@/components/OpenStreetMap'), { 
  ssr: false,
  loading: () => <LoadingSpinner />
})
```

### 2. Marker Clustering
```typescript
// Group nearby markers for better performance
const clusters = groupMarkersByProximity(reports, clusterRadius)
```

### 3. Lazy Loading
```typescript
// Load markers only when map is ready
useEffect(() => {
  if (mapRef.current && reports.length > 0) {
    addMarkersToMap(reports)
  }
}, [reports, mapRef.current])
```

## Troubleshooting

### Common Issues

1. **Markers not showing**
   - Check if Leaflet CSS is imported
   - Verify marker coordinates are valid
   - Ensure map container has proper dimensions

2. **Geocoding not working**
   - Check network connectivity
   - Verify coordinate format (lat, lng)
   - Handle rate limiting (1 request per second)

3. **Map not loading**
   - Check if container element exists
   - Verify Leaflet is properly installed
   - Check browser console for errors

### Debug Mode
```typescript
// Enable debug logging
const DEBUG = process.env.NODE_ENV === 'development'

if (DEBUG) {
  console.log('Map initialized:', mapRef.current)
  console.log('Reports loaded:', reports.length)
}
```

## Migration from Mapbox

### Removed Dependencies
- `mapbox-gl`
- `react-map-gl`
- `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`

### Updated Components
- `components/OceanHazardMap.tsx` → `components/OpenStreetMap.tsx`
- `components/Map.tsx` → `components/SimpleMap.tsx`

### Updated Services
- Geocoding: Mapbox → Nominatim
- Tiles: Mapbox → OpenStreetMap
- Styling: Mapbox styles → Leaflet layers

## Benefits

### ✅ **Cost Savings**
- No API key required
- No usage limits
- No billing concerns

### ✅ **Open Source**
- Community-driven
- Transparent development
- No vendor lock-in

### ✅ **Reliability**
- Multiple tile providers
- Global coverage
- High availability

### ✅ **Flexibility**
- Custom styling options
- Multiple layer support
- Easy integration

## Future Enhancements

### Planned Features
1. **Custom Tile Layers**: Add specialized oceanographic maps
2. **Offline Support**: Cache tiles for offline usage
3. **Advanced Clustering**: ML-powered clustering algorithms
4. **Vector Tiles**: Faster rendering for large datasets
5. **3D Visualization**: Elevation and depth data

### Integration Opportunities
1. **Weather Overlays**: Real-time weather data
2. **Tide Charts**: Oceanographic data visualization
3. **Satellite Imagery**: Recent satellite data
4. **Traffic Data**: Real-time traffic information

## Support

For issues or questions:
- Check the [Leaflet documentation](https://leafletjs.com/)
- Review [OpenStreetMap usage policy](https://wiki.openstreetmap.org/wiki/Tile_usage_policy)
- Consult the [Nominatim usage policy](https://operations.osmfoundation.org/policies/nominatim/)

## License

OpenStreetMap data is licensed under the [Open Database License](https://opendatacommons.org/licenses/odbl/).
Leaflet is licensed under the [BSD 2-Clause License](https://github.com/Leaflet/Leaflet/blob/master/LICENSE).
