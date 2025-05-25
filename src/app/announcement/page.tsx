"use client";

import React, { useState, useEffect, useMemo } from "react";
import { observer } from "mobx-react-lite";
import Cookies from "js-cookie";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { locationStore } from "@/app/AppStore";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Edit, Trash2, MoreHorizontal, AlertTriangle, Loader2 } from "lucide-react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Types
interface Announcement {
  id: string;
  subject: string;
  content: string;
  provinceName: string;
  districtName: string;
  createdAt: string;
}

interface AnnouncementPayload {
  id?: string; // Optional for add, required for update
  subject: string;
  content: string;
  provinceName: string;
  districtName: string;
}

const AnnouncementPage = observer(() => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [currentAnnouncement, setCurrentAnnouncement] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState<AnnouncementPayload>({
    subject: "",
    content: "",
    provinceName: "",
    districtName: "",
  });

  const [filterProvince, setFilterProvince] = useState<string>("");
  const [filterDistrict, setFilterDistrict] = useState<string>("");

  const locations = locationStore.locations; 

  const { toast } = useToast();

  useEffect(() => {
    // Check for admin role (e.g., from a cookie)
    const userRole = Cookies.get("is_admin"); // Adjust cookie name if different
    if (userRole === "true") {
      setIsAdmin(true);
      fetchAnnouncements();
    } else {
      setIsAdmin(false);
      setIsLoading(false);
      setError("Bu sayfaya erişim yetkiniz bulunmamaktadır.");
    }
  }, []);

  const fetchAnnouncements = async (province?: string, district?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      let url = "/announcements";
      const params: Record<string, string> = {};
      if (province) params.provinceName = province;
      if (district) params.districtName = district;
      const query = new URLSearchParams(params).toString();
      if (query) url += `?${query}`;
      const response = await api.get(url);
      setAnnouncements(response.data.sort((a: Announcement, b: Announcement) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (err) {
      console.error("Error fetching announcements:", err);
      setError("Duyurular yüklenirken bir hata oluştu.");
      toast({
        title: "Hata",
        description: "Duyurular yüklenemedi.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAnnouncements(filterProvince, filterDistrict);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterProvince, filterDistrict, isAdmin]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openModal = (mode: "add" | "edit", announcement?: Announcement) => {
    setModalMode(mode);
    if (mode === "edit" && announcement) {
      setCurrentAnnouncement(announcement);
      setFormData({
        id: announcement.id,
        subject: announcement.subject,
        content: announcement.content,
        provinceName: announcement.provinceName,
        districtName: announcement.districtName,
      });
    } else {
      setCurrentAnnouncement(null);
      setFormData({
        subject: "",
        content: "",
        provinceName: "",
        districtName: "",
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentAnnouncement(null);
    setFormData({ subject: "", content: "", provinceName: "", districtName: "" });
  };

  const handleSubmit = async () => {
    if (!formData.subject || !formData.content || !formData.provinceName) {
      toast({
        title: "Eksik Bilgi",
        description: "Lütfen konu, içerik ve il alanlarını doldurun.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      if (modalMode === "add") {
        await api.post("/announcement", { announcement: formData });
        toast({ title: "Başarılı", description: "Duyuru eklendi." });
      } else if (modalMode === "edit" && currentAnnouncement) {
        await api.post("/announcement", { announcement: { ...formData, id: currentAnnouncement.id } });
        toast({ title: "Başarılı", description: "Duyuru güncellendi." });
      }
      fetchAnnouncements();
      closeModal();
    } catch (err) {
      console.error("Error submitting announcement:", err);
      toast({
        title: "Hata",
        description: "Duyuru kaydedilemedi.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsLoading(true);
    try {
      await api.delete(`/announcement?id=${id}`) // Assuming this is the endpoint for deleting an announcement
      toast({ title: "Başarılı", description: "Duyuru silindi." });
      fetchAnnouncements();
    } catch (err) {
      console.error("Error deleting announcement:", err);
      toast({
        title: "Hata",
        description: "Duyuru silinemedi.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const columns = useMemo<ColumnDef<Announcement>[]>(
    () => [
      {
        accessorKey: "subject",
        header: "Konu",
        cell: ({ row }) => <div className="font-medium">{row.getValue("subject")}</div>,
      },
      {
        accessorKey: "content",
        header: "İçerik",
        cell: ({ row }) => <div className="truncate max-w-xs">{row.getValue("content")}</div>,
      },
      {
        accessorKey: "provinceName",
        header: "İl",
      },
      {
        accessorKey: "districtName",
        header: "İlçe",
        cell: ({ row }) => row.getValue("districtName") || "-",
      },
      {
        accessorKey: "createdAt",
        header: "Oluşturulma Tarihi",
        cell: ({ row }) => new Date(row.getValue("createdAt")).toLocaleString(),
      },
      {
        id: "actions",
        header: "İşlemler",
        cell: ({ row }) => {
          const announcement = row.original;
          return (
            <AlertDialog>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Menüyü aç</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => openModal("edit", announcement)}>
                    <Edit className="mr-2 h-4 w-4" /> Düzenle
                  </DropdownMenuItem>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-sm px-2 py-1.5 rounded-sm text-red-600 hover:!text-red-600 hover:!bg-red-100 dark:hover:!bg-red-700/50 focus:bg-accent focus:text-accent-foreground relative flex cursor-default select-none items-center outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Sil
                    </Button>
                  </AlertDialogTrigger>
                </DropdownMenuContent>
              </DropdownMenu>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Bu işlem geri alınamaz. Bu duyuruyu kalıcı olarak silecektir.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>İptal</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={async () => {
                      // Use announcement.id from the row context
                      await handleDelete(announcement.id);
                    }}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Sil
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [] 
  );

  const table = useReactTable({
    data: announcements,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  // Always return a ReactNode
  if (!isAdmin && !isLoading) {
    return (
      <>
        <div className="container mx-auto py-10 px-4 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
          <h1 className="mt-4 text-2xl font-bold text-red-700 dark:text-red-400">Erişim Reddedildi</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">{error || "Bu sayfayı görüntüleme yetkiniz yok."}</p>
        </div>
      </>
    );
  }
  
  return (
    <>
      <div className="container mx-auto py-10 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Duyuru Yönetimi</h1>
          <div className="flex gap-2 items-center">
            <Select
              value={filterProvince}
              onValueChange={(value: string) => {
                setFilterProvince(value === "__all__" ? "" : value);
                setFilterDistrict("");
              }}
            >
              <SelectTrigger className="w-[160px] dark:bg-gray-700 dark:text-white dark:border-gray-600">
                <SelectValue placeholder="İl filtrele" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Tümü</SelectItem>
                {locations.map((loc) => (
                  <SelectItem key={loc.name} value={loc.name}>{loc.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filterDistrict}
              onValueChange={(value: string) => setFilterDistrict(value === "__all__" ? "" : value)}
              disabled={!filterProvince}
            >
              <SelectTrigger className="w-[160px] dark:bg-gray-700 dark:text-white dark:border-gray-600">
                <SelectValue placeholder="İlçe filtrele" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Tümü</SelectItem>
                {(locations.find((loc) => loc.name === filterProvince)?.districts || []).map((district) => (
                  <SelectItem key={district.name} value={district.name}>{district.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isAdmin && (
              <Button onClick={() => openModal("add")} className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
                <PlusCircle className="mr-2 h-5 w-5" /> Yeni Duyuru Ekle
              </Button>
            )}
          </div>
        </div>

        {isLoading && !announcements.length ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
            <p className="ml-3 text-gray-600 dark:text-gray-400">Duyurular yükleniyor...</p>
          </div>
        ) : error && !announcements.length ? (
          <Card className="w-full max-w-2xl mx-auto shadow-lg bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700">
            <CardHeader>
                <CardTitle className="text-red-700 dark:text-red-300 flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2"/> Hata
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-center text-red-600 dark:text-red-400">{error}</p>
            </CardContent>
          </Card>
        ) : !isLoading && !error && announcements.length === 0 && isAdmin ? (
          <Card className="w-full max-w-2xl mx-auto shadow-lg dark:bg-gray-800">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-700 dark:text-gray-200">Sonuç Bulunamadı</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-center text-gray-500 dark:text-gray-400">Henüz hiç duyuru eklenmemiş.</p>
            </CardContent>
          </Card>
        ) : isAdmin && announcements.length > 0 ? (
          <Card className="shadow-lg dark:bg-gray-800/50 dark:border-gray-700">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <TableHead key={header.id} className="whitespace-nowrap">
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows?.length ? (
                      table.getRowModel().rows.map((row) => (
                        <TableRow
                          key={row.id}
                          data-state={row.getIsSelected() && "selected"}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id} className="py-3 px-4">
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={columns.length}
                          className="h-24 text-center"
                        >
                          Sonuç bulunamadı.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
             <div className="flex items-center justify-end space-x-2 py-4 px-4 border-t dark:border-gray-700">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    Önceki
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    Sonraki
                </Button>
            </div>
          </Card>
        ) : null}

        {/* Add/Edit Modal */}
        <Dialog open={isModalOpen} onOpenChange={(open: boolean) => { if (!open) closeModal(); else setIsModalOpen(true);}}>
          <DialogContent className="sm:max-w-[550px] dark:bg-gray-800">
            <DialogHeader>
              <DialogTitle className="text-gray-800 dark:text-gray-100">
                {modalMode === "add" ? "Yeni Duyuru Ekle" : "Duyuruyu Düzenle"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="subject" className="text-right col-span-1 dark:text-gray-300">
                  Konu
                </Label>
                <Input
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleFormChange}
                  className="col-span-3 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="content" className="text-right col-span-1 dark:text-gray-300">
                  İçerik
                </Label>
                <Textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleFormChange}
                  className="col-span-3 min-h-[100px] dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="provinceName" className="text-right col-span-1 dark:text-gray-300">
                  İl
                </Label>
                <Select
                  value={formData.provinceName}
                  onValueChange={(value:any) => {
                    setFormData((prev) => ({ ...prev, provinceName: value, districtName: "" }));
                  }}
                >
                  <SelectTrigger className="col-span-3 dark:bg-gray-700 dark:text-white dark:border-gray-600">
                    <SelectValue placeholder="İl seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((loc) => (
                      <SelectItem key={loc.name} value={loc.name}>{loc.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="districtName" className="text-right col-span-1 dark:text-gray-300">
                  İlçe (Opsiyonel)
                </Label>
                <Select
                  value={formData.districtName}
                  onValueChange={(value: any) => {
                    setFormData((prev) => ({ ...prev, districtName: value }));
                  }}
                  disabled={!formData.provinceName}
                >
                  <SelectTrigger className="col-span-3 dark:bg-gray-700 dark:text-white dark:border-gray-600">
                    <SelectValue placeholder="İlçe seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {(locations.find((loc) => loc.name === formData.provinceName)?.districts || []).map((district) => (
                      <SelectItem key={district.name} value={district.name}>{district.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" onClick={closeModal}>İptal</Button>
              </DialogClose>
              <Button onClick={handleSubmit} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {modalMode === "add" ? "Ekle" : "Kaydet"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
})  ;

export default AnnouncementPage;
