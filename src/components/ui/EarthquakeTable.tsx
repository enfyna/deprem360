'use client';

import { Input } from "./input";
import { Button } from "./button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./card";
import { ScrollArea } from './scroll-area';
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

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

interface EarthquakeTableProps {
  earthquakes: EarthquakeEvent[];
  isLoading: boolean;
  error: string | null;
  currentFilters: FilterParams;
  onFilterChange: (filterName: keyof FilterParams, value: string | number) => void;
  onSelectFilterChange: (filterName: keyof FilterParams, value: string) => void;
  onApplyFilters: () => void;
}

export function EarthquakeTable({ 
    earthquakes,
    isLoading,
    error,
    currentFilters,
    onFilterChange,
    onSelectFilterChange,
    onApplyFilters
}: EarthquakeTableProps) {
  return (
    <Card className="shadow-lg rounded-lg overflow-hidden border dark:border-gray-700 dark:bg-gray-900">
      <CardHeader className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">Deprem Verileri</CardTitle>
        <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
          AFAD'dan alınan son deprem verileri. Varsayılan olarak bugünün verileri gösterilmektedir.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 border rounded-md dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div>
            <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Başlangıç Tarihi</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal dark:bg-gray-700 dark:text-white dark:border-gray-600",
                    !currentFilters.start && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {currentFilters.start ? format(new Date(currentFilters.start.split(' ')[0]), "PPP") : <span>Tarih seçin</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={currentFilters.start ? new Date(currentFilters.start.split(' ')[0]) : undefined}
                  onSelect={(date) => {
                    const timePart = currentFilters.start?.split(' ')[1] || '00:00:00';
                    onFilterChange('start', date ? `${format(date, 'yyyy-MM-dd')} ${timePart}` : '')
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bitiş Tarihi</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal dark:bg-gray-700 dark:text-white dark:border-gray-600",
                    !currentFilters.end && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {currentFilters.end ? format(new Date(currentFilters.end.split(' ')[0]), "PPP") : <span>Tarih seçin</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={currentFilters.end ? new Date(currentFilters.end.split(' ')[0]) : undefined}
                  onSelect={(date) => {
                    const timePart = currentFilters.end?.split(' ')[1] || '00:00:00';
                    onFilterChange('end', date ? `${format(date, 'yyyy-MM-dd')} ${timePart}` : '')
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <label htmlFor="min-mag" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Min. Büyüklük</label>
            <Input 
              id="min-mag" 
              type="number" 
              placeholder="Örn: 1.0" 
              value={currentFilters.minmag || ''} // Ensure value is not undefined
              onChange={(e) => onFilterChange('minmag', e.target.value)}
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>
          <div>
            <label htmlFor="max-mag" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max. Büyüklük</label>
            <Input 
              id="max-mag" 
              type="number" 
              placeholder="Örn: 7.0" 
              value={currentFilters.maxmag || ''} // Ensure value is not undefined
              onChange={(e) => onFilterChange('maxmag', e.target.value)}
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>
          <div>
            <label htmlFor="min-depth" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Min. Derinlik (km)</label>
            <Input 
              id="min-depth" 
              type="number" 
              placeholder="Örn: 1"
              value={currentFilters.mindepth || ''} // Ensure value is not undefined
              onChange={(e) => onFilterChange('mindepth', e.target.value)}
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>
          <div>
            <label htmlFor="max-depth" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max. Derinlik (km)</label>
            <Input 
              id="max-depth" 
              type="number" 
              placeholder="Örn: 50"
              value={currentFilters.maxdepth || ''} // Ensure value is not undefined
              onChange={(e) => onFilterChange('maxdepth', e.target.value)}
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>
          <div>
            <label htmlFor="orderby" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sırala</label>
            <Select 
                value={currentFilters.orderby || ''}
                onValueChange={(value: string | undefined) => {
                    onSelectFilterChange('orderby', value ?? '');
                }}
            >
              <SelectTrigger className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
                <SelectValue placeholder="Sıralama Kriteri" />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-800 dark:text-white">
                <SelectItem value="timedesc">Zamana Göre (Yeni)</SelectItem>
                <SelectItem value="time">Zamana Göre (Eski)</SelectItem>
                <SelectItem value="magnitudedesc">Büyüklüğe Göre (Azalan)</SelectItem>
                <SelectItem value="magnitude">Büyüklüğe Göre (Artan)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-2 md:col-span-3 lg:col-span-4 flex justify-end items-end">
            <Button 
                onClick={onApplyFilters} 
                className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              Filtrele
            </Button>
          </div>
        </div>

        {isLoading && <p className="text-center text-gray-600 dark:text-gray-400 py-4">Yükleniyor...</p>}
        {error && <p className="text-center text-red-500 dark:text-red-400 py-4">Hata: {error}</p>}
        {!isLoading && !error && earthquakes.length === 0 && (
          <p className="text-center text-gray-600 dark:text-gray-400 py-4">Belirtilen kriterlere uygun deprem bulunamadı.</p>
        )}

        {!isLoading && !error && earthquakes.length > 0 && (
          <ScrollArea className="h-[400px] w-full rounded-md border dark:border-gray-700">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">Tarih</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">Lokasyon</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">Büyüklük</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">Derinlik (km)</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">Tip</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">Enlem</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">Boylam</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {earthquakes.map((event) => (
                    <tr key={event.eventID} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{event.date}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{event.location}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{event.magnitude}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{event.depth}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{event.type}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{event.latitude}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{event.longitude}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
