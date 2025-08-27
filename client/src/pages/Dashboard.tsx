import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { 
  fetchDashboardMetrics, 
  fetchRecentActivities, 
  fetchTopDeals 
} from '../store/slices/dashboardSlice';
import MetricsCard from '../components/Dashboard/MetricsCard';
import RecentActivities from '../components/Dashboard/RecentActivities';
import TopDeals from '../components/Dashboard/TopDeals';
import SalesChart from '../components/Charts/SalesChart';
import ConversionChart from '../components/Charts/ConversionChart';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { metrics, recentActivities, topDeals, isLoading } = useAppSelector(
    (state) => state.dashboard
  );

  useEffect(() => {
    dispatch(fetchDashboardMetrics());
    dispatch(fetchRecentActivities());
    dispatch(fetchTopDeals());
  }, [dispatch]);

  if (isLoading && !metrics) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Dashboard</h1>
        <p className="dashboard-subtitle">Welcome back! Here's what's happening with your business.</p>
      </div>

      {/* Metrics Cards */}
      <div className="metrics-grid">
        <MetricsCard
          title="Total Leads"
          value={metrics?.overview?.totalLeads || 0}
          change={0}
          icon="👥"
          color="primary"
        />
        <MetricsCard
          title="Active Deals"
          value={metrics?.overview?.activeDeals || 0}
          change={12}
          icon="💰"
          color="success"
        />
        <MetricsCard
          title="Total Revenue"
          value={`$${(metrics?.revenue?.totalValue || 0).toLocaleString()}`}
          change={0}
          icon="📈"
          color="warning"
        />
        <MetricsCard
          title="Conversion Rate"
          value={`${(metrics?.revenue?.winRate || 0).toFixed(1)}%`}
          change={2.5}
          icon="🎯"
          color="info"
        />
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-container">
          <h3 className="chart-title">Sales Trends</h3>
          <SalesChart />
        </div>
        <div className="chart-container">
          <h3 className="chart-title">Conversion Rates</h3>
          <ConversionChart />
        </div>
      </div>

      {/* Bottom Section */}
      <div className="dashboard-bottom">
        <div className="recent-activities-section">
          <h3 className="section-title">Recent Activities</h3>
          <RecentActivities activities={recentActivities} />
        </div>
        
        <div className="top-deals-section">
          <h3 className="section-title">Top Deals</h3>
          <TopDeals deals={topDeals} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
