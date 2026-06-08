# DataFlow AWS - Advanced README

<div align="center">
  
![DataFlow AWS]

**Interactive Planning, Simulation & Generation Platform for AWS Serverless Data Pipelines**

![React](https://img.shields.io/badge/React-19.0.1-61dafb?logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6?logo=typescript) ![Vite](https://img.shields.io/badge/Vite-6.2.3-646cff?logo=vite) ![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js) ![AWS](https://img.shields.io/badge/AWS-Lambda%20%7C%20Glue%20%7C%20S3-ff9900?logo=amazonaws)

[Quick Start](#quick-start) • [Architecture](#system-architecture) • [API Reference](#api-integration) • [Deployment](#deployment-strategies) • [Contributing](#contributing)

</div>

---

## Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Prerequisites & Environment Setup](#prerequisites--environment-setup)
- [Installation & Configuration](#installation--configuration)
- [Core Features & Pipeline Presets](#core-features--pipeline-presets)
- [API Integration (Google Gemini)](#api-integration-google-gemini)
- [Development Workflow](#development-workflow)
- [Performance Optimization](#performance-optimization)
- [Security & Compliance](#security--compliance)
- [Deployment Strategies](#deployment-strategies)
- [Troubleshooting & Debugging](#troubleshooting--debugging)
- [Contributing Guidelines](#contributing-guidelines)
- [License](#license)

---

## Overview

**DataFlow AWS** is an intelligent, interactive platform designed to democratize the design and deployment of enterprise-grade AWS serverless data pipelines. The application leverages Google's Gemini API for intelligent code generation, configuration recommendations, and pipeline optimization.

### Key Capabilities

| Feature | Description |
|---------|-------------|
| **Interactive Pipeline Design** | Visual configuration interface for AWS Lambda, Glue ETL, and S3 workflows |
| **AI-Driven Code Generation** | Automatic Terraform, Glue PySpark, and Lambda handler generation via Gemini API |
| **Pipeline Simulation** | Real-time execution simulation with synthetic data generation and validation |
| **Security & Compliance** | PII masking, HIPAA compliance support, data encryption, and audit trail generation |
| **Multi-Preset Templates** | Pre-configured pipeline patterns for E-Commerce, IoT, Healthcare, Web Analytics, and Financial Data |
| **Serverless Architecture** | 100% serverless deployment with no EC2 instances or persistent infrastructure |

### Technology Stack

```
Frontend Layer
├── React 19 (UI Framework)
├── TypeScript 5.8 (Type Safety)
├── Tailwind CSS 4.1 + ViteCSS (Styling)
├── Lucide React (Icons)
└── Motion.js (Animations)

Backend Layer
├── Express.js 4.21 (HTTP Server)
├── Vite 6.2 (Dev Server & Build)
├── tsx (TypeScript Execution)
└── esbuild (Production Bundling)

AI/ML Integration
├── Google Gemini API 2.4 (@google/genai)
└── Server-Side API Support

Infrastructure & Build
├── TypeScript Compilation
├── Vite + React Plugin
├── Tailwind CSS Vite Plugin
└── Hot Module Replacement (HMR)
```

---

## System Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    React Frontend (SPA)                      │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │  SidebarSettings │  │  Main Viewport   │                │
│  │  Configuration   │  │  Pipeline Canvas │                │
│  │  & Presets       │  │  Data Simulation │                │
│  └──────────────────┘  └──────────────────┘                │
└─────────────────────┬───────────────────────────────────────┘
                      │ (HTTP/WebSocket)
┌─────────────────────▼───────────────────────────────────────┐
│              Express.js Backend Server                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Pipeline Configuration API                            │ │
│  │  ├─ POST /api/pipeline/validate                       │ │
│  │  ├─ POST /api/pipeline/simulate                       │ │
│  │  └─ POST /api/generate/terraform                      │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Gemini AI Integration Layer                           │ │
│  │  ├─ Code Generation (Terraform, PySpark)              │ │
│  │  ├─ Configuration Recommendations                      │ │
│  │  └─ Error Analysis & Debugging                        │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
    [Gemini API] [AWS Services] [Data Store]
    (Code Gen)    (Validation)   (Session State)
```

### Data Flow

1. **User Configuration** → SidebarSettings captures pipeline parameters
2. **Local Validation** → TypeScript types validate against PipelineConfig
3. **Backend Processing** → Express server processes requests
4. **Gemini Integration** → AI generates code based on configuration
5. **Simulation Engine** → Runs mock data through configured pipeline
6. **Results Visualization** → Frontend renders simulation results and generated code

---

## Prerequisites & Environment Setup

### System Requirements

```
Minimum Requirements:
├── Node.js: v18.0.0 or higher (v20+ recommended)
├── npm: v9.0.0 or higher (or yarn/pnpm equivalent)
├── Memory: 4GB RAM (8GB+ recommended for large simulations)
├── Disk Space: 2GB for node_modules
└── OS: macOS, Linux, or Windows (WSL2 recommended for Windows)

Recommended Setup:
├── Node.js: v20.11.0 (LTS)
├── npm: v10.5.0+
├── VSCode with TypeScript support
└── Git for version control
```

### API Credentials

#### Google Gemini API Setup

1. **Create a Google Cloud Project:**
   ```bash
   # Visit Google Cloud Console
   https://console.cloud.google.com/
   
   # Create new project
   gcloud projects create dataflow-aws-app
   ```

2. **Enable Gemini API:**
   ```bash
   gcloud services enable generativelanguage.googleapis.com \
     --project=dataflow-aws-app
   ```

3. **Create API Key:**
   ```bash
   # Via Cloud Console: APIs & Services → Credentials → Create Credentials → API Key
   # Or via gcloud CLI:
   gcloud alpha services api-keys create \
     --display-name="DataFlow AWS" \
     --project=dataflow-aws-app
   ```

4. **Set Environment Variable:**
   ```bash
   export GEMINI_API_KEY="your-api-key-here"
   # Or add to .env.local file (see Installation section)
   ```

---

## Installation & Configuration

### Step 1: Clone & Install Dependencies

```bash
# Clone repository
git clone <repository-url>
cd dataflow-aws-app

# Install Node dependencies with legacy peer deps if needed
npm install --legacy-peer-deps

# Verify installation
npm run lint  # Should run with no TypeScript errors
```

### Step 2: Environment Configuration

Create `.env.local` file in project root:

```env
# Google Gemini API Configuration
GEMINI_API_KEY=your-gemini-api-key-here

# Optional: Gemini Model Selection
GEMINI_MODEL=gemini-2.0-flash

# Development Server Configuration
VITE_DEV_SERVER_PORT=5173
VITE_API_SERVER_PORT=3000

# Features
ENABLE_PII_MASKING=true
ENABLE_TERRAFORM_GENERATION=true
ENABLE_GLUE_SCRIPT_GENERATION=true

# Logging
LOG_LEVEL=info
DEBUG_MODE=false

# Optional: AWS Service Configuration (for actual deployment)
AWS_REGION=us-east-1
AWS_PROFILE=default
TERRAFORM_STATE_BUCKET=dataflow-terraform-state
```

### Step 3: Verify Configuration

```bash
# Test Gemini API connectivity
npm run test:api

# Build TypeScript without errors
npm run lint

# Start development server
npm run dev
```

### Advanced Configuration

#### Custom Vite Configuration

Edit `vite.config.ts` for advanced customization:

```typescript
// Enable/disable HMR
server: {
  hmr: process.env.DISABLE_HMR !== 'true',
  watch: process.env.DISABLE_HMR === 'true' ? null : {},
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, '')
    }
  }
}

// Custom aliases
resolve: {
  alias: {
    '@components': path.resolve(__dirname, './src/components'),
    '@utils': path.resolve(__dirname, './src/utils'),
    '@hooks': path.resolve(__dirname, './src/hooks'),
  }
}
```

#### TypeScript Configuration

The project uses strict TypeScript settings in `tsconfig.json`:

- Target: ES2022 (modern JavaScript features)
- Module: ESNext (tree-shakeable)
- JSX: react-jsx (automatic runtime)
- Strict mode enabled
- Path aliases configured

---

## Core Features & Pipeline Presets

### Pipeline Configuration Model

```typescript
interface PipelineConfig {
  // Pipeline Selection
  preset: PipelinePresetId; // 'ecommerce' | 'iot_telemetry' | 'healthcare_pii' | 'web_clickstream' | 'financial_ledger'
  
  // AWS Lambda Configuration
  lambdaTimeout: number;           // 3-60 seconds
  
  // S3 Security
  bucketType: 'standard' | 'encrypted';  // SSE-S3 or SSE-KMS
  
  // AWS Glue ETL
  glueWorkers: number;             // 2-10 DPU (Data Processing Units)
  glueCompression: 'snappy' | 'gzip' | 'none';
  targetFormat: 'parquet' | 'iceberg' | 'json';
  
  // Data Governance
  enablePIIMasking: boolean;       // GDPR/HIPAA compliance
  enablePartitioning: boolean;     // Cost optimization
  partitionKeys: string[];         // e.g., ['date', 'region']
}
```

### Available Pipeline Presets

#### 1. **E-Commerce Transactions**

**Use Case:** Real-time transaction processing with PCI compliance

```typescript
{
  id: 'ecommerce',
  rawSchema: 'transaction_id, amount, currency, status, payment_details, customer_email',
  typicalPII: ['Credit Card Numbers', 'Email Addresses'],
  suggestedTransformations: ['Deduplication', 'Format Standardization', 'PII Masking']
}
```

**Configuration Recommendations:**
- **Lambda Timeout:** 15-30 seconds
- **Glue Workers:** 4-6 DPU (handles 1000+ TPS)
- **Storage Format:** Parquet with Snappy compression
- **Partitioning:** date, region, payment_type
- **Security:** Enable PII masking, SSE-KMS encryption

#### 2. **Industrial IoT Telemetry**

**Use Case:** High-frequency sensor data aggregation and anomaly detection

```typescript
{
  id: 'iot_telemetry',
  rawSchema: 'device_id, temperature, status, alert_triggers, machine_load_factor',
  typicalPII: ['Device IP addresses', 'Operator metadata'],
  suggestedTransformations: ['Rolling window aggregation', 'Outlier filtering', 'Snappy compression']
}
```

**Configuration Recommendations:**
- **Lambda Timeout:** 30-45 seconds (high-volume processing)
- **Glue Workers:** 8-10 DPU (streaming transformations)
- **Storage Format:** Iceberg (time-series optimized)
- **Partitioning:** timestamp, device_id, location
- **Compression:** Snappy (good balance of speed/ratio)

#### 3. **Healthcare Patient Records (HIPAA)**

**Use Case:** Secure patient data processing with strict compliance

```typescript
{
  id: 'healthcare_pii',
  rawSchema: 'patient_id, patient_name, ssn, dob, diagnosis_code, clinical_cost',
  typicalPII: ['SSN', 'Patient Names', 'DOB', 'Medical Records'],
  suggestedTransformations: ['SHA-256 hashing', 'Audit trail injection', 'Database partition mapping']
}
```

**Configuration Recommendations:**
- **Lambda Timeout:** 45-60 seconds (strict validation)
- **Glue Workers:** 4-6 DPU (smaller batches for compliance)
- **Storage Format:** Parquet (audit trail compatible)
- **Security:** **MANDATORY PII masking**, SSE-KMS, field-level encryption
- **Compliance Features:** Audit logging, access control, data lineage

#### 4. **Web Access Clickstreams**

**Use Case:** User behavior analytics and session tracking

```typescript
{
  id: 'web_clickstream',
  rawSchema: 'session_id, request_ips, bytes_transferred, page_views, browser_agent',
  typicalPII: ['Client IP addresses', 'Web tokens'],
  suggestedTransformations: ['User-Agent parsing', 'Geo-IP translation', 'Partition by status code']
}
```

**Configuration Recommendations:**
- **Lambda Timeout:** 10-20 seconds (fast, frequent invocations)
- **Glue Workers:** 6-8 DPU (handle high volume)
- **Storage Format:** Parquet (analytical queries)
- **Partitioning:** date, hour, source_channel
- **Privacy:** IP anonymization, PII masking optional

#### 5. **Financial Ledger (Future)**

**Use Case:** Transaction settlement and financial reporting

```typescript
{
  id: 'financial_ledger',
  description: 'Coming soon...'
}
```

---

## API Integration (Google Gemini)

### Gemini API Integration Points

The application uses Google's Gemini API for intelligent code generation and recommendations.

### 1. Infrastructure-as-Code Generation (Terraform)

**Endpoint:** `POST /api/generate/terraform`

```typescript
interface TerraformGenerationRequest {
  pipelineConfig: PipelineConfig;
  includeVPC: boolean;
  includeMonitoring: boolean;
  tags: Record<string, string>;
}

interface TerraformGenerationResponse {
  terraform: string;      // Main Terraform code
  variables: string;      // variables.tf content
  outputs: string;        // outputs.tf content
  readme: string;         // Deployment instructions
}
```

**Example Request:**

```bash
curl -X POST http://localhost:3000/api/generate/terraform \
  -H "Content-Type: application/json" \
  -d '{
    "pipelineConfig": {
      "preset": "ecommerce",
      "lambdaTimeout": 30,
      "bucketType": "encrypted",
      "glueWorkers": 6,
      "glueCompression": "snappy",
      "targetFormat": "parquet",
      "enablePIIMasking": true,
      "enablePartitioning": true,
      "partitionKeys": ["date", "region"]
    },
    "includeVPC": true,
    "includeMonitoring": true,
    "tags": {
      "Environment": "production",
      "Application": "dataflow"
    }
  }'
```

**Generated Terraform Includes:**

- Lambda function with IAM role
- Glue job configuration
- S3 buckets with encryption and lifecycle policies
- CloudWatch monitoring and alarms
- VPC setup with security groups (if enabled)
- SNS topics for alerts
- EventBridge rules for scheduling

### 2. AWS Glue PySpark Script Generation

**Endpoint:** `POST /api/generate/glue-script`

```python
# Generated Glue Script Example
import sys
from awsglue.transforms import *
from awsglue.utils import getResolvedOptions
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, when, sha2, lit, current_timestamp

# PII Masking Functions (Auto-generated based on preset)
def mask_credit_card(cc_number):
    """Mask credit card to XXXX-XXXX-XXXX-{last4}"""
    return when(col(cc_number).isNotNull(), 
                concat(lit("XXXX-XXXX-XXXX-"), 
                       substring(col(cc_number), -4, 4))).otherwise(None)

def mask_email(email):
    """Hash email for GDPR compliance"""
    return sha2(col(email), 256)

# Data transformation pipeline
spark = SparkSession.builder.appName("DataFlowGlueJob").getOrCreate()

# Read from S3
input_df = spark.read.parquet(s3_input_path)

# Apply transformations
if config['enablePIIMasking']:
    input_df = input_df \
        .withColumn("payment_details", mask_credit_card("payment_details")) \
        .withColumn("customer_email", mask_email("customer_email"))

# Write to S3 with partitioning
input_df.write \
    .mode("overwrite") \
    .format("parquet") \
    .option("compression", "snappy") \
    .partitionBy(*partition_keys) \
    .save(s3_output_path)
```

### 3. Pipeline Validation & Error Analysis

**Endpoint:** `POST /api/pipeline/validate`

```typescript
interface ValidationResponse {
  isValid: boolean;
  warnings: ValidationWarning[];
  errors: ValidationError[];
  recommendations: Recommendation[];
  estimatedCost: CostEstimate;
}

interface CostEstimate {
  lambdaPerMonth: number;
  gluePerMonth: number;
  s3StoragePerMonth: number;
  dataTransferPerMonth: number;
  totalPerMonth: number;
}
```

### Implementing Custom Gemini Calls

```typescript
// src/services/geminiService.ts
import { GoogleGenerativeAI } from "@google/genai";

const client = new GoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY
});

export async function generateTerraform(config: PipelineConfig): Promise<string> {
  const model = client.getGenerativeModel({ 
    model: "gemini-2.0-flash"
  });

  const prompt = `
    Generate production-ready Terraform code for an AWS data pipeline with:
    - Pipeline Type: ${config.preset}
    - Lambda Timeout: ${config.lambdaTimeout}s
    - Glue Workers: ${config.glueWorkers} DPU
    - Target Format: ${config.targetFormat}
    - Enable PII Masking: ${config.enablePIIMasking}
    
    Include:
    1. Lambda function definition
    2. Glue job configuration
    3. S3 bucket policies
    4. IAM roles and permissions
    5. CloudWatch monitoring
    6. Error handling
  `;

  const response = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.2,        // Low for consistent code generation
      topP: 0.9,
      maxOutputTokens: 4096
    }
  });

  return response.response.text();
}
```

---

## Development Workflow

### Quick Start Commands

```bash
# Install dependencies
npm install

# Start development server (http://localhost:5173)
npm run dev

# Run TypeScript compiler in watch mode
npm run lint

# Build for production
npm run build

# Start production server
npm start

# Clean build artifacts
npm run clean
```

### Development Server Details

```
Frontend:  http://localhost:5173 (Vite)
Backend:   http://localhost:3000 (Express)
API:       http://localhost:3000/api/*
```

The Vite development server includes:
- **Hot Module Replacement (HMR):** Auto-reload on file changes
- **Fast Refresh:** Preserves component state
- **TypeScript Support:** Real-time type checking
- **CSS Modules:** Tailwind CSS with JIT compilation

### File Structure

```
dataflow-aws-app/
├── src/
│   ├── main.tsx                 # React entry point
│   ├── App.tsx                  # Main component
│   ├── components/
│   │   ├── SidebarSettings.tsx  # Configuration panel
│   │   ├── PipelineCanvas.tsx   # Visual editor
│   │   └── SimulationViewer.tsx # Results display
│   ├── services/
│   │   ├── geminiService.ts     # Gemini API client
│   │   ├── pipelineService.ts   # Business logic
│   │   └── apiClient.ts         # HTTP client
│   ├── hooks/
│   │   ├── usePipelineConfig.ts # State management
│   │   └── useSimulation.ts     # Simulation logic
│   ├── types.ts                 # TypeScript interfaces
│   ├── index.css                # Global styles (Tailwind)
│   └── utils/
│       ├── validators.ts        # Input validation
│       └── formatters.ts        # Data formatting
├── server.ts                    # Express backend
├── vite.config.ts              # Vite configuration
├── tsconfig.json               # TypeScript configuration
├── tailwind.config.js          # Tailwind CSS config
├── package.json                # Dependencies
├── index.html                  # HTML entry point
├── .env.local                  # Environment variables
└── README.md                   # Documentation
```

### Creating New Components

```typescript
// src/components/NewComponent.tsx
import React from 'react';
import { IconComponent } from 'lucide-react';
import { usePipelineConfig } from '@/hooks/usePipelineConfig';

interface NewComponentProps {
  onUpdate?: (data: any) => void;
}

export const NewComponent: React.FC<NewComponentProps> = ({ onUpdate }) => {
  const { config } = usePipelineConfig();
  
  return (
    <div className="bg-[#080808] border border-white/10 rounded-xl p-5">
      <div className="flex items-center space-x-2">
        <IconComponent className="w-5 h-5 text-blue-500" />
        <h2 className="text-white font-semibold">Component Title</h2>
      </div>
      {/* Component content */}
    </div>
  );
};
```

### Debugging

**Enable Debug Mode:**
```bash
DEBUG=* npm run dev
```

**VS Code Debugging:**

Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Backend",
      "program": "${workspaceFolder}/server.ts",
      "runtimeArgs": ["--loader", "tsx/esm"],
      "outFiles": ["${workspaceFolder}/dist/**/*.js"]
    },
    {
      "type": "chrome",
      "request": "launch",
      "name": "Frontend",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/src"
    }
  ]
}
```

---

## Performance Optimization

### Frontend Optimizations

#### 1. Code Splitting

```typescript
// Dynamic imports for large components
const PipelineSimulator = React.lazy(() => 
  import('./components/PipelineSimulator').then(m => ({ default: m.PipelineSimulator }))
);

// Usage with Suspense
<Suspense fallback={<LoadingSpinner />}>
  <PipelineSimulator />
</Suspense>
```

#### 2. Memoization

```typescript
// Prevent unnecessary re-renders
const SidebarSettings = React.memo(({ config, onChange }: Props) => {
  return /* ... */;
}, (prevProps, nextProps) => {
  return JSON.stringify(prevProps.config) === JSON.stringify(nextProps.config);
});
```

#### 3. Bundle Size Optimization

```bash
# Analyze bundle
npm run build -- --analyze

# Optimize imports
import { Button } from 'lucide-react';  // ✅ Tree-shakeable
import * as Icons from 'lucide-react';  // ❌ Bundles all icons
```

### Backend Optimizations

#### 1. API Response Caching

```typescript
// src/middleware/cache.ts
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 300 }); // 5 minutes

app.get('/api/presets', (req, res) => {
  const cachedPresets = cache.get('pipeline-presets');
  if (cachedPresets) {
    return res.json(cachedPresets);
  }
  
  const presets = PRESETS;
  cache.set('pipeline-presets', presets);
  res.json(presets);
});
```

#### 2. Gemini API Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

const geminiLimiter = rateLimit({
  windowMs: 60 * 1000,        // 1 minute
  max: 10,                    // 10 requests per minute
  message: 'Too many API calls, please wait'
});

app.post('/api/generate/terraform', 
  geminiLimiter,
  async (req, res) => {
    // Handle request
  }
);
```

#### 3. Streaming Large Responses

```typescript
// Stream Terraform code generation
app.post('/api/generate/terraform/stream', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  
  const stream = await generateTerraformStream(req.body);
  stream.pipe(res);
});
```

---

## Security & Compliance

### API Key Management

**Never commit API keys to Git:**

```bash
# Add to .gitignore
echo ".env.local" >> .gitignore
echo ".env.*.local" >> .gitignore
```

**Use environment variables in CI/CD:**

```yaml
# GitHub Actions Example
- name: Deploy with API Key
  env:
    GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
  run: npm run build
```

### Data Security

#### PII Masking Implementation

```typescript
// src/utils/pieMasking.ts
export const PII_MASKING_RULES: Record<string, (value: string) => string> = {
  ssn: (value: string) => `XXX-XX-${value.slice(-4)}`,
  email: (value: string) => {
    const [local] = value.split('@');
    return `${local.slice(0, 2)}****@****`;
  },
  creditCard: (value: string) => `XXXX-XXXX-XXXX-${value.slice(-4)}`,
  phoneNumber: (value: string) => `(XXX) XXX-${value.slice(-4)}`,
};

export function maskSensitiveData(
  data: Record<string, any>,
  sensitivePaths: string[]
): Record<string, any> {
  return sensitivePaths.reduce((masked, path) => {
    const [key] = path.split('.');
    if (masked[key]) {
      masked[key] = PII_MASKING_RULES[key]?.(masked[key]) || masked[key];
    }
    return masked;
  }, { ...data });
}
```

### Input Validation

```typescript
// src/utils/validators.ts
import { z } from 'zod';

export const PipelineConfigSchema = z.object({
  preset: z.enum(['ecommerce', 'iot_telemetry', 'healthcare_pii', 'web_clickstream']),
  lambdaTimeout: z.number().min(3).max(60),
  bucketType: z.enum(['standard', 'encrypted']),
  glueWorkers: z.number().min(2).max(10),
  glueCompression: z.enum(['snappy', 'gzip', 'none']),
  targetFormat: z.enum(['parquet', 'iceberg', 'json']),
  enablePIIMasking: z.boolean(),
  enablePartitioning: z.boolean(),
  partitionKeys: z.array(z.string()).max(5),
});

// Usage
export function validatePipelineConfig(config: unknown) {
  return PipelineConfigSchema.parse(config);
}
```

### HIPAA Compliance (Healthcare Preset)

```typescript
// Mandatory for healthcare_pii preset
const HIPAA_REQUIREMENTS = {
  encryption: 'SSE-KMS',           // Must use customer-managed keys
  auditLogging: true,              // CloudTrail enabled
  accessControl: true,             // IAM policies
  dataRetention: 6,                // Years
  piIMasking: true,                // Non-negotiable
  encryptionInTransit: 'TLS1.2+',
  keyRotation: 90,                 // Days
};

export function validateHIPAACompliance(config: PipelineConfig): ComplianceReport {
  if (config.preset !== 'healthcare_pii') {
    return { compliant: true };
  }
  
  return {
    compliant: 
      config.bucketType === 'encrypted' && 
      config.enablePIIMasking,
    violations: [
      !config.bucketType === 'encrypted' ? 'Encryption not enabled' : null,
      !config.enablePIIMasking ? 'PII masking not enabled' : null,
    ].filter(Boolean),
    recommendations: [
      'Enable CloudTrail for audit logging',
      'Configure VPC endpoints for S3/Glue',
      'Implement field-level encryption',
      'Set up multi-factor authentication'
    ]
  };
}
```

### CSRF & XSS Protection

```typescript
// src/middleware/security.ts
import csrf from 'csurf';
import helmet from 'helmet';
import xss from 'xss-clean';

app.use(helmet());
app.use(csrf());
app.use(xss());

// Content Security Policy
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "https:", "data:"],
      connectSrc: ["'self'", "https://api.anthropic.com"]
    }
  })
);
```

---

## Deployment Strategies

### 1. Docker Containerization

**Dockerfile:**

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Frontend build
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY server.ts .

ENV NODE_ENV=production
ENV GEMINI_API_KEY=${GEMINI_API_KEY}

EXPOSE 3000
CMD ["node", "dist/server.cjs"]
```

