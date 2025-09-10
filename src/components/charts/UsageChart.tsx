"use client";
import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

type UsageData = {
  labels: string[];
  datasets: Array<{ label: string; data: number[]; borderColor?: string; backgroundColor?: string }>;
};

export default function UsageChart({ data }: { data?: UsageData }) {
  const chartData: UsageData = data || {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [
      { label: 'Day', data: [10, 20, 15, 25, 30], borderColor: 'rgba(54,162,235,1)', backgroundColor: 'rgba(54,162,235,0.2)' },
      { label: 'Night', data: [5, 15, 10, 20, 18], borderColor: 'rgba(255,99,132,1)', backgroundColor: 'rgba(255,99,132,0.2)' },
    ],
  };

  return <Line data={chartData} />;
}
