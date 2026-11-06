import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

export const root = fileURLToPath(new URL('../', import.meta.url));
export const read = path => JSON.parse(readFileSync(new URL('../' + path, import.meta.url), 'utf8'));
export const stringify = data => JSON.stringify(data, null, 2) + '\n';
export const digest = data => createHash('sha256').update(typeof data === 'string' ? data : stringify(data)).digest('hex');
export const dataFiles = {
  sources: 'data/sources.v1.json', works: 'data/works.v1.json',
  entities: 'data/entities.v1.json', coverage: 'data/coverage.v1.json',
  relations: 'data/relations.v1.json',
  bindings: 'data/bindings.v1.json', external_identities: 'data/external-identities.v1.json',
  consumers: 'data/consumers.v1.json'
};
export function loadDataset() {
  const data = { version: read('package.json').version, as_of: read('data/release.v1.json').as_of };
  for (const [name, path] of Object.entries(dataFiles)) data[name] = read(path).entries;
  data.dataset_sha256 = digest(data);
  return data;
}
export const byId = list => new Map(list.map(x => [x.id, x]));
export const groupCount = (list, key) => Object.fromEntries([...new Set(list.map(x => x[key]))].sort().map(v => [v, list.filter(x => x[key] === v).length]));
export const md = value => String(value ?? '').replace(/\|/g, '\\|').replace(/[\r\n]+/g, ' ');
