# Serverless Function Platform

A comprehensive serverless function platform similar to AWS Lambda, with support for multiple virtualization technologies and a real-time monitoring dashboard.

## Features

- **Multi-runtime Support**: Run JavaScript and Python functions
- **Multiple Virtualization Technologies**:
  - Docker containers for standard isolation
  - gVisor container runtime for enhanced security isolation
- **Real-time Monitoring**: Track function executions, performance metrics, and logs
- **RESTful API**: Create, update, invoke, and manage functions programmatically
- **Web Dashboard**: User-friendly interface for function management and visualization
- **Resource Controls**: Configure memory limits and timeouts for functions
- **Environment Variables**: Set environment-specific configuration

## Architecture

The platform consists of the following components:

- **API Server**: RESTful API for function management and invocation
- **Execution Engine**: Handles function execution using different virtualization technologies
- **Database**: Stores function definitions and execution records
- **Dashboard**: Web interface for function management and monitoring

## Prerequisites

- Node.js (v14+)
- Docker
- MongoDB
- [Optional] gVisor runtime for enhanced isolation

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/serverless-platform.git
cd serverless-platform
```

### 2. Install Dependencies

Install dependencies for each component:

```bash
# API Server
cd api
npm install

# Execution Engine
cd ../execution-engine
npm install

# Dashboard
cd ../dashboard
npm install
```

### 3. Set Up MongoDB

Make sure MongoDB is running on your system. You can start it with:

```bash
# Start MongoDB
mongod --dbpath /path/to/data/directory
```

### 4. Start the Services

Start each component in a separate terminal:

```bash
# API Server
cd api
npm start

# Dashboard
cd dashboard
npm start
```

The system will create the necessary directories and set up the execution environment automatically.

### 5. Access the Dashboard

Open your browser and navigate to:

```
http://localhost:3000
```

## Using the Platform

### Creating a Function

1. Navigate to the Functions page
2. Click "New Function"
3. Fill in the details:
   - Name: A unique name for your function
   - Runtime: JavaScript or Python
   - Handler: The entry point (e.g., `index.handler` for JavaScript)
   - Code: Write or paste your function code
   - Memory: Set the memory limit (default: 128MB)
   - Timeout: Set the execution timeout (default: 30s)
4. Click "Create Function"

### Invoking a Function

1. Go to the function details page
2. Click on the "Invoke" tab
3. Provide the input JSON
4. Select the virtualization technology (Docker or gVisor)
5. Click "Invoke Function"
6. View the execution results, logs, and metrics

### Monitoring Functions

The dashboard provides real-time metrics for functions, including:

- Execution counts and success rates
- Execution durations
- Memory and CPU usage
- Detailed logs

## API Reference

The platform provides a RESTful API for function management:

### Functions

- `GET /api/functions` - List all functions
- `GET /api/functions/:id` - Get function details
- `POST /api/functions` - Create a new function
- `PUT /api/functions/:id` - Update a function
- `DELETE /api/functions/:id` - Delete a function

### Executions

- `GET /api/executions` - List all executions
- `GET /api/executions/:id` - Get execution details
- `GET /api/executions/function/:functionId` - Get executions for a function
- `POST /api/executions/invoke/:functionId` - Invoke a function

## Security Considerations

- The platform uses container isolation for security
- gVisor provides additional security isolation for untrusted code
- Function timeouts and memory limits prevent resource exhaustion
- Each function execution runs in its own isolated environment

## Development

### Project Structure

```
serverless-platform/
├── api/               # API server
│   ├── index.js       # Main server file
│   ├── models/        # Database models
│   └── routes/        # API routes
├── dashboard/         # Web UI
│   ├── public/        # Static assets
│   └── src/           # React components
├── execution-engine/  # Function execution engine
│   ├── docker/        # Docker execution engine
│   └── gvisor/        # gVisor execution engine
└── functions/         # Sample functions
    ├── javascript/    # JavaScript samples
    └── python/        # Python samples
```

### Adding a New Virtualization Technology

To add a new virtualization technology:

1. Create a new implementation in `execution-engine/`
2. Implement the `executeFunction` interface
3. Register the new engine in `execution-engine/index.js`
4. Update the UI to include the new option

## Future Enhancements

- Support for additional runtimes (Go, Ruby, Java)
- Additional virtualization technologies (Firecracker)
- Function versioning and aliases
- Cold start optimizations
- Autoscaling support
- Authentication and multi-tenancy
- Function composition and workflows
- VPC networking integration
- Custom domains for function endpoints

## License

MIT License