import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ApiService from '../services/api';

const Executions = () => {
  const [executions, setExecutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExecutions = async () => {
      try {
        setLoading(true);
        const response = await ApiService.getExecutions();
        setExecutions(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching executions:', error);
        setError('Failed to fetch executions. Please try again later.');
        setLoading(false);
      }
    };

    fetchExecutions();
    
    // Refresh data every 10 seconds
    const intervalId = setInterval(fetchExecutions, 10000);
    
    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return <div className="text-center mt-5"><h3>Loading executions...</h3></div>;
  }

  if (error) {
    return <div className="alert alert-danger mt-5">{error}</div>;
  }

  return (
    <div>
      <h1 className="mb-4">Function Executions</h1>
      
      {executions.length === 0 ? (
        <div className="text-center py-5">
          <h4>No executions found</h4>
          <p>Invoke a function to see executions here.</p>
          <Link to="/functions" className="btn btn-primary mt-3">
            Go to Functions
          </Link>
        </div>
      ) : (
        <div className="card">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Function</th>
                    <th>Status</th>
                    <th>Duration</th>
                    <th>Start Time</th>
                    <th>Memory</th>
                    <th>Virtualization</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {executions.map(execution => {
                    // Handle different forms of functionId safely
                    const functionId = execution.functionId ? 
                      (typeof execution.functionId === 'object' && execution.functionId._id ? execution.functionId._id : 
                       typeof execution.functionId === 'string' ? execution.functionId : 'unknown') : 'unknown';
                    
                    const functionName = execution.functionId && 
                      typeof execution.functionId === 'object' && execution.functionId.name ? 
                      execution.functionId.name : 'Unknown';
                    
                    return (
                      <tr key={execution._id}>
                        <td>
                          {functionId !== 'unknown' ? (
                            <Link to={`/functions/${functionId}`}>
                              {functionName}
                            </Link>
                          ) : (
                            <span>{functionName}</span>
                          )}
                        </td>
                        <td>
                          <span className={`badge status-${execution.status}`}>
                            {execution.status}
                          </span>
                        </td>
                        <td>{execution.duration ? `${execution.duration}ms` : 'N/A'}</td>
                        <td>{new Date(execution.startTime).toLocaleString()}</td>
                        <td>{execution.memoryUsage ? `${execution.memoryUsage}MB` : 'N/A'}</td>
                        <td>{execution.virtualizationTechnology}</td>
                        <td>
                          <Link to={`/executions/${execution._id}`} className="btn btn-sm btn-outline-primary">
                            Details
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Executions;