**Build and Run:**

```bash
docker build -t dataflow-aws:latest .
docker run -p 3000:3000 \
  -e GEMINI_API_KEY=your-key \
  dataflow-aws:latest
```

### 2. AWS Elastic Beanstalk Deployment

**Create `.ebextensions/nodecommand.config`:**

```yaml
option_settings:
  aws:elasticbeanstalk:container:nodejs:
    NodeCommand: "node dist/server.cjs"
  aws:elasticbeanstalk:application:environment:
    GEMINI_API_KEY: "{{ PARAMETER_STORE }}/gemini-key"
  aws:autoscaling:asg:
    MinSize: 1
    MaxSize: 10
  aws:elasticbeanstalk:cloudwatch:logs:
    StreamLogs: true
    DeleteOnTerminate: false
```

**Deploy:**

```bash
eb init -p node.js-20 dataflow-aws
eb create dataflow-prod
eb deploy
```

### 3. Kubernetes Deployment

**k8s/deployment.yaml:**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: dataflow-aws
spec:
  replicas: 3
  selector:
    matchLabels:
      app: dataflow-aws
  template:
    metadata:
      labels:
        app: dataflow-aws
    spec:
      containers:
      - name: dataflow
        image: your-registry/dataflow-aws:latest
        ports:
        - containerPort: 3000
        env:
        - name: GEMINI_API_KEY
          valueFrom:
            secretKeyRef:
              name: gemini-secret
              key: api-key
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
```

**Deploy:**

```bash
kubectl create secret generic gemini-secret \
  --from-literal=api-key=$GEMINI_API_KEY

