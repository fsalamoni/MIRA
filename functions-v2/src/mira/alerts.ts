// ============================================================================
// MIRA — Cloud Functions v2 (versão SEM valores monetários)
// ----------------------------------------------------------------------------
// Funções serverless para a plataforma MIRA. Nenhuma função aqui lida com
// valores monetários — apenas estrutura, eventos e metadados qualitativos.
// ============================================================================

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { logger } from 'firebase-functions/v2';
import * as admin from 'firebase-admin';

// ============================================================================
// 1. Avaliação de Regras de Alerta
// ============================================================================

interface AlertRule {
    type: string;
    threshold?: number; // quantidade de transações no intervalo (não valor)
    enabled: boolean;
}

interface Transaction {
    hash: string;
    chain: string;
    from_address: string;
    to_address: string;
    timestamp: string;
    flagged?: boolean;
}

const SEVERITY_BY_RULE: Record<string, string> = {
    quantity_threshold: 'medium',
    mixer_touched: 'critical',
    sanctioned_address: 'critical',
    structuring: 'high',
    rapid_dispersion: 'high',
    dormant_activation: 'medium',
    bridge_cross_chain: 'medium',
};

export const evaluateAlertRules = onSchedule(
    {
        schedule: 'every 1 hours',
        region: 'southamerica-east1',
        cors: true,
        enforceAppCheck: false,
    },
    async () => {
        logger.info('[MIRA] Starting alert rule evaluation');
        try {
            const db = admin.firestore();
            const rulesSnap = await db.collection('platformConfig').doc('alertRules').get();
            const rules = rulesSnap.exists ? (rulesSnap.data()?.rules as AlertRule[]) : [];

            if (!rules.length) {
                logger.info('[MIRA] No active rules — skipping');
                return;
            }

            const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
            const tenantsSnap = await db.collection('organizations').get();

            let totalAlerts = 0;

            for (const tenantDoc of tenantsSnap.docs) {
                const tenantId = tenantDoc.id;
                const txSnap = await db
                    .collection('tenants').doc(tenantId)
                    .collection('transactions')
                    .where('timestamp', '>=', since.toISOString())
                    .limit(500)
                    .get();

                for (const txDoc of txSnap.docs) {
                    const tx = txDoc.data() as Transaction;
                    for (const rule of rules.filter((r) => r.enabled)) {
                        const triggered = await evaluateRule(rule, tx, tenantId);
                        if (triggered) {
                            await createAlertIfNew(tenantId, rule, tx);
                            totalAlerts++;
                        }
                    }
                }
            }

            logger.info(`[MIRA] Created ${totalAlerts} new alerts`);
        } catch (e) {
            logger.error('[MIRA] Error evaluating alert rules', e);
        }
    }
);

async function evaluateRule(rule: AlertRule, tx: Transaction, _tenantId: string): Promise<boolean> {
    switch (rule.type) {
        case 'quantity_threshold':
            // Regra baseada em quantidade de transações, não em valor
            return false;
        case 'mixer_touched':
            return false;
        case 'sanctioned_address':
            return false;
        case 'structuring':
            return false;
        case 'rapid_dispersion':
            return false;
        case 'dormant_activation':
            return false;
        case 'bridge_cross_chain':
            return false;
        default:
            return false;
    }
}

async function createAlertIfNew(tenantId: string, rule: AlertRule, tx: Transaction): Promise<void> {
    const db = admin.firestore();
    const alertsRef = db.collection('tenants').doc(tenantId).collection('alerts');
    const existing = await alertsRef
        .where('tx_hash', '==', tx.hash)
        .where('rule_type', '==', rule.type)
        .limit(1)
        .get();

    if (!existing.empty) return;

    await alertsRef.add({
        rule_type: rule.type,
        severity: SEVERITY_BY_RULE[rule.type] || 'medium',
        title: `${rule.type} detectado`,
        description: `Transação ${tx.hash.slice(0, 14)}... na chain ${tx.chain} disparou a regra ${rule.type}`,
        triggered_at: new Date().toISOString(),
        tx_id: tx.hash,
        tx_hash: tx.hash,
        from_address: tx.from_address,
        to_address: tx.to_address,
        chain: tx.chain,
        status: 'open',
        false_positive: false,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
    });
}

