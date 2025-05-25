'use client';

import React from 'react';
import { MapContainer, TileLayer, WMSTileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L, { LatLngExpression, Icon as LeafletIcon, PointTuple, Map } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Define interfaces for props
interface LayerInfo {
  url: string;
  layers: string;
}

interface EarthquakeEvent {
  eventID?: string;
  latitude: string | number;
  longitude: string | number;
  location?: string;
  magnitude?: string | number;
  depth?: string | number;
  date?: string;
  type?: string;
}

// Define CustomMarker interface for use in this component and for export
export interface CustomMarker {
  position: [number, number]; // [latitude, longitude]  
  key?: string;
  title?: string;
  iconUrl?: string;
  iconSize?: [number, number];
  popupContent?: React.ReactNode;
  description?: string;
}

interface MapViewProps {
  layersInfo?: LayerInfo[];
  earthquakeEvents?: EarthquakeEvent[];
  customMarkers?: CustomMarker[];
  center?: [number, number]; // [latitude, longitude]
  zoom?: number;
  style?: React.CSSProperties;
  onMapClick?: (latlng: L.LatLng) => void;
}

// Default Leaflet icon
const defaultIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Custom icon for earthquake markers (example)
const earthquakeIcon = new L.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const MapView: React.FC<MapViewProps> = ({
    layersInfo = [],
    earthquakeEvents = [],
    customMarkers = [],
    center = [39.0, 35.0], // Default center: Turkey
    zoom = 6,
    style,
    onMapClick
}) => {
    const wmsKey = layersInfo.map(l => `${l.url}_${l.layers}`).join(',');
    const earthquakesKey = earthquakeEvents.length > 0 ? `earthquakes-${earthquakeEvents.length}-${earthquakeEvents[0]?.eventID || 'id'}` : 'no-earthquakes';
    const customMarkersKeyPart = customMarkers.map((m, i) => `${m.key || i}-${m.position?.join('_')}`).join(',');
    const customMarkersKey = customMarkers.length > 0 ? `custom-${customMarkers.length}-${customMarkersKeyPart}` : 'no-custom-markers';
    const mapKey = `${wmsKey}_${earthquakesKey}_${customMarkersKey}_${center.join('_')}_${zoom}`;

    const MapClickHandler = () => {
        useMapEvents({
            click: (e) => {
                if (onMapClick) {
                    onMapClick(e.latlng);
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
                <MapClickHandler />
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
                        position={[parseFloat(String(event.latitude)), parseFloat(String(event.longitude))]}
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

                {customMarkers.map((marker, idx) => {
                    let iconToUse = defaultIcon;
                    if (marker.iconUrl) {
                        iconToUse = new L.Icon({
                            iconUrl: marker.iconUrl,
                            iconSize: marker.iconSize || [25, 41],
                            iconAnchor: marker.iconSize ? [marker.iconSize[0] / 2, marker.iconSize[1]] : [12, 41],
                            popupAnchor: [1, -34],
                            shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
                            shadowSize: [41, 41]
                        });
                    }
                    return (
                        <Marker
                            key={marker.key || marker.title || `custom-${idx}`}
                            position={marker.position}
                            icon={iconToUse}
                        >
                            {(marker.popupContent || marker.title || marker.description) && (
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
};

export default MapView;
