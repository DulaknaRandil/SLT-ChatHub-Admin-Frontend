"use client";
import React from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function MediaChart({ data }: { data?: number[] }) {
  const d = data || [30, 20, 10, 40];
  return (
    <Pie
      data={{ labels: ['Images', 'Videos', 'Voice', 'Docs'], datasets: [{ data: d, backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'] }] }}
      options={{ responsive: true, plugins: { legend: { position: 'top' } } }}
    />
  );
}
