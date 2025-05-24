'use client'

import { ScrollArea } from "./scroll-area";
import { useEffect, useState } from "react";
import api from "@/lib/axios"; // API istemciniz
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";
import { locationStore } from "@/app/AppStore"; // İl/ilçe verileri için store'unuz
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "./dialog"; // Added
import { Button } from "./button"; // Added

// Tipleri tanımlayalım
interface AnnouncementItem {
    id: string | number;
    subject: string;
    content: string;
    districtName?: string;
    provinceName?: string;
    createdAt?: string; 
}

interface District {
    name: string;
}

interface Location {
    name: string; // İl adı
    districts: District[];
}

interface DuyuruCardProps {
    announcement: AnnouncementItem;
    onCardClick: (announcement: AnnouncementItem) => void; // Added
}

function DuyuruCard({ announcement, onCardClick }: DuyuruCardProps) { // Modified
    // Başlık ve içerik kısaltma
    const subjectDisplay = announcement.subject && announcement.subject.length > 40
        ? announcement.subject.substring(0, 40) + '...'
        : announcement.subject ?? 'Başlıksız';

    const contentDisplay = announcement.content && announcement.content.length > 80
        ? announcement.content.substring(0, 80) + '...'
        : announcement.content ?? 'İçerik yok';

    const locationDisplay = announcement.districtName && announcement.provinceName
        ? `${announcement.provinceName} / ${announcement.districtName} `
        : announcement.provinceName || 'Genel';

    return (
        <Card 
            className="m-2 shadow-sm hover:shadow-md transition-shadow duration-200 dark:bg-gray-800 cursor-pointer" // Added cursor-pointer
            onClick={() => onCardClick(announcement)} // Added onClick
        >
            <CardHeader className="pb-2 pt-3 px-4">
                <CardTitle className="text-md font-semibold text-gray-800 dark:text-gray-100">
                    {subjectDisplay}
                </CardTitle>
                <CardDescription className="text-xs text-gray-500 dark:text-gray-400">
                    {locationDisplay}
                </CardDescription>
            </CardHeader>
            <CardContent className="text-sm pt-0 pb-3 px-4 text-gray-700 dark:text-gray-300">
                {contentDisplay}
            </CardContent>
        </Card>
    );
}

