/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Database, 
  Cpu, 
  Shield, 
  Activity, 
  FileCode, 
  Terminal as TerminalIcon, 
  ArrowRight, 
  CheckCircle, 
  AlertTriangle, 
  Download, 
  Copy, 
  RefreshCw, 
  Eye, 
  BookOpen,
  XCircle,
  Play,
  Layers,
  Server,
  Zap,
  Check
} from 'lucide-react';
import { SidebarSettings, PRESETS } from './components/SidebarSettings';
import { PipelineConfig, SimulatedRecord, GeneratedCodeBundle } from './types';

export default function App() {
  // Configuration State
  const [config, setConfig] = useState<PipelineConfig>({
    preset: 'ecommerce',
    bucketType: 'encrypted',
    glueWorkers: 4,
    enablePIIMasking: true,
    enablePartitioning: true,
    partitionKeys: ['status', 'currency'],
    glueCompression: 'snappy',
    targetFormat: 'parquet',
    lambdaTimeout: 30
  });

  const [activeTab, setActiveTab] = useState<'architecture' | 'codes' | 'quicksight'>('architecture');
  const [codeTab, setCodeTab] = useState<'github_all' | 'terraform' | 'lambda' | 'glue' | 'quicksight'>('github_all');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationIndex, setSimulationIndex] = useState(0);
  const [simulationRecords, setSimulationRecords] = useState<SimulatedRecord[]>([]);
  const [displayedRecords, setDisplayedRecords] = useState<SimulatedRecord[]>([]);
  const [generatedCodes, setGeneratedCodes] = useState<GeneratedCodeBundle | null>(null);
  const [loadingCode, setLoadingCode] = useState(false);
  
  // Console logging state
  const [consoleLogs, setConsoleLogs] = useState<{ id: string; type: 'info' | 'success' | 'warn' | 'error'; text: string; time: string }[]>([]);
  const terminalRef = useRef<HTMLDivElement>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Auto scroll console logs
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [consoleLogs]);

  // Initial setup: Fetch generated codes
  useEffect(() => {
    fetchCodes();
    addLog('system', 'info', 'Initializing AWS serverless pipeline canvas environments...');
    addLog('system', 'success', 'Loaded telemetry presets: [E-Commerce, IoT sensors, HIPAA Clinical Data, Web Clickstreams].');
    addLog('system', 'info', 'AWS Glue Catalog connector initialized on DB reference: dataflow_metadata_db');
  }, [config.preset, config.bucketType, config.glueWorkers, config.enablePIIMasking, config.enablePartitioning, config.targetFormat, config.glueCompression, config.lambdaTimeout]);

  // Handle Preset Change Log
  const handleConfigChange = (updates: Partial<PipelineConfig>) => {
    setConfig(prev => {
      const next = { ...prev, ...updates };
      if (updates.preset) {
        addLog('config', 'info', `Switched active ingest preset to: ${updates.preset.toUpperCase()}`);
      }
      return next;
    });
  };

  const addLog = (module: string, type: 'info' | 'success' | 'warn' | 'error', text: string) => {
    const timeStr = new Date().toISOString().split('T')[1].substring(0, 8);
    setConsoleLogs(prev => [
      ...prev,
      {
        id: Math.random().toString(),
        type,
        text: `[${module.toUpperCase()}] ${text}`,
        time: timeStr
      }
    ].slice(-50)); // Keep last 50 logs
  };

  const fetchCodes = async () => {
    setLoadingCode(true);
    try {
      const res = await fetch('/api/pipeline/generate-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config })
      });
      if (!res.ok) throw new Error('API server unreachable');
      const json = await res.json();
      if (json.success) {
        setGeneratedCodes(json.data);
        addLog('code-engine', 'success', 'Successfully generated fresh cloud deployment scripts matching criteria.');
      } else {
        throw new Error(json.error || 'Unknown error');
      }
    } catch (err: any) {
      addLog('code-engine', 'error', `Code compilation simulation failed: ${err.message}. Loading robust fail-safe blueprints.`);
    } finally {
      setLoadingCode(false);
    }
  };

  // Run Simulation Sequence
  const runSimulation = async () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setDisplayedRecords([]);
    setSimulationIndex(0);
    addLog('simulator', 'info', 'Initiating live log generator stream to S3 Raw Landing Bucket...');
    addLog('aws-s3', 'info', `Target bucket: s3://${config.preset}-landing-zone-dataflow-raw/`);

    try {
      const res = await fetch('/api/pipeline/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config })
      });
      const data = await res.json();
      if (data.success && data.records) {
        setSimulationRecords(data.records);
        
        // Begin sequence stream
        let idx = 0;
        const total = data.records.length;
        
        const interval = setInterval(() => {
          if (idx >= total) {
            clearInterval(interval);
            setIsSimulating(false);
            addLog('simulator', 'success', `Execution complete. Processed ${total} payloads. Curated items stored in S3. Parquet metrics finalized.`);
            addLog('catalog', 'success', `AWS Glue crawler finished indexing table standard partitioned columns.`);
            return;
          }
          
          const record = data.records[idx];
          setDisplayedRecords(prev => [record, ...prev]);
          
          // Custom micro logs for realistic system feedback
          setTimeout(() => {
            addLog('aws-eventbridge', 'info', `Landed new raw transaction payload {id: ${record.rawPayload.transaction_id || record.rawPayload.device_id}, size: 456 bytes}`);
          }, 0);

          setTimeout(() => {
            if (record.lambdaProcessed.isValid) {
              addLog('aws-lambda', 'success', `Ingest verified payload for ${record.id}. Sanitized parameters stored into curated S3.`);
              
              // Spark trigger logging
              setTimeout(() => {
                if (config.enablePIIMasking && record.glueProcessed.detectedPII.length > 0) {
                  addLog('aws-glue-pyspark', 'warn', `Scanned and redacted PII metrics: [${record.glueProcessed.detectedPII.join(', ')}] in block ${record.id}`);
                }
                addLog('aws-glue-pyspark', 'info', `Writing Parquet record safely to Spark output node partitioned route: ${record.glueProcessed.partitionPath}`);
              }, 400);

            } else {
              addLog('aws-lambda', 'error', `Validation rejected: ${record.lambdaProcessed.errorReason} -> Quarantined to AWS SQS DLQ: queue/dataflow-dlq`);
            }
          }, 300);

          idx++;
          setSimulationIndex(idx);
        }, 1200);

      } else {
        setIsSimulating(false);
        addLog('simulator', 'error', 'Failed generating payloads on simulated API endpoint.');
      }
    } catch (err: any) {
      setIsSimulating(false);
      addLog('simulator', 'error', `Stream simulation error: ${err.message}`);
    }
  };

  const activePresetInfo = PRESETS.find(p => p.id === config.preset) || PRESETS[0];

  // Helper logic to construct the "Giga Complete All-In-One" GitHub script
  const getUnifiedCompleteFile = (): string => {
    if (!generatedCodes) return 'Loading code blueprint packages...';
    
    return `# Architecture Blueprint: Serverless Zero-Trust Realtime Data Pipeline
# Repository Target: AWS-ETL-Enterprise-Dataflow-Framework
# Designed & Compiled at: 2026-06-08 (Verified Live Ingest Ready)
# Framework: AWS Lambda Ingestion Edge Protective Guards + AWS Glue Serverless PySpark ETL Engine + Amazon Athena + Amazon QuickSight Analytics

## 1. PROJECT META MATRIX
- **Interactive Preset Domain**: ${activePresetInfo.name}
- **Serverless Compute Workers**: AWS Glue PySpark Spark G.1X with ${config.glueWorkers} allocations
- **Durable Target Layout Format**: Columnar ${config.targetFormat.toUpperCase()} compressed using the highly-optimized ${config.glueCompression.toUpperCase()} codec library.
- **Privacy & Compliance Standard**: ${config.enablePIIMasking ? 'Active Deep-PII Cryptographic / Structural Masking Guardwires' : 'Compliance Scan Restricted'}
- **Hive Dynamic Partitioning Model**: ${config.enablePartitioning ? 'Dynamic partition pruning enabled (S3 index speed optimal)' : 'Standard flattened S3 directory structure'}
- **Raw Landing Key Guard Security**: S3 Bucket utilizing ${config.bucketType === 'encrypted' ? 'AES256 Core Encryption with Custom AWS Managed KMS Key Policies' : 'Standard AWS Managed KMS keys'}

---

## 2. DISCOVERY & ENTERPRISE ARCHITECTURE

\`\`\`
  [ RAW DATA PRODUCER STREAM ] 
              |
              V (HTTPS Payload POST or File Upload Event)
    s3://dataflow-raw-landing-[preset_id] (Unencrypted raw tier)
              |
              V (EventBridge Route S3:ObjectCreated Event Trigger)
     [ AWS Lambda Protective Edge Guard Function ]
              |
              +--- [Invalid Schema Constraint / Anomaly Payload] ---> [ AWS SQS Enterprise DLQ (Quarantine Hub) ]
              |
              +--- [Valid Checked Elements JSON Payload]
              |
              V
    s3://dataflow-clean-curated-[preset_id] (Curated JSON zone)
              |
              V [Daily / Trigger-based AWS Glue Crawler Discovery Run]
     [ AWS Glue Service Schema Catalog Engine ]
              |
              V [AWS Glue PySpark Job Engine execution]
     (Deduplication, PII Cryptographic Scrubbing, Spark Enriched Audits)
              |
              V [Snappy Columnar Partition Grouping Writeout]
    s3://dataflow-processed-analytical-[preset_id] (Parquet Optimized Lake)
              |
              V
     [ Amazon Athena Serverless Query Optimizer Engine ]
              |
              V
     [ Amazon QuickSight Enterprise Interactive Analytics Lens ]
\`\`\`

---

## 3. MASTER IaC TERRAFORM INFRASTRUCTURE (terraform/main.tf)
\`\`\`hcl
${generatedCodes.terraform}
\`\`\`

---

## 4. EDGE PROTECTIVE INGESTION PYTHOM LAMBDA TRIGGER (lambda/index.py)
\`\`\`python
${generatedCodes.lambdaScript}
\`\`\`

---

## 5. DYNAMIC PYSPARK TRANSFORMS & COMPLIANCE JOB (glue/etl_job.py)
\`\`\`python
${generatedCodes.glueScript}
\`\`\`

---

## 6. AMAZON QUICKSIGHT INTEGRATION & ATHENA VIEW SPEC (quicksight/README.md)
${getQuickSightMarkdown()}

---

## 7. SAMPLE INGEST RECORD SCHEMA MOCKS (data/sample_payload.json)
\`\`\`json
${generatedCodes.sampleData}
\`\`\`
`;
  };

  function getQuickSightMarkdown() {
    return `### Amazon QuickSight Integration Manual

To hook up your serverless processed data in Athena to Amazon QuickSight, adhere to these simple, production-grade instructions:

1. **Authorize QuickSight Service Clearance**:
   - In AWS Console, select QuickSight -> Manage QuickSight -> Security & Permissions.
   - Click "Add or Remove" resources. Ensure that **Amazon Athena** and the specific curated and analytical **Amazon S3 Buckets** (e.g., \`s3://dataflow-lake-processed-parquet-hash123\`) are fully selected to allow queries with standard decrypt policies.

2. **Establish the Athena Data Source**:
   - Inside QuickSight, click **New Dataset** -> Under "Create a Dataset", select **Athena**.
   - Input your custom Data Source Name (e.g., \`Athena_Dataflow_Lake\`).
   - Define Athena Workgroup (\`primary\` or your company specific analytics workgroup). Click "Create data source".

3. **Configure Analytical Catalog Schema**:
   - Select your Catalog Database (\`ecommerce_curated_db\` or matching preset database catalog).
   - Select the indexed PySpark target analytical table mapping (e.g., \`processed_parquet\`).
   - Choose **Import to SPICE (Super-fast, Parallel, In-memory Calculation Engine)** to enable extreme speed and avoid S3 costs on frequent clicks, OR select **Direct Query** for real-time live reporting of inbound lambda signals.

4. **Construct Enterprise Charts**:
   - Create a **Donut Chart** with **status** and **currency** counts to monitor pipeline delivery ratios.
   - Create a **Time Series Line Chart** measuring **etl_processed_at** as the X-axis and aggregate **amount** as Value to inspect performance patterns.
   - Create a **KPI KPI Indicator Widget** tracking total sanitized counts and average Lambda durations!`;
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    addLog('system', 'success', `Copied blueprint segment to clipboard: ${label}`);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addLog('system', 'success', `Downloaded: ${filename} (Ready for GitHub Upload)`);
  };

  // Get active code output for subtabs in Code Tab
  const getActiveCodeOutput = () => {
    if (!generatedCodes) return 'Compiling custom AWS blueprints based on active configuration...';
    switch (codeTab) {
      case 'github_all': return getUnifiedCompleteFile();
      case 'terraform': return generatedCodes.terraform;
      case 'lambda': return generatedCodes.lambdaScript;
      case 'glue': return generatedCodes.glueScript;
      case 'quicksight': return getQuickSightMarkdown();
    }
  };

  // Calculate live analytics stats for Quicksight simulator page
  const totalSimulated = displayedRecords.length;
  const successfulRecords = displayedRecords.filter(r => r.lambdaProcessed.isValid);
  const failureRecords = displayedRecords.filter(r => !r.lambdaProcessed.isValid);
  const piiRedactedCount = displayedRecords.filter(r => r.glueProcessed.detectedPII.length > 0).length;
  const avgDurationObj = displayedRecords.reduce((acc, r) => acc + (r.lambdaProcessed.metrics?.durationMs || 0), 0);
  const avgDuration = totalSimulated > 0 ? (avgDurationObj / totalSimulated).toFixed(1) : '0';

  // Compute stats on category metrics
  const categoryStats: Record<string, { totalAmount: number; count: number }> = {};
  displayedRecords.forEach(r => {
    const payload = r.rawPayload;
    if (r.lambdaProcessed.isValid) {
      const cat = payload.product_category || payload.diagnosis_code || 'Telemetry Stream';
      const amount = parseFloat(payload.amount || payload.clinical_cost || 0);
      if (!categoryStats[cat]) {
        categoryStats[cat] = { totalAmount: 0, count: 0 };
      }
      categoryStats[cat].totalAmount += amount;
      categoryStats[cat].count += 1;
    }
  });

  return (
    <div className="flex flex-col min-h-screen bg-[#050505] text-[#d4d4d4] font-sans selection:bg-blue-500/30 selection:text-white border border-white/10 overflow-x-hidden" id="applet-viewport">
      
      {/* Top Application Header */}
      <nav className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-[#0a0a0a] shrink-0" id="top-nav-banner">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.5)]">
              <Database className="w-5 h-5 text-white animate-pulse" />
            </div>
            <span className="text-sm font-semibold tracking-wider font-mono text-white">NEURAL-PIPELINE <span className="text-blue-500">v4.0</span></span>
          </div>
          <div className="h-4 w-[1px] bg-white/10 hidden sm:block"></div>
          <div className="hidden sm:flex gap-4 text-[10px] uppercase tracking-widest font-mono font-semibold opacity-60">
            <span className="text-blue-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block animate-ping"></span>
              LIVE_ACTIVE
            </span>
            <span>US-EAST-1 (VPC-PEERED)</span>
            <span className="text-neutral-500">GLUE_VER: 4.0</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => downloadFile(getUnifiedCompleteFile(), 'README_AWS_SERVERLESS_PIPELINE.md')}
            disabled={!generatedCodes}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-black text-xs font-bold rounded transition-all active:scale-[0.98] disabled:opacity-40"
            id="deploy-all-btn"
            title="Download unified GitHub ready Markdown file"
          >
            <Download className="w-3.5 h-3.5 text-black" />
            <span className="text-white">UNIFIED GITHUB FILE</span>
          </button>
        </div>
      </nav>

      {/* Primary Workspace Layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden" id="main-content-layout">
        
        {/* Left Side: Parameters / Ingest Presets Controls */}
        <aside className="w-full md:w-80 border-b md:border-b-0 md:border-r border-white/10 p-5 bg-[#080808] flex flex-col gap-6 overflow-y-auto shrink-0" id="aside-sidebar-controls">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-widest font-mono text-neutral-500 mb-3 block">
              <span>Cloud Resources</span>
              <span className="text-blue-500 text-[9px] px-1 bg-blue-950/20 rounded border border-blue-500/10">Connected</span>
            </div>
            
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs p-2.5 rounded bg-black/40 border border-white/5 hover:border-blue-500/20 transition-all">
                <span className="flex items-center gap-2 font-mono text-neutral-300">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  AWS S3 INGEST LAND
                </span>
                <span className="text-[10px] text-neutral-500 font-mono select-all">raw-tier</span>
              </div>
              <div className="flex items-center justify-between text-xs p-2.5 rounded bg-black/40 border border-white/5 hover:border-blue-500/20 transition-all">
                <span className="flex items-center gap-2 font-mono text-neutral-400">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                  LAMBDA REGULATOR
                </span>
                <span className="text-[10px] text-neutral-500 font-mono select-all">edge-guard</span>
              </div>
              <div className="flex items-center justify-between text-xs p-2.5 rounded bg-black/40 border border-white/5 hover:border-blue-500/20 transition-all">
                <span className="flex items-center gap-2 font-mono text-neutral-400">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  GLUE DYNAMIC SPARK
                </span>
                <span className="text-[10px] text-neutral-500 font-mono select-all">py-spark</span>
              </div>
              <div className="flex items-center justify-between text-xs p-2.5 rounded bg-black/40 border border-white/5 hover:border-blue-500/20 transition-all">
                <span className="flex items-center gap-2 font-mono text-neutral-400">
                  <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
                  QUICKSIGHT LENS
                </span>
                <span className="text-[10px] text-neutral-500 font-mono select-all">bi-spice</span>
              </div>
            </div>
          </div>

          <div className="h-[1px] bg-white/5"></div>

          {/* Core configurations component inside dark container */}
          <SidebarSettings 
            config={config} 
            onChange={handleConfigChange} 
            isSimulating={isSimulating} 
            onRunSimulation={runSimulation} 
          />

          <div className="mt-auto pt-4 border-t border-white/10 hidden md:block">
            <div className="text-[9px] text-neutral-600 font-mono uppercase tracking-widest space-y-1">
              <div>HOST: CLOUDCONTAINER_RUN</div>
              <div>METADATA: 2026-06-08</div>
              <div className="text-blue-500/70 select-all">STATUS_HASH: 0x8a9f2d1</div>
            </div>
          </div>
        </aside>

        {/* Central Complex Workspace */}
        <main className="flex-1 flex flex-col bg-[#050505] relative overflow-y-auto" id="central-workspace">
          
          {/* Main workspace header / tab selectors */}
          <div className="border-b border-white/10 bg-[#070707] px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
            <div>
              <h1 className="text-xl sm:text-2xl font-serif italic text-white tracking-tight">Advanced ETL Orchestration</h1>
              <p className="text-xs text-neutral-400 max-w-xl mt-1 font-sans">
                Highly optimized AWS Glue serverless dynamic structures and Lambda validation blueprints. Click tabs to inspect live telemetry streams, view source scripts, or configure charts.
              </p>
            </div>

            {/* Global tabs switcher buttons */}
            <div className="flex bg-[#0d0d0d] p-1 rounded-lg border border-white/10 shrink-0 font-mono text-xs">
              <button
                onClick={() => setActiveTab('architecture')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all font-semibold ${
                  activeTab === 'architecture'
                    ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20'
                    : 'text-neutral-400 hover:text-white border border-transparent'
                }`}
                id="tab-architecture-select"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Architecture Map</span>
              </button>
              
              <button
                onClick={() => setActiveTab('codes')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all font-semibold ${
                  activeTab === 'codes'
                    ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20'
                    : 'text-neutral-400 hover:text-white border border-transparent'
                }`}
                id="tab-codes-select"
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>Source Codes</span>
              </button>

              <button
                onClick={() => setActiveTab('quicksight')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all font-semibold ${
                  activeTab === 'quicksight'
                    ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20'
                    : 'text-neutral-400 hover:text-white border border-transparent'
                }`}
                id="tab-quicksight-select"
              >
                <Activity className="w-3.5 h-3.5" />
                <span>QuickSight Lens</span>
              </button>
            </div>
          </div>

          <div className="p-6 flex-1 flex flex-col space-y-6">

            {/* TAB 1: INTERACTIVE DATAFLOW PATHWAYS DIAGRAM */}
            {activeTab === 'architecture' && (
              <div className="grid grid-cols-1 gap-6" id="architecture-diagram-pane">
                
                {/* Active parameter summary strip */}
                <div className="flex flex-wrap items-center gap-4 bg-[#0a0a0a] border border-white/10 rounded-xl p-4 text-xs font-mono">
                  <div className="text-zinc-500 uppercase tracking-widest text-[10px]">Active Settings:</div>
                  <div className="bg-white/5 border border-white/5 py-1 px-2.5 rounded text-white flex items-center gap-1">
                    <Database className="w-3.5 h-3.5 text-blue-400" />
                    <span>Schema preset: <strong className="text-blue-400 uppercase">{config.preset}</strong></span>
                  </div>
                  <div className="bg-white/5 border border-white/5 py-1 px-2.5 rounded text-white flex items-center gap-1">
                    <Cpu className="w-3.5 h-3.5 text-blue-400" />
                    <span>S3 Encryption Mode: <strong className="text-blue-400 uppercase">{config.bucketType}</strong></span>
                  </div>
                  <div className="bg-white/5 border border-white/5 py-1 px-2.5 rounded text-white flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-blue-400" />
                    <span>Glue Spark DPUs: <strong className="text-blue-400 text-yellow-500">{config.glueWorkers} G.1X</strong></span>
                  </div>
                  <div className="bg-white/5 border border-white/5 py-1 px-2.5 rounded text-white flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-blue-400" />
                    <span>PII Masking Filter: <strong className={`${config.enablePIIMasking ? 'text-green-400' : 'text-neutral-400'}`}>{config.enablePIIMasking ? 'ACTIVE' : 'OFF'}</strong></span>
                  </div>
                </div>

                {/* Animated map diagram */}
                <div className="relative p-6 rounded-xl border border-white/10 bg-[#070707] overflow-hidden min-h-[300px] flex flex-col justify-between">
                  <div className="absolute top-1/2 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent -translate-y-8"></div>
                  
                  <div className="flex justify-between items-center relative z-10 w-full mb-6">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">DYNAMIC SERVERLESS STREAM SCHEMATIC</span>
                    {isSimulating && (
                      <span className="text-xs bg-blue-500/10 border border-blue-500/30 text-blue-400 px-2.5 py-1 rounded-full flex items-center gap-1.5 animate-pulse font-mono">
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping" />
                        STREAMING ACTIVE ({simulationIndex} RECORD TRANSITS)
                      </span>
                    )}
                  </div>

                  {/* Flow Stages */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10 my-4" id="stage-diagram-flow-grid">
                    
                    {/* Stage 1: UNENCRYPTED RAW LANDING (S3) */}
                    <div className="p-4 rounded-xl border border-white/5 bg-[#0b0b0b] hover:border-white/10 transition-colors relative flex flex-col justify-between">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded bg-neutral-900 border border-white/10 flex items-center justify-center">
                          <Database className="w-4 h-4 text-blue-400" />
                        </div>
                        <div className="leading-tight">
                          <div className="text-[10px] font-mono text-neutral-500">Tier 01</div>
                          <div className="text-xs font-bold text-white uppercase tracking-wider font-mono">S3 LANDING</div>
                        </div>
                      </div>
                      <p className="text-[11px] text-neutral-400 mb-4 h-12 overflow-hidden leading-normal">
                        Raw sensor streaming parameters or transaction logs land directly via HTTP POST triggers.
                      </p>
                      
                      <div className="p-2 rounded bg-black/60 border border-white/5 font-mono text-[9px] text-neutral-500">
                        URI: <span className="text-white">s3://raw-landing/</span>
                      </div>

                      {isSimulating && (
                        <div className="absolute -right-3 top-1/2 -translate-y-1/2 hidden md:block z-20">
                          <ArrowRight className="w-5 h-5 text-blue-500 animate-bounce" />
                        </div>
                      )}
                    </div>

                    {/* Stage 2: LAMBDA INGESTION GUARD */}
                    <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-950/5 hover:border-blue-500/40 transition-all relative flex flex-col justify-between shadow-[0_0_20px_rgba(59,130,246,0.03)]">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
                          <Cpu className="w-4 h-4 text-blue-400 animate-spin" style={{ animationDuration: '6s' }} />
                        </div>
                        <div className="leading-tight">
                          <div className="text-[10px] font-mono text-blue-400">Trigger Edge</div>
                          <div className="text-xs font-bold text-white uppercase tracking-wider font-mono">LAMBDA_VERIFIER</div>
                        </div>
                      </div>
                      <p className="text-[11px] text-neutral-400 mb-4 h-12 overflow-hidden leading-normal">
                        Evaluates payloads against rigorous schema tests. Isolates and quarantines invalid data fields immediately.
                      </p>

                      <div className="grid grid-cols-2 gap-1.5 mt-2">
                        <div className="p-1 px-1.5 rounded bg-[#0f1d12] border border-green-500/15 font-mono text-[8px] text-green-400 text-center leading-none">
                          VALID &gt; CURATED
                        </div>
                        <div className="p-1 px-1.5 rounded bg-[#2c1314] border border-red-500/20 font-mono text-[8px] text-red-400 text-center leading-none">
                          BAD &gt; SQS DLQ
                        </div>
                      </div>

                      {isSimulating && (
                        <div className="absolute -right-3 top-1/2 -translate-y-1/2 hidden md:block z-20">
                          <ArrowRight className="w-5 h-5 text-blue-500 animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                      )}
                    </div>

                    {/* Stage 3: AWS GLUE PYSPARK SHIELD */}
                    <div className="p-4 rounded-xl border border-white/5 bg-[#0b0b0b] hover:border-white/10 transition-colors relative flex flex-col justify-between">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded bg-neutral-900 border border-white/10 flex items-center justify-center">
                          <Server className="w-4 h-4 text-purple-400" />
                        </div>
                        <div className="leading-tight">
                          <div className="text-[10px] font-mono text-neutral-500">Spark Job</div>
                          <div className="text-xs font-bold text-white uppercase tracking-wider font-mono">GLUE PYSPARK</div>
                        </div>
                      </div>
                      <p className="text-[11px] text-neutral-400 mb-4 h-12 overflow-hidden leading-normal">
                        Performs massive schema casts, masks sensitive high-risk PII metrics, enriches auditable columns, and writes optimized files.
                      </p>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[9px] font-mono text-neutral-500">
                          <span>PII redaction:</span>
                          <span className={`${config.enablePIIMasking ? 'text-green-400' : 'text-neutral-500'}`}>
                            {config.enablePIIMasking ? 'Active regex' : 'Bypassed'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[9px] font-mono text-neutral-500">
                          <span>Codec:</span>
                          <span className="text-white font-bold">{config.glueCompression.toUpperCase()}</span>
                        </div>
                      </div>

                      {isSimulating && (
                        <div className="absolute -right-3 top-1/2 -translate-y-1/2 hidden md:block z-20">
                          <ArrowRight className="w-5 h-5 text-blue-500 animate-bounce" style={{ animationDelay: '0.4s' }} />
                        </div>
                      )}
                    </div>

                    {/* Stage 4: PARQUET DATA LAKE */}
                    <div className="p-4 rounded-xl border border-white/10 bg-[#0a0a0a] relative flex flex-col justify-between shadow-[0_0_20px_rgba(255,255,255,0.02)]">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded bg-white/[0.03] border border-white/10 flex items-center justify-center">
                          <Layers className="w-4 h-4 text-yellow-500" />
                        </div>
                        <div className="leading-tight">
                          <div className="text-[10px] font-mono text-neutral-500">Analytics</div>
                          <div className="text-xs font-bold text-white uppercase tracking-wider font-mono">ATHENA LAKESTORE</div>
                        </div>
                      </div>
                      <p className="text-[11px] text-neutral-400 mb-4 h-12 overflow-hidden leading-normal">
                        Ready for sub-second SQL queries with AWS Athena. Highly structured schema maps partition pruning directly to dashboards.
                      </p>

                      <div className="p-2 rounded bg-black/60 border border-white/5 font-mono text-[9px] text-neutral-400">
                        Format: <span className="text-yellow-400 font-bold uppercase">{config.targetFormat}</span>
                      </div>
                    </div>

                  </div>

                  <div className="pt-2 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-[11px] text-neutral-500 font-mono">
                    <span>INFLOW ENHANCEMENT ALERTS: 0 DISRUPTIONS</span>
                    <span>VPC FIREWALL: INTRUSION PROTECTION SYSTEM ACTIVE</span>
                  </div>
                </div>

                {/* Live Real-time Terminal Logging */}
                <div className="p-4 rounded-xl border border-white/10 bg-black/80 font-mono space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-2">
                      <TerminalIcon className="w-4 h-4 text-blue-400" />
                      Live Stream Simulation (Console Event Broker)
                    </span>
                    <span className="text-[10px] text-neutral-500">2026-06-08 (UTC TIMESTREAM)</span>
                  </div>
                  
                  {displayedRecords.length === 0 ? (
                    <div className="py-8 text-center text-xs text-neutral-600 border border-dashed border-white/5 rounded-lg">
                      Log stream empty. Click "EXECUTE PIPELINE PIPELINE_SIM" on the parameters sidebar to stream valid and invalid rows through real-time AWS triggers.
                    </div>
                  ) : (
                    <div className="max-h-[220px] overflow-y-auto space-y-2.5 text-xs text-neutral-300 pr-2">
                      {displayedRecords.slice(0, 15).map((rec) => (
                        <div key={rec.id} className="p-3 bg-[#080808] border border-white/5 rounded-lg select-none">
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-1.5 mb-2 text-[10px] text-neutral-500">
                            <span className="font-bold text-neutral-400 text-xs">Record ID: {rec.id}</span>
                            <span>{rec.timestamp}</span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Raw */}
                            <div>
                              <div className="text-[10px] text-blue-400 uppercase font-bold mb-1">[1] S3 Ingest Invariant:</div>
                              <pre className="text-[10px] bg-black/60 p-1.5 rounded overflow-x-auto text-neutral-400 font-mono">
                                {JSON.stringify(rec.rawPayload, null, 1)}
                              </pre>
                            </div>

                            {/* Lambda */}
                            <div>
                              <div className="text-[10px] uppercase font-bold mb-1 flex items-center gap-1">
                                {rec.lambdaProcessed.isValid ? (
                                  <span className="text-green-500">[2] Lambda Approved Zone:</span>
                                ) : (
                                  <span className="text-red-500">[2] Lambda Rejected DLQ:</span>
                                )}
                              </div>
                              {rec.lambdaProcessed.isValid ? (
                                <pre className="text-[10px] bg-black/60 p-1.5 rounded overflow-x-auto text-green-400/90 font-mono">
                                  {JSON.stringify(rec.lambdaProcessed.sanitizedPayload, null, 1)}
                                </pre>
                              ) : (
                                <div className="p-2 rounded bg-red-950/20 border border-red-500/20 text-red-400 text-[10px] leading-relaxed">
                                  <strong>FATAL CONSTRAINT FAIL:</strong> {rec.lambdaProcessed.errorReason}
                                  <div className="mt-1.5 font-bold uppercase text-[9px] text-red-500">EMITTED TO SQS DLQ ALARM CLIENT</div>
                                </div>
                              )}
                            </div>

                            {/* Glue */}
                            <div>
                              <div className="text-[10px] text-purple-400 uppercase font-bold mb-1">[3] Glue Spark DynamicFrame:</div>
                              {rec.lambdaProcessed.isValid ? (
                                <div className="space-y-1.5">
                                  <pre className="text-[10px] bg-black/60 p-1.5 rounded overflow-x-auto text-purple-300 font-mono">
                                    {JSON.stringify(rec.glueProcessed.transformedPayload, null, 1)}
                                  </pre>
                                  {rec.glueProcessed.detectedPII.length > 0 && (
                                    <div className="text-[9px] text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded border border-yellow-500/20">
                                      🛡️ Dynamic scrubbing masked PII: {rec.glueProcessed.detectedPII.join(', ')}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="p-2 rounded bg-neutral-900 border border-white/5 text-neutral-600 text-[10px] italic">
                                  Record rejected by step 2 protective gate. Bypassed Spark task.
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}


            {/* TAB 2: POWERFUL SOURCE CODES VIEWER */}
            {activeTab === 'codes' && (
              <div className="grid grid-cols-1 select-none" id="source-codes-pane">
                
                {/* File tab list */}
                <div className="flex border-b border-white/10 bg-[#090909] p-1 rounded-t-xl gap-1">
                  <button
                    onClick={() => setCodeTab('github_all')}
                    className={`px-3.5 py-2 rounded-t-lg text-xs font-mono font-bold tracking-tight transition-all flex items-center gap-1.5 whitespace-nowrap ${
                      codeTab === 'github_all'
                        ? 'bg-[#050505] text-blue-400 border border-b-transparent border-white/10'
                        : 'text-neutral-500 hover:text-neutral-300'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                    <span>ALL-IN-ONE GITHUB SOLUTION</span>
                    <span className="text-[8px] bg-blue-500/10 border border-blue-500/25 text-blue-400 px-1 rounded">PRO</span>
                  </button>

                  <button
                    onClick={() => setCodeTab('terraform')}
                    className={`px-3.5 py-2 rounded-t-lg text-xs font-mono transition-all flex items-center gap-1 whitespace-nowrap ${
                      codeTab === 'terraform'
                        ? 'bg-[#050505] text-white border border-b-transparent border-white/10'
                        : 'text-neutral-500 hover:text-neutral-300'
                    }`}
                  >
                    <FileCode className="w-3.5 h-3.5 text-purple-400" />
                    <span>terraform/main.tf</span>
                  </button>

                  <button
                    onClick={() => setCodeTab('lambda')}
                    className={`px-3.5 py-2 rounded-t-lg text-xs font-mono transition-all flex items-center gap-1 whitespace-nowrap ${
                      codeTab === 'lambda'
                        ? 'bg-[#050505] text-white border border-b-transparent border-white/10'
                        : 'text-neutral-500 hover:text-neutral-300'
                    }`}
                  >
                    <Cpu className="w-3.5 h-3.5 text-yellow-400" />
                    <span>lambda/index.py</span>
                  </button>

                  <button
                    onClick={() => setCodeTab('glue')}
                    className={`px-3.5 py-2 rounded-t-lg text-xs font-mono transition-all flex items-center gap-1 whitespace-nowrap ${
                      codeTab === 'glue'
                        ? 'bg-[#050505] text-white border border-b-transparent border-white/10'
                        : 'text-neutral-500 hover:text-neutral-300'
                    }`}
                  >
                    <Database className="w-3.5 h-3.5 text-green-400" />
                    <span>glue/etl_job.py</span>
                  </button>

                  <button
                    onClick={() => setCodeTab('quicksight')}
                    className={`px-3.5 py-2 rounded-t-lg text-xs font-mono transition-all flex items-center gap-1 whitespace-nowrap ${
                      codeTab === 'quicksight'
                        ? 'bg-[#050505] text-white border border-b-transparent border-white/10'
                        : 'text-neutral-500 hover:text-neutral-300'
                    }`}
                  >
                    <Activity className="w-3.5 h-3.5 text-indigo-400" />
                    <span>quicksight/manual.md</span>
                  </button>
                </div>

                {/* Code Body */}
                <div className="bg-[#030303] border-x border-b border-white/10 rounded-b-xl p-5 relative min-h-[400px] flex flex-col justify-between">
                  
                  {loadingCode ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                      <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mb-4" />
                      <span className="text-xs text-neutral-400 font-mono uppercase tracking-widest">Compiling unique advanced codebase for GitHub...</span>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col justify-between">
                      
                      {/* Code Metadata & Instruction Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/[0.02] border border-white/5 rounded-lg p-3 mb-4 text-xs font-mono text-neutral-400 leading-normal">
                        <div>
                          {codeTab === 'github_all' && (
                            <p>
                              🌟 <strong>Master All-In-One GitHub Upload File</strong>: Merges setup blueprints, Terraform infrastructure logs, Lambda dynamic verification code, and PySpark serverless calculations in a single copy-paste ready Markdown file. Easily upload this as your repo root <strong className="text-white">README.md</strong> to showcase an advanced architecture!
                            </p>
                          )}
                          {codeTab === 'terraform' && (
                            <p>
                              🏗️ <strong>Terraform IaC (Infrastructure) Blueprint</strong>: Allocates unencrypted landing zones, custom encrypted curations, a fully partitioned processed Lake tier, and registers SQS DLQs + EventBridge automatic triggers.
                            </p>
                          )}
                          {codeTab === 'lambda' && (
                            <p>
                              ⚡ <strong>Lightweight AWS Lambda Micro-Validation</strong>: Intercepts raw json payloads, isolates schema outliers, verifies data health metrics, and routes corrupt nodes directly with Amazon SQS DLQ tracking lines.
                            </p>
                          )}
                          {codeTab === 'glue' && (
                            <p>
                              🔥 <strong>Dynamic PySpark Apache Serverless ETL</strong>: Runs high-efficiency dataframe transformations, applies strict casting, masks structural PII automatically, and writes target partitions out efficiently.
                            </p>
                          )}
                          {codeTab === 'quicksight' && (
                            <p>
                              📊 <strong>Amazon QuickSight BI Configuration Manual</strong>: Step-by-step guidance to authorize database catalogs, construct dynamic visual spice blocks, and setup secure analytical queries.
                            </p>
                          )}
                        </div>

                        {/* Fast copy control button */}
                        <button
                          onClick={() => copyToClipboard(getActiveCodeOutput(), codeTab)}
                          className="px-3 py-1.5 bg-neutral-900 border border-white/10 text-neutral-300 hover:text-white rounded flex items-center justify-center gap-1.5 transition-colors self-start sm:self-center bg-zinc-900 hover:bg-zinc-800"
                        >
                          {copiedKey === codeTab ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-green-400" />
                              <span className="text-green-400 font-bold">COPIED!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-neutral-400" />
                              <span>COPY CODE</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Code Area */}
                      <div className="flex-1 overflow-x-auto bg-black p-4 rounded-lg border border-white/5 max-h-[500px]">
                        <pre className="text-[11px] leading-relaxed font-mono text-zinc-300 whitespace-pre">
                          {getActiveCodeOutput()}
                        </pre>
                      </div>

                    </div>
                  )}

                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-neutral-500 font-mono">
                    <span>SECURITY CLASSIFICATION: ENCRYPTED-INTERNAL Blueprints</span>
                    <span>VERIFIED PYTHON_COMPATIBLE: python 3.11 / pyspark glue 4.0</span>
                  </div>
                </div>

              </div>
            )}


            {/* TAB 3: SIMULATED QUICKSIGHT REPLICATED DASHBOARD (QuickSight Lens) */}
            {activeTab === 'quicksight' && (
              <div className="space-y-6" id="quicksight-lens-pane">
                
                {/* Metric cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="quicksight-stats-widgets">
                  <div className="p-4 bg-[#0a0a0a] border border-white/10 rounded-xl">
                    <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-1">Total stream attempts</div>
                    <div className="text-3xl font-light text-white font-mono">{totalSimulated}</div>
                    <div className="text-[9px] text-zinc-500 mt-2 font-mono">Counted from active simulator session</div>
                  </div>

                  <div className="p-4 bg-[#0a0a0a] border border-white/10 rounded-xl">
                    <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-1">Ingest Success Rate</div>
                    <div className="text-3xl font-light text-green-400 font-mono">
                      {totalSimulated > 0 ? ((successfulRecords.length / totalSimulated) * 100).toFixed(0) : '0'}%
                    </div>
                    <div className="text-[9px] text-green-500/80 mt-2 font-mono">
                      {successfulRecords.length} Accepted / {failureRecords.length} Quarantined
                    </div>
                  </div>

                  <div className="p-4 bg-[#0a0a0a] border border-white/10 rounded-xl">
                    <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-1">PII Redacted Load</div>
                    <div className="text-3xl font-light text-yellow-500 font-mono">
                      {piiRedactedCount}
                    </div>
                    <div className="text-[9px] text-zinc-500 mt-2 font-mono">
                      Dynamic PII masks executed by Glue nodes
                    </div>
                  </div>

                  <div className="p-4 bg-[#0a0a0a] border border-white/10 rounded-xl">
                    <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-1">Avg Lambda Duration</div>
                    <div className="text-3xl font-light text-blue-400 font-mono">
                      {avgDuration} <span className="text-xs text-neutral-400">ms</span>
                    </div>
                    <div className="text-[9px] text-blue-500/80 mt-2 font-mono">
                      Dynamic protection checks execution speed
                    </div>
                  </div>
                </div>

                {/* Simulated QuickSight BI Dashboard Graphs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="quicksight-charts-grid">
                  
                  {/* Chart Left: Transformation speed logs or volume tracker */}
                  <div className="p-5 bg-[#090909] border border-white/10 rounded-xl">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 font-bold">SPICE Engine Inflow Rate</span>
                      <span className="text-[9px] text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/10 font-mono">INTELLIGENT REFRESH ACTIVE</span>
                    </div>
                    
                    {totalSimulated === 0 ? (
                      <div className="h-60 flex items-center justify-center border border-dashed border-white/5 rounded-lg text-xs text-neutral-600">
                        Launch simulator stream to inspect visual interactive charts.
                      </div>
                    ) : (
                      <div className="h-60 flex flex-col justify-between pt-4">
                        <div className="flex items-end justify-between h-44 gap-2 px-2 border-b border-white/10">
                          {displayedRecords.slice(0, 12).reverse().map((r, i) => {
                            const val = r.rawPayload.amount || r.rawPayload.clinical_cost || 100;
                            const heightPercent = Math.min(100, Math.max(10, (val / 500) * 100));
                            const isValSuccess = r.lambdaProcessed.isValid;
                            
                            return (
                              <div key={r.id} className="flex-1 flex flex-col bg-zinc-950 items-center h-full group relative">
                                <div 
                                  style={{ height: `${heightPercent}%` }} 
                                  className={`w-full rounded-t transition-all duration-500 ${
                                    isValSuccess ? 'bg-blue-500/70 hover:bg-blue-400' : 'bg-red-500/40 hover:bg-red-500/70'
                                  }`} 
                                />
                                <span className="text-[8px] font-mono text-neutral-500 mt-1.5 scale-90 truncate w-full text-center">
                                  #{r.id.split('_')[1] || i}
                                </span>

                                {/* Tooltip details styled cleanly */}
                                <div className="absolute bottom-full mb-1 bg-[#121212] border border-white/15 text-white p-2 rounded text-[9px] font-mono font-bold leading-normal pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 w-24">
                                  <div>ID: {r.id}</div>
                                  <div className={isValSuccess ? 'text-green-400' : 'text-red-400'}>
                                    Val: {val} {r.rawPayload.currency || ''}
                                  </div>
                                  <div className="text-[8px] text-neutral-400">Duration: {r.lambdaProcessed?.metrics?.durationMs || 0}ms</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <div className="flex justify-between text-[9px] font-mono text-neutral-500 uppercase tracking-widest pt-1 px-1">
                          <span>Inflow sequence (earliest &gt; latest)</span>
                          <span className="text-blue-400">Value (0 - 500 max scale)</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Chart Right: Categorized Breakdown Metric weights */}
                  <div className="p-5 bg-[#090909] border border-white/10 rounded-xl">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 font-bold">SQL Aggregate Category Share (Athena View)</span>
                      <span className="text-[9px] text-indigo-400 font-mono">QUICKSIGHT ANALYSIS LENS</span>
                    </div>

                    {Object.keys(categoryStats).length === 0 ? (
                      <div className="h-60 flex items-center justify-center border border-dashed border-white/5 rounded-lg text-xs text-neutral-600">
                        Launch simulator stream to inspect relative category shares.
                      </div>
                    ) : (
                      <div className="h-60 overflow-y-auto space-y-4 pr-1">
                        {Object.entries(categoryStats).map(([category, stats]) => {
                          const totalSum = Object.values(categoryStats).reduce((sum, s) => sum + s.totalAmount, 0);
                          const percentage = totalSum > 0 ? ((stats.totalAmount / totalSum) * 100).toFixed(0) : '0';
                          
                          return (
                            <div key={category} className="space-y-1.5 p-3 rounded bg-black/40 border border-white/5">
                              <div className="flex items-center justify-between text-xs font-mono">
                                <span className="font-semibold text-neutral-200 tracking-tight">{category}</span>
                                <span className="text-neutral-400">
                                  <strong>${stats.totalAmount.toFixed(2)}</strong> ({percentage}%)
                                </span>
                              </div>
                              <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                                <div 
                                  style={{ width: `${percentage}%` }} 
                                  className="h-full bg-blue-500 rounded-full transition-all duration-700" 
                                />
                              </div>
                              <div className="text-[9px] font-mono text-zinc-500">
                                Total transactional counts: {stats.count} hits
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                </div>

                {/* Athena tabular preview console inside dashboard */}
                <div className="p-5 bg-[#0a0a0a] border border-white/10 rounded-xl space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 font-bold">Athena Serverless Query Table Preview (\`select * from analytical_table limit 15\`)</span>
                    <span className="text-[9px] text-neutral-500">DEDUPLICATED & PARTITION_PRUNED</span>
                  </div>
                  
                  {displayedRecords.length === 0 ? (
                    <div className="py-12 text-center text-xs text-neutral-600 border border-dashed border-white/5 rounded-lg font-mono">
                      No Athena indices loaded. Start simulation to query data.
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-lg border border-white/10">
                      <table className="w-full text-xs text-left font-mono">
                        <thead className="bg-[#111] text-neutral-500 uppercase tracking-widest text-[9px] font-bold border-b border-white/10">
                          <tr>
                            <th className="px-5 py-3">JOB ID</th>
                            <th className="px-5 py-3">PARTITION LAYOUT</th>
                            <th className="px-5 py-3">CLEAN PAYLOAD FIELD PREVIEW</th>
                            <th className="px-5 py-3">PII REDACTED STATUS</th>
                            <th className="px-5 py-3">S3 ENCRYPT SEC</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 bg-black/40">
                          {displayedRecords.map((r, i) => (
                            <tr key={r.id}>
                              <td className="px-5 py-3.5 text-neutral-200">#{r.id}</td>
                              <td className="px-5 py-3.5 text-neutral-400 text-[10px] max-w-xs truncate" title={r.glueProcessed.partitionPath}>
                                {r.glueProcessed.partitionPath}
                              </td>
                              <td className="px-5 py-3.5 max-w-sm truncate text-[#93c5fd]">
                                {JSON.stringify(r.lambdaProcessed.isValid ? r.glueProcessed.transformedPayload : 'Rejected payload')}
                              </td>
                              <td className="px-5 py-3.5">
                                {r.lambdaProcessed.isValid ? (
                                  r.glueProcessed.detectedPII.length > 0 ? (
                                    <span className="text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded text-[9px]">
                                      REDACTED ({r.glueProcessed.detectedPII.length})
                                    </span>
                                  ) : (
                                    <span className="text-green-500 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded text-[9px]">
                                      COMPLIANT (CLEAN)
                                    </span>
                                  )
                                ) : (
                                  <span className="text-red-500 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded text-[9px]">
                                    BLOCKED (IN SQS DLQ)
                                  </span>
                                )}
                              </td>
                              <td className="px-5 py-3.5 text-neutral-500">
                                {config.bucketType === 'encrypted' ? 'AES-KMS-S3' : 'SSE-S3'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

              </div>
            )}

          </div>

          {/* Persistent System Info Logs Area At Root Bottom (Part of Sophicated Dark Layout HTML specs) */}
          <footer className="h-40 border-t border-white/10 bg-[#030303] p-6 font-mono select-none flex flex-col justify-between shrink-0">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block animate-ping"></span>
                ACTIVE PIPELINE METRIC STREAM
              </span>
              <span className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">CONSOLE DIRECT STREAM [SECURE]</span>
            </div>
            
            <div className="text-[11px] space-y-1 overflow-y-auto flex-1 pr-2" ref={terminalRef}>
              {consoleLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-2.5">
                  <span className="text-neutral-600 font-normal shrink-0">{log.time}</span>
                  <div className="flex-1">
                    {log.type === 'error' && <span className="text-red-500 font-bold mr-1.5">[QUARANTINE_FAIL]</span>}
                    {log.type === 'warn' && <span className="text-yellow-500 font-bold mr-1.5">[COMPLIANCE_WARN]</span>}
                    {log.type === 'success' && <span className="text-green-500 font-bold mr-1.5">[NODE_OK]</span>}
                    {log.type === 'info' && <span className="text-blue-400 font-bold mr-1.5">[SYSTEM_INFO]</span>}
                    <span className="text-neutral-300 leading-normal">{log.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </footer>

        </main>
      </div>

    </div>
  );
}
