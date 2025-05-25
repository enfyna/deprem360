'use client'

import { Card } from "@/components/ui/card";
import { Duyurular } from "@/components/ui/Duyurular";
import { MultiSelect } from "@/components/ui/multi-select";
import dynamic from "next/dynamic";
import { useState, useEffect, useCallback } from "react";
import { EarthquakeTable } from "@/components/ui/EarthquakeTable";
import axios from 'axios';

const MapView = dynamic(() => import('@/components/ui/MapView'), { ssr: false });

import { Earth, Building, Layers, AlertTriangle } from "lucide-react";
import api from "@/lib/axios";

interface EarthquakeEvent {
  rms: string;
  eventID: string;
  location: string;
  latitude: string;
  longitude: string;
  depth: string;
  type: string;
  magnitude: string;
  country: string;
  province: string;
  district: string | null;
  neighborhood: string | null;
  date: string;
  isEventUpdate: boolean;
  lastUpdateDate: string | null;
}

interface FilterParams {
  start?: string;
  end?: string;
  orderby?: 'time' | 'timedesc' | 'magnitude' | 'magnitudedesc';
  mindepth?: string;
  maxdepth?: string;
  minmag?: string;
  maxmag?: string;
  magtype?: string;
  lat?: string;
  lon?: string;
  maxrad?: string;
  minrad?: string;
  minlat?: string;
  maxlat?: string;
  minlon?: string;
  maxlon?: string;
  limit?: string;
  offset?: string;
  eventid?: string;
}

const getFormattedDateTime = (date: Date, timeString: string): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day} ${timeString}`;
};


const initialWmsList = [
    { value: "afad_eq", label: "Depremler (WMS)", icon: Earth },
    { value: "afad_56", label: "Katman", icon: Layers },
    { value: "afad_station", label: "Istasyonlar", icon: Building },
    { value: "earthquake_markers", label: "Deprem Noktaları (Veri)", icon: AlertTriangle },
];

export default function Home() {
    const wmsSources: { [key: string]: { name: string, url: string, layers: string } } = {
        afad_eq: {
            name: "AFAD Depremler",
            url: "https://ivmegeoserver.afad.gov.tr/geoserver/afad/wms",
            layers: "afad:turkey_acc_arc_events",
        },
        afad_56: {
            name: "AFAD Katman 56",
            url: "https://tdthmaps.afad.gov.tr/FusionPlatform/ogc/wms/tsthwmsservice",
            layers: "56",
        },
        afad_station: {
            name: "AFAD İstasyonlar",
            url: "https://ivmegeoserver.afad.gov.tr/geoserver/afad/wms",
            layers: "afad:station",
        }
    };

    const [selectedKeys, setSelectedKeys] = useState<string[]>(["afad_station"]);

    const [earthquakes, setEarthquakes] = useState<EarthquakeEvent[]>([]);
    const [isEarthquakeLoading, setIsEarthquakeLoading] = useState<boolean>(true);
    const [earthquakeError, setEarthquakeError] = useState<string | null>(null);
    const [earthquakeFilters, setEarthquakeFilters] = useState<FilterParams>(() => {
        const yesterdayDate = new Date();
        yesterdayDate.setDate(yesterdayDate.getDate() - 2);
        const todayDate = new Date();
        const tomorrowDate = new Date(todayDate);
        tomorrowDate.setDate(todayDate.getDate() + 1);

        return {
            start: getFormattedDateTime(yesterdayDate, "00:00:00"),
            end: getFormattedDateTime(tomorrowDate, "00:00:00"),
            orderby: 'timedesc',
            minmag: '',
            maxmag: '',
            mindepth: '',
            maxdepth: '',
        };
    });

    const fetchEarthquakes = useCallback(async (filtersToUse: FilterParams) => {
        setIsEarthquakeLoading(true);
        setEarthquakeError(null);
        try {
            let params: Record<string, string> = {};
            Object.entries(filtersToUse).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    if (key === 'start' || key === 'end') {
                        // Format date as yyyy-mm-dd
                        const date = new Date(value);
                        const year = date.getFullYear();
                        const month = (date.getMonth() + 1).toString().padStart(2, '0');
                        const day = date.getDate().toString().padStart(2, '0');
                        params[key] = `${year}-${month}-${day}`;
                    } else {
                        params[key] = String(value);
                    }
                }
            });

            console.log("Fetching earthquakes with params:", params);
            const response = await api.get('/earthquakes', { params });
            setEarthquakes(response.data as EarthquakeEvent[]);
        } catch (err) {
            console.error("Error fetching earthquake data in page.tsx:", err);
            setEarthquakeError("Deprem verileri alınamadı. Lütfen filtrelerinizi kontrol edin veya daha sonra tekrar deneyin.");
            setEarthquakes([]);
        } finally {
            setIsEarthquakeLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEarthquakes(earthquakeFilters);
    }, [fetchEarthquakes, earthquakeFilters]);

    const handleEarthquakeFilterChange = (filterName: keyof FilterParams, value: string | number) => {
        setEarthquakeFilters(prev => ({ ...prev, [filterName]: String(value) }));
    };

    const handleEarthquakeSelectFilterChange = (filterName: keyof FilterParams, value: string) => {
        setEarthquakeFilters(prev => ({ ...prev, [filterName]: value as FilterParams['orderby'] }));
    };

    const handleApplyEarthquakeFilters = () => {
        fetchEarthquakes(earthquakeFilters);
    };
    
    const activeWmsLayers = selectedKeys
        .filter(key => wmsSources[key])
        .map(k => wmsSources[k]);

    const showEarthquakeMarkers = selectedKeys.includes("earthquake_markers");

    return (
        <main className="flex flex-col w-full">
            <div className="flex flex-col md:flex-row h-[calc(100vh-56px)] w-full">
                <Card className="flex flex-col items-end m-0 md:m-6 w-full md:w-3/4 h-1/2 md:h-full max-h-full">
                    <div className="flex-1 w-full h-full">
                        <MapView
                            layersInfo={activeWmsLayers}
                            earthquakeEvents={showEarthquakeMarkers ? earthquakes : []}
                        />
                    </div>
                    <div className="p-4 w-full">
                        <MultiSelect
                            options={initialWmsList}
                            onValueChange={setSelectedKeys}
                            defaultValue={selectedKeys}
                            placeholder="Katmanlar"
                            variant="inverted"
                            animation={2}
                            maxCount={4}
                        />
                    </div>
                </Card>
                <div className="w-full md:w-1/4 h-1/2 md:h-full max-h-full flex flex-col">
                    <Duyurular />
                </div>
            </div>
            <div className="w-full p-0 md:p-6">
                <EarthquakeTable
                    earthquakes={earthquakes}
                    isLoading={isEarthquakeLoading}
                    error={earthquakeError}
                    currentFilters={earthquakeFilters}
                    onFilterChange={handleEarthquakeFilterChange}
                    onSelectFilterChange={handleEarthquakeSelectFilterChange}
                    onApplyFilters={handleApplyEarthquakeFilters}
                />
            </div>
        </main >
    );
}
