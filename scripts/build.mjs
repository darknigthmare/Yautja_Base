import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { validateLocal } from './validate.mjs';
import { root, read, stringify, digest, byId, groupCount, md } from './lib.mjs';
import { selectSnapshot } from '../src/index.mjs';

const check = process.argv.slice(2).includes('--check');
const { d, errors } = validateLocal();
if (errors.length) throw new Error(errors.join('\n'));
const generated = new Map();
const emit = (path, data) => generated.set(path, typeof data === 'string' ? data : stringify(data));
const sources = byId(d.sources), works = byId(d.works);
const intake = read('data/research/project-intake.v1.json').entries;
const links = ids => [...new Set(ids)].map(id => `[${md(sources.get(id)?.title ?? id)}](${sources.get(id)?.url ?? '#'})`).join(' · ');
const workNames = ids => ids.map(id => works.get(id)?.title ?? id).join(' · ');
const stats = {
  as_of: d.as_of, version: d.version, dataset_sha256: d.dataset_sha256,
  entities: d.entities.length, works: d.works.length, sources: d.sources.length,
  bindings: d.bindings.length, external_identities: d.external_identities.length,
  interwork_relations: d.relations.length,
  imported_candidates: intake.length, coverage_items: d.coverage.length,
  anthology_contributions_indexed: d.coverage.reduce((n,c)=>n+(c.contributions?.length ?? 0),0),
  by_kind: groupCount(d.entities,'kind'), by_verification: groupCount(d.entities,'verification'),
  by_origin: groupCount(d.entities,'origin'), works_by_medium: groupCount(d.works,'medium'),
  source_types: groupCount(d.sources,'source_type'), consumer_bindings: groupCount(d.bindings,'consumer'),
  runtime_consumers_installed: d.consumers.filter(c => c.integration_status === 'installed_and_verified').length,
  visual_assets_certified: 0, whole_corpus_exhaustiveness_certified: false
};
emit('exports/stats.v1.json', stats);
emit('exports/yautja-base.full.v1.json', selectSnapshot(d, { includeFan: true }));
emit('exports/yautja-base.licensed.v1.json', selectSnapshot(d));
emit('exports/yautja-base.verified.v1.json', selectSnapshot(d, { verifiedOnly: true }));
for (const c of d.consumers) emit(`exports/consumers/${c.id}.v1.json`, selectSnapshot(d, { consumer:c.id }));

for (const kind of Object.keys(stats.by_kind)) {
  const rows = d.entities.filter(e => e.kind === kind);
  let out = `# ${kind} — ${rows.length} références\n\nFiches documentaires; le statut de chaque assertion reste attaché à sa source.\n\n`;
  for (const e of rows) {
    out += `## ${e.name}\n\n- **ID** : \`${e.id}\`\n- **Œuvres** : ${md(workNames(e.work_ids))}\n- **Provenance** : ${md(e.origin)} · ${md(e.continuity)}\n- **Vérification** : ${e.verification}\n`;
    if (e.aliases.length) out += `- **Alias** : ${e.aliases.map(md).join(', ')}\n`;
    out += `\n${e.summary}\n\n`;
    if (e.traits.length) {
      out += '| Caractéristique | Valeur / constat | Vérification | Sources |\n|---|---|---|---|\n';
      for (const t of e.traits) out += `| ${md(t.label)} | ${md(typeof t.value === 'object' ? JSON.stringify(t.value) : t.value)} | ${md(t.verification)} | ${links(t.source_ids)} |\n`;
      out += '\n';
    }
    if (e.visual_notes.length) out += '**Points à examiner pour la réalisation visuelle**\n\n' + e.visual_notes.map(v => '- ' + md(v)).join('\n') + '\n\n';
    if (e.notes) out += `**Notes** : ${typeof e.notes === 'string' ? e.notes : e.notes.map(md).join(' · ')}\n\n`;
    out += `**Sources de la fiche** : ${links(e.source_ids) || 'À documenter'}\n\n`;
  }
  emit(`catalog/${kind}.md`, out);
}

let bibliography = '# Œuvres et éditions\n\nUne notice bibliographique ne vaut pas audit intégral de l’œuvre. Les éditions, adaptations et supports restent distincts.\n\n';
for (const medium of Object.keys(stats.works_by_medium)) {
  bibliography += `## ${medium}\n\n| ID | Œuvre | Année déclarée | Publication | Vérification | Références |\n|---|---|---|---|---|---|\n`;
  for (const w of d.works.filter(w => w.medium === medium)) bibliography += `| \`${md(w.id)}\` | ${md(w.title)} | ${md(w.year ?? 'à vérifier')} | ${md(w.publication_status ?? 'voir notice')} | ${w.verification} | ${links(w.source_ids)} |\n`;
  bibliography += '\n';
}
bibliography += '## Notes d’édition et limites\n\n';
for (const w of d.works) if (w.notes) bibliography += `- **${md(w.title)}** (\`${w.id}\`) : ${md(w.notes)}${w.publication_date ? ' Publication déclarée : '+md(w.publication_date)+'.' : ''}\n`;
bibliography += '\n';
emit('docs/WORKS.md', bibliography);