// Ana Duyurular listesi ve filtreleme bileşeni
export function Duyurular() {
    const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Filtreler için il/ilçe verilerini store\'dan alalım
    const locations: Location[] = locationStore.locations;
    const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
    const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
    const [districtsForSelectedProvince, setDistrictsForSelectedProvince] = useState<District[]>([]);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [detailedAnnouncement, setDetailedAnnouncement] = useState<AnnouncementItem | null>(null);
    const [isDetailLoading, setIsDetailLoading] = useState<boolean>(false);

    // İl seçimi değiştiğinde ilçe listesini güncelle
    useEffect(() => {
        if (selectedProvince) {
            const provinceData = locations.find(loc => loc.name === selectedProvince);
            setDistrictsForSelectedProvince(provinceData?.districts || []);
            setSelectedDistrict(null); // İlçe seçimini sıfırla
        } else {
            setDistrictsForSelectedProvince([]);
            setSelectedDistrict(null); // İl seçimi yoksa ilçe listesini ve seçimini sıfırla
        }
    }, [selectedProvince, locations]);

    // Filtreler değiştiğinde duyuruları yeniden çek
    useEffect(() => {
        const fetchAnnouncements = async () => {
            setIsLoading(true);
            try {
                const params: Record<string, string> = {}; // API parametreleri için
                if (selectedProvince) {
                    params.provinceName = selectedProvince;
                }
                if (selectedDistrict) {
                    params.districtName = selectedDistrict;
                }

                const response = await api.get('/announcements', { params });
                setAnnouncements(response.data as AnnouncementItem[]);
            } catch (err) {
                console.error("Duyurular alınamadı:", err);
                setAnnouncements([]); // Hata durumunda listeyi boşalt
            } finally {
                setIsLoading(false);
            }
        };

        fetchAnnouncements();
    }, [selectedProvince, selectedDistrict]); // selectedProvince veya selectedDistrict değiştiğinde tetiklenir

    const handleCardClick = async (announcement: AnnouncementItem) => {
        setIsModalOpen(true);
        setDetailedAnnouncement(announcement); // Show basic data immediately
        setIsDetailLoading(true);
        try {
            // As per user: "api.get('/announcement') a id vererek istek at"
            // Assuming /announcements/{id} or /announcement/{id}. Using /announcements/{id} for consistency.
            const params: Record<string, string> = {};
            if (announcement.id) {
                params.id = String(announcement.id); 
            }
            const response = await api.get(`/announcement`, { params });
            setDetailedAnnouncement(response.data as AnnouncementItem);
        } catch (err) {
            console.error("Duyuru detayı alınamadı:", err);
            // Modal will show data from the list if detail fetch fails
            // Optionally, set an error message in detailedAnnouncement or a separate state
        } finally {
            setIsDetailLoading(false);
        }
    };

    const handleModalOpenChange = (open: boolean) => {
        setIsModalOpen(open);
        if (!open) {
            setDetailedAnnouncement(null);
        }
    };

    return (
        <div className="flex flex-col h-full max-h-full bg-card text-card-foreground shadow-lg rounded-lg overflow-hidden border dark:border-gray-700 dark:bg-gray-900">
            {/* Filtreler Bölümü */}
            <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <h3 className="text-md font-semibold mb-2 text-gray-700 dark:text-gray-200">Duyuru Filtreleri</h3>
                <div className="space-y-2">
                    {/* İl Seçimi */}
                    <div>
                        <label htmlFor="duyuru-province-select" className="sr-only">İl Seçin</label>
                        <select
                            id="duyuru-province-select"
                            value={selectedProvince || ""}
                            onChange={(e) => setSelectedProvince(e.target.value || null)}
                            className="block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value="">Tüm İller</option>
                            {locations.map(loc => <option key={loc.name} value={loc.name}>{loc.name}</option>)}
                        </select>
                    </div>
                    {/* İlçe Seçimi (İl seçildiyse görünür) */}
                    {selectedProvince && (
                        <div>
                            <label htmlFor="duyuru-district-select" className="sr-only">İlçe Seçin</label>
                            <select
                                id="duyuru-district-select"
                                value={selectedDistrict || ""}
                                onChange={(e) => setSelectedDistrict(e.target.value || null)}
                                disabled={districtsForSelectedProvince.length === 0}
                                className="block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600"
                            >
                                <option value="">Tüm İlçeler</option>
                                {districtsForSelectedProvince.map(dist => <option key={dist.name} value={dist.name}>{dist.name}</option>)}
                            </select>
                        </div>
                    )}
                </div>
            </div>

            {/* Duyuru Listesi */}
            <ScrollArea className="flex-grow h-0 min-h-0 max-h-full p-1">
                {isLoading ? (
                    <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">Yükleniyor...</div>
                ) : announcements.length > 0 ? (
                    announcements.map((item) => (
                        <DuyuruCard announcement={item} key={item.id} onCardClick={handleCardClick} />
                    ))
                ) : (
                    <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">Gösterilecek duyuru bulunamadı.</div>
                )}
            </ScrollArea>

            {/* Duyuru Detay Modalı */}
            {detailedAnnouncement && (
                <Dialog open={isModalOpen} onOpenChange={handleModalOpenChange}>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>{isDetailLoading ? 'Yükleniyor...' : detailedAnnouncement.subject}</DialogTitle>
                            <DialogDescription>
                                {detailedAnnouncement.provinceName && detailedAnnouncement.districtName 
                                    ? `${detailedAnnouncement.provinceName} / ${detailedAnnouncement.districtName}` 
                                    : detailedAnnouncement.provinceName || 'Genel'}
                                {detailedAnnouncement.createdAt && ` - ${new Date(detailedAnnouncement.createdAt).toLocaleDateString('tr-TR')}`}
                            </DialogDescription>
                        </DialogHeader>
                        <ScrollArea className="max-h-[60vh] pr-6"> {/* Added ScrollArea for long content */}
                            {isDetailLoading ? (
                                <div className="py-4 text-center">Detaylar yükleniyor...</div>
                            ) : (
                                <div className="py-4 whitespace-pre-wrap"> {/* Added whitespace-pre-wrap for content formatting */}
                                    {detailedAnnouncement.content || "İçerik bulunmamaktadır."}
                                </div>
                            )}
                        </ScrollArea>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">Kapat</Button>
                            </DialogClose>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}