import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { loadDataset, read, digest } from './lib.mjs';

const kinds = new Set(['character','species','faction','location','vehicle','weapon','equipment','culture','biology','effect','animation','gameplay','cosmetic']);
const levels = new Set(['verified','partial','to_verify']);
const origins = new Set(['licensed','fan','project_original']);
export function validateDataset(d) {
  const errors = [];
  const must = (condition, message) => { if (!condition) errors.push(message); };
  const allIds = new Set();
  for (const group of ['sources','works','entities','coverage','relations','bindings','external_identities','consumers']) {
    must(Array.isArray(d[group]), `${group}: array required`);
    for (const item of Array.isArray(d[group]) ? d[group] : []) {
      must(typeof item.id === 'string' && /^[a-z0-9][a-z0-9._:-]*$/.test(item.id), `${group}: invalid ID ${item.id}`);
      must(!allIds.has(item.id), `Duplicate ID ${item.id}`); allIds.add(item.id);
    }
  }
  if (errors.some(e => e.endsWith('array required'))) return errors;
  const sources = new Map(d.sources.map(s => [s.id, s]));
  const works = new Map(d.works.map(w => [w.id, w]));
  const entities = new Map(d.entities.map(e => [e.id, e]));
  const consumers = new Set(d.consumers.map(c => c.id));
  const refs = (list, index, label) => {
    must(Array.isArray(list), `${label}: array required`);
    for (const id of list ?? []) must(index.has(id), `${label}: unknown reference ${id}`);
  };
  for (const s of d.sources) {
    must(['official','creator','secondary','project'].includes(s.source_type), `${s.id}: invalid source_type`);
    try { const u = new URL(s.url); must(['https:','http:'].includes(u.protocol) && !u.username && !u.password, `${s.id}: unsafe URL`); must(!/[?&](token|key|access_token)=/i.test(s.url), `${s.id}: credential in URL`); } catch { must(false, `${s.id}: invalid URL`); }
    must(/^\d{4}-\d{2}-\d{2}$/.test(s.checked_at), `${s.id}: invalid checked_at`);
    must(Boolean(s.supports) && Boolean(s.title), `${s.id}: scope and title required`);
  }
  for (const w of d.works) {
    refs(w.source_ids, sources, w.id);
    must(typeof w.title === 'string' && w.title.length > 0, `${w.id}: title required`);
    must(['verified_metadata','to_verify'].includes(w.verification), `${w.id}: invalid verification`);
    must(origins.has(w.origin), `${w.id}: invalid work origin`);
    must(w.year === null || Number.isInteger(w.year), `${w.id}: year must be integer or null`);
    if (w.verification === 'verified_metadata') must(w.source_ids?.length > 0, `${w.id}: metadata proof required`);
    if (w.parent_work_id) must(works.has(w.parent_work_id), `${w.id}: missing parent_work_id`);
    if (w.contains_work_ids) refs(w.contains_work_ids, works, `${w.id}/contains`);
    if (w.publication_status === 'announced' && w.publication_date) must(w.publication_date > d.as_of, `${w.id}: announcement date needs rechecking`);
  }
  const forbidden = new Set(['hp','maxHp','damage','meleeDamage','plasmaDamage','stats','cost','unlockLevel','rarity']);
  const scan = (obj, path) => {
    if (!obj || typeof obj !== 'object') return;
    for (const [k,v] of Object.entries(obj)) { must(!forbidden.has(k), `${path}: gameplay balance field ${k} is not shared lore`); scan(v, path + '.' + k); }
  };
  for (const e of d.entities) {
    must(Boolean(e.name) && Boolean(e.summary) && Boolean(e.continuity), `${e.id}: name, summary and continuity required`);
    must(kinds.has(e.kind), `${e.id}: invalid kind ${e.kind}`);
    must(levels.has(e.verification), `${e.id}: invalid verification`);
    must(origins.has(e.origin), `${e.id}: invalid origin`);
    refs(e.source_ids, sources, e.id); refs(e.work_ids, works, e.id);
    must(Array.isArray(e.aliases) && Array.isArray(e.visual_notes) && Array.isArray(e.traits), `${e.id}: missing arrays`);
    must(e.visual_fidelity_verified === false, `${e.id}: unreviewed visual certification forbidden`);
    if (e.verification !== 'to_verify') must(e.source_ids?.length > 0, `${e.id}: source required`);
    for (const t of Array.isArray(e.traits) ? e.traits : []) {
      must(typeof t.label === 'string' && t.label.length > 0 && Object.hasOwn(t,'value'), `${e.id}: trait label/value required`);
      refs(t.source_ids, sources, `${e.id}/${t.label}`);
      must(['verified','to_verify'].includes(t.verification), `${e.id}: invalid trait verification`);
      if (t.verification === 'verified') must(t.source_ids?.length > 0, `${e.id}: verified trait without proof`);
    }
    if (e.origin === 'fan') must(e.continuity !== 'film-canon', `${e.id}: fan work misclassified`);
    scan(e, e.id);
  }
  const tuples = new Set();
  for (const b of d.bindings) {
    must(consumers.has(b.consumer), `${b.id}: unknown consumer`);
    must(entities.has(b.entity_id), `${b.id}: unknown entity`);
    must(b.target_verification === entities.get(b.entity_id)?.verification, `${b.id}: stale target verification`);
    must(b.relationship === 'documentary_reference' && b.visual_fidelity_verified === false, `${b.id}: invalid binding scope`);
    must(typeof b.local_id === 'string' && b.local_id.length > 0 && typeof b.collection === 'string' && b.collection.length > 0, `${b.id}: local_id and collection required`);
    must(b.source?.visibility === 'public' && typeof b.source?.repository === 'string', `${b.id}: public repository source required`);
    must(/^[a-f0-9]{40}$/.test(b.source?.commit ?? '') && Boolean(b.source?.path), `${b.id}: immutable source required`);
    const key = `${b.consumer}/${b.collection}/${b.local_id}/${b.entity_id}`;
    must(!tuples.has(key), `${b.id}: duplicate binding`); tuples.add(key);
  }
  for (const x of d.external_identities) {
    must(entities.has(x.entity_id), `${x.id}: unknown entity`);
    must(x.namespace === 'alien_base' && Boolean(x.external_id), `${x.id}: invalid external ID`);
    must(x.source?.visibility === 'public' && /^[a-f0-9]{40}$/.test(x.source?.commit ?? ''), `${x.id}: public pinned provenance required`);
  }
  for (const c of d.coverage) {
    must(works.has(c.work_id), `${c.id}: unknown work ${c.work_id}`);
    must(['partial','indexed','to_verify'].includes(c.status) && Array.isArray(c.remaining), `${c.id}: invalid coverage`);
  }
  for (const r of d.relations) {
    must(entities.has(r.from_id) && entities.has(r.to_id) && r.from_id !== r.to_id, `${r.id}: invalid relation endpoints`);
    refs(r.source_ids, sources, r.id);
    must(['game_variant_of','adaptation_counterpart','related_reference'].includes(r.relationship), `${r.id}: unknown relationship`);
    must(levels.has(r.verification), `${r.id}: invalid verification`);
    if (r.verification === 'verified') must(r.source_ids.length > 0, `${r.id}: verified relation requires evidence`);
  }
  return errors;
}

export function validateLocal() {
  const d = loadDataset(); const errors = validateDataset(d);
  const intake = read('data/research/project-intake.v1.json');
  const ids = new Set();
  for (const r of intake.entries) {
    if (ids.has(r.id)) errors.push(`Duplicate intake ${r.id}`); ids.add(r.id);
    if (r.status !== 'research_only' || r.canon_verified !== false || r.gameplay_stats_included !== false || r.source?.visibility !== 'public') errors.push(`Invalid intake policy ${r.id}`);
  }
  return { d, errors };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { d, errors } = validateLocal();
  if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
  else console.log(`OK: ${d.entities.length} entités, ${d.works.length} œuvres, ${d.sources.length} sources, ${d.bindings.length} correspondances. Contrôle structurel, pas certification du lore.`);
}
