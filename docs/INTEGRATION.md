# Intégration dans les jeux

## Contrat commun

Le format `yautja-base/snapshot-v1` fournit les entités, œuvres, sources et
correspondances documentaires. Les identifiants du jeu consommateur restent
inchangés. Les données locales de combat, inventaire, progression et sauvegarde
ne sont jamais écrasées par une fiche de référence.

Les premières correspondances sont préparées pour:

- `darknigthmare/avp-hunt-hive-tcg`
- `darknigthmare/yautja-la-longue-chasse`
- `darknigthmare/Yautja-hive-warriors`
- `darknigthmare/yautja-apex-hunt`

La présence d'un consommateur dans `data/consumers.v1.json` signifie qu'un
profil d'export existe. Son état d'installation est explicite. Cette livraison
ne prétend pas que leurs moteurs chargent déjà ce nouveau référentiel.

## Export hors ligne

```bash
npm run check
node scripts/export.mjs --consumer yautja-la-longue-chasse --out /tmp/yautja-base.snapshot.json
node scripts/query.mjs "Wolf"
node scripts/query.mjs --medium game --kind weapon
node scripts/query.mjs --verification to_verify
```

L'export embarque les références correspondant à ses entités. Par défaut, les
créations fan et propres aux projets sont exclues. Pour un mode crossover
assumé, utiliser `--include-fan`. `--verified-only` réduit l'export aux fiches
vérifiées; cela ne prouve toujours pas la fidélité visuelle des sprites.

```js
import { readFileSync } from 'node:fs';
import { createRegistry } from './vendor/yautja-base/src/index.mjs';

const snapshot = JSON.parse(readFileSync('./data/yautja-base.snapshot.json', 'utf8'));
const registry = createRegistry(snapshot);
const linked = registry.resolveLocal('yautja-la-longue-chasse', 'jungle-hunter');
// linked est une liste: une identité de film et une variante PHG restent séparées.
// Le jeu décide comment afficher ce contexte dans sa fiche ou son codex.
```

Le module `src/index.mjs` fonctionne aussi dans un navigateur: il reçoit un
objet JSON déjà chargé et n'effectue aucune requête réseau. Un export n'est
pas une API GitHub appelée à chaque lancement du jeu.

## Liaison avec Alien_base

`data/external-identities.v1.json` préserve les anciens IDs déjà exposés dans
les instantanés publics d'Apex Hunt et du TCG. Ces liens documentent une
identité ou une famille d'équipement; ils ne réécrivent ni le registre Alien
ni les sauvegardes. Les variantes par œuvre restent séparées dans Yautja_Base.

Les associations ambiguës sont conservées en recherche. Une correspondance
peut désigner une même référence narrative sans certifier le modèle, le kit
de combat ni les accessoires que le jeu lui a attribués.

## Mise à jour reproductible

1. Choisir un commit du référentiel et le consigner dans le dépôt consommateur.
2. Générer l'export puis vérifier son `dataset_sha256`.
3. Comparer les IDs ajoutés, retirés et les statuts modifiés.
4. Intégrer la notice documentaire avec un adaptateur local.
5. Tester le chargement hors ligne, les ID inconnus et la conservation des saves.
6. Faire constater l'affichage réel dans le jeu avant de déclarer l'intégration.

Pour récupérer les données plus tard, utiliser un chemin Git épinglé à un
commit; éviter `main` comme dépendance mouvante de production. Aucune clé
GitHub ni information privée ne doit être livrée dans un client public.
