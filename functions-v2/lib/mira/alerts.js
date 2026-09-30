"use strict";
// ============================================================================
// MIRA — Cloud Functions v2
// ----------------------------------------------------------------------------
// Funções serverless para a plataforma MIRA (Módulo de Inteligência em
// Rastreamento de Ativos).
//
// Este arquivo é o ponto de entrada para os módulos específicos do MIRA:
// - Avaliação de regras de alerta
// - Ingest de transações (mock no protótipo, real via API em produção)
// - Heurísticas de clusterização
// - Geração de relatórios
// ============================================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.logAccess = exports.runClusteringHeuristics = exports.ingestMockBlock = exports.evaluateAlertRules = void 0;
const https_1 = require("firebase-functions/v2/https");
const scheduler_1 = require("firebase-functions/v2/scheduler");
const v2_1 = require("firebase-functions/v2");
const admin = require("firebase-admin");
const SEVERITY_BY_RULE = {
    value_threshold: 'medium',
    mixer_touched: 'critical',
    sanctioned_address: 'critical',
    structuring: 'high',
    rapid_dispersion: 'high',
    dormant_activation: 'medium',
    bridge_cross_chain: 'medium',
};
/**
 * evaluateAlertRules — Cloud Function agendada que:
 * 1. Lê todas as regras ativas em /platformConfig/alertRules
 * 2. Lê transações recentes (últimas 24h) em todos os tenants
 * 3. Para cada transação, verifica quais regras ela dispara
 * 4. Cria alertas em /tenants/{orgId}/alerts se ainda não existir
 *
 * NOTA: No protótipo, é executado manualmente. Em produção, agendado 1x/h.
 */
exports.evaluateAlertRules = (0, scheduler_1.onSchedule)({
    schedule: 'every 1 hours',
    region: 'southamerica-east1',
    cors: true,
    enforceAppCheck: false,
}, async () => {
    var _a;
    v2_1.logger.info('[MIRA] Starting alert rule evaluation');
    try {
        const db = admin.firestore();
        const rulesSnap = await db.collection('platformConfig').doc('alertRules').get();
        const rules = rulesSnap.exists ? (_a = rulesSnap.data()) === null || _a === void 0 ? void 0 : _a.rules : [];
        if (!rules.length) {
            v2_1.logger.info('[MIRA] No active rules — skipping');
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
                const tx = txDoc.data();
                for (const rule of rules.filter((r) => r.enabled)) {
                    const triggered = await evaluateRule(rule, tx, tenantId);
                    if (triggered) {
                        await createAlertIfNew(tenantId, rule, tx);
                        totalAlerts++;
                    }
                }
            }
        }
        v2_1.logger.info(`[MIRA] Created ${totalAlerts} new alerts`);
    }
    catch (e) {
        v2_1.logger.error('[MIRA] Error evaluating alert rules', e);
    }
});
async function evaluateRule(rule, tx, _tenantId) {
    var _a;
    switch (rule.type) {
        case 'value_threshold':
            return tx.value_usd >= ((_a = rule.threshold) !== null && _a !== void 0 ? _a : 50000);
        case 'mixer_touched':
            // TODO: verificar contra lista de mixers conhecidos
            return false;
        case 'sanctioned_address':
            // TODO: verificar contra OFAC SDN
            return false;
        case 'structuring':
            // TODO: detectar padrão de fracionamento
            return false;
        case 'rapid_dispersion':
            // TODO: detectar dispersão rápida de fundos
            return false;
        case 'dormant_activation':
            // TODO: detectar ativação de wallet dormente
            return false;
        case 'bridge_cross_chain':
            // TODO: detectar uso de bridge
            return false;
        default:
            return false;
    }
}
async function createAlertIfNew(tenantId, rule, tx) {
    const db = admin.firestore();
    const alertsRef = db.collection('tenants').doc(tenantId).collection('alerts');
    const existing = await alertsRef
        .where('tx_hash', '==', tx.hash)
        .where('rule_type', '==', rule.type)
        .limit(1)
        .get();
    if (!existing.empty)
        return; // already exists
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
        value_usd: tx.value_usd,
        chain: tx.chain,
        status: 'open',
        false_positive: false,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
    });
}
// ============================================================================
// 2. Ingest de blocos (mock para protótipo, real para produção)
// ============================================================================
/**
 * ingestMockBlock — Cloud Function onCall que injeta uma transação mock no
 * Firestore para popular o protótipo. Substituível por ingest real via
 * Blockchair/Etherscan API em produção.
 */
