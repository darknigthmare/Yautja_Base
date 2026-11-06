import test from 'node:test';
import assert from 'node:assert/strict';
import { createRegistry, selectSnapshot } from '../src/index.mjs';
import { validateDataset, validateLocal } from '../scripts/validate.mjs';
import { loadDataset, digest } from '../scripts/lib.mjs';

test('all data references and intake policies are structurally valid', () => assert.deepEqual(validateLocal().errors, []));
test('malformed top-level collections report validation errors', () => {
  const d=loadDataset(); d.works={};
  assert.ok(validateDataset(d).includes('works: array required'));
});
test('shared data rejects imported gameplay balance', () => {
  const d = loadDataset(); d.entities[0].stats = { hp: 1000 };
  assert.ok(validateDataset(d).some(e => e.includes('gameplay balance')));
});
test('broken evidence and unjustified visual certification fail validation', () => {
  const d = loadDataset(); d.entities[0].source_ids.push('missing-source'); d.entities[0].visual_fidelity_verified = true;
  const errors = validateDataset(d);
  assert.ok(errors.some(e => e.includes('missing-source')));
  assert.ok(errors.some(e => e.includes('visual certification')));
});
test('fan entries are opt-in and excluded bindings cannot reintroduce them', () => {
  const d = loadDataset(), normal = selectSnapshot(d), all = selectSnapshot(d, { includeFan: true });
  assert.ok(all.entities.some(e => e.origin === 'fan'));
  assert.ok(normal.entities.every(e => e.origin === 'licensed'));
  const ids = new Set(normal.entities.map(e => e.id));
  assert.ok(normal.bindings.every(b => ids.has(b.entity_id)));
});
test('verified-only exports retain no provisional entity or trait', () => {
  const s = selectSnapshot(loadDataset(), { verifiedOnly: true });
  assert.ok(s.entities.length > 0);
  assert.ok(s.entities.every(e => e.verification === 'verified' && e.traits.every(t => t.verification === 'verified')));
});
test('adapter preserves one-to-many identities and isolates caller mutations', () => {
  const s = selectSnapshot(loadDataset(), { includeFan: true });
  const [first,second] = s.entities;
  s.bindings = [first,second].map(e => ({consumer:'test',local_id:'ambiguous',collection:'skins',entity_id:e.id}));
  const registry = createRegistry(s);
  assert.equal(registry.resolveLocal('test','ambiguous').length, 2);
  assert.deepEqual(registry.resolveLocal('test','unknown'), []);
  const original = registry.get(first.id).name;
  registry.get(first.id).name = 'mutated'; first.name = 'input mutated';
  assert.equal(registry.get(first.id).name, original);
});
test('consumer exports are deterministic and contain no unrelated bindings', () => {
  const d = loadDataset();
  for (const c of d.consumers) {
    const s = selectSnapshot(d, { consumer: c.id });
    assert.ok(s.bindings.every(b => b.consumer === c.id));
    assert.equal(digest(s), digest(selectSnapshot(d, { consumer: c.id })));
    assert.equal(s.entities.length, createRegistry(s).size);
  }
  assert.throws(() => selectSnapshot(d, { consumer:'typo' }), /Unknown consumer/);
});
test('full export retains the complete bibliography and coverage including works without entities', () => {
  const d=loadDataset(), s=selectSnapshot(d,{includeFan:true}), ids=new Set(s.works.map(w=>w.id));
  assert.equal(s.works.length,d.works.length);
  assert.equal(s.sources.length,d.sources.length);
  assert.equal(s.coverage.length,d.coverage.length);
  for(const w of s.works) for(const id of [w.parent_work_id,...(w.contains_work_ids??[])].filter(Boolean)) assert.ok(ids.has(id));
});
test('missing trait fields and private or incomplete binding provenance are rejected', () => {
  const d=loadDataset();
  d.entities[0].traits.push({verification:'verified',source_ids:[d.sources[0].id]});
  delete d.bindings[0].local_id; d.bindings[0].source.visibility='private';
  const errors=validateDataset(d);
  assert.ok(errors.some(e=>e.includes('trait label/value')));
  assert.ok(errors.some(e=>e.includes('local_id and collection')));
  assert.ok(errors.some(e=>e.includes('public repository source')));
});
