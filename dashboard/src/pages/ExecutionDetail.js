import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ApiService from '../services/api';

const ExecutionDetail = () => {
  const { id } = useParams();
  const [execution, setExecution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExecutionData = async () => {
      try {
        setLoading(true);
        const response = await ApiService.getExecution(id);
        setExecution(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching execution data:', error);
        setError('Failed to fetch execution data. Please try again later.');
        setLoading(false);
      }
    };

    fetchExecutionData();
  }, [id]);

  if (loading) {
    return <div className="text-center mt-5"><h3>Loading execution details...</h3></div>;
  }

  if (error) {
    return <div className="alert alert-danger mt-5">{error}</div>;
  }

  if (!execution) {
    return <div className="alert alert-warning mt-5">Execution not found</div>;
  }

  const functionId = execution.functionId._id || execution.functionId;
  const functionName = execution.functionId.name || 'Unknown Function';

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1>Execution Details</h1>
          <p className="text-muted">
            Function: <Link to={`/functions/${functionId}`}>{functionName}</Link>
          </p>
        </div>
        <span className={`badge status-${execution.status}`}>
          {execution.status}
        </span>
      </div>
      
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Execution Information</h5>
            </div>
            <div className="card-body">
              <p><strong>Execution ID:</strong> {execution._id}</p>
              <p><strong>Status:</strong> {execution.status}</p>
              <p><strong>Start Time:</strong> {new Date(execution.startTime).toLocaleString()}</p>
              <p><strong>End Time:</strong> {execution.endTime ? new Date(execution.endTime).toLocaleString() : 'N/A'}</p>
              <p><strong>Duration:</strong> {execution.duration ? `${execution.duration}ms` : 'N/A'}</p>
              <p><strong>Virtualization Technology:</strong> {execution.virtualizationTechnology}</p>
            </div>
          </div>
          
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Resource Usage</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <div className="card bg-light">
                    <div className="card-body text-center">
                      <h5 className="card-title">Memory Usage</h5>
                      <h2 className="card-text">{execution.memoryUsage || '0'} MB</h2>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card bg-light">
                    <div className="card-body text-center">
                      <h5 className="card-title">CPU Usage</h5>
                      <h2 className="card-text">{execution.cpuUsage || '0'}%</h2>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Input</h5>
            </div>
            <div className="card-body">
              <pre className="p-3 bg-light rounded" style={{ maxHeight: '200px', overflow: 'auto' }}>
                <code>{JSON.stringify(execution.input, null, 2)}</code>
              </pre>
            </div>
          </div>
          
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Output</h5>
            </div>
            <div className="card-body">
              {execution.error ? (
                <div className="alert alert-danger">
                  {execution.error}
                </div>
              ) : (
                <pre className="p-3 bg-light rounded" style={{ maxHeight: '200px', overflow: 'auto' }}>
                  <code>{JSON.stringify(execution.output, null, 2)}</code>
                </pre>
              )}
            </div>
          </div>
          
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Logs</h5>
            </div>
            <div className="card-body">
              <div className="execution-log">
                {execution.logs && execution.logs.length > 0 ? (
                  execution.logs.map((log, index) => (
                    <div key={index}>{log}</div>
                  ))
                ) : (
                  <div className="text-muted">No logs available</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="d-flex justify-content-between">
        <Link to={`/functions/${functionId}`} className="btn btn-outline-primary">
          Back to Function
        </Link>
        <Link to={`/functions/${functionId}`} state={{ invokeTab: true }} className="btn btn-primary">
          Invoke Again
        </Link>
      </div>
    </div>
  );
};

export default ExecutionDetail;