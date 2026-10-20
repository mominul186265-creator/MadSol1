-- ============================================================================
-- MadSol Communication Module — Production PostgreSQL Relational Schema
-- Migration Version: 20260923_001_communication_production
-- Description: Review-ready relational schema supporting multi-institution
--              tenant isolation, atomic distributed locking, idempotent scheduling,
--              detailed delivery records, and audit execution logs.
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. Communication Provider Configurations Table (Per-Institution Gateway Configs)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS communication_provider_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id VARCHAR(64) NOT NULL UNIQUE,
    provider_id VARCHAR(64) NOT NULL DEFAULT 'mock_simulator',
    provider_name VARCHAR(128) NOT NULL DEFAULT 'Sandbox / Lab Simulator',
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_sandbox BOOLEAN NOT NULL DEFAULT true,
    api_key_encrypted TEXT,
    sender_id VARCHAR(32) NOT NULL DEFAULT 'MADRASAH',
    voice_caller_id VARCHAR(32) NOT NULL DEFAULT '+8809612000000',
    sms_rate_bdt NUMERIC(6, 4) NOT NULL DEFAULT 0.3500,
    voice_rate_bdt_per_min NUMERIC(6, 4) NOT NULL DEFAULT 0.7000,
    sms_balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    voice_balance_minutes NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    webhook_url TEXT,
    connection_status VARCHAR(32) NOT NULL DEFAULT 'unconfigured',
    last_connected_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_comm_configs_tenant 
    ON communication_provider_configs (institution_id);

-- ----------------------------------------------------------------------------
-- 2. Communication Templates Table (SMS / Voice Message Templates)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS communication_templates (
    id VARCHAR(64) PRIMARY KEY,
    institution_id VARCHAR(64) NOT NULL,
    name VARCHAR(128) NOT NULL,
    name_bn VARCHAR(128),
    category VARCHAR(64) NOT NULL,
    type VARCHAR(32) NOT NULL,
    content TEXT NOT NULL,
    voice_script TEXT,
    placeholders JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    usage_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_comm_templates_tenant_name UNIQUE (institution_id, name)
);

CREATE INDEX IF NOT EXISTS idx_comm_templates_tenant_category 
    ON communication_templates (institution_id, category, is_active);

-- ----------------------------------------------------------------------------
-- 3. Communication Messages Table (Broadcasts, Schedules & Campaigns)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS communication_messages (
    id VARCHAR(64) PRIMARY KEY,
    institution_id VARCHAR(64) NOT NULL,
    type VARCHAR(32) NOT NULL,
    channel VARCHAR(32) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    voice_script TEXT,
    sender_id VARCHAR(64) NOT NULL,
    sender_name VARCHAR(128) NOT NULL,
    sender_role VARCHAR(64) NOT NULL,
    template_id VARCHAR(64) REFERENCES communication_templates(id) ON DELETE SET NULL,
    template_name VARCHAR(128),
    provider_id VARCHAR(64) NOT NULL,
    provider_name VARCHAR(128) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'draft',
    scheduled_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    total_recipients INTEGER NOT NULL DEFAULT 0,
    sent_count INTEGER NOT NULL DEFAULT 0,
    delivered_count INTEGER NOT NULL DEFAULT 0,
    failed_count INTEGER NOT NULL DEFAULT 0,
    pending_count INTEGER NOT NULL DEFAULT 0,
    cost_estimate NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    actual_cost NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    external_batch_id VARCHAR(128),
    idempotency_key VARCHAR(128),
    retry_count INTEGER NOT NULL DEFAULT 0,
    max_retries INTEGER NOT NULL DEFAULT 2,
    last_retry_at TIMESTAMPTZ,
    queue_started_at TIMESTAMPTZ,
    processing_started_at TIMESTAMPTZ,
    lock_owner VARCHAR(128),
    lock_expires_at TIMESTAMPTZ,
    sms_config JSONB,
    voice_config JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Essential Indexes for High-Throughput & Isolation
CREATE INDEX IF NOT EXISTS idx_comm_messages_tenant_created 
    ON communication_messages (institution_id, created_at DESC);

-- Partial index for ultra-fast Scheduler Queue Polling (zero scan overhead on historical records)
CREATE INDEX IF NOT EXISTS idx_comm_messages_due_queue 
    ON communication_messages (scheduled_at) 
    WHERE status IN ('scheduled', 'pending');

-- Partial index for Crash Recovery Watchdog (recovering stuck locks)
CREATE INDEX IF NOT EXISTS idx_comm_messages_stuck_watchdog 
    ON communication_messages (lock_expires_at) 
    WHERE status = 'processing';

-- Idempotency constraint ensuring unique dispatch execution per tenant
CREATE UNIQUE INDEX IF NOT EXISTS uk_comm_messages_tenant_idempotency 
    ON communication_messages (institution_id, idempotency_key) 
    WHERE idempotency_key IS NOT NULL;

-- ----------------------------------------------------------------------------
-- 4. Communication Recipients Table (Granular Delivery Records per Recipient)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS communication_recipients (
    id VARCHAR(64) PRIMARY KEY,
    message_id VARCHAR(64) NOT NULL REFERENCES communication_messages(id) ON DELETE CASCADE,
    institution_id VARCHAR(64) NOT NULL,
    recipient_type VARCHAR(32) NOT NULL,
    name VARCHAR(128) NOT NULL,
    phone VARCHAR(32) NOT NULL,
    student_id VARCHAR(64),
    guardian_id VARCHAR(64),
    staff_id VARCHAR(64),
    status VARCHAR(32) NOT NULL DEFAULT 'pending',
    external_msg_id VARCHAR(128),
    cost_units INTEGER NOT NULL DEFAULT 1,
    delivered_at TIMESTAMPTZ,
    failed_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_comm_recipients_msg_status 
    ON communication_recipients (message_id, status);

CREATE INDEX IF NOT EXISTS idx_comm_recipients_tenant_phone 
    ON communication_recipients (institution_id, phone);

-- ----------------------------------------------------------------------------
-- 5. Communication Execution Logs Table (Immutable Audit Trail)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS communication_execution_logs (
    id VARCHAR(64) PRIMARY KEY,
    institution_id VARCHAR(64) NOT NULL,
    message_id VARCHAR(64) NOT NULL REFERENCES communication_messages(id) ON DELETE CASCADE,
    action VARCHAR(64) NOT NULL,
    status VARCHAR(32) NOT NULL,
    provider_id VARCHAR(64) NOT NULL,
    sender_id VARCHAR(64) NOT NULL,
    sender_name VARCHAR(128) NOT NULL,
    total_recipients INTEGER NOT NULL DEFAULT 0,
    delivered_count INTEGER NOT NULL DEFAULT 0,
    failed_count INTEGER NOT NULL DEFAULT 0,
    cost_incurred NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    details TEXT,
    executed_by VARCHAR(128) NOT NULL,
    executed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_comm_logs_tenant_msg 
    ON communication_execution_logs (institution_id, message_id, executed_at DESC);

-- ----------------------------------------------------------------------------
-- Row-Level Security (RLS) Ready Stubs for Multi-Tenant Hardening
-- ----------------------------------------------------------------------------
-- ALTER TABLE communication_provider_configs ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE communication_templates ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE communication_messages ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE communication_recipients ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE communication_execution_logs ENABLE ROW LEVEL SECURITY;
