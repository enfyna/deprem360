'use client'

import { Card } from "@/components/ui/card";
import { Duyurular } from "@/components/ui/Duyurular";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import dynamic from "next/dynamic";
import { useState } from "react";

const MapView = dynamic(() => import('@/components/ui/MapView'), { ssr: false });

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

    const [selectedKey, setSelectedKey] = useState("afad_eq");
    const selectedSource: any = wmsSources[selectedKey];

    return (
        <main className="flex flex-row row-start-2 items-center sm:items-start">
            <Card className="flex-grow flex flex-col justify-center items-center m-6">
                <MapView
                    wmsUrl={selectedSource.url}
                    layers={selectedSource.layers}
                />
                <div className="p-4">
                    <Select defaultValue="afad_eq" onValueChange={(e) => { setSelectedKey(e); console.log(e) }}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Harita" />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(wmsSources).map(([key, source]) => (
                                <SelectItem key={key} value={key}>
                                    {source.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </Card>
            <Duyurular></Duyurular>
        </main >
    );
}