kubectl apply -f k8s/deployment.yaml
```

### 4. Vercel Deployment (Frontend Only)

**vercel.json:**

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "env": {
    "GEMINI_API_KEY": "@gemini_api_key"
  },
  "redirects": [
    {
      "source": "/api/:path*",
      "destination": "https://api.dataflow.example.com/:path*"
    }
  ]
}
```

---

## Troubleshooting & Debugging

### Common Issues

#### 1. Gemini API Key Errors

```
Error: API Key not found or invalid
```

**Solutions:**

```bash
# Verify environment variable is set
echo $GEMINI_API_KEY

# Check .env.local exists and has valid key
cat .env.local

# Restart dev server after env change
npm run dev
```

#### 2. TypeScript Compilation Errors

```bash
# Run type checker
npm run lint

# Fix common errors
npm run lint -- --fix

# View detailed error messages
tsc --noEmit --pretty false
```

#### 3. Memory Issues During Build

```bash
# Increase Node memory limit
NODE_OPTIONS=--max-old-space-size=4096 npm run build

# For large projects, use esbuild directly
esbuild src/main.tsx --bundle --minify --sourcemap
```

### Performance Debugging

```typescript
// Add performance monitoring
console.time('api-call');
const response = await fetch('/api/generate/terraform');
console.timeEnd('api-call');

// Browser DevTools
// 1. Open Chrome DevTools (F12)
// 2. Go to Network tab
// 3. Monitor API calls and response times
// 4. Check Performance tab for React profiling
```

