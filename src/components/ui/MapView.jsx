'use client';

import { MapContainer, TileLayer, WMSTileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Default Leaflet icon for custom markers
const defaultIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Custom icon for earthquake markers
const earthquakeIcon = new L.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png', // Example: can be different
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
    // You could add a class here to style it differently via CSS e.g. className: 'earthquake-marker-icon'
});

/**
 * @typedef {Object} CustomMarkerJS // Renamed to avoid potential conflicts
 * @property {[number, number]} position - [latitude, longitude]
 * @property {string} [key] - Optional unique key for the marker
 * @property {string} [title] - Optional title for the marker
 * @property {string} [iconUrl] - Optional URL for a custom marker icon image
 * @property {[number, number]} [iconSize] - Optional size for the custom icon image e.g., [32, 32]
 * @property {React.ReactNode} [popupContent] - Optional content for the marker's popup
 * @property {string} [description] - Optional description for the marker
 */

export default function MapView({
    layersInfo = [], 
    earthquakeEvents = [], 
    /** @type {Array<CustomMarkerJS>} */ // Explicitly type customMarkers using the JSDoc typedef
    customMarkers = [], 
    center = [39.0, 35.0], 
    zoom = 6, 
    style,
    onMapClick 
}) {
    const wmsKey = layersInfo.map(l => `${l.url}_${l.layers}`).join(',');
    const earthquakesKey = earthquakeEvents.length > 0 ? `earthquakes-${earthquakeEvents.length}-${earthquakeEvents[0]?.eventID || 'id'}` : 'no-earthquakes';
    const customMarkersKey = customMarkers.length > 0 ? `custom-${customMarkers.length}-${customMarkers[0]?.position?.join('')}` : 'no-custom-markers';
    const mapKey = `${wmsKey}_${earthquakesKey}_${customMarkersKey}_${center.join('')}_${zoom}`;

    // Map click handler component
    const MapClickHandler = () => {
        useMapEvents({
            click: (e) => {
                if (onMapClick) {
                    onMapClick(e.latlng); // Pass LatLng object to the callback
                }
            },
        });
        return null;
    };

    return (
        <div style={style || { height: '100%', width: '100%' }}>
            <MapContainer
                key={mapKey}
                center={center}
                zoom={zoom}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%', zIndex: 0 }}
            >
                <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                />
                <MapClickHandler /> {/* Add the click handler component to the map */}
                {layersInfo.map((layer, idx) => (
                    <WMSTileLayer
                        key={`${layer.url}_${layer.layers}_${idx}`}
                        url={layer.url}
                        layers={layer.layers}
                        format="image/png"
                        transparent={true}
                        tiled={true}
                        version="1.1.1"
                    />
                ))}

                {earthquakeEvents.map(event => (
                    <Marker 
                        key={event.eventID || `eq-${event.latitude}-${event.longitude}`}
                        position={[parseFloat(event.latitude), parseFloat(event.longitude)]}
                        icon={earthquakeIcon} 
                    >
                        <Popup>
                            <b>Lokasyon:</b> {event.location}<br />
                            <b>Büyüklük:</b> {event.magnitude}<br />
                            <b>Derinlik:</b> {event.depth} km<br />
                            <b>Tarih:</b> {event.date}<br />
                            <b>Tip:</b> {event.type}
                        </Popup>
                    </Marker>
                ))}

                {/* Render custom markers */}
                {customMarkers.map((marker, idx) => {
                    let iconToUse = defaultIcon;
                    if (marker.iconUrl) {
                        iconToUse = new L.Icon({
                            iconUrl: marker.iconUrl,
                            iconSize: marker.iconSize || [25, 41], // Default size if not provided
                            iconAnchor: marker.iconSize ? [marker.iconSize[0] / 2, marker.iconSize[1]] : [12, 41], // Adjust anchor based on size
                            popupAnchor: [1, -34],
                            shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png', // Optional: add shadow if needed
                            shadowSize: [41, 41]
                        });
                    }

                    return (
                        <Marker
                            key={marker.key || marker.title || `custom-${idx}`}
                            position={marker.position} // Expects [lat, lon]
                            icon={iconToUse} // Use the determined icon
                        >
                            {(marker.popupContent || marker.title || marker.description) && ( // Display popup if content, title or description exists
                                <Popup>
                                    {marker.title && <h4>{marker.title}</h4>}
                                    {marker.description && <p>{marker.description}</p>}
                                    {marker.popupContent}
                                </Popup>
                            )}
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
}