let coverage = '# Matrice de couverture\n\n**Aucun statut ci-dessous ne déclare une œuvre intégralement auditée.** `indexed` = référence ou catégorie indexée; `partial` = contenu partiellement étudié; `to_verify` = preuve à réunir.\n\n';
for (const c of d.coverage) {
  coverage += `## ${md(works.get(c.work_id)?.title ?? c.work_id)} — ${md(c.area)}\n\n- ID : \`${c.id}\`\n- État : **${c.status}**\n\n${c.remaining.length ? c.remaining.map(x=>'- '+md(x)).join('\n') : '- Compléter les ancrages page/plan/édition avant de certifier une couverture exhaustive.'}\n\n`;
  if (c.contributions?.length) coverage += '**Contributions indexées**\n\n' + c.contributions.map(x => '- ' + md(typeof x === 'string' ? x : JSON.stringify(x))).join('\n') + '\n\n';
}
emit('docs/COVERAGE.md', coverage);

let sourceDoc = '# Sources consultées\n\nLa portée de chaque source borne les faits qu’elle peut établir. Les commentaires utilisateurs sur un forum officiel ne sont pas des annonces du développeur.\n\n| ID | Titre | Type | Consultée le | Portée |\n|---|---|---|---|---|\n';
for (const s of d.sources) sourceDoc += `| \`${s.id}\` | [${md(s.title)}](${s.url}) | ${s.source_type} | ${s.checked_at} | ${md(s.supports)} |\n`;
emit('docs/SOURCES.md',sourceDoc);

let projectDoc = '# Correspondances préparées pour les projets\n\nCes liens sont documentaires. Ils préservent les IDs locaux et ne changent pas les statistiques, sauvegardes, modèles ou accès au gameplay. Le chargement par les moteurs reste à intégrer et à vérifier.\n\n';
const entityNames = byId(d.entities);
for (const c of d.consumers) {
  projectDoc += `## ${c.name}\n\nÉtat : **${c.integration_status}**. [Dépôt](${c.repository_url}).\n\n| Collection | ID local conservé | Fiche de référence | Vérification de la fiche |\n|---|---|---|---|\n`;
  for (const b of d.bindings.filter(b=>b.consumer===c.id)) projectDoc += `| ${md(b.collection)} | \`${md(b.local_id)}\` | ${md(entityNames.get(b.entity_id).name)} (\`${b.entity_id}\`) | ${entityNames.get(b.entity_id).verification} |\n`;
  projectDoc += '\n';
}
projectDoc += '## Correspondances encore ouvertes\n\n| Projet | ID local | Nom | État |\n|---|---|---|---|\n';
for (const u of read('data/research/unresolved-bindings.v1.json').entries) projectDoc += `| ${u.consumer} | \`${md(u.local_id)}\` | ${md(u.name)} | À instruire |\n`;
projectDoc += '\n## Identifiants Alien_base préservés\n\n| ID externe | Fiche Yautja_Base | Provenance publique |\n|---|---|---|\n';
for (const x of d.external_identities) projectDoc += `| \`${x.external_id}\` | ${md(entityNames.get(x.entity_id).name)} | [Instantané public](${x.source.url}) |\n`;
projectDoc += '\n';
emit('docs/PROJECT_LINKS.md',projectDoc);