exports.ingestMockBlock = (0, https_1.onCall)({
    region: 'southamerica-east1',
    cors: true,
    enforceAppCheck: false,
}, async (request) => {
    if (!request.auth)
        throw new https_1.HttpsError('unauthenticated', 'Auth required');
    const { tenantId, chain, from, to, value } = request.data;
    if (!tenantId || !chain || !from || !to || !value) {
        throw new https_1.HttpsError('invalid-argument', 'Missing required fields');
    }
    const db = admin.firestore();
    const tx = {
        chain,
        hash: `0x${Math.random().toString(16).slice(2, 66)}`,
        block_height: Math.floor(Math.random() * 1000000) + 800000,
        from_address: from,
        to_address: to,
        value: Number(value),
        value_usd: Number(value) * 65000,
        fee: 0.001,
        timestamp: new Date().toISOString(),
        status: 'confirmed',
        confirmations: 1,
        risk_score: Math.floor(Math.random() * 100),
        flagged: false,
        case_ids: [],
        created_at: admin.firestore.FieldValue.serverTimestamp(),
    };
    await db.collection('tenants').doc(tenantId).collection('transactions').add(tx);
    v2_1.logger.info(`[MIRA] Ingested mock tx ${tx.hash} for tenant ${tenantId}`);
    return { ok: true, tx };
});
// ============================================================================
// 3. Clustering heurístico (executar sob demanda)
// ============================================================================
/**
 * runClusteringHeuristics — Aplica heurísticas clássicas de clusterização
 * (multi-input, peel chain, bridge) e popula /tenants/{orgId}/clusters.
 *
 * No protótipo, é mock — gera clusters baseados em cluster_id já existente.
 * Em produção, faria a análise real sobre todas as transações.
 */
exports.runClusteringHeuristics = (0, https_1.onCall)({
    region: 'southamerica-east1',
    cors: true,
    enforceAppCheck: false,
}, async (request) => {
    if (!request.auth)
        throw new https_1.HttpsError('unauthenticated', 'Auth required');
    const { tenantId } = request.data;
    if (!tenantId)
        throw new https_1.HttpsError('invalid-argument', 'tenantId required');
    const db = admin.firestore();
    const walletsSnap = await db
        .collection('tenants').doc(tenantId)
        .collection('wallets')
        .get();
    // Mock: agrupa por heurística
    const clusters = new Map();
    walletsSnap.forEach((doc) => {
        const w = doc.data();
        const key = w.cluster_id || `unclustered_${doc.id}`;
        if (!clusters.has(key))
            clusters.set(key, []);
        clusters.get(key).push(doc.id);
    });
    const batch = db.batch();
    const clustersColRef = db.collection('tenants').doc(tenantId).collection('clusters');
    // Limpa clusters antigos
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
    v2_1.logger.info(`[MIRA] Created ${clusters.size} clusters for tenant ${tenantId}`);
    return { ok: true, clusters: clusters.size };
});
// ============================================================================
// 4. Auditoria de acesso (LGPD)
// ============================================================================
/**
 * logAccess — Registra abertura de caso ou wallet para fins de auditoria.
 * Chamado pelo frontend ao abrir uma página sensível.
 */
exports.logAccess = (0, https_1.onCall)({
    region: 'southamerica-east1',
    cors: true,
    enforceAppCheck: false,
}, async (request) => {
    var _a, _b, _c;
    if (!request.auth)
        throw new https_1.HttpsError('unauthenticated', 'Auth required');
    const { tenantId, resourceType, resourceId, action } = request.data;
    if (!tenantId || !resourceType || !resourceId) {
        throw new https_1.HttpsError('invalid-argument', 'Missing required fields');
    }
    const db = admin.firestore();
    await db.collection('tenants').doc(tenantId).collection('audit_logs').add({
        user_id: request.auth.uid,
        user_email: request.auth.token.email || null,
        resource_type: resourceType,
        resource_id: resourceId,
        action: action || 'view',
        ip: ((_a = request.rawRequest) === null || _a === void 0 ? void 0 : _a.ip) || null,
        user_agent: ((_c = (_b = request.rawRequest) === null || _b === void 0 ? void 0 : _b.headers) === null || _c === void 0 ? void 0 : _c['user-agent']) || null,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { ok: true };
});
//# sourceMappingURL=alerts.js.map