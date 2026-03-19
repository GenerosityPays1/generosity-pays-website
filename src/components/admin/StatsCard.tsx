'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: { value: number; label?: string };
  className?: string;
}

export default function StatsCard({ title, value, icon, trend, className = '' }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {trend && (
            <p className={`text-xs mt-1 font-medium ${trend.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend.value >= 0 ? '+' : ''}{trend.value}%{trend.label ? ` ${trend.label}` : ''}
            </p>
          )}
        </div>
        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary text-xl">
          {icon}
        </div>
      </div>
    </motion.div>
  );
}
