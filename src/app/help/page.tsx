"use client";

import React, { useEffect, useState, useMemo } from "react"; // Added useMemo here for clarity, though React.useMemo was used
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import Cookies from "js-cookie";
import { locationStore, Location } from "@/app/AppStore";
import * as turf from "@turf/turf";
import { CheckCircle2, XCircle, AlertTriangle, PlusCircle, MapPin, MessageSquare, Send, Trash2, Edit3, Eye, Search, Filter as FilterIcon, ListChecks, Users, Building, ShieldCheck, Ambulance, FireExtinguisher, Wrench, Info } from 'lucide-react';
import MapView from '@/components/ui/MapView';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { EmergencyHelpFormCategory } from "@/constants/EmergencyHelpFormCategory";

// Define CustomMarker interface locally if import is problematic
export interface CustomMarker {
  position: [number, number]; // [latitude, longitude]  
  key?: string;
  title?: string;
  iconUrl?: string;
  iconSize?: [number, number];
  popupContent?: React.ReactNode;
  description?: string;
}


type Comment = {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    surname: string;
  };
};

type HelpForm = {
  id: string;
  category: string;
  subject: string;
  content: string;
  provinceName: string;
  districtName: string;
  point: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
  aiApproval: boolean | null;
  managerApproval: boolean | null;
  userId: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    surname: string;
  };
};

type HelpFormDetail = HelpForm & {
  comments: Comment[];
};

// Helper component for approval icons
const ApprovalIcon = ({ status }: { status: boolean | null }) => {
  if (status === true) {
    return <CheckCircle2 className="h-5 w-5 text-green-500" aria-label="Onaylandı" />;
  } else if (status === false) {
    return <XCircle className="h-5 w-5 text-red-500" aria-label="Reddedildi" />;
  } else {
    return <AlertTriangle className="h-5 w-5 text-yellow-500" aria-label="Beklemede" />;
  }
};

const ALL_CATEGORIES_OPTION_VALUE = "__all_categories__";
const ALL_PROVINCES_OPTION_VALUE = "__all_provinces__";
const ALL_DISTRICTS_OPTION_VALUE = "__all_districts__";

// Define structure for new help form data
interface NewHelpFormData {
  category: string;
  subject: string;
  content: string;
  provinceName: string;
  districtName: string;
  point?: { // Point is optional
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
}

export default function HelpPage() {
  const [forms, setForms] = useState<HelpForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false); // For detail modal
  const [addModalOpen, setAddModalOpen] = useState(false); // For new request modal
  const [selectedForm, setSelectedForm] = useState<HelpFormDetail | null>(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false); 
  const [error, setError] = useState<string | null>(null);
  const [addFormError, setAddFormError] = useState<string | null>(null); // Error state for add form modal
  const [loadingDetailOfId, setLoadingDetailOfId] = useState<string | null>(null);

  const [newFormData, setNewFormData] = useState<NewHelpFormData>({
    category: "",
    subject: "",
    content: "",
    provinceName: "",
    districtName: "",
    // point is initially undefined
  });
  const [selectedPoint, setSelectedPoint] = useState<[number, number] | null>(null); // [latitude, longitude]
  const [addModalMapCenter, setAddModalMapCenter] = useState<[number, number]>([39.0, 35.0]); // Default center (Turkey)
  const [addModalMapZoom, setAddModalMapZoom] = useState<number>(6); // Default zoom

  const categoryOptions = Object.values(EmergencyHelpFormCategory);

  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [provinceFilter, setProvinceFilter] = useState<string>("");
  const [districtFilter, setDistrictFilter] = useState<string>("");

  // @ts-ignore
  const locations = locationStore.locations as Location[]; // Use the imported Location type

  const provinces = useMemo(() => locations.map(loc => loc.name), [locations]);

  const districts = useMemo(() => {
    if (!provinceFilter || provinceFilter === ALL_PROVINCES_OPTION_VALUE) return [];
    const province = locations.find(loc => loc.name === provinceFilter);
    if (!province || !Array.isArray(province.districts)) return [];
    return province.districts.map(d => d.name);
  }, [provinceFilter, locations]);

