"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";

import { Textarea } from "@/components/ui/textarea"; // shadcn textarea ekle
import Cookies from "js-cookie"; // ekle
import { locationStore } from "@/app/AppStore"; 

export enum EmergencyHelpFormCategory {
    UNDER_DEBRIS = 'Enkaz Altında',
    DEBRIS_REMOVAL = 'Enkaz Kaldırma',
    SEARCH_AND_RESCUE = 'Arama Kurtarma',
    MEDICAL = 'Tıbbi',
    FOOD = 'Gıda',
    SHELTER = 'Barınma',
    FIRST_AID = 'Acil Yardım',
    CLOTHING = 'Giyim',
    OTHER = 'Diğer'
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
    coordinates: [number, number];
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

interface District {
    name: string;
}

interface Location {
    name: string; // İl adı
    districts: District[];
}

export default function HelpPage() {
  const [forms, setForms] = useState<HelpForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState<HelpFormDetail | null>(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filtreler
  const categoryOptions = Object.values(EmergencyHelpFormCategory);

  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [provinceFilter, setProvinceFilter] = useState<string>("");
  const [districtFilter, setDistrictFilter] = useState<string>("");

// İl/ilçe verileri locationStore'dan
  // @ts-ignore
  const locations: Location[] = Array.isArray(locationStore.locations)
  ? locationStore.locations.map((loc: any) => ({ ...loc }))
  : [];

// Sadece seçili ile göre ilçeleri göster
const provinces = locations.map(loc => loc.name);

const districts = React.useMemo(() => {
  if (!provinceFilter) return [];
  const province = locations.find(loc => loc.name === provinceFilter);
  if (!province || !Array.isArray(province.districts)) return [];
  return province.districts.map(d => d.name);
}, [provinceFilter, locations]);

// Eğer il değişirse districtFilter'ı sıfırla
React.useEffect(() => {
  setDistrictFilter("");
}, [provinceFilter]);

  const isLoggedIn = !!Cookies.get("jwt_token");

  const fetchForms = async () => {
    setLoading(true);
    const params: any = {};
    if (categoryFilter) params.category = (categoryFilter);
    if (provinceFilter) params.provinceName = (provinceFilter);
    if (districtFilter) params.districtName = (districtFilter);
    // if (bboxFilter) params.bbox = bboxFilter;
    const query = new URLSearchParams(params).toString();
    const url = query ? `/emergencyHelpForms?${query}` : "/emergencyHelpForms";
    try {
      const res = await api.get(url);
      const sortedForms = res.data.sort(
        (a: HelpForm, b: HelpForm) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setForms(sortedForms);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFilter, provinceFilter, districtFilter]);


  // Kategorileri otomatik olarak çıkar
  const categories = Array.from(new Set(forms.map(f => f.category).filter(Boolean)));

  const filteredForms = categoryFilter
    ? forms.filter(f => f.category === categoryFilter)
    : forms;

  const handleShowDetail = async (id: string) => {
    const res = await api.get(`/emergencyHelpForm?loadComments=true&id=${id}`);
    setSelectedForm(res.data);
    setOpen(true);
  };
  
const handleCommentSubmit = async () => {
    if (!comment.trim() || !selectedForm) return;
    setSubmitting(true);
    setError(null);
    try {
      const response = await api.post("/emergencyHelpForm", {
        emergencyHelpForm: {
          id: selectedForm.id,
          comments: [{
            content: comment
          }]
        }
      });
      console.log("Yorum eklendi:", response);
      // Yorum eklendikten sonra tekrar veriyi çek
      const res = await api.get(`/emergencyHelpForm?loadComments=true&id=${selectedForm.id}`);
      setSelectedForm(res.data);
      setComment("");
    } catch (e) {
      setError("Yorum eklenemedi.");
    }
    setSubmitting(false);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="flex flex-col items-center justify-center p-4 w-full min-h-screen">
    <h1 className="text-3xl font-bold mb-8 mt-4 text-center">Yardım Talepleri</h1>

    {/* Filtreler */}
    <div className="mb-6 flex gap-2 items-center flex-wrap">
      <span className="font-medium">Kategori:</span>
      <select
        className="border rounded px-2 py-1"
        value={categoryFilter}
        onChange={e => setCategoryFilter(e.target.value)}
      >
        <option value="">Tümü</option>
        {categoryOptions.map(cat => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>
      <span className="font-medium">İl:</span>
      <select
        className="border rounded px-2 py-1"
        value={provinceFilter}
        onChange={e => setProvinceFilter(e.target.value)}
      >
        <option value="">Tümü</option>
        {provinces.map(prov => (
          <option key={prov} value={prov}>{prov}</option>
        ))}
      </select>
      <span className="font-medium">İlçe:</span>
      <select
        className="border rounded px-2 py-1"
        value={districtFilter}
        onChange={e => setDistrictFilter(e.target.value)}
      >
        <option value="">Tümü</option>
        {districts.map(dist => (
          <option key={dist} value={dist}>{dist}</option>
        ))}
      </select>
    </div>

      <div className="flex flex-col items-center w-full gap-4">
        {forms.length == 0 ? <>
        <Card className="w-full max-w-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
              <CardTitle className="text-lg font-semibold">Guzel bir gun</CardTitle>
            </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">Bu konumda yardım talebi bulunmamaktadır.</p>
          </CardContent>
        </Card>
        </> :forms.map((form) => (
          <Card key={form.id} className="w-full max-w-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">{form.subject}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Kategori</span>
                  <span className="font-medium text-primary">{form.category}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Konu</span>
                  <span className="font-medium">{form.subject}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>İçerik</span>
                  <span className="font-medium">{form.content}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>İl</span>
                  <span className="font-medium">{form.provinceName}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>İlçe</span>
                  <span className="font-medium">{form.districtName}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Kullanıcı</span>
                  <span className="font-medium">{form.user.name} {form.user.surname}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Tarih</span>
                  <span className="font-medium">{new Date(form.createdAt).toLocaleString()}</span>
                </div>
                <Button onClick={() => handleShowDetail(form.id)} className="mt-4 w-full" variant="secondary">
                  Detayları Gör
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yardım Talep Detayı</DialogTitle>
          </DialogHeader>
          {selectedForm && (
            <div className="space-y-3">
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                        <span className="text-xl font-bold">{selectedForm.subject}</span>
                        <span className="text-xs text-muted-foreground mt-1">
                            {selectedForm.user.name} {selectedForm.user.surname}
                        </span>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-sm font-medium">{selectedForm.provinceName} / {selectedForm.districtName}</span>
                        <span className="text-xs text-muted-foreground mt-1">{selectedForm.category}</span>
                    </div>
                </div>
                <div className="w-full">
                    <div className="w-full p-2">{selectedForm.content}</div>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">Tarih</span>
                    <span className="text-xs">{new Date(selectedForm.createdAt).toLocaleString()}</span>
                </div>
            </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm text-muted-foreground">Yorumlar</span>
                <ul className="max-h-40 overflow-y-auto">
                  <div className="max-h-40 overflow-y-auto pr-2">
                    {selectedForm.comments && selectedForm.comments.length > 0 ? (
                      selectedForm.comments.map((comment) => (
                        <li key={comment.id} className="mb-2 border-b pb-1">
                          <div>
                            <strong>{comment.user.name} {comment.user.surname}:</strong> {comment.content}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(comment.createdAt).toLocaleString()}
                          </div>
                        </li>
                      ))
                    ) : (
                      <li>Yorum yok.</li>
                    )}
                  </div>
                </ul>
              </div>
              {isLoggedIn && (
                <div className="mt-2">
                  <Textarea
                    placeholder="Yorumunuzu yazın..."
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    disabled={submitting}
                  />
                  <Button
                    className="mt-2"
                    onClick={handleCommentSubmit}
                    disabled={submitting || !comment.trim()}
                  >
                    {submitting ? "Gönderiliyor..." : "Yorum Yap"}
                  </Button>
                  {error && <div className="text-red-500 mt-2">{error}</div>}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}