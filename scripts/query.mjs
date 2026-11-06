import { createRegistry, selectSnapshot } from '../src/index.mjs';
import { loadDataset } from './lib.mjs';
const options = {}, terms = [], args = process.argv.slice(2);
for (let i=0;i<args.length;i++) {
  if (['--kind','--medium','--verification','--origin'].includes(args[i])) {
    const flag = args[i]; if (!args[i+1] || args[i+1].startsWith('--')) throw new Error(`Missing value ${flag}`);
    options[flag.slice(2)] = args[++i];
  } else if (args[i].startsWith('--')) throw new Error(`Unknown argument ${args[i]}`);
  else terms.push(args[i]);
}
const registry = createRegistry(selectSnapshot(loadDataset(), { includeFan: true }));
for (const e of registry.find(terms.join(' '), options)) console.log(`${e.id}\t${e.name}\t${e.kind}\t${e.verification}\t${e.work_ids.join(',')}`);