  useEffect(() => {
    setDistrictFilter(""); // Reset district when province changes
  }, [provinceFilter]);

  const isLoggedIn = !!Cookies.get("jwt_token");
  const userId = Cookies.get("user_id"); // Assuming user_id is stored in cookies

  const fetchForms = async () => {
    setLoading(true);
    setError(null);
    
    const queryParams: string[] = [];
    if (categoryFilter && categoryFilter !== ALL_CATEGORIES_OPTION_VALUE) {
      queryParams.push(`category=${encodeURIComponent(categoryFilter)}`);
    }
    if (provinceFilter && provinceFilter !== ALL_PROVINCES_OPTION_VALUE) {
      queryParams.push(`provinceName=${encodeURIComponent(provinceFilter)}`);
    }
    if (districtFilter && districtFilter !== ALL_DISTRICTS_OPTION_VALUE) {
      queryParams.push(`districtName=${encodeURIComponent(districtFilter)}`);
    }
    
    const query = queryParams.join('&');
    const url = query ? `/emergencyHelpForms?${query}` : "/emergencyHelpForms";

    try {
      const res = await api.get(url);
      const sortedForms = res.data.sort(
        (a: HelpForm, b: HelpForm) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setForms(sortedForms);
    } catch (err) {
        console.error("Error fetching help forms:", err);
        setError("Yardım talepleri yüklenirken bir hata oluştu.");
        setForms([]);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchForms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFilter, provinceFilter, districtFilter]);


  const handleShowDetail = async (id: string) => {
    setLoadingDetailOfId(id); // Set which detail is being loaded
    setSubmitting(true); 
    setError(null);
    try {
        const res = await api.get(`/emergencyHelpForm?loadComments=true&id=${id}`);
        setSelectedForm(res.data);
        setOpen(true);
    } catch (err) {
        console.error("Error fetching form details:", err);
        setError("Talep detayları yüklenemedi.");
    } finally {
        setSubmitting(false);
        setLoadingDetailOfId(null); // Clear loading state for this detail
    }
  };
  
  const handleCommentSubmit = async () => {
    if (!comment.trim() || !selectedForm) return;
    setSubmitting(true);
    setError(null); // Clear main error, use addFormError for modal
    try {
      await api.post("/emergencyHelpForm", {
        emergencyHelpForm: {
          id: selectedForm.id,
          comments: [{ content: comment }]
        }
      });
      const res = await api.get(`/emergencyHelpForm?loadComments=true&id=${selectedForm.id}`);
      setSelectedForm(res.data);
      setComment("");
    } catch (e) {
      console.error("Error submitting comment:", e);
      setError("Yorum eklenemedi. Lütfen tekrar deneyin.");
    }
    setSubmitting(false);
  };

  // Effect to update map center in "Add New Help Request" modal when province changes or modal opens
  useEffect(() => {
    if (addModalOpen) {
      let newCenter: [number, number] = [39.0, 35.0]; // Default: Turkey center [lat, lon]
      let newZoom = 6; // Default zoom for Turkey general view

      if (newFormData.provinceName) {
        const selectedProvinceData = locations.find(p => p.name === newFormData.provinceName);
        if (selectedProvinceData && selectedProvinceData.geometry) {
          try {
            const centroid = turf.centroid(selectedProvinceData.geometry);
            if (centroid && centroid.geometry && centroid.geometry.coordinates) {
              const [lon, lat] = centroid.geometry.coordinates as [number, number];
              newCenter = [lat, lon]; // Correct order [latitude, longitude] for MapView
              newZoom = 9; // Zoom in more when a province is selected
            } else {
              console.warn(`Centroid calculation failed for province: ${newFormData.provinceName}. Using default map center.`);
            }
          } catch (e) {
            console.error(`Error calculating centroid for province ${newFormData.provinceName}:`, e);
          }
        } else {
          console.warn(`No geometry found for province: ${newFormData.provinceName}. Using default map center.`);
        }
      }
      // If newFormData.provinceName is empty, it will use the default newCenter [39.0, 35.0] and newZoom 6.

      setAddModalMapCenter(newCenter);
      setAddModalMapZoom(newZoom);
    } else {
      // Reset when modal is closed
      setSelectedPoint(null);
      setAddModalMapCenter([39.0, 35.0]); // Reset to default Turkey center [lat, lon]
      setAddModalMapZoom(6); // Reset to default zoom
    }
  }, [addModalOpen, newFormData.provinceName, locations]);

  const handleMapClick = (latlng: { lat: number; lng: number }) => {
    const newPoint: [number, number] = [latlng.lat, latlng.lng];
    setSelectedPoint(newPoint);
    setNewFormData(prev => ({
      ...prev,
      point: {
        type: "Point",
        coordinates: [latlng.lng, latlng.lat] // API expects [longitude, latitude]
      }
    }));
    // Do not recenter the map here; keep the user's current view
    // console.log('Map clicked. Current center:', addModalMapCenter, 'Zoom:', addModalMapZoom); // For debugging if reset persists
  };

  const handleAddFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (name === "provinceName") {
      setNewFormData(prev => ({ ...prev, districtName: "" })); // Reset district on province change
    }
  };

