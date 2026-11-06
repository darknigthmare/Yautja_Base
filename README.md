# YAUTJA_BASE — Référentiel commun Predator / Yautja / AVP

Version **0.1.0**, état documentaire au **6 novembre 2026**. Base de référence partagée pour les projets Yautja de darknigthmare, organisée sur les principes d’Alien_base : identifiants permanents, provenance, variantes par œuvre et statistiques propres à chaque jeu.

## Accès au contenu

- [Catalogue par catégorie](#catalogue) : personnages, armes, équipements, véhicules, lieux, culture, biologie et systèmes de jeu.
- [Œuvres et éditions](docs/WORKS.md) : films, animation, jeux, BD, romans, crossovers, fan films et produits de référence indexés.
- [Sources consultées](docs/SOURCES.md) et [matrice des manques](docs/COVERAGE.md).
- [Politique de fidélité](docs/SOURCE_POLICY.md), [intégration multi-jeux](docs/INTEGRATION.md), [priorités d’approfondissement](docs/ROADMAP.md).
- [Corpus JSON complet](exports/yautja-base.full.v1.json), [sélection licenciée](exports/yautja-base.licensed.v1.json), [sélection de fiches vérifiées](exports/yautja-base.verified.v1.json).
- [196 entrées de recherche issues des jeux](data/research/project-intake.v1.json), distinctes des fiches documentées.
- [Correspondances par projet et identifiants conservés](docs/PROJECT_LINKS.md).
- [Briefs de références visuelles](data/visual/briefs.v1.json) et [écarts repérés dans les imports](data/research/review-issues.v1.json).

## État mesuré de cette livraison

| Mesure | Nombre |
|---|---:|
| Fiches documentaires | 481 |
| Œuvres / éditions indexées | 178 |
| Sources consultées et référencées | 201 |
| Correspondances avec les IDs des jeux | 130 |
| Liens vers des IDs Alien_base déjà publics | 33 |
| Entrées existantes placées en recherche | 196 |
| Sujets de couverture suivis | 191 |
| Actifs visuels certifiés 1:1 | 0 |

Ces nombres décrivent des notices et des liens; ils ne représentent pas des personnages tous jouables ni des œuvres toutes dépouillées. Le corpus est **alimenté mais non exhaustif**. Les manques sont listés explicitement, en particulier les cosmétiques PHG, les détails par mission/numéro/chapitre et les ancrages visuels.

### Niveau de vérification des fiches

| Statut | Fiches |
|---|---:|
| partial | 164 |
| to_verify | 2 |
| verified | 315 |

`verified` borne les assertions de la fiche aux sources citées; il ne certifie ni la totalité d’une œuvre ni la fidélité de ses adaptations dans les projets. `partial` et `to_verify` restent visibles dans les exports.

## Catalogue

| Catégorie | Fiches |
|---|---:|
| [animation](catalog/animation.md) | 8 |
| [biology](catalog/biology.md) | 2 |
| [character](catalog/character.md) | 178 |
| [cosmetic](catalog/cosmetic.md) | 29 |
| [culture](catalog/culture.md) | 6 |
| [effect](catalog/effect.md) | 6 |
| [equipment](catalog/equipment.md) | 46 |
| [faction](catalog/faction.md) | 23 |
| [gameplay](catalog/gameplay.md) | 41 |
| [location](catalog/location.md) | 36 |
| [species](catalog/species.md) | 21 |
| [vehicle](catalog/vehicle.md) | 10 |
| [weapon](catalog/weapon.md) | 75 |

## Projets consommateurs

| Projet | Correspondances préparées | Installation dans le jeu |
|---|---:|---|
| [Yautja : La Longue Chasse](https://github.com/darknigthmare/yautja-la-longue-chasse) | 36 | export_ready_not_installed |
| [Yautja Hive Warriors](https://github.com/darknigthmare/Yautja-hive-warriors) | 26 | export_ready_not_installed |
| [Yautja : Apex Hunt](https://github.com/darknigthmare/yautja-apex-hunt) | 42 | export_ready_not_installed |
| [AVP HUNT // HIVE TCG](https://github.com/darknigthmare/avp-hunt-hive-tcg) | 26 | export_ready_not_installed |

Les correspondances documentent une référence narrative ou technique. Elles ne transfèrent pas les HP, dégâts, cartes, sauvegardes ou déblocages. Aucun consommateur n’est annoncé comme intégré avant vérification de son chargement réel.

## Rechercher, vérifier, exporter

Node.js 22 ou supérieur, sans dépendance npm à télécharger.

```bash
npm run check
node scripts/query.mjs "Wolf"
node scripts/query.mjs --medium game --kind weapon
node scripts/export.mjs --consumer yautja-la-longue-chasse --out /tmp/yautja-base.snapshot.json
```

Les exports et le catalogue Markdown sont reproductibles avec `npm run build`. `npm run check` détecte aussi un export périmé. L’adaptateur hors ligne se trouve dans [src/index.mjs](src/index.mjs).

## Structure

| Dossier | Contenu |
|---|---|
| `data/` | Sources, œuvres, entités, couverture, consommateurs et correspondances |
| `data/research/` | Imports publics épinglés, écarts, pistes et statut de recherche |
| `data/visual/` | Briefs et méthode de vérification des actifs |
| `catalog/` | Fiches lisibles sur GitHub, générées depuis les données |
| `exports/` | Instantanés JSON avec empreintes et filtres de provenance |
| `src/` | Adaptateur documentaire sans réseau ni modification de gameplay |
| `scripts/` | Validation, recherche, export et génération |
| `tests/` | Contrôles des contrats et des cas d’erreur |
| `schema/` | Contrat JSON Schema du corpus |

## Contribuer

Conserver les IDs. Ajouter des sources, limiter les affirmations à leurs preuves, qualifier la continuité et documenter les lacunes. Les fiches de jeux importées ne sont pas des preuves de canon. Une réédition, un fan film, un design de figurine et une classe multijoueur ne sont pas fusionnés par ressemblance.

Projet documentaire de fan non officiel. Predator, Alien et les autres marques citées appartiennent à leurs ayants droit. Les médias originaux sont référencés, pas redistribués dans ce dépôt.