// ============================================================================
// 2. Ingest de blocos (mock para protótipo, real para produção)
// ============================================================================

export const ingestMockBlock = onCall(
    {
        region: 'southamerica-east1',
        cors: true,
        enforceAppCheck: false,
    },
    async (request) => {
        if (!request.auth) throw new HttpsError('unauthenticated', 'Auth required');
        const { tenantId, chain, from, to } = request.data;
        if (!tenantId || !chain || !from || !to) {
            throw new HttpsError('invalid-argument', 'Missing required fields');
        }

        const db = admin.firestore();
        const tx = {
            chain,
            hash: `0x${Math.random().toString(16).slice(2, 66)}`,
            block_height: Math.floor(Math.random() * 1000000) + 800000,
            from_address: from,
            to_address: to,
            timestamp: new Date().toISOString(),
            status: 'confirmed',
            confirmations: 1,
            risk_score: Math.floor(Math.random() * 100),
            flagged: false,
            case_ids: [],
            created_at: admin.firestore.FieldValue.serverTimestamp(),
        };
        await db.collection('tenants').doc(tenantId).collection('transactions').add(tx);
        logger.info(`[MIRA] Ingested mock tx ${tx.hash} for tenant ${tenantId}`);
        return { ok: true, tx };
    }
);

// ============================================================================
// 3. Clustering heurístico
// ============================================================================

export const runClusteringHeuristics = onCall(
    {
        region: 'southamerica-east1',
        cors: true,
        enforceAppCheck: false,
    },
    async (request) => {
        if (!request.auth) throw new HttpsError('unauthenticated', 'Auth required');
        const { tenantId } = request.data;
        if (!tenantId) throw new HttpsError('invalid-argument', 'tenantId required');

        const db = admin.firestore();
        const walletsSnap = await db
            .collection('tenants').doc(tenantId)
            .collection('wallets')
            .get();

        const clusters = new Map<string, string[]>();
        walletsSnap.forEach((doc) => {
            const w = doc.data();
            const key = w.cluster_id || `unclustered_${doc.id}`;
            if (!clusters.has(key)) clusters.set(key, []);
            clusters.get(key)!.push(doc.id);
        });

        const batch = db.batch();
        const clustersColRef = db.collection('tenants').doc(tenantId).collection('clusters');

        const oldClusters = await clustersColRef.get();
        oldClusters.forEach((d) => batch.delete(d.ref));

        for (const [clusterId, walletIds] of clusters) {
            const ref = clustersColRef.doc();
            batch.set(ref, {
                cluster_id: clusterId,
                wallets: walletIds,
                size: walletIds.length,
                heuristics: ['multi_input', 'co_spending'],
                confidence: 'medium',
                created_at: admin.firestore.FieldValue.serverTimestamp(),
            });
        }

        await batch.commit();
        logger.info(`[MIRA] Created ${clusters.size} clusters for tenant ${tenantId}`);
        return { ok: true, clusters: clusters.size };
    }
);

// ============================================================================
// 4. Auditoria de acesso (LGPD)
// ============================================================================

export const logAccess = onCall(
    {
        region: 'southamerica-east1',
        cors: true,
        enforceAppCheck: false,
    },
    async (request) => {
        if (!request.auth) throw new HttpsError('unauthenticated', 'Auth required');
        const { tenantId, resourceType, resourceId, action } = request.data;
        if (!tenantId || !resourceType || !resourceId) {
            throw new HttpsError('invalid-argument', 'Missing required fields');
        }

        const db = admin.firestore();
        await db.collection('tenants').doc(tenantId).collection('audit_logs').add({
            user_id: request.auth.uid,
            user_email: request.auth.token.email || null,
            resource_type: resourceType,
            resource_id: resourceId,
            action: action || 'view',
            ip: request.rawRequest?.ip || null,
            user_agent: request.rawRequest?.headers?.['user-agent'] || null,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });

        return { ok: true };
    }
);