  const handleAddFormCategoryChange = (value: string) => {
    setNewFormData(prev => ({
        ...prev,
        category: value === ALL_CATEGORIES_OPTION_VALUE ? "" : value
    }));
  };

  const handleAddFormProvinceChange = (value: string) => {
    setNewFormData(prev => ({
        ...prev,
        provinceName: value === ALL_PROVINCES_OPTION_VALUE ? "" : value,
        districtName: "" // Reset district
    }));
  };

  const handleAddFormDistrictChange = (value: string) => {
    setNewFormData(prev => ({
        ...prev,
        districtName: value === ALL_DISTRICTS_OPTION_VALUE ? "" : value
    }));
  };

  const handleAddHelpRequest = async () => {
    if (!userId) {
        setAddFormError("Kullanıcı ID bulunamadı. Lütfen tekrar giriş yapın.");
        return;
    }
    if (!newFormData.category || !newFormData.subject || !newFormData.content || !newFormData.provinceName) {
        setAddFormError("Lütfen tüm zorunlu alanları doldurun (Kategori, Konu, İçerik, İl).");
        return;
    }

    setSubmitting(true);
    setAddFormError(null);

    const payload: any = {
        emergencyHelpForm: {
            ...newFormData,
            user: { id: userId },
        }
    };

    if (payload.emergencyHelpForm.point === undefined) {
        // If point is not selected, we do not include it in the payload
        payload.emergencyHelpForm.point = turf.centroid(locations.find(loc => loc.name === payload.emergencyHelpForm.provinceName)?.geometry || null).geometry; // Use centroid of province geometry if available

    }

    try {
        await api.post("/emergencyHelpForm", payload);
        setAddModalOpen(false);
        fetchForms(); // Refresh the list
        setNewFormData({ category: "", subject: "", content: "", provinceName: "", districtName: "" }); // Reset form
        setSelectedPoint(null);
    } catch (err: any) { 
        console.error("Error submitting new help form:", err);
        setAddFormError(err.response?.data?.message || "Yardım talebi gönderilemedi. Lütfen tekrar deneyin.");
    } finally {
        setSubmitting(false);
    }
  };

  const newFormDistricts = useMemo(() => {
    if (!newFormData.provinceName) return [];
    const province = locations.find(loc => loc.name === newFormData.provinceName);
    if (!province || !Array.isArray(province.districts)) return [];
    return province.districts.map(d => d.name);
  }, [newFormData.provinceName, locations]);

  const addMapMarkers: CustomMarker[] = selectedPoint 
    ? [{ position: selectedPoint, key: 'selected_point', title: "Seçilen Nokta" }]
    : [];

