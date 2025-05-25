'use client'
import React, { useState, useRef, useEffect } from "react";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/button";
import api from '@/lib/axios';


const initialChartData: { eksen_x: string; Sure: number }[] = [];


const chartConfig = {
  Sure: {
    label: "Süre (saniye)",
    color: "#2563eb",
  },
} satisfies ChartConfig;

function ChartSection({ chartData }: { chartData: typeof initialChartData }) {
  const isEmpty = chartData.length === 0;
  return (
    <div className="flex flex-col items-start w-full">
      <ChartContainer
        config={chartConfig}
        className="min-h-[300px] w-full max-w-[600px] bg-white dark:bg-gray-900 rounded-lg shadow flex items-center justify-center"
      >
        {isEmpty ? (
          <div className="w-full h-[300px] flex flex-col items-center justify-center opacity-60">
            <span className="text-lg text-gray-400 dark:text-gray-500">Henüz kayıtlı tatbikat yok</span>
            <span className="text-5xl mt-2">📊</span>
          </div>
        ) : (
          <BarChart data={chartData} width={550} height={450}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
            <XAxis
              dataKey="eksen_x"
              stroke="#374151"
              tick={{ fill: "var(--tw-text-opacity,1) #374151" }}
              tickLine={{ stroke: "#374151" }}
              axisLine={{ stroke: "#374151" }}
              interval={0}
            />
            <YAxis
              stroke="#374151"
              tick={{ fill: "var(--tw-text-opacity,1) #374151" }}
              tickLine={{ stroke: "#374151" }}
              axisLine={{ stroke: "#374151" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--tw-bg-opacity,1) #fff",
                color: "#111",
                borderRadius: "0.5rem",
                border: "1px solid #e5e7eb",
              }}
              wrapperStyle={{
                color: "#111",
              }}
              labelStyle={{
                color: "#f00",
                fontWeight: 600,
              }}
              itemStyle={{
                color: "#f00",
              }}
              cursor={{ fill: "#e5e7eb", opacity: 0.2 }}
            />
            <Bar dataKey="Sure" fill="var(--color-Sure, #2563eb)" radius={4} />
          </BarChart>
        )}
      </ChartContainer>
    </div>
  );
}

function TimerPanel({ onStop, onStart }: { onStop: (seconds: number) => void, onStart: () => void }) {
  const [milliseconds, setMilliseconds] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleStartStop = () => {
    if (!running) {
      setRunning(true);
      onStart(); // Timer başlarken POST fonksiyonunu çağır
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
      setMilliseconds(0);
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const seconds = Math.floor(milliseconds / 1000);
  const ms = (milliseconds % 1000).toString().padStart(3, "0");

  return (
    <div className="flex flex-col gap-8 items-center justify-center w-full">
      <h3 className="text-3xl font-semibold text-gray-800 dark:text-gray-100">Tatbikat Kontrol Paneli</h3>
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 min-w-[200px] flex flex-col items-center">
        <span className="text-4xl font-mono text-gray-900 dark:text-gray-100">
          {seconds}
          <span className="text-lg">.{ms} sn</span>
        </span>
      </div>
      <div className="flex gap-4 w-full justify-center">
        <Button
          variant={running ? "destructive" : "default"}
          onClick={handleStartStop}
          className="w-32"
        >
          {running ? "Stop" : "Start"}
        </Button>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [chartData, setChartData] = useState<{ eksen_x: string; Sure: number }[]>(initialChartData);
  const [userData, setUserData] = useState<any>(null);
  const [drillId, setDrillId] = useState<string | null>(null);

  // GET fonksiyonu

  const fetchUserData = async () => {
    try {
      const response = await api.get('/earthquakeDrills');
      setUserData(response.data);

      // Sadece tamamlanmış drill'leri al
      if (Array.isArray(response.data)) {
        const completedDrills = response.data.filter((d: any) => d.startTime && d.endTime);
        const newChartData = completedDrills.map((d: any, i: number) => {
          const start = new Date(d.startTime);
          const end = new Date(d.endTime);
          const diffSeconds = Math.round((end.getTime() - start.getTime()) / 1000);
          const tarih = start.toLocaleDateString('tr-TR');
          return {
            eksen_x: `${tarih} - T ${i + 1}`,
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

  // Drill başlat (startTime ile)
  const postDrillStart = async (startTime: string, userId: string) => {
    try {
      const response = await api.post('/earthquakeDrill', {
        earthquakeDrill: {
          startTime,
          user: { id: userId }
        }
      });
      setDrillId(response.data.id);
      console.log('Drill başlatıldı:', response.data);
    } catch (err) {
      console.error('Drill başlatma hatası:', err);
    }
  };

  // Drill bitir (endTime ile)
  const postDrillEnd = async (id: string, endTime: string) => {
    try {
      const response = await api.post('/earthquakeDrill', {
        earthquakeDrill: {
          id,
          endTime
        }
      });
      console.log('Drill bitirildi:', response.data);
    } catch (err) {
      console.error('Drill bitirme hatası:', err);
    }
  };

  // Timer başladığında çağrılır
  const handleTimerStart = () => {
    const startTime = new Date().toISOString();
    const userId = Cookies.get('user_id')!!;
    postDrillStart(startTime, userId);
  };

  // Timer durduğunda çağrılır
  const handleTimerStop = async () => {
  if (!drillId) return;
  const endTime = new Date().toISOString();
  await postDrillEnd(drillId, endTime);
  setDrillId(null);

  // GET ile son verileri çek
  const drills = await fetchUserData();
  if (drills && Array.isArray(drills)) {
    // Sadece tamamlanmış drill'leri al
    const completedDrills = drills.filter((d: any) => d.startTime && d.endTime);

    // Her biri için chartData oluştur
    const newChartData = completedDrills.map((d: any, i: number) => {
    const start = new Date(d.startTime);
    const end = new Date(d.endTime);
    const diffSeconds = Math.round((end.getTime() - start.getTime()) / 1000);
    const tarih = start.toLocaleDateString('tr-TR');
    return {
      eksen_x: `${tarih} - T${i + 1}`, // T1, T2, T3 ...
      Sure: diffSeconds,
    };
  });

    setChartData(newChartData);
  }
  };

  return (
    <div className="flex flex-col md:flex-row items-start gap-8 mt-8 justify-start w-full px-2">
      {/* Sağ konteyner: Kontrol Paneli */}
      <div className="flex flex-col w-full md:w-1/2">
        <TimerPanel onStop={handleTimerStop} onStart={handleTimerStart} />
      </div>
      {/* Ayraç (sadece büyük ekranda göster) */}
      <div className="hidden md:block w-px h-80 bg-gray-300 dark:bg-gray-700 mx-4" />
      {/* Sol konteyner: Grafik */}
      <div className="flex flex-col gap-10 items-center justify-center w-full md:w-1/2">
        <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-100">Tatbikat Sonuçları</h2>
        <ChartSection chartData={chartData} />
      </div>
    </div>
  );
}