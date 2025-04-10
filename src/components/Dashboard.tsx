import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { AlertTriangle, TrendingUp, Users, Pill as Pills } from 'lucide-react';

interface DashboardStats {
  totalPatients: number;
  totalMedications: number;
  lowStockItems: number;
  totalCost: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    totalMedications: 0,
    lowStockItems: 0,
    totalCost: 0,
  });

  useEffect(() => {
    async function fetchStats() {
      // Fetch total patients
      const { count: patientsCount } = await supabase
        .from('patients')
        .select('*', { count: 'exact' });

      // Fetch medications stats
      const { data: medications } = await supabase
        .from('medications')
        .select('*');

      // Calculate low stock items
      const lowStock = medications?.filter(
        (med) => med.current_stock <= med.min_stock_level
      ).length || 0;

      // Fetch total cost from medication usage
      const { data: usageData } = await supabase
        .from('medication_usage')
        .select('quantity, unit_cost_at_time');

      const totalCost = usageData?.reduce(
        (acc, curr) => acc + curr.quantity * curr.unit_cost_at_time,
        0
      ) || 0;

      setStats({
        totalPatients: patientsCount || 0,
        totalMedications: medications?.length || 0,
        lowStockItems: lowStock,
        totalCost,
      });
    }

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Patients */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Patients</p>
              <p className="text-2xl font-bold">{stats.totalPatients}</p>
            </div>
            <Users className="text-blue-500" size={24} />
          </div>
        </div>

        {/* Total Medications */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Medications</p>
              <p className="text-2xl font-bold">{stats.totalMedications}</p>
            </div>
            <Pills className="text-green-500" size={24} />
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Low Stock Items</p>
              <p className="text-2xl font-bold text-orange-500">{stats.lowStockItems}</p>
            </div>
            <AlertTriangle className="text-orange-500" size={24} />
          </div>
        </div>

        {/* Total Cost */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Cost</p>
              <p className="text-2xl font-bold">${stats.totalCost.toFixed(2)}</p>
            </div>
            <TrendingUp className="text-purple-500" size={24} />
          </div>
        </div>
      </div>

      {/* Additional dashboard content can be added here */}
    </div>
  );
}