  return (
    <div className="container mx-auto py-8 px-4 w-full min-h-screen">
      <h1 className="text-3xl font-bold mb-8 mt-4 text-center text-gray-800 dark:text-gray-100">Yardım Talepleri</h1>

      {isLoggedIn && (
        <div className="w-full max-w-2xl mx-auto mb-6 flex justify-end">
            <Button onClick={() => setAddModalOpen(true)} className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white">
                <PlusCircle className="h-5 w-5 mr-2" />
                Yardım Talebi Ekle
            </Button>
        </div>
      )}

      <Card className="w-full max-w-2xl mx-auto mb-8 shadow-md dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="text-xl">Filtreler</CardTitle>
          <CardDescription>Yardım taleplerini kategori, il ve ilçeye göre filtreleyin.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="category-filter" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Kategori</Label>
              <Select 
                value={categoryFilter || ALL_CATEGORIES_OPTION_VALUE} 
                onValueChange={(value: string) => setCategoryFilter(value === ALL_CATEGORIES_OPTION_VALUE ? "" : value)}
              >
                <SelectTrigger id="category-filter" className="w-full dark:bg-gray-700 dark:text-white dark:border-gray-600">
                  <SelectValue placeholder="Kategori Seçin" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:text-white">
                  <SelectItem value={ALL_CATEGORIES_OPTION_VALUE}>Tümü</SelectItem>
                  {categoryOptions.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="province-filter" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">İl</Label>
              <Select 
                value={provinceFilter || ALL_PROVINCES_OPTION_VALUE} 
                onValueChange={(value: string) => setProvinceFilter(value === ALL_PROVINCES_OPTION_VALUE ? "" : value)}
              >
                <SelectTrigger id="province-filter" className="w-full dark:bg-gray-700 dark:text-white dark:border-gray-600">
                  <SelectValue placeholder="İl Seçin" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:text-white">
                  <SelectItem value={ALL_PROVINCES_OPTION_VALUE}>Tümü</SelectItem>
                  {provinces.map(prov => (
                    <SelectItem key={prov} value={prov}>{prov}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="district-filter" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">İlçe</Label>
              <Select 
                value={districtFilter || ALL_DISTRICTS_OPTION_VALUE} 
                onValueChange={(value: string) => setDistrictFilter(value === ALL_DISTRICTS_OPTION_VALUE ? "" : value)} 
                disabled={!provinceFilter || provinceFilter === ALL_PROVINCES_OPTION_VALUE}
              >
                <SelectTrigger id="district-filter" className="w-full dark:bg-gray-700 dark:text-white dark:border-gray-600">
                  <SelectValue placeholder="İlçe Seçin" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:text-white">
                  <SelectItem value={ALL_DISTRICTS_OPTION_VALUE}>Tümü</SelectItem>
                  {districts.map(dist => (
                    <SelectItem key={dist} value={dist}>{dist}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {loading && (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="ml-3 text-gray-600 dark:text-gray-400">Yardım talepleri yükleniyor...</p>
        </div>
      )}

      {!loading && error && (
        <Card className="w-full max-w-2xl mx-auto shadow-lg bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700">
            <CardHeader>
                <CardTitle className="text-red-700 dark:text-red-300">Hata</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-center text-red-600 dark:text-red-400">{error}</p>
            </CardContent>
        </Card>
      )}

      {!loading && !error && forms.length === 0 && (
        <Card className="w-full max-w-2xl mx-auto shadow-lg dark:bg-gray-800">
          <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-700 dark:text-gray-200">Sonuç Bulunamadı</CardTitle>
            </CardHeader>
          <CardContent>
            <p className="text-center text-gray-500 dark:text-gray-400">Belirtilen kriterlere uygun yardım talebi bulunmamaktadır.</p>
          </CardContent>
        </Card>
      )}

      {!loading && !error && forms.length > 0 && (
        <div className="space-y-6">
          {forms.map((form) => (
            <Card key={form.id} className="w-full max-w-2xl mx-auto shadow-lg hover:shadow-xl transition-shadow duration-300 dark:bg-gray-800/50 dark:border-gray-700">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">{form.subject}</CardTitle>
                    <CardDescription className="text-sm text-gray-500 dark:text-gray-400">
                      {form.provinceName} / {form.districtName} - Kategori: {form.category}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end space-y-1 ml-2 flex-shrink-0">
                    <div className="flex items-center space-x-1" title={`AI Onayı: ${form.aiApproval === null ? 'Beklemede' : form.aiApproval ? 'Onaylandı' : 'Reddedildi'}`}>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Yapay Zeka:</span>
                      <ApprovalIcon status={form.aiApproval} />
                    </div>
                    <div className="flex items-center space-x-1" title={`Yönetici Onayı: ${form.managerApproval === null ? 'Beklemede' : form.managerApproval ? 'Onaylandı' : 'Reddedildi'}`}>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Yönetici:</span>
                      <ApprovalIcon status={form.managerApproval} />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 mb-3 line-clamp-3">{form.content}</p>
                <div className="flex justify-between items-center text-xs text-muted-foreground dark:text-gray-500 mb-4">
                  <span>{form.user.name} {form.user.surname}</span>
                  <span>{new Date(form.createdAt).toLocaleString()}</span>
                </div>
                <Button 
                  onClick={() => handleShowDetail(form.id)} 
                  className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white" 
                  variant="default" 
                  disabled={submitting} // Disable all detail buttons if any modal operation is in progress
                >
                  {loadingDetailOfId === form.id ? "Yükleniyor..." : "Detayları Gör ve Yorum Yap"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

    <Dialog open={open} onOpenChange={(isOpen: boolean) => { setOpen(isOpen); if (!isOpen) {setSelectedForm(null); setError(null);} }}>
        <DialogContent className="max-w-xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl p-0 dark:bg-gray-800">
          <DialogHeader className="p-6 border-b dark:border-gray-700">
            <DialogTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {selectedForm ? selectedForm.subject : "Yardım Talep Detayı"}
            </DialogTitle>
             <DialogClose asChild>
            </DialogClose>
          </DialogHeader>
          {submitting && !selectedForm && !error && (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <p className="ml-3 text-gray-600 dark:text-gray-400">Detaylar yükleniyor...</p>
            </div>
          )}
          {error && (
            <div className="p-6 text-center">
                <AlertTriangle className="mx-auto h-10 w-10 mb-2 text-red-500 dark:text-red-400" />
                <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
          {selectedForm && !error && (
            <ScrollArea className="max-h-[calc(100vh-200px)]">
            <div className="flex flex-col md:flex-row gap-0">
              {/* Left Column: Details */}
              <div className="md:w-3/5 p-6 border-r-0 md:border-r dark:border-gray-700 space-y-4">
                <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Kategori</Label>
                    <p className="font-semibold text-blue-600 dark:text-blue-400">{selectedForm.category}</p>
                </div>
                <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Konum</Label>
                    <p>{selectedForm.provinceName} / {selectedForm.districtName}</p>
                </div>
                <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Onay Durumları</Label>
                    <div className="flex items-center space-x-2 mt-1">
                        <span className="text-sm">Yapay Zeka:</span> <ApprovalIcon status={selectedForm.aiApproval} />
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                        <span className="text-sm">Yönetici:</span> <ApprovalIcon status={selectedForm.managerApproval} />
                    </div>
                </div>
                 <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Talep Sahibi</Label>
                    <p>{selectedForm.user.name} {selectedForm.user.surname}</p>
                </div>
                <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Talep Tarihi</Label>
                    <p>{new Date(selectedForm.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex space-x-4 my-3">
                    <div className="flex items-center space-x-1">
                        <Label className="text-xs text-muted-foreground">Yapay Zeka Onayı:</Label>
                        <ApprovalIcon status={selectedForm.aiApproval} />
                        <span className="text-sm text-gray-600 dark:text-gray-300">({selectedForm.aiApproval === null ? 'Beklemede' : selectedForm.aiApproval ? 'Onaylandı' : 'Reddedildi'})</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <Label className="text-xs text-muted-foreground">Yönetici Onayı:</Label>
                        <ApprovalIcon status={selectedForm.managerApproval} />
                        <span className="text-sm text-gray-600 dark:text-gray-300">({selectedForm.managerApproval === null ? 'Beklemede' : selectedForm.managerApproval ? 'Onaylandı' : 'Reddedildi'})</span>
                    </div>
                </div>
                <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">İçerik</Label>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md">{selectedForm.content}</p>
                </div>
                <div className="space-y-1 mt-4">
                    <Label className="text-xs text-muted-foreground flex items-center">
                        <MapPin className="h-4 w-4 mr-1 text-blue-500" />
                        Konum Haritası
                    </Label>
                    {selectedForm.point && selectedForm.point.coordinates && selectedForm.point.coordinates.length === 2 ? (
                        <MapView
                            customMarkers={[
                                {
                                    position: [
                                        selectedForm.point.coordinates[1], // latitude
                                        selectedForm.point.coordinates[0], // longitude
                                    ],
                                    title: selectedForm.subject,
                                    description: selectedForm.content,
                                } as never // Type assertion here
                            ]}
                            center={[
                                selectedForm.point.coordinates[1], // latitude
                                selectedForm.point.coordinates[0], // longitude
                            ]}
                            zoom={14}
                            style={{ height: '250px', width: '100%', borderRadius: '8px', marginTop: '4px' }}
                            onMapClick={() => {}} // No-op handler for required prop
                        />
                    ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">Konum bilgisi harita için uygun değil veya bulunamadı.</p>
                    )}
                </div>
              </div>

              {/* Right Column: Comments */}
              <div className="md:w-2/5 p-6 space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2 dark:border-gray-700 text-gray-700 dark:text-gray-200">Yorumlar ({selectedForm.comments?.length || 0})</h3>
                <ScrollArea className="h-64 pr-2"> {/* Nested ScrollArea for comments */}
                  {selectedForm.comments && selectedForm.comments.length > 0 ? (
                    <ul className="space-y-3">
                      {selectedForm.comments.map((commentEntry: Comment) => (
                        <li key={commentEntry.id} className="text-sm border p-3 rounded-md bg-white dark:bg-gray-700/30 dark:border-gray-600 shadow-sm">
                          <p className="font-semibold text-gray-800 dark:text-gray-100">{commentEntry.user.name} {commentEntry.user.surname}:</p>
                          <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{commentEntry.content}</p>
                          <p className="text-xs text-muted-foreground mt-1">{new Date(commentEntry.createdAt).toLocaleString()}</p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">Henüz yorum yapılmamış.</p>
                  )}
                </ScrollArea>

                {isLoggedIn && (
                  <div className="mt-4 pt-4 border-t dark:border-gray-700">
                    <Label htmlFor="comment-input" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Yorum Ekle</Label>
                    <Textarea
                      id="comment-input"
                      placeholder="Yorumunuzu buraya yazın..."
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                      disabled={submitting} // General submitting state for comment section as well
                      className="min-h-[80px] dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    />
                    <Button
                      className="mt-3 w-full bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white"
                      onClick={handleCommentSubmit}
                      disabled={submitting || !comment.trim()}
                    >
                      {submitting && selectedForm ? "Gönderiliyor..." : "Yorumu Gönder"} {/* More specific submitting text */}
                    </Button>
                    {error && <p className="text-red-500 dark:text-red-400 text-sm mt-2">{error}</p>} 
                  </div>
                )}
                 {!isLoggedIn && (
                    <p className="text-sm text-center text-gray-500 dark:text-gray-400 mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-md border border-yellow-200 dark:border-yellow-700">
                        Yorum yapabilmek için lütfen <a href="/login" className="underline text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">giriş yapın</a>.
                    </p>
                )}
              </div>
            </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* Add New Help Request Modal */}
      <Dialog open={addModalOpen} onOpenChange={(isOpen: boolean) => { 
          setAddModalOpen(isOpen); 
          if (!isOpen) { 
              setAddFormError(null); 
              setNewFormData({ category: "", subject: "", content: "", provinceName: "", districtName: "" });
              setSelectedPoint(null);
            }
        }}>
        <DialogContent className="max-w-xl md:max-w-2xl lg:max-w-3xl p-0 dark:bg-gray-800">
            <DialogHeader className="p-6 border-b dark:border-gray-700">
                <DialogTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">Yeni Yardım Talebi Oluştur</DialogTitle>
                <DialogClose asChild>
                </DialogClose>
            </DialogHeader>
            <ScrollArea className="max-h-[calc(100vh-200px)]">
                <div className="p-6 space-y-4">
                    <div>
                        <Label htmlFor="new-category" className="text-sm font-medium">Kategori *</Label>
                        <Select 
                            value={newFormData.category || ALL_CATEGORIES_OPTION_VALUE}
                            onValueChange={handleAddFormCategoryChange}
                        >
                            <SelectTrigger id="new-category" className="w-full mt-1 dark:bg-gray-700 dark:text-white dark:border-gray-600">
                                <SelectValue placeholder="Kategori Seçin" />
                            </SelectTrigger>
                            <SelectContent className="dark:bg-gray-800 dark:text-white">
                                <SelectItem value={ALL_CATEGORIES_OPTION_VALUE} disabled>Kategori Seçin</SelectItem>
                                {categoryOptions.map(cat => (
                                    <SelectItem key={`new-${cat}`} value={cat}>{cat}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="new-subject" className="text-sm font-medium">Konu *</Label>
                        <Input id="new-subject" name="subject" value={newFormData.subject} onChange={handleAddFormChange} placeholder="Örn: Enkaz altında kalanlar var" className="mt-1 dark:bg-gray-700 dark:text-white dark:border-gray-600" />
                    </div>
                    <div>
                        <Label htmlFor="new-content" className="text-sm font-medium">İçerik / Adres Bilgisi *</Label>
                        <Textarea id="new-content" name="content" value={newFormData.content} onChange={handleAddFormChange} placeholder="Detaylı adres ve durum bilgisi..." className="mt-1 min-h-[100px] dark:bg-gray-700 dark:text-white dark:border-gray-600" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="new-province" className="text-sm font-medium">İl *</Label>
                            <Select 
                                value={newFormData.provinceName || ALL_PROVINCES_OPTION_VALUE}
                                onValueChange={handleAddFormProvinceChange}
                            >
                                <SelectTrigger id="new-province" className="w-full mt-1 dark:bg-gray-700 dark:text-white dark:border-gray-600">
                                    <SelectValue placeholder="İl Seçin" />
                                </SelectTrigger>
                                <SelectContent className="dark:bg-gray-800 dark:text-white">
                                     <SelectItem value={ALL_PROVINCES_OPTION_VALUE} disabled>İl Seçin</SelectItem>
                                    {provinces.map(prov => (
                                        <SelectItem key={`new-prov-${prov}`} value={prov}>{prov}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="new-district" className="text-sm font-medium">İlçe</Label>
                            <Select 
                                value={newFormData.districtName || ALL_DISTRICTS_OPTION_VALUE}
                                onValueChange={handleAddFormDistrictChange} 
                                disabled={!newFormData.provinceName}
                            >
                                <SelectTrigger id="new-district" className="w-full mt-1 dark:bg-gray-700 dark:text-white dark:border-gray-600">
                                    <SelectValue placeholder="İlçe Seçin" />
                                </SelectTrigger>
                                <SelectContent className="dark:bg-gray-800 dark:text-white">
                                    <SelectItem value={ALL_DISTRICTS_OPTION_VALUE} disabled>İlçe Seçin</SelectItem>
                                    {newFormDistricts.map(dist => (
                                        <SelectItem key={`new-dist-${dist}`} value={dist}>{dist}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="map-select" className="text-sm font-medium">Konum Seç (Haritadan)</Label>
                        <p className="text-xs text-muted-foreground mb-1">Haritaya tıklayarak kesin konumu belirtebilirsiniz. İl ve ilçe seçimi yapıldıysa harita o bölgeye odaklanmaya çalışacaktır.</p>
                        <MapView 
                                key={addModalMapCenter ? `${addModalMapCenter.join('-')}-${addModalMapZoom}` : 'add-map'} // More robust key
                                customMarkers={addMapMarkers as never} // Use the explicitly typed variable
                                center={addModalMapCenter || undefined} 
                                zoom={addModalMapZoom}
                                onMapClick={handleMapClick}
                                style={{ height: '300px', width: '100%' }}
                            />
                        {selectedPoint && <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">Seçilen Koordinatlar: {selectedPoint[0].toFixed(5)}, {selectedPoint[1].toFixed(5)}</p>}
                    </div>

                    {addFormError && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-md">
                            <p className="text-red-600 dark:text-red-400 text-sm">{addFormError}</p>
                        </div>
                    )}

                    <Button onClick={handleAddHelpRequest} disabled={submitting} className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white">
                        {submitting ? "Gönderiliyor..." : "Yardım Talebini Gönder"}
                    </Button>
                </div>
            </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}