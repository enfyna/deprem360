"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import api from "@/lib/axios"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { EmergencyHelpFormCategory } from "../help/page";
import { locationStore } from "../AppStore"; // Added import

export type HelpFormAdmin = {
  id: string
  category: string
  subject: string
  content: string
  provinceName: string
  districtName: string
  aiApproval: boolean | null
  managerApproval: boolean | null
  createdAt: string
  user: {
    id: string // Kullanıcı ID'si genelde string veya number olur, backend'e göre ayarlayın
    name: string
    surname: string
  }
}

interface HelpFormEditDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  helpForm: HelpFormAdmin;
  onSaveChanges: (updatedData: HelpFormAdmin) => void;
}

const HelpFormEditDialog: React.FC<HelpFormEditDialogProps> = ({
  isOpen,
  onOpenChange,
  helpForm,
  onSaveChanges,
}) => {
  const [editedData, setEditedData] = React.useState<HelpFormAdmin>({ ...helpForm });

  React.useEffect(() => {
    setEditedData({ ...helpForm });
  }, [helpForm]);

  const uniqueProvinces = React.useMemo(() => {
    // Ensure locationStore.locations is defined and an array before mapping
    if (!locationStore.locations || !Array.isArray(locationStore.locations)) {
      return [];
    }
    const provinces = locationStore.locations.map(location => location.name);
    return [...new Set(provinces)];
  }, [locationStore.locations]);

  const districtsForSelectedProvince = React.useMemo(() => {
    if (!editedData.provinceName || !locationStore.locations || !Array.isArray(locationStore.locations)) return [];
    const selectedLocation = locationStore.locations.find(location => location.name === editedData.provinceName);
    return selectedLocation ? selectedLocation.districts.map(d => d.name) : [];
  }, [editedData.provinceName, locationStore.locations]);

  const handleChange = (
    field: keyof Omit<HelpFormAdmin, 'user' | 'createdAt' | 'id'> | `user.${keyof HelpFormAdmin['user']}`,
    value: string // All direct callers (Inputs, Selects) provide string
  ) => {
    setEditedData(prev => {
      const prevCopy = { ...prev };
      let processedValue: string | boolean | null = value;

      if (field === "category" || field === "provinceName" || field === "districtName") {
        if (value === "__all__") {
          processedValue = "";
        }
      }

      if (typeof field === 'string' && field.startsWith('user.')) {
        const userField = field.split('.')[1] as keyof HelpFormAdmin['user'];
        prevCopy.user = { ...(prevCopy.user || { id: '', name: '', surname: '' }), [userField]: processedValue as string };
      } else if (field === "aiApproval" || field === "managerApproval") {
        if (value === "true") processedValue = true;
        else if (value === "false") processedValue = false;
        else processedValue = null;
        (prevCopy as any)[field] = processedValue;
      } else {
        (prevCopy as any)[field] = processedValue;
      }

      if (field === "provinceName") {
        prevCopy.districtName = ""; // Reset district when province changes
      }
      return prevCopy;
    });
  };

  const handleSave = async () => {
    try {
      console.log("Kaydediliyor:", editedData);
      const emergency = {
        emergencyHelpForm: editedData
      }
      // GERÇEK API ÇAĞRISINI BURAYA EKLEYİN
      // Örneğin: const response = await api.put(`/api/emergencyHelpForms/${editedData.id}`, editedData);
      // response.data'nın güncellenmiş HelpFormAdmin nesnesini içerdiğini varsayıyoruz.
      // Şimdilik sahte bir yanıt kullanalım:
      // await new Promise(resolve => setTimeout(resolve, 1000)); // API gecikmesini simüle et
      const response = await api.post(`/emergencyHelpForm`, emergency); // API endpoint'inizi ayarlayın

      onSaveChanges(response.data); // Backend'den dönen güncel veri ile ana listeyi güncelle
      onOpenChange(false); // Dialog'u kapat
    } catch (error) {
      console.error("Kaydetme hatası:", error);
      alert("Güncelleme sırasında bir hata oluştu. Lütfen API endpoint'inizi ve metodunuzu kontrol edin.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Yardım Formu Düzenle</DialogTitle>
          <DialogDescription>
            ID: {editedData.id}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">Kategori</Label>
            <Select
              value={editedData.category || "__all__"}
              onValueChange={(selectedValue: string) => handleChange("category", selectedValue)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Kategori seçiniz" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Tümü</SelectItem>
                {Object.values(EmergencyHelpFormCategory).map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="subject" className="text-right">Konu</Label>
            <Input
              id="subject"
              value={editedData.subject}
              onChange={(e) => handleChange("subject", e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="content" className="text-right">İçerik</Label>
            <Textarea
              id="content"
              value={editedData.content}
              onChange={(e) => handleChange("content", e.target.value)}
              className="col-span-3"
              rows={5}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="provinceName" className="text-right">İl</Label>
            <Select
              value={editedData.provinceName || "__all__"}
              onValueChange={(selectedValue: string) => handleChange("provinceName", selectedValue)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="İl seçiniz" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Tümü</SelectItem>
                {uniqueProvinces.map(province => (
                  <SelectItem key={province} value={province}>{province}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="districtName" className="text-right">İlçe</Label>
            <Select
              value={editedData.districtName || "__all__"}
              onValueChange={(selectedValue: string) => handleChange("districtName", selectedValue)}
              disabled={!editedData.provinceName || districtsForSelectedProvince.length === 0}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="İlçe seçiniz" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Tümü</SelectItem>
                {districtsForSelectedProvince.map(district => (
                  <SelectItem key={district} value={district}>{district}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="userName" className="text-right">Kullanıcı Adı</Label>
            <Input
              id="userName"
              value={editedData.user.name}
              onChange={(e) => handleChange("user.name", e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="userSurname" className="text-right">Kullanıcı Soyadı</Label>
            <Input
              id="userSurname"
              value={editedData.user.surname}
              onChange={(e) => handleChange("user.surname", e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="aiApproval" className="text-right">AI Onayı</Label>
            <Select
              value={editedData.aiApproval === null ? "null" : String(editedData.aiApproval)}
              onValueChange={(value: string) => handleChange("aiApproval", value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Seçiniz" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Onaylandı</SelectItem>
                <SelectItem value="false">Reddedildi</SelectItem>
                <SelectItem value="null">Bekliyor</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="managerApproval" className="text-right">Yönetici Onayı</Label>
            <Select
              value={editedData.managerApproval === null ? "null" : String(editedData.managerApproval)}
              onValueChange={(value: string) => handleChange("managerApproval", value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Seçiniz" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Onaylandı</SelectItem>
                <SelectItem value="false">Reddedildi</SelectItem>
                <SelectItem value="null">Bekliyor</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Oluşturma Tarihi</Label>
            <p className="col-span-3">{new Date(editedData.createdAt).toLocaleString()}</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>İptal</Button>
          <Button onClick={handleSave}>Kaydet</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


export function DataTableHelpForm() {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [data, setData] = React.useState<HelpFormAdmin[]>([])
  const [loading, setLoading] = React.useState(true) // Başlangıçta true

  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [editingHelpForm, setEditingHelpForm] = React.useState<HelpFormAdmin | null>(null);

  const fetchData = React.useCallback(() => {
    setLoading(true);
    api.get("/emergencyHelpForms") // API endpoint'inizi kontrol edin
      .then(res => {
        setData(res.data);
      })
      .catch(err => {
        console.error("Veri çekme hatası:", err);
        alert("Veriler yüklenirken bir hata oluştu.");
        setData([]); // Hata durumunda veriyi boşalt
      })
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const columns: ColumnDef<HelpFormAdmin>[] = React.useMemo(() => [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value: boolean | 'indeterminate') => table.toggleAllPageRowsSelected(value === true)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value: boolean | 'indeterminate') => row.toggleSelected(value === true)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "category",
      header: "Kategori",
      cell: ({ row }) => <div>{row.getValue("category")}</div>,
    },
    {
      accessorKey: "subject",
      header: "Konu",
      cell: ({ row }) => <div className="max-w-xs truncate">{row.getValue("subject")}</div>,
    },
    {
      accessorKey: "content",
      header: "İçerik",
      cell: ({ row }) => <div className="max-w-xs truncate">{row.getValue("content")}</div>,
    },
    {
      accessorKey: "provinceName",
      header: "İl",
      cell: ({ row }) => <div>{row.getValue("provinceName")}</div>,
    },
    {
      accessorKey: "districtName",
      header: "İlçe",
      cell: ({ row }) => <div>{row.getValue("districtName")}</div>,
    },
    {
      accessorKey: "aiApproval",
      header: "AI Onayı",
      cell: ({ row }) => {
        const value = row.getValue("aiApproval");
        if (value === true) return <span className="text-green-600 font-semibold">Onaylandı</span>;
        if (value === false) return <span className="text-red-600 font-semibold">Reddedildi</span>;
        return <span className="text-yellow-600 font-semibold">Bekliyor</span>;
      },
    },
    {
      accessorKey: "managerApproval",
      header: "Yönetici Onayı",
      cell: ({ row }) => {
        const value = row.getValue("managerApproval");
        if (value === true) return <span className="text-green-600 font-semibold">Onaylandı</span>;
        if (value === false) return <span className="text-red-600 font-semibold">Reddedildi</span>;
        return <span className="text-yellow-600 font-semibold">Bekliyor</span>;
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Tarih
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div>{new Date(row.getValue("createdAt")).toLocaleString()}</div>,
    },
    {
      accessorKey: "user",
      header: "Kullanıcı",
      cell: ({ row }) => {
        const user = row.getValue("user") as HelpFormAdmin["user"];
        return <div>{user.name} {user.surname}</div>;
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const helpForm = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Menüyü aç</span>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Eylemler</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(helpForm.id)}
              >
                ID'yi Kopyala
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setEditingHelpForm(helpForm);
                  setIsEditDialogOpen(true);
                }}
              >
                Detay/Düzenle
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={async () => {
                  if (window.confirm("Bu satırı silmek istediğinize emin misiniz?")) {
                    try {
                      console.log("Silme işlemi başlatılıyor:", helpForm.id);
                      // GERÇEK API ÇAĞRISINI BURAYA EKLEYİN
                      await api.delete(`/emergencyHelpForm?id=${helpForm.id}`); // API endpoint'inizi ayarlayın
                      console.log("Silme işlemi başarılı:", helpForm.id);
                      // Sayfayı yenilemeden veriyi güncelle
                      setData(currentData => currentData.filter(item => item.id !== helpForm.id));
                    } catch (e) {
                      console.error("Silme işlemi başarısız oldu:", e);
                      alert("Silme işlemi başarısız oldu. Lütfen API endpoint'inizi kontrol edin.");
                    }
                  }
                }}
                className="text-red-600 hover:!text-red-700"
              >
                Sil
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [setData, setEditingHelpForm, setIsEditDialogOpen]);


  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    manualPagination: false, // API'den sayfalama yapmıyorsanız false
    manualSorting: false,    // API'den sıralama yapmıyorsanız false
    manualFiltering: false,  // API'den filtreleme yapmıyorsanız false
    autoResetPageIndex: true, // veri değiştiğinde sayfayı sıfırla
  });

  const handleSaveChanges = (updatedData: HelpFormAdmin) => {
    setData(currentData =>
      currentData.map(item =>
        item.id === updatedData.id ? updatedData : item
      )
    );
    // İsteğe bağlı olarak, başarılı güncelleme mesajı gösterebilirsiniz.
    // alert("Veri başarıyla güncellendi!");
  };

  return (
    <div className="w-full">
      <div className="flex items-center py-4 gap-2">
        <Input
          placeholder="Konu, içerik veya kategoride ara..."
          value={(table.getColumn("subject")?.getFilterValue() as string) ?? ""}
          onChange={(event) => {
            table.getColumn("subject")?.setFilterValue(event.target.value)
            // İsterseniz diğer kolonlarda da arama yapabilirsiniz:
            // table.getColumn("content")?.setFilterValue(event.target.value)
            // table.getColumn("category")?.setFilterValue(event.target.value)
            // Veya global bir filtre kullanabilirsiniz (tanımlamanız gerekir)
          }}
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Kolonlar <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value: boolean) =>
                      column.toggleVisibility(value)
                    }
                  >
                    {/* Sütun başlıklarını daha kullanıcı dostu hale getirebilirsiniz */}
                    {column.id === "provinceName" ? "İl" :
                      column.id === "districtName" ? "İlçe" :
                        column.id === "aiApproval" ? "AI Onayı" :
                          column.id === "managerApproval" ? "Yönetici Onayı" :
                            column.id === "createdAt" ? "Tarih" :
                              column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
        {/* Tüm Sütunları Sil butonu isteğe bağlı, eğer bir filtre sıfırlama vs. içinse ismi değiştirilebilir. */}
        {/* <Button
          variant="destructive"
          className="ml-2"
          onClick={() => {
            const allColumns = table.getAllColumns();
            const newVisibility: VisibilityState = {};
            allColumns.forEach(col => {
              if (col.id !== "select" && col.id !== "actions" && col.getCanHide()) {
                newVisibility[col.id] = false;
              }
            });
            setColumnVisibility(newVisibility);
          }}
        >
          Sütunları Gizle
        </Button> */}
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Yükleniyor...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
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
                  Sonuç yok.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} /{" "}
          {table.getFilteredRowModel().rows.length} satır seçili.
          Toplam {data.length} kayıt.
        </div>
        <div className="space-x-2">
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
      </div>
      {editingHelpForm && (
        <HelpFormEditDialog
          key={editingHelpForm.id + (isEditDialogOpen ? "-open" : "-closed")} // Key'i dialog açılıp kapandığında veya veri değiştiğinde değiştirmek için
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          helpForm={editingHelpForm}
          onSaveChanges={handleSaveChanges}
        />
      )}
    </div>
  )
}