---

## Contributing Guidelines

### Development Setup

```bash
# Fork and clone your fork
git clone https://github.com/your-username/dataflow-aws.git
cd dataflow-aws

# Add upstream remote
git remote add upstream https://github.com/original/dataflow-aws.git

# Create feature branch
git checkout -b feature/my-feature
```

### Code Standards

**TypeScript:**
- Strict mode enabled
- Explicit return types
- No `any` types without justification
- Comprehensive error handling

**React Components:**
- Functional components with hooks
- Memoization for expensive renders
- Clear prop interfaces
- JSDoc comments for public APIs

**Styling:**
- Tailwind CSS utility classes
- CSS variables for theme
- No inline styles
- Mobile-first approach

### Testing

```bash
# Add Jest/Vitest tests
npm install --save-dev vitest @testing-library/react

# Run tests
npm run test

# With coverage
npm run test:coverage
```

### Commit Messages

Follow conventional commits:

```
feat: add Terraform generation
fix: correct PII masking regex
docs: update deployment guide
test: add pipeline validation tests
refactor: simplify state management
```

### Pull Request Process

1. Update documentation
2. Add/update tests
3. Ensure all tests pass
4. Request review from maintainers
5. Address feedback
6. Squash commits and merge

---

## License

This project is licensed under the Apache License 2.0.

```
SPDX-License-Identifier: Apache-2.0

See LICENSE file for full text.
```

---

## Support & Resources

### Documentation
- [Google Generative AI SDK](https://ai.google.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [React 19 Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [AWS Terraform Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)

### Community
- GitHub Issues: [Report bugs](https://github.com/your-repo/issues)
- Discussions: [Ask questions](https://github.com/your-repo/discussions)
- Twitter: [@DataFlowAWS](https://twitter.com)

### Getting Help

```
Email: support@dataflowaws.io
Slack: dataflowaws.slack.com
Office Hours: Tuesdays 10am-12pm PST
```

---

<div align="center">

**Made with ❤️ by the DataFlow Team**

[⬆ back to top](#dataflow-aws---advanced-readme)

</div>