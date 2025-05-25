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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

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
    id: string
    name: string
    surname: string
  }
}

const dialogEdit = (helpForm: HelpFormAdmin) => {
return (
 <Dialog open={true} onOpenChange={() => {}}>
    <DialogTrigger asChild>
      <Button variant="outline">Detay</Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Yardım Formu Detayı</DialogTitle>
        <DialogDescription>
          {helpForm.subject} - {helpForm.category}
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <p><strong>Konu:</strong> {helpForm.subject}</p>
        <p><strong>İçerik:</strong> {helpForm.content}</p>
        <p><strong>İl:</strong> {helpForm.provinceName}</p>
        <p><strong>İlçe:</strong> {helpForm.districtName}</p>
        <p><strong>AI Onayı:</strong> {helpForm.aiApproval ? "Onaylandı" : "Reddedildi"}</p>
        <p><strong>Yönetici Onayı:</strong> {helpForm.managerApproval ? "Onaylandı" : "Reddedildi"}</p>
        <p><strong>Tarih:</strong> {new Date(helpForm.createdAt).toLocaleString()}</p>
        <p><strong>Kullanıcı:</strong> {helpForm.user.name} {helpForm.user.surname}</p>
      </div>
    </DialogContent>
  </Dialog>
)
}

export const columns: ColumnDef<HelpFormAdmin>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
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
    cell: ({ row }) => <div>{row.getValue("subject")}</div>,
  },
  {
    accessorKey: "content",
    header: "İçerik",
    cell: ({ row }) => <div>{row.getValue("content")}</div>,
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
      if (value === true) return <span className="text-green-600">Onaylandı</span>;
      if (value === false) return <span className="text-red-600">Reddedildi</span>;
      return <span className="text-yellow-600">Bekliyor</span>;
    },
  },
  {
    accessorKey: "managerApproval",
    header: "Yönetici Onayı",
    cell: ({ row }) => {
      const value = row.getValue("managerApproval");
      if (value === true) return <span className="text-green-600">Onaylandı</span>;
      if (value === false) return <span className="text-red-600">Reddedildi</span>;
      return <span className="text-yellow-600">Bekliyor</span>;
    },
  },
  {
    accessorKey: "createdAt",
    header: "Tarih",
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
      const helpForm = row.original
      return (
        <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => navigator.clipboard.writeText(helpForm.id)}
          >
            ID'yi Kopyala
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => dialogEdit(helpForm)}
          >
            Detay
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={async () => {
              if (window.confirm("Bu satırı silmek istediğinize emin misiniz?")) {
                try {
                  console.log("Silme işlemi başlatılıyor:", helpForm.id);
                  const res = await api.delete(`/emergencyHelpForm?id=${helpForm.id}`);
                  console.log("Silme işlemi sonucu:", res);
                 
                  const event = new CustomEvent("helpFormDeleted", { detail: helpForm.id });
                  window.dispatchEvent(event);
                } catch (e) {
                  alert("Silme işlemi başarısız oldu.");
                }
              }
            }}
            className="text-red-600"
          >
            Sil
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      )
    },
  },
]

export function DataTableHelpForm() {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [data, setData] = React.useState<HelpFormAdmin[]>([])
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    setLoading(true)
    api.get("/emergencyHelpForms")
      .then(res => { setData(res.data)})
      .finally(() => setLoading(false))
  }, [])

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
  })

  return (
    <div className="w-full">
      <div className="flex items-center py-4 gap-2">
        <Input
          placeholder="Konu veya içerikte ara..."
          value={(table.getColumn("subject")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("subject")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Kolonlar <ChevronDown />
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
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="destructive"
          className="ml-2"
          onClick={() => {
            // Hide all columns except select and actions
            const allColumns = table.getAllColumns();
            const newVisibility: VisibilityState = {};
            allColumns.forEach(col => {
              if (col.id !== "select" && col.id !== "actions") {
                newVisibility[col.id] = false;
              }
            });
            setColumnVisibility(newVisibility);
          }}
        >
          Tüm Sütunları Sil
        </Button>
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
    </div>
  )
}