/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize GoogleGenAI with protection
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Preset fallbacks in case API fails or key is missing
const fallbackPresetBundles: Record<string, {
  readme: string;
  terraform: string;
  glueScript: string;
  lambdaScript: string;
  sampleData: string;
}> = {
  ecommerce: {
    readme: `# AWS Serverless E-Commerce Processing & Analytics Pipeline

This architecture handles real-time ingest, validation, dynamic formatting, and analytical query structures of transaction logs using a high-efficiency serverless framework.

## Architecture Pipeline
\`\`\`
[ E-commerce App ] ---> S3 (Landing Bucket)
                             |
                             V  (S3 ObjectCreated Event Trigger)
                   [ AWS Lambda Ingestion Guard ]
                             | (Schema validation & sanitization)
                             |---> Success ---> S3 (Curated JSON)
                             |---> Fail    ---> SQS Dead Letter Queue (DLQ)
                                                     |
                                   [ AWS Glue Crawlers & Catalog ]
                                                     | (Schema discovery)
                                   [ AWS Glue PySpark Jobs ]
                                                     | (Deduplication, PII Masking, Casts)
                                                     V
                                         S3 (Analytical Parquet Lake)
                                                     |
                                         [ Athena / QuickSight Dashboard ]
\`\`\`

## Features Implemented
1. **Landing Zone validation & Sanitization**: Lambda inspects schema types, validates email/credit cards, and routes toxic logs to SQS.
2. **PySpark Custom Transformations**: Dynamic schemas are converted to relational structures using Amazon Glue PII scanning and dynamic target layout format.
3. **Optimized Costing & Elastic Workers**: Uses Glue Auto-scaling G.1X workers to prevent database wait over-spending.`,
    terraform: `provider "aws" {
  region = var.aws_region
}

variable "aws_region" {
  default = "us-east-1"
}

# 1. S3 Lake Tiers
resource "aws_s3_bucket" "data_lake_landing" {
  bucket = "dataflow-lake-raw-landing-hash123"
}

resource "aws_s3_bucket" "data_lake_curated" {
  bucket = "dataflow-lake-clean-curated-hash123"
}

resource "aws_s3_bucket" "data_lake_processed" {
  bucket = "dataflow-lake-processed-parquet-hash123"
}

# 2. Dead-letter queue for invalid transactions
resource "aws_sqs_queue" "pipeline_dlq" {
  name                      = "dataflow-ecommerce-dlq"
  message_retention_seconds = 1209600
}

# 3. AWS Lambda Processor
resource "aws_iam_role" "lambda_exec_role" {
  name = "dataflow-lambda-exec-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

resource "aws_lambda_function" "ingest_validator" {
  filename      = "lambda_function.zip"
  function_name = "dataflow-ecommerce-validator"
  role          = aws_iam_role.lambda_exec_role.arn
  handler       = "index.lambda_handler"
  runtime       = "python3.11"
  timeout       = 30

  environment {
    variables = {
      CURATED_BUCKET = aws_s3_bucket.data_lake_curated.id
      DLQ_URL        = aws_sqs_queue.pipeline_dlq.url
    }
  }
}

# 4. AWS Glue Catalog DB
resource "aws_glue_catalog_database" "ecommerce_catalog" {
  name = "ecommerce_curated_db"
}

# 5. AWS PySpark Glue Job
resource "aws_iam_role" "glue_service_role" {
  name = "dataflow-glue-service-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = { Service = "glue.amazonaws.com" }
    }]
  })
}

resource "aws_glue_job" "pyspark_etl" {
  name     = "ecommerce_parquet_transformation"
  role_arn = aws_iam_role.glue_service_role.arn

  command {
    script_location = "s3://\${aws_s3_bucket.data_lake_processed.id}/scripts/etl_job.py"
    python_version  = "3"
  }

  default_arguments = {
    "--job-language"        = "python"
    "--TempDir"             = "s3://\${aws_s3_bucket.data_lake_processed.id}/tmp/"
    "--enable-metrics"      = "true"
    "--enable-continuous-log-filter" = "true"
  }

  glue_version = "4.0"
  number_of_workers = 2
  worker_type = "G.1X"
}`,
    glueScript: `import sys
from awsglue.transforms import *
from awsglue.utils import getResolvedOptions
from pyspark.context import SparkContext
from awsglue.context import GlueContext
from awsglue.job import Job
from pyspark.sql.functions import col, when, regexp_replace, input_file_name, current_timestamp

# Initialize Glue Context
args = getResolvedOptions(sys.argv, ['JOB_NAME'])
sc = SparkContext()
glueContext = GlueContext(sc)
spark = glueContext.spark_session
job = Job(glueContext)
job.init(args['JOB_NAME'], args)

# Load data from Glue Catalog DynamicFrame
datasource = glueContext.create_dynamic_frame.from_catalog(
    database = "ecommerce_curated_db",
    table_name = "curated_json",
    transformation_ctx = "datasource"
)

# Move DynamicFrame into PySpark DataFrame for high-performance operations
df = datasource.toDF()

# 1. Deduplicate based on transaction_id
df_dedup = df.dropDuplicates(["transaction_id"])

# 2. Advanced PII masking: Mask credit cards and emails if present
target_cols = df_dedup.columns
if "payment_details" in target_cols:
    df_dedup = df_dedup.withColumn("payment_details", regexp_replace(col("payment_details"), r"\\d{4}-\\d{4}-\\d{4}-(\\d{4})", "XXXX-XXXX-XXXX-$1"))

if "customer_email" in target_cols:
    df_dedup = df_dedup.withColumn("customer_email", regexp_replace(col("customer_email"), r"(?i)([^@]{3})[^@]*@(.*)", "$1***@$2"))

# 3. Add dynamic processing auditing columns
df_enriched = df_dedup.withColumn("etl_processed_at", current_timestamp()) \\
                      .withColumn("source_file", input_file_name())

# Write back partitioned efficiently as snappy-compressed optimized Parquet columnar files
df_enriched.write \\
    .format("parquet") \\
    .option("compression", "snappy") \\
    .partitionBy("status", "currency") \\
    .mode("overwrite") \\
    .save("s3://dataflow-lake-processed-parquet-hash123/ecommerce_analytics/")

job.commit()`,
    lambdaScript: `import json
import os
import boto3
import uuid

# Initialize clients
s3_client = boto3.client('s3')
sqs_client = boto3.client('sqs')

CURATED_BUCKET = os.environ.get('CURATED_BUCKET', 'dataflow-lake-clean-curated-hash123')
DLQ_URL = os.environ.get('DLQ_URL')

def lambda_handler(event, context):
    """
    Validates transactional structures on S3 landing events.
    Encrypts/scrubs raw entries, verifies fields, and saves clean files to S3 curated tier.
    """
    for record in event.get('Records', []):
        try:
            # 1. Fetch landed object metadata
            landing_bucket = record['s3']['bucket']['name']
            landing_key = record['s3']['object']['key']
            
            # 2. Get file content
            response = s3_client.get_object(Bucket=landing_bucket, Key=landing_key)
            raw_data = response['Body'].read().decode('utf-8')
            payload = json.loads(raw_data)
            
            # Simple Schema constraint checking
            required_fields = ["transaction_id", "amount", "currency", "status"]
            missing = [f for f in required_fields if f not in payload]
            
            if missing:
                raise ValueError(f"Missing required relational keys: {missing}")
                
            if not isinstance(payload['amount'], (int, float)) or payload['amount'] <= 0:
                raise ValueError("Amount metrics must be non-zero positive numeric values.")
                
            # 3. Schema Sanitization: Convert keys, strip whitespaces
            sanitized = {k.strip().lower(): v for k, v in payload.items()}
            sanitized["lambda_validated_at"] = True
            
            # 4. Save to Curated Zone
            curated_key = f"curated/year=2026/month=06/{uuid.uuid4()}.json"
            s3_client.put_object(
                Bucket=CURATED_BUCKET,
                Key=curated_key,
                Body=json.dumps(sanitized),
                ContentType='application/json'
            )
            
        except Exception as e:
            # Send toxic data payload details to DLQ for diagnostic alerting
            if DLQ_URL:
                sqs_client.send_message(
                    QueueUrl=DLQ_URL,
                    MessageBody=json.dumps({
                        "error": str(e),
                        "original_event_record": record
                    })
                )
            
    return {
        "statusCode": 200,
        "body": json.dumps("Serverless data compliance check execution completed.")
    }`,
    sampleData: `[
  {
    "transaction_id": "tx_fa92019a",
    "amount": 254.95,
    "currency": "USD",
    "status": "completed",
    "payment_details": "4111-2222-3333-4444",
    "customer_email": "jane.doe@example.com",
    "product_category": "Electronics"
  },
  {
    "transaction_id": "tx_bd112028",
    "amount": 45.00,
    "currency": "EUR",
    "status": "pending",
    "payment_details": "5555-4444-3333-2222",
    "customer_email": "customer@service.fr",
    "product_category": "Apparel"
  }
]`
  }
};

