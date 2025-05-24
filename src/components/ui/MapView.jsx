'use client';

import { MapContainer, TileLayer, WMSTileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function MapView({
    layersInfo
}) {
    const mapKey = layersInfo.map(l => `${l.url}_${l.layers}`).join(',');

    return (
        <div style={{ height: '100%', width: '100%' }}>
            <MapContainer
                key={mapKey}
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
            </MapContainer>
        </div>
    );
}
