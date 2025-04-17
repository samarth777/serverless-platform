import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Functions from './pages/Functions';
import FunctionDetail from './pages/FunctionDetail';
import CreateFunction from './pages/CreateFunction';
import Executions from './pages/Executions';
import ExecutionDetail from './pages/ExecutionDetail';

function App() {
  return (
    <div className="container-fluid">
      <div className="row">
        {/* Sidebar */}
        <div className="col-md-2 p-0 sidebar">
          <div className="d-flex flex-column p-3">
            <h3 className="mb-4">Serverless Platform</h3>
            <nav className="nav flex-column">
              <Link className="nav-link text-white" to="/">Dashboard</Link>
              <Link className="nav-link text-white" to="/functions">Functions</Link>
              <Link className="nav-link text-white" to="/executions">Executions</Link>
              <Link className="nav-link text-white" to="/functions/new">Create Function</Link>
            </nav>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="col-md-10 main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/functions" element={<Functions />} />
            <Route path="/functions/new" element={<CreateFunction />} />
            <Route path="/functions/:id" element={<FunctionDetail />} />
            <Route path="/executions" element={<Executions />} />
            <Route path="/executions/:id" element={<ExecutionDetail />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;