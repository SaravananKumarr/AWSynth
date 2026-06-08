/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PipelinePreset, PipelineConfig, PipelinePresetId } from '../types';
import { Shield, Cpu, Database, Settings, HelpCircle } from 'lucide-react';

interface SidebarSettingsProps {
  config: PipelineConfig;
  onChange: (updates: Partial<PipelineConfig>) => void;
  isSimulating: boolean;
  onRunSimulation: () => void;
}

export const PRESETS: PipelinePreset[] = [
  {
    id: 'ecommerce',
    name: 'E-Commerce Transactions',
    description: 'Tracks transactional order volumes, credit card data masking, and status pipelines.',
    icon: 'ShoppingCart',
    rawSchema: 'transaction_id: string, amount: float, currency: string, status: string, payment_details: string (CC), customer_email: string',
    typicalPII: ['Credit Card Numbers', 'Email Addresses'],
    suggestedTrans: ['Deduplication', 'Format Standardizations', 'PII Masking Pattern']
  },
  {
    id: 'iot_telemetry',
    name: 'Industrial IoT Telemetry',
    description: 'High-frequency vibration sensors, heat monitors, and machine fault anomaly alerts.',
    icon: 'Cpu',
    rawSchema: 'device_id: string, temperature: float, status: string, alert_triggers: array, machine_load_factor: float',
    typicalPII: ['Device IP addresses', 'Operator Identity Metadata'],
    suggestedTrans: ['Rolling window status calculation', 'Filter toxic invalid temperature readings', 'Snappy parquet compression']
  },
  {
    id: 'healthcare_pii',
    name: 'Healthcare Patient Records (HIPAA)',
    description: 'Enforces strict data classification, cryptographic redact filters, and patient audits.',
    icon: 'Heart',
    rawSchema: 'patient_id: string, patient_name: string, ssn: string (National ID), dob: date, diagnosis_code: string, clinical_cost: float',
    typicalPII: ['Social Security Numbers (SSN)', 'Patient Names', 'Date of Birth (DOB)'],
    suggestedTrans: ['Complete SHA-256 dynamic masking', 'Durable audit trail timestamp Injection', 'Database catalog partition mapping']
  },
  {
    id: 'web_clickstream',
    name: 'Web Access Clickstreams',
    description: 'Monitors inbound IP addresses, route activities, HTTP statuses, and geolocates sources.',
    icon: 'Network',
    rawSchema: 'session_id: string, request_ips: string, bytes_transferred: int, page_views: array, browser_agent: string',
    typicalPII: ['Client Raw IP Address', 'Web Access Tokens'],
    suggestedTrans: ['User-Agent mapping parsing', 'Geo-IP translation metrics', 'Partition by status code']
  }
];

