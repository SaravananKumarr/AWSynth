/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PipelinePresetId = 'ecommerce' | 'iot_telemetry' | 'healthcare_pii' | 'web_clickstream' | 'financial_ledger';

export interface PipelinePreset {
  id: PipelinePresetId;
  name: string;
  description: string;
  icon: string;
  rawSchema: string; // JSON schema as text description
  typicalPII: string[];
  suggestedTrans: string[];
}

export interface PipelineConfig {
  preset: PipelinePresetId;
  bucketType: 'standard' | 'encrypted';
  glueWorkers: number; // 2 to 10
  enablePIIMasking: boolean;
  enablePartitioning: boolean;
  partitionKeys: string[];
  glueCompression: 'snappy' | 'gzip' | 'none';
  targetFormat: 'parquet' | 'iceberg' | 'json';
  lambdaTimeout: number; // seconds
}

export interface SimulatedRecord {
  id: string;
  timestamp: string;
  rawPayload: Record<string, any>;
  lambdaProcessed: {
    isValid: boolean;
    errorReason?: string;
    sanitizedPayload: Record<string, any>;
    metrics: {
      durationMs: number;
    };
  };
  glueProcessed: {
    transformedPayload: Record<string, any>;
    partitionPath: string;
    detectedPII: string[];
  };
}

export interface GeneratedCodeBundle {
  readme: string;
  terraform: string;
  glueScript: string;
  lambdaScript: string;
  sampleData: string;
}
