import { writeFileSync } from 'node:fs';
import { selectSnapshot } from '../src/index.mjs';
import { validateLocal } from './validate.mjs';
import { stringify } from './lib.mjs';

const args = process.argv.slice(2);
const allowed = new Set(['--consumer','--out','--include-fan','--verified-only']);
const options = {};
for (let i=0;i<args.length;i++) {
  const a = args[i];
  if (!allowed.has(a)) throw new Error(`Unknown argument: ${a}`);
  if (a === '--include-fan') options.includeFan = true;
  else if (a === '--verified-only') options.verifiedOnly = true;
  else { if (!args[i+1] || args[i+1].startsWith('--')) throw new Error(`Missing value: ${a}`); options[a.slice(2)] = args[++i]; }
}
const { d, errors } = validateLocal();
if (errors.length) throw new Error(errors.join('\n'));
const result = stringify(selectSnapshot(d, options));
if (options.out) { writeFileSync(options.out, result); console.log(`Export écrit: ${options.out}`); }
else process.stdout.write(result);
