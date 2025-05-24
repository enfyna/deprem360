'use client'
import React, { useState, useRef } from "react";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import { Button } from "@/components/ui/button";

const initialChartData = [
  { eksen_x: "T 1", Sure: 60 },
  
  
];

const chartConfig = {
  Sure: {
    label: "Süre (saniye)",
    color: "#2563eb",
  },
} satisfies ChartConfig;

function ChartSection({ chartData }: { chartData: typeof initialChartData }) {
  return (
    <div className="flex flex-col items-start w-full">
      <ChartContainer
        config={chartConfig}
        className="min-h-[300px] w-full max-w-[600px] bg-white dark:bg-gray-900 rounded-lg shadow"
      >
        <BarChart data={chartData} width={550} height={450}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
          <XAxis
            dataKey="eksen_x"
            stroke="#374151"
            tick={{ fill: "var(--tw-text-opacity,1) #374151" }}
            tickLine={{ stroke: "#374151" }}
            axisLine={{ stroke: "#374151" }}
            interval={0} // <-- Tüm etiketleri göster
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
      </ChartContainer>
    </div>
  );
}

function TimerPanel({ onStop }: { onStop: (seconds: number) => void }) {
  const [milliseconds, setMilliseconds] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleStartStop = () => {
    if (!running) {
      setRunning(true);
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

  React.useEffect(() => {
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
  const [chartData, setChartData] = useState(initialChartData);

  const handleTimerStop = (seconds: number) => {
    if (seconds === 0) return;
    const nextIndex = chartData.length + 1;
    setChartData([
      ...chartData,
      {
        eksen_x: `T ${nextIndex}`,
        Sure: seconds,
      },
    ]);
  };

  return (
    <div className="flex flex-col md:flex-row items-start gap-8 mt-8 justify-start w-full px-2">
      {/* Sağ konteyner: Kontrol Paneli */}
      <div className="flex flex-col w-full md:w-1/2">
        <TimerPanel onStop={handleTimerStop} />
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