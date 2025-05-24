'use client'

import { Card } from "@/components/ui/card";
import { Duyurular } from "@/components/ui/Duyurular";
import { MultiSelect } from "@/components/ui/multi-select";
import { locationStore } from "@/app/AppStore";
import dynamic from "next/dynamic";
import { useState, useEffect, useContext } from "react";

const MapView = dynamic(() => import('@/components/ui/MapView'), { ssr: false });

import { Earth, Building, Layers } from "lucide-react";
import api from "@/lib/axios";

const wmsList = [
    { value: "afad_eq", label: "Depremler", icon: Earth },
    { value: "afad_56", label: "Katman", icon: Layers },
    { value: "afad_station", label: "Istasyonlar", icon: Building },
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

    const locations = locationStore.locations;
    console.log('Locations:', locations);
    console.log(locations);

    const [selectedKeys, setSelectedKeys] = useState<string[]>(["afad_station"]);

    return (
        <main className="flex flex-col md:flex-row row-start-2 items-center sm:items-start container">
            <Card className="flex flex-col items-end m-6 container">
                <MapView
                    layersInfo={selectedKeys.map(k => wmsSources[k])}
                />
                <div className="p-4">
                    <MultiSelect
                        options={wmsList}
                        onValueChange={setSelectedKeys}
                        defaultValue={selectedKeys}
                        placeholder="Katmanlar"
                        variant="inverted"
                        animation={2}
                        maxCount={3}
                    />
                </div>
            </Card>
            <Duyurular></Duyurular>
        </main >
    );
}