export const SidebarSettings: React.FC<SidebarSettingsProps> = ({
  config,
  onChange,
  isSimulating,
  onRunSimulation
}) => {
  return (
    <div className="bg-[#080808] border border-white/10 rounded-xl p-5 shadow-2xl space-y-6 text-[#d4d4d4]" id="pipeline-settings-panel">
      <div className="flex items-center space-x-2 pb-3 border-b border-white/10">
        <Settings className="w-5 h-5 text-blue-500" id="icon-sidebar-settings" />
        <h2 className="text-base font-semibold text-white tracking-tight leading-none">PIPELINE CONFIGS</h2>
      </div>

      {/* Preset Domain */}
      <div className="space-y-2">
        <label className="text-[10px] uppercase font-mono tracking-widest text-neutral-500 block">Select Stream Domain</label>
        <div className="grid grid-cols-1 gap-2.5">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => onChange({ preset: p.id })}
              className={`text-left p-3.5 rounded-lg border text-sm transition-all focus:outline-none ${
                config.preset === p.id
                  ? 'border-blue-500/50 bg-blue-950/15 text-white shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                  : 'border-white/10 hover:border-white/20 bg-[#0d0d0d] text-neutral-400'
              }`}
              id={`preset-btn-${p.id}`}
            >
              <div className="font-semibold flex items-center justify-between text-white">
                <span className="font-mono tracking-tight">{p.name}</span>
                {config.preset === p.id && <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />}
              </div>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">{p.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* AWS Lambda Parameters */}
      <div className="p-4 bg-white/[0.02] border border-white/5 rounded-lg space-y-3.5">
        <div className="flex items-center space-x-1.5 text-blue-400 font-mono text-[10px] uppercase tracking-widest">
          <Cpu className="w-4 h-4" />
          <span>LAMBDA GUARD LIMITS</span>
        </div>
        
        <div>
          <label className="text-xs text-neutral-400 block mb-1 font-medium">Execution Timeout Limit</label>
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min="3"
              max="60"
              value={config.lambdaTimeout}
              onChange={(e) => onChange({ lambdaTimeout: parseInt(e.target.value) })}
              className="w-full accent-blue-500 bg-neutral-800"
            />
            <span className="text-xs bg-[#111] border border-white/10 rounded px-1.5 py-0.5 font-mono text-blue-400 min-w-[3rem] text-center">
              {config.lambdaTimeout}s
            </span>
          </div>
        </div>

        <div>
          <label className="text-xs text-neutral-400 block mb-1 font-medium">S3 Native Security</label>
          <select
            value={config.bucketType}
            onChange={(e: any) => onChange({ bucketType: e.target.value })}
            className="w-full text-xs font-medium border border-white/10 rounded p-2 bg-[#0c0c0c] text-neutral-300 focus:border-blue-500 focus:outline-none"
          >
            <option value="standard">SSE-S3 AWS Default KMS</option>
            <option value="encrypted">SSE-KMS Customer Shield Key</option>
          </select>
        </div>
      </div>

      {/* AWS Glue ETL Parameters */}
      <div className="p-4 bg-white/[0.02] border border-white/5 rounded-lg space-y-3.5">
        <div className="flex items-center space-x-1.5 text-blue-400 font-mono text-[10px] uppercase tracking-widest">
          <Database className="w-4 h-4" />
          <span>GLUE ETL SCHEMATICS</span>
        </div>

        {/* Worker Allocations */}
        <div>
          <label className="text-xs text-neutral-400 block mb-1 font-medium">DPU Serverless Capacity (G.1X)</label>
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min="2"
              max="10"
              value={config.glueWorkers}
              onChange={(e) => onChange({ glueWorkers: parseInt(e.target.value) })}
              className="w-full accent-blue-500 bg-neutral-800"
            />
            <span className="text-xs bg-[#111] border border-white/10 rounded px-1.5 py-0.5 font-mono text-blue-400 min-w-[3rem] text-center">
              {config.glueWorkers} DPU
            </span>
          </div>
        </div>

        {/* Output Format */}
        <div>
          <label className="text-xs text-neutral-400 block mb-1 font-medium">Store Partition Target Format</label>
          <select
            value={config.targetFormat}
            onChange={(e: any) => onChange({ targetFormat: e.target.value })}
            className="w-full text-xs font-medium border border-white/10 rounded p-2 bg-[#0c0c0c] text-neutral-300 focus:border-blue-500 focus:outline-none"
          >
            <option value="parquet">Apache Parquet (Columnar Splittable)</option>
            <option value="iceberg">Apache Iceberg (Transactional ACID Table)</option>
            <option value="json">Raw Canonical JSON (Cleaned Record Stream)</option>
          </select>
        </div>

        {/* Compression */}
        <div>
          <label className="text-xs text-neutral-400 block mb-1 font-medium">Spark Output Block Compression</label>
          <select
            value={config.glueCompression}
            onChange={(e: any) => onChange({ glueCompression: e.target.value })}
            className="w-full text-xs font-medium border border-white/10 rounded p-2 bg-[#0c0c0c] text-neutral-300 focus:border-blue-500 focus:outline-none"
          >
            <option value="snappy">Snappy Codec (Speed priority)</option>
            <option value="gzip">Gzip Codec (Maximum byte shrink)</option>
            <option value="none">Raw Binary Streams (No codec compression)</option>
          </select>
        </div>

        {/* Security / Compliance Toggles */}
        <div className="space-y-3.5 pt-2.5 border-t border-white/10">
          <label className="flex items-start space-x-2.5 cursor-pointer group">
            <input
              type="checkbox"
              checked={config.enablePIIMasking}
              onChange={(e) => onChange({ enablePIIMasking: e.target.checked })}
              className="rounded text-blue-500 focus:ring-blue-500 w-4 h-4 bg-[#0a0a0a] border-white/25 mt-0.5"
            />
            <div className="text-xs">
              <span className="font-semibold text-white block group-hover:text-blue-400 transition-colors">PII Masking Filter</span>
              <span className="text-[10px] text-neutral-500 leading-normal block mt-0.5">Scrub payment details, name tokens, SSN and diagnostic identifiers.</span>
            </div>
          </label>

          <label className="flex items-start space-x-2.5 cursor-pointer group">
            <input
              type="checkbox"
              checked={config.enablePartitioning}
              onChange={(e) => onChange({ enablePartitioning: e.target.checked })}
              className="rounded text-blue-500 focus:ring-blue-500 w-4 h-4 bg-[#0a0a0a] border-white/25 mt-0.5"
            />
            <div className="text-xs">
              <span className="font-semibold text-white block group-hover:text-blue-400 transition-colors">S3 Pruned Partitioning</span>
              <span className="text-[10px] text-neutral-500 leading-normal block mt-0.5">Automate dynamic Hive Partition structure paths to cut Athena query overhead costs.</span>
            </div>
          </label>
        </div>
      </div>

      <button
        onClick={onRunSimulation}
        disabled={isSimulating}
        className="w-full bg-blue-600 hover:bg-blue-500 font-mono tracking-wide text-white rounded-lg py-3 text-xs font-bold shadow-[0_0_15px_rgba(59,130,246,0.25)] active:translate-y-[1px] transition-all disabled:opacity-40 inline-flex items-center justify-center space-x-2"
        id="run-simulation-button"
      >
        <span>{isSimulating ? 'SIMULATING EXECUTION STREAM...' : 'EXECUTE PIPELINE PIPELINE_SIM'}</span>
      </button>

      <div className="text-[10px] text-neutral-500 bg-black/60 py-2.5 px-3 rounded text-center leading-normal border border-white/5 flex items-center justify-center space-x-1.5 font-mono">
        <InfoIcon className="w-3.5 h-3.5 text-blue-400 shrink-0" />
        <span>Simulator writes directly to temporary simulated targets.</span>
      </div>
    </div>
  );
};

const InfoIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </svg>
);
