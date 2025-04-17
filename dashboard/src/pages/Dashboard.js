import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ApiService from '../services/api';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [functions, setFunctions] = useState([]);
  const [executions, setExecutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [functionsResponse, executionsResponse] = await Promise.all([
          ApiService.getFunctions(),
          ApiService.getExecutions()
        ]);
        
        setFunctions(functionsResponse.data);
        setExecutions(executionsResponse.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to fetch dashboard data. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
    
    // Refresh data every 10 seconds
    const intervalId = setInterval(fetchData, 10000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Calculate metrics
  const totalFunctions = functions.length;
  const totalExecutions = executions.length;
  const completedExecutions = executions.filter(e => e.status === 'completed').length;
  const failedExecutions = executions.filter(e => e.status === 'failed').length;
  const averageDuration = executions.length > 0
    ? executions.reduce((acc, curr) => acc + (curr.duration || 0), 0) / executions.length
    : 0;

  // Group executions by function - Fix for null functionId issue
  const executionsByFunction = executions.reduce((acc, execution) => {
    // Check if functionId exists and has _id property
    if (execution.functionId && typeof execution.functionId === 'object' && execution.functionId._id) {
      const functionId = execution.functionId._id;
      acc[functionId] = (acc[functionId] || 0) + 1;
    } else if (execution.functionId && typeof execution.functionId === 'string') {
      const functionId = execution.functionId;
      acc[functionId] = (acc[functionId] || 0) + 1;
    }
    return acc;
  }, {});

  // Create data for charts
  const statusChartData = {
    labels: ['Completed', 'Failed', 'Running', 'Pending'],
    datasets: [
      {
        label: 'Executions by Status',
        data: [
          executions.filter(e => e.status === 'completed').length,
          executions.filter(e => e.status === 'failed').length,
          executions.filter(e => e.status === 'running').length,
          executions.filter(e => e.status === 'pending').length
        ],
        backgroundColor: [
          'rgba(40, 167, 69, 0.6)', // completed - green
          'rgba(220, 53, 69, 0.6)', // failed - red
          'rgba(23, 162, 184, 0.6)', // running - blue
          'rgba(255, 193, 7, 0.6)'  // pending - yellow
        ]
      }
    ]
  };

  // Recent executions chart (last 10 executions)
  const recentExecutions = [...executions]
    .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
    .slice(0, 10)
    .reverse();

  const executionTimeChartData = {
    labels: recentExecutions.map((_, index) => `Execution ${index + 1}`),
    datasets: [
      {
        label: 'Execution Time (ms)',
        data: recentExecutions.map(e => e.duration || 0),
        borderColor: 'rgba(23, 162, 184, 1)',
        backgroundColor: 'rgba(23, 162, 184, 0.2)',
        tension: 0.4
      }
    ]
  };

  // Top functions chart - Fix for null functionId issue
  const functionIds = Object.keys(executionsByFunction);
  const functionNames = functionIds.map(id => {
    const func = functions.find(f => f._id === id);
    return func ? func.name : 'Unknown';
  });

  const topFunctionsChartData = {
    labels: functionNames,
    datasets: [
      {
        label: 'Number of Executions',
        data: functionIds.map(id => executionsByFunction[id]),
        backgroundColor: 'rgba(40, 167, 69, 0.6)'
      }
    ]
  };

  // Fix for null functionId in recentExecutions
  const fixedRecentExecutions = recentExecutions.map(execution => {
    return {
      ...execution,
      functionName: execution.functionId && typeof execution.functionId === 'object' && execution.functionId.name 
        ? execution.functionId.name 
        : 'Unknown',
      functionId: execution.functionId && typeof execution.functionId === 'object' && execution.functionId._id 
        ? execution.functionId._id 
        : (typeof execution.functionId === 'string' ? execution.functionId : 'unknown')
    };
  });

  if (loading) {
    return <div className="text-center mt-5"><h3>Loading dashboard...</h3></div>;
  }

  if (error) {
    return <div className="alert alert-danger mt-5">{error}</div>;
  }

  return (
    <div className="dashboard">
      <h1 className="mb-4">Dashboard</h1>
      
      {/* Key Metrics */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card metrics-card">
            <div className="card-body text-center">
              <h5 className="card-title">Total Functions</h5>
              <h2 className="card-text">{totalFunctions}</h2>
              <Link to="/functions" className="btn btn-sm btn-outline-primary">View All</Link>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card metrics-card">
            <div className="card-body text-center">
              <h5 className="card-title">Total Executions</h5>
              <h2 className="card-text">{totalExecutions}</h2>
              <Link to="/executions" className="btn btn-sm btn-outline-primary">View All</Link>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card metrics-card">
            <div className="card-body text-center">
              <h5 className="card-title">Success Rate</h5>
              <h2 className="card-text">
                {totalExecutions > 0 ? `${Math.round((completedExecutions / totalExecutions) * 100)}%` : 'N/A'}
              </h2>
              <span className="text-success">{completedExecutions} successful</span> /
              <span className="text-danger"> {failedExecutions} failed</span>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card metrics-card">
            <div className="card-body text-center">
              <h5 className="card-title">Avg. Duration</h5>
              <h2 className="card-text">{averageDuration.toFixed(2)}ms</h2>
              <span className="text-muted">Across all executions</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Charts */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Execution Status</h5>
            </div>
            <div className="card-body">
              <div className="chart-container">
                <Doughnut 
                  data={statusChartData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'right',
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Top Functions by Executions</h5>
            </div>
            <div className="card-body">
              <div className="chart-container">
                <Bar 
                  data={topFunctionsChartData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="row">
        <div className="col-md-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Recent Execution Times</h5>
            </div>
            <div className="card-body">
              <div className="chart-container">
                <Line 
                  data={executionTimeChartData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: 'Duration (ms)'
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Recent Executions</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Function</th>
                      <th>Status</th>
                      <th>Duration</th>
                      <th>Time</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fixedRecentExecutions.map(execution => (
                      <tr key={execution._id}>
                        <td>
                          <Link to={`/functions/${execution.functionId}`}>
                            {execution.functionName}
                          </Link>
                        </td>
                        <td>
                          <span className={`badge status-${execution.status}`}>
                            {execution.status}
                          </span>
                        </td>
                        <td>{execution.duration ? `${execution.duration}ms` : 'N/A'}</td>
                        <td>{new Date(execution.startTime).toLocaleString()}</td>
                        <td>
                          <Link to={`/executions/${execution._id}`} className="btn btn-sm btn-outline-primary">
                            Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {recentExecutions.length === 0 && (
                <div className="text-center py-3">
                  <p>No executions found.</p>
                  <Link to="/functions" className="btn btn-primary">
                    Go to Functions
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;