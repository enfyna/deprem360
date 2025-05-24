'use client';

import { MapContainer, TileLayer, WMSTileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Custom icon for earthquake markers (optional, but good for UX)
const earthquakeIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png', // Default Leaflet icon, replace if you have a custom one
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

export default function MapView({
    layersInfo,
    earthquakeEvents // New prop for earthquake data
}) {
    // Combine WMS layers and earthquake markers for a unique key to force re-render if either changes
    const wmsKey = layersInfo.map(l => `${l.url}_${l.layers}`).join(',');
    const earthquakesKey = earthquakeEvents && earthquakeEvents.length > 0 ? `earthquakes-${earthquakeEvents.length}-${earthquakeEvents[0]?.eventID}` : 'no-earthquakes';
    const mapKey = `${wmsKey}_${earthquakesKey}`;

    return (
        <div style={{ height: '100%', width: '100%' }}>
            <MapContainer
                key={mapKey} // Use the combined key
                center={[39.0, 35.0]}
                zoom={6}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%', zIndex: 0 }}
            >
                <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                />
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

                {/* Render earthquake markers */}
                {earthquakeEvents && earthquakeEvents.map(event => (
                    <Marker 
                        key={event.eventID} 
                        position={[parseFloat(event.latitude), parseFloat(event.longitude)]}
                        icon={earthquakeIcon} // Apply custom icon
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
            </MapContainer>
        </div>
    );
}