const countsTable = Object.entries(stats.by_kind).map(([k,n])=>`| [${k}](catalog/${k}.md) | ${n} |`).join('\n');
const verificationTable = Object.entries(stats.by_verification).map(([k,n])=>`| ${k} | ${n} |`).join('\n');
const consumersTable = d.consumers.map(c=>`| [${c.name}](${c.repository_url}) | ${stats.consumer_bindings[c.id] ?? 0} | ${md(c.integration_status)} |`).join('\n');
emit('README.md', `# YAUTJA_BASE — Référentiel commun Predator / Yautja / AVP\n\nVersion **${d.version}**, état documentaire au **6 novembre 2026**. Base de référence partagée pour les projets Yautja de darknigthmare, organisée sur les principes d’Alien_base : identifiants permanents, provenance, variantes par œuvre et statistiques propres à chaque jeu.\n\n## Accès au contenu\n\n- [Catalogue par catégorie](#catalogue) : personnages, armes, équipements, véhicules, lieux, culture, biologie et systèmes de jeu.\n- [Œuvres et éditions](docs/WORKS.md) : films, animation, jeux, BD, romans, crossovers, fan films et produits de référence indexés.\n- [Sources consultées](docs/SOURCES.md) et [matrice des manques](docs/COVERAGE.md).\n- [Politique de fidélité](docs/SOURCE_POLICY.md), [intégration multi-jeux](docs/INTEGRATION.md), [priorités d’approfondissement](docs/ROADMAP.md).\n- [Corpus JSON complet](exports/yautja-base.full.v1.json), [sélection licenciée](exports/yautja-base.licensed.v1.json), [sélection de fiches vérifiées](exports/yautja-base.verified.v1.json).\n- [${stats.imported_candidates} entrées de recherche issues des jeux](data/research/project-intake.v1.json), distinctes des fiches documentées.\n- [Correspondances par projet et identifiants conservés](docs/PROJECT_LINKS.md).\n- [Briefs de références visuelles](data/visual/briefs.v1.json) et [écarts repérés dans les imports](data/research/review-issues.v1.json).\n\n## État mesuré de cette livraison\n\n| Mesure | Nombre |\n|---|---:|\n| Fiches documentaires | ${stats.entities} |\n| Œuvres / éditions indexées | ${stats.works} |\n| Sources consultées et référencées | ${stats.sources} |\n| Correspondances avec les IDs des jeux | ${stats.bindings} |\n| Liens vers des IDs Alien_base déjà publics | ${stats.external_identities} |\n| Entrées existantes placées en recherche | ${stats.imported_candidates} |\n| Sujets de couverture suivis | ${stats.coverage_items} |\n| Actifs visuels certifiés 1:1 | 0 |\n\nCes nombres décrivent des notices et des liens; ils ne représentent pas des personnages tous jouables ni des œuvres toutes dépouillées. Le corpus est **alimenté mais non exhaustif**. Les manques sont listés explicitement, en particulier les cosmétiques PHG, les détails par mission/numéro/chapitre et les ancrages visuels.\n\n### Niveau de vérification des fiches\n\n| Statut | Fiches |\n|---|---:|\n${verificationTable}\n\n\`verified\` borne les assertions de la fiche aux sources citées; il ne certifie ni la totalité d’une œuvre ni la fidélité de ses adaptations dans les projets. \`partial\` et \`to_verify\` restent visibles dans les exports.\n\n## Catalogue\n\n| Catégorie | Fiches |\n|---|---:|\n${countsTable}\n\n## Projets consommateurs\n\n| Projet | Correspondances préparées | Installation dans le jeu |\n|---|---:|---|\n${consumersTable}\n\nLes correspondances documentent une référence narrative ou technique. Elles ne transfèrent pas les HP, dégâts, cartes, sauvegardes ou déblocages. Aucun consommateur n’est annoncé comme intégré avant vérification de son chargement réel.\n\n## Rechercher, vérifier, exporter\n\nNode.js 22 ou supérieur, sans dépendance npm à télécharger.\n\n\`\`\`bash\nnpm run check\nnode scripts/query.mjs "Wolf"\nnode scripts/query.mjs --medium game --kind weapon\nnode scripts/export.mjs --consumer yautja-la-longue-chasse --out /tmp/yautja-base.snapshot.json\n\`\`\`\n\nLes exports et le catalogue Markdown sont reproductibles avec \`npm run build\`. \`npm run check\` détecte aussi un export périmé. L’adaptateur hors ligne se trouve dans [src/index.mjs](src/index.mjs).\n\n## Structure\n\n| Dossier | Contenu |\n|---|---|\n| \`data/\` | Sources, œuvres, entités, couverture, consommateurs et correspondances |\n| \`data/research/\` | Imports publics épinglés, écarts, pistes et statut de recherche |\n| \`data/visual/\` | Briefs et méthode de vérification des actifs |\n| \`catalog/\` | Fiches lisibles sur GitHub, générées depuis les données |\n| \`exports/\` | Instantanés JSON avec empreintes et filtres de provenance |\n| \`src/\` | Adaptateur documentaire sans réseau ni modification de gameplay |\n| \`scripts/\` | Validation, recherche, export et génération |\n| \`tests/\` | Contrôles des contrats et des cas d’erreur |\n| \`schema/\` | Contrat JSON Schema du corpus |\n\n## Contribuer\n\nConserver les IDs. Ajouter des sources, limiter les affirmations à leurs preuves, qualifier la continuité et documenter les lacunes. Les fiches de jeux importées ne sont pas des preuves de canon. Une réédition, un fan film, un design de figurine et une classe multijoueur ne sont pas fusionnés par ressemblance.\n\nProjet documentaire de fan non officiel. Predator, Alien et les autres marques citées appartiennent à leurs ayants droit. Les médias originaux sont référencés, pas redistribués dans ce dépôt.\n`);

emit('exports/manifest.v1.json', {
  schema_version: '1.0.0', as_of: d.as_of, dataset_sha256: d.dataset_sha256,
  files: [...generated].filter(([p])=>p.startsWith('exports/')).map(([path,text])=>({path,sha256:digest(text),bytes:Buffer.byteLength(text)}))
});

const drift = [];
for (const [path,text] of generated) {
  const full = join(root,path);
  if (check) {
    try { if (readFileSync(full,'utf8') !== text) drift.push(path); } catch { drift.push(path); }
  } else { mkdirSync(dirname(full),{recursive:true}); writeFileSync(full,text); }
}
if (drift.length) { console.error('Generated files differ:\n' + drift.join('\n')); process.exitCode = 1; }
else console.log(`${check ? 'Checked' : 'Generated'} ${generated.size} files; dataset ${d.dataset_sha256}`);
