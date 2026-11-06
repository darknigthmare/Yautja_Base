/** Offline documentary adapter. Never modifies game data or saves. */
export const SCHEMA = 'yautja-base/snapshot-v1';

const normalize = value => String(value).normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

export function createRegistry(input) {
  if (!input || input.schema !== SCHEMA || !Array.isArray(input.entities)) {
    throw new TypeError('Expected yautja-base/snapshot-v1');
  }
  const snapshot = structuredClone(input);
  const entities = new Map();
  for (const entity of snapshot.entities) {
    if (!entity.id || entities.has(entity.id)) throw new Error(`Duplicate/missing entity: ${entity.id}`);
    entities.set(entity.id, entity);
  }
  const works = new Map((snapshot.works ?? []).map(w => [w.id, w]));
  const sources = new Map((snapshot.sources ?? []).map(s => [s.id, s]));
  const matchingIds = ids => [...new Set(ids)].map(id => entities.get(id)).filter(Boolean).map(e => structuredClone(e));
  return Object.freeze({
    version: snapshot.version,
    size: entities.size,
    get(id) { const e = entities.get(id); return e ? structuredClone(e) : undefined; },
    work(id) { const w = works.get(id); return w ? structuredClone(w) : undefined; },
    source(id) { const s = sources.get(id); return s ? structuredClone(s) : undefined; },
    find(query = '', { kind, medium, verification, origin } = {}) {
      const q = normalize(query);
      return [...entities.values()].filter(e =>
        (!kind || e.kind === kind) && (!verification || e.verification === verification) &&
        (!origin || e.origin === origin) && (!medium || e.work_ids.some(id => works.get(id)?.medium === medium)) &&
        normalize([e.name, ...(e.aliases ?? []), e.summary, e.id].join(' ')).includes(q)
      ).map(e => structuredClone(e));
    },
    resolveLocal(consumer, localId, collection) {
      return matchingIds((snapshot.bindings ?? []).filter(b =>
        b.consumer === consumer && b.local_id === localId && (!collection || b.collection === collection)
      ).map(b => b.entity_id));
    },
    resolveExternal(namespace, externalId) {
      return matchingIds((snapshot.external_identities ?? []).filter(b =>
        b.namespace === namespace && b.external_id === externalId
      ).map(b => b.entity_id));
    },
    relations(id) {
      return structuredClone((snapshot.relations ?? []).filter(r => r.from_id === id || r.to_id === id));
    }
  });
}

export function selectSnapshot(dataset, { consumer, includeFan = false, verifiedOnly = false } = {}) {
  if (consumer && !dataset.consumers.some(c => c.id === consumer)) throw new Error(`Unknown consumer: ${consumer}`);
  const entities = dataset.entities.filter(e =>
    (includeFan || e.origin === 'licensed') &&
    (!verifiedOnly || (e.verification === 'verified' && e.traits.every(t => t.verification === 'verified')))
  );
  const ids = new Set(entities.map(e => e.id));
  // Bibliography is a first-class deliverable: works with no entity dossier yet
  // must not disappear. Editions and collection/parent links stay resolvable.
  const works = dataset.works.filter(w => includeFan || w.origin === 'licensed');
  const worksIds = new Set(works.map(w => w.id));
  for (const w of works) for (const related of [w.parent_work_id, ...(w.contains_work_ids ?? [])].filter(Boolean)) {
    if (!worksIds.has(related)) throw new Error(`Bibliography boundary needs review: ${w.id} -> ${related}`);
  }
  const relations = (dataset.relations ?? []).filter(r => ids.has(r.from_id) && ids.has(r.to_id));
  const sourceIds = new Set([...entities.flatMap(e => [...e.source_ids, ...e.traits.flatMap(t => t.source_ids)]), ...works.flatMap(w => w.source_ids), ...relations.flatMap(r => r.source_ids)]);
  return {
    schema: SCHEMA, version: dataset.version, as_of: dataset.as_of,
    dataset_sha256: dataset.dataset_sha256,
    policy: {
      scope: 'documentary-reference', canon_universality_asserted: false,
      visual_fidelity_verified: false, gameplay_balance_included: false,
      imports_are_not_runtime_installation: true,
      consumer: consumer ?? 'all', include_fan: includeFan, verified_only: verifiedOnly
    },
    entities: structuredClone(entities), works: structuredClone(works),
    sources: structuredClone(includeFan ? dataset.sources : dataset.sources.filter(s => sourceIds.has(s.id))),
    coverage: structuredClone((dataset.coverage ?? []).filter(c => worksIds.has(c.work_id))),
    relations: structuredClone(relations),
    bindings: structuredClone(dataset.bindings.filter(b => ids.has(b.entity_id) && (!consumer || b.consumer === consumer))),
    external_identities: structuredClone(dataset.external_identities.filter(b => ids.has(b.entity_id)))
  };
}
