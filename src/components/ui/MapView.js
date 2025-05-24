'use client';

import { MapContainer, TileLayer, WMSTileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function MapView({
    wmsUrl,
    layers,
    styles = '',
    version = '1.1.1',
    format = 'image/png',
    transparent = true,
    tiled = true,
}) {
    // Key olarak WMS URL + layers kullan (benzersiz olması yeterli)
    const mapKey = `${wmsUrl}_${layers}`;

    return (
        <div style={{ height: '100vh', width: '100%' }}>
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
                <WMSTileLayer
                    url={wmsUrl}
                    layers={layers}
                    format={format}
                    transparent={transparent}
                    tiled={tiled}
                    version={version}
                    styles={styles}
                />
            </MapContainer>
        </div>
    );
}
