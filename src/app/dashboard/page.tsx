'use client'
import React, { useState, useRef, useEffect } from "react";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/button";
import api from '@/lib/axios';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Square, Activity, CalendarDays } from "lucide-react"; // İkonlar için

const initialChartData: { eksen_x: string; Sure: number }[] = [];

const chartConfig = {
  Sure: {
    label: "Süre (saniye)",
    color: "hsl(var(--chart-1))", // shadcn/ui tema rengi
  },
} satisfies ChartConfig;

function ChartSection({ chartData }: { chartData: typeof initialChartData }) {
  const isEmpty = chartData.length === 0;
  return (
    <ChartContainer
      config={chartConfig}
      className="min-h-[300px] w-full" // max-w kaldırıldı, kart genişliğine uyacak
    >
      {isEmpty ? (
        <div className="w-full h-[300px] flex flex-col items-center justify-center text-center p-4">
          <CalendarDays className="w-16 h-16 text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-muted-foreground">Henüz Kayıtlı Tatbikat Yok</p>
          <p className="text-sm text-muted-foreground">Yeni bir tatbikat başlattığınızda sonuçlar burada görünecektir.</p>
        </div>
      ) : (
        <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.5} />
          <XAxis
            dataKey="eksen_x"
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: "hsl(var(--muted-foreground))" }}
            tickLine={{ stroke: "hsl(var(--muted-foreground))" }}
            axisLine={{ stroke: "hsl(var(--muted-foreground))" }}
            interval={0}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: "hsl(var(--muted-foreground))" }}
            tickLine={{ stroke: "hsl(var(--muted-foreground))" }}
            axisLine={{ stroke: "hsl(var(--muted-foreground))" }}
          />
          <Tooltip
            cursor={{ fill: "hsl(var(--accent))", opacity: 0.3 }}
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              borderColor: "hsl(var(--border))",
              borderRadius: "0.5rem",
              color: "hsl(var(--foreground))"
            }}
            labelStyle={{
              fontWeight: 600,
              color: "hsl(var(--foreground))"
            }}
          />
          <Bar dataKey="Sure" fill="var(--color-Sure)" radius={[4, 4, 0, 0]} />
        </BarChart>
      )}
    </ChartContainer>
  );
}

function TimerPanel({ onStop, onStart }: { onStop: (seconds: number) => void, onStart: () => void }) {
  const [milliseconds, setMilliseconds] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleStartStop = () => {
    if (!running) {
      setRunning(true);
      onStart();
      setMilliseconds(0); // Her start'ta sıfırla
      intervalRef.current = setInterval(() => {
        setMilliseconds((prev) => prev + 10);
      }, 10);
    } else {
      setRunning(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      const seconds = Math.floor(milliseconds / 1000);
      onStop(seconds);
      // setMilliseconds(0); // Stop'ta sıfırlama, son süre görünsün
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const seconds = Math.floor(milliseconds / 1000);
  const ms = (milliseconds % 1000).toString().padStart(3, "000").slice(0, 2); // Sadece ilk iki haneyi al

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center">
          <Activity className="mr-2 h-6 w-6 text-primary" />
          Tatbikat Kontrol Paneli
        </CardTitle>
        <CardDescription>Tatbikatınızı buradan başlatıp durdurabilirsiniz.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center gap-6 py-8">
        <div className="text-center">
          <span className="text-7xl font-mono font-bold text-primary tabular-nums">
            {seconds}
          </span>
          <span className="text-3xl font-mono text-muted-foreground -ml-1">.{ms}</span>
          <span className="text-xl ml-1 text-muted-foreground">sn</span>
        </div>
        <Button
          variant={running ? "destructive" : "default"}
          onClick={handleStartStop}
          className="w-40 h-12 text-lg"
          size="lg"
        >
          {running ? <Square className="mr-2 h-5 w-5" /> : <Play className="mr-2 h-5 w-5" />}
          {running ? "Durdur" : "Başlat"}
        </Button>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground text-center block">
        Tatbikat süreniz otomatik olarak kaydedilecektir.
      </CardFooter>
    </Card>
  );
}

export default function Dashboard() {
  const [chartData, setChartData] = useState<{ eksen_x: string; Sure: number }[]>(initialChartData);
  const [userData, setUserData] = useState<any>(null);
  const [drillId, setDrillId] = useState<string | null>(null);

  const fetchUserData = async () => {
    try {
      const response = await api.get('/earthquakeDrills');
      setUserData(response.data);
      if (Array.isArray(response.data)) {
        const completedDrills = response.data.filter((d: any) => d.startTime && d.endTime);
        const newChartData = completedDrills.map((d: any, i: number) => {
          const start = new Date(d.startTime);
          const end = new Date(d.endTime);
          const diffSeconds = Math.round((end.getTime() - start.getTime()) / 1000);
          const tarih = start.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: '2-digit' });
          return {
            eksen_x: `${tarih} - T${i + 1}`,
            Sure: diffSeconds,
          };
        });
        setChartData(newChartData);
      }
      return response.data;
    } catch (err) {
      console.error("Failed to fetch user data:", err);
      return null;
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const postDrillStart = async (startTime: string, userId: string) => {
    try {
      const response = await api.post('/earthquakeDrill', {
        earthquakeDrill: { startTime, user: { id: userId } }
      });
      setDrillId(response.data.id);
      console.log('Drill başlatıldı:', response.data);
    } catch (err) {
      console.error('Drill başlatma hatası:', err);
    }
  };

  const postDrillEnd = async (id: string, endTime: string) => {
    try {
      const response = await api.post('/earthquakeDrill', {
        earthquakeDrill: { id, endTime }
      });
      console.log('Drill bitirildi:', response.data);
    } catch (err) {
      console.error('Drill bitirme hatası:', err);
    }
  };

  const handleTimerStart = () => {
    const startTime = new Date().toISOString();
    const userId = Cookies.get('user_id')!!;
    postDrillStart(startTime, userId);
  };

  const handleTimerStop = async (seconds: number) => { // seconds parametresini tekrar ekledim
    if (!drillId) return;
    const endTime = new Date().toISOString();
    await postDrillEnd(drillId, endTime);
    setDrillId(null);
    await fetchUserData(); // Verileri ve grafiği güncelle
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Sol Konteyner: Kontrol Paneli */}
        <div className="w-full">
          <TimerPanel onStop={handleTimerStop} onStart={handleTimerStart} />
        </div>

        {/* Sağ Konteyner: Grafik */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Tatbikat Sonuçları</CardTitle>
            <CardDescription>Tamamlanan tatbikat sürelerinizin grafiği.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartSection chartData={chartData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}