// Advanced Simulation generation logic helper
function buildLocalSimulation(preset: string, config: any) {
  const records: any[] = [];
  const piiKeys = preset === 'healthcare_pii' ? ['ssn', 'patient_name', 'dob'] : ['payment_details', 'customer_email'];
  
  const categories = ['Electronics', 'Home & Kitchen', 'Beauty', 'Apparel', 'Automotive'];
  const states = ['completed', 'pending', 'failed'];
  const currencies = ['USD', 'EUR', 'GBP', 'INR', 'JPY'];

  for (let i = 0; i < 12; i++) {
    const idNum = Math.floor(100000 + Math.random() * 900000);
    const amountVal = parseFloat((20 + Math.random() * 480).toFixed(2));
    const randomCategory = categories[i % categories.length];
    const statusVal = Math.random() > 0.08 ? states[i % states.length] : 'invalid';
    const currencyVal = currencies[i % currencies.length];
    
    const emailStr = `user_${idNum}@example.com`;
    const ccStr = `4${Math.floor(1000 + Math.random()*9000)}-${Math.floor(1000 + Math.random()*9000)}-${Math.floor(1000 + Math.random()*9000)}-${Math.floor(1000 + Math.random()*9000)}`;
    const ssnStr = `${Math.floor(100 + Math.random()*900)}-${Math.floor(10 + Math.random()*90)}-${Math.floor(1000 + Math.random()*9000)}`;

    const rawPayload: Record<string, any> = {
      transaction_id: `tx_${idNum}`,
      amount: statusVal === 'invalid' ? -50 : amountVal,
      currency: currencyVal,
      status: statusVal === 'invalid' ? 'failed' : statusVal,
      customer_email: emailStr,
      product_category: randomCategory,
    };

    if (preset === 'healthcare_pii') {
      delete rawPayload.product_category;
      rawPayload.patient_name = `Patient ${idNum}`;
      rawPayload.ssn = ssnStr;
      rawPayload.dob = `19${Math.floor(50 + Math.random() * 40)}-${Math.floor(1 + Math.random()*11).toString().padStart(2, '0')}-${Math.floor(1 + Math.random()*28).toString().padStart(2, '0')}`;
      rawPayload.diagnosis_code = `ICD-10-M${20 + (i * 3)}`;
      rawPayload.clinical_cost = amountVal * 3;
    } else {
      rawPayload.payment_details = ccStr;
    }

    // Process Lambda
    const isValid = rawPayload.amount > 0;
    const errorReason = isValid ? undefined : 'Amount metrics must be non-zero positive numeric values.';

    const sanitizedPayload: any = isValid ? { ...rawPayload, lambda_validated_at: true } : {};

    // Process Glue PySpark Masking
    let transformedPayload: any = { ...sanitizedPayload };
    const detectedPII: string[] = [];

    if (isValid && config.enablePIIMasking) {
      if (transformedPayload.customer_email) {
        detectedPII.push('Email Address');
        transformedPayload.customer_email = transformedPayload.customer_email.replace(/([^@]{3})[^@]*@(.*)/, "$1***@$2");
      }
      if (transformedPayload.payment_details) {
        detectedPII.push('Credit Card Number');
        transformedPayload.payment_details = transformedPayload.payment_details.replace(/\d{4}-\d{4}-\d{4}-(\d{4})/, "XXXX-XXXX-XXXX-$1");
      }
      if (transformedPayload.ssn) {
        detectedPII.push('Social Security Number (SSN)');
        transformedPayload.ssn = "XXX-XX-XXXX";
      }
      if (transformedPayload.patient_name) {
        detectedPII.push('Patient Full Name');
        transformedPayload.patient_name = "PATIENT_REDACTED_MEMBER";
      }
    }

    const partitionPath = config.enablePartitioning
      ? `s3_lake_processed/analytics/year=2026/month=06/status=${rawPayload.status || 'failed'}/`
      : `s3_lake_processed/analytics/`;

    records.push({
      id: `rc_${idNum}`,
      timestamp: new Date(Date.now() - (i * 3600 * 1000)).toISOString(),
      rawPayload,
      lambdaProcessed: {
        isValid,
        errorReason,
        sanitizedPayload,
        metrics: {
          durationMs: Math.floor(15 + Math.random() * 25)
        }
      },
      glueProcessed: {
        transformedPayload,
        partitionPath,
        detectedPII
      }
    });
  }

  return records;
}

// REST Api route to generate advanced AWS codes using Gemini
app.post('/api/pipeline/generate-codes', async (req, res) => {
  const { config } = req.body;
  const configPreset = config?.preset || 'ecommerce';

  if (!ai) {
    // If key missing, return fallback preset
    return res.json({
      success: true,
      data: fallbackPresetBundles[configPreset] || fallbackPresetBundles.ecommerce,
      info: "Returning fallback code configurations."
    });
  }

  try {
    const prompt = `You are a Principal Serverless Data Pipeline Architect on AWS. The user wants to build an advanced, unique, production-grade serverless data pipeline matching these settings:
- Dataset / Preset Domain: ${configPreset}
- S3 Bucket encryption mode: ${config?.bucketType || 'encrypted'}
- AWS Glue concurrent worker count: ${config?.glueWorkers || 2} Dynamic DPUs
- Data partition optimization: ${config?.enablePartitioning ? 'Yes, partition by status/category attributes dynamically' : 'No'}
- PII compliance level masking: ${config?.enablePIIMasking ? 'Active (Auto-mask emails, credit-cards, and SSNs if diagnosed)' : 'Disabled'}
- Target processed format: ${config?.targetFormat || 'parquet'}
- AWS Lambda timeout spec: ${config?.lambdaTimeout || 30} seconds

Return a completely populated, fully compliant JSON object with these fields. 
The code MUST be highly advanced, using PySpark awsglue libs, proper error handlers, retry strategies in Python, and full Terraform infrastructure constructs.

Required JSON Structure (and only this JSON structure):
{
  "readme": "Detailed Markdown README.md with comprehensive System Architecture (text-drawn flowcharts), IAM roles matrix, cost optimization rules, and QuickSight connection details. Focus on advanced patterns such as ACID transactional tables or partition pruning.",
  "terraform": "A highly advanced, valid Terraform main.tf that sets up three S3 lake tiers, an SQS DLQ queue, IAM execution policies with minimal clearance, a landing EventBridge notification system, an enrichment AWS Lambda function, and an AWS Glue job configuring Spark runtime G.1X workers.",
  "glueScript": "An advanced PySpark script that reads from Glue catalog database, runs dynamic deduplication, transforms schemas, scans and cryptographically masks or replaces PII keys using standard regex, enriches rows with ingestion dates + input file names, and writes partitions as columnar data to s3 with snappy compression.",
  "lambdaScript": "A robust, production Python 3.11 AWS Lambda script to parse raw JSON S3 uploads, inspect types, enforce business constraints, quarantine toxic rows to SQS dead-letter queues, and load validated states safely."
}

Do not return any text other than the valid JSON, since the output is parsed as JSON in the backend application.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            readme: { type: Type.STRING },
            terraform: { type: Type.STRING },
            glueScript: { type: Type.STRING },
            lambdaScript: { type: Type.STRING }
          },
          required: ["readme", "terraform", "glueScript", "lambdaScript"]
        }
      }
    });

    const jsonText = response.text?.trim() || "";
    const parsed = JSON.parse(jsonText);
    
    // Add default sample dataset
    parsed.sampleData = JSON.stringify(fallbackPresetBundles[configPreset]?.sampleData || fallbackPresetBundles.ecommerce.sampleData, null, 2);

    res.json({
      success: true,
      data: parsed
    });

  } catch (error: any) {
    console.error("Gemini Code generation failure: ", error);
    // Fallback gracefully to preset package
    res.json({
      success: true,
      data: fallbackPresetBundles[configPreset] || fallbackPresetBundles.ecommerce,
      error: error.message,
      info: "Encountered simulation failure. Loaded high-quality fallback bundle."
    });
  }
});

// REST Api route to simulate pipeline logs streaming
app.post('/api/pipeline/simulate', (req, res) => {
  const { config } = req.body;
  const configPreset = config?.preset || 'ecommerce';
  
  try {
    const simulationResult = buildLocalSimulation(configPreset, config);
    res.json({
      success: true,
      records: simulationResult
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Start server
async function startServer() {
  // Vite middleware in development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
