# Politique des sources et de fidélité

## Ce que signifie une fiche

La base fournit des identités, œuvres, descriptions documentaires et liens de
preuve. Elle ne décrète pas une continuité universelle. `origin` décrit le statut
de la création; `verification` décrit ce qui a été contrôlé. Ces deux axes sont
indépendants de l'état du contenu dans les jeux consommateurs.

| Champ | Valeur | Sens |
|---|---|---|
| source_type | official | Studio, éditeur, développeur, manuel ou fabricant licencié |
| source_type | creator | Communication du créateur identifiable |
| source_type | secondary | Référence spécialisée ou encyclopédie; nécessite attribution |
| source_type | project | Code ou catalogue d'un jeu du propriétaire; prouve son contenu local |
| origin | licensed | Référence rattachée à une œuvre/licence; ne signifie pas canon unique |
| origin | fan | Fan film ou création de fan identifiée |
| origin | project_original | Création propre à un des projets |
| verification | verified | Assertion limitée à ce que les sources citées établissent |
| verification | partial | Identité ou partie de la fiche documentée; détails encore ouverts |
| verification | to_verify | Piste indexée, pas encore validée |
| verification | verified_metadata | Métadonnées bibliographiques vérifiées; contenu non audité intégralement |

`source_ids` au niveau de la fiche indique la provenance générale. Les `traits`
portent leurs propres références pour les assertions détaillées. La portée de
chaque source est précisée dans `supports`. Une citation globale n'autorise pas
à inventer tailles, plans intérieurs, noms de clans, dialogues ou statistiques.

## Règles d'admission

1. Créer ou retrouver l'œuvre avec un identifiant permanent, le support, l'année
   et la continuité locale. Distinguer série, numéro, recueil et adaptation.
2. Ajouter la source consultée: URL, titre, éditeur, date et portée.
3. Décrire l'identité avec un texte original bref. Les pseudonymes de collection
   ou du fandom sont attribués à leur usage, pas présentés comme des noms prononcés.
4. Sourcer chaque caractéristique. Utiliser `to_verify` en l'absence de preuve.
5. Reporter les manques dans `coverage`, en précisant l'édition, scène, page,
   mission ou version à examiner quand elle est connue.
6. Examiner les correspondances par identité et œuvre. Un nom voisin ne suffit
   pas pour remplacer un ID ou fusionner un clan, une classe et une personne.

## Médias et chronologies

Un film possède sa propre notice; sa novélisation n'est pas le même document.
Le jeu PHG expose des classes et du lore licencié, avec des règles datées par
version. Une apparence inspirée d'un chasseur de film conserve ses paramètres
de jeu et sa silhouette propres. Les crossovers gardent leur continuité locale.
Les publications annoncées et non encore sorties à la date de consultation ne
sont pas présentées comme entièrement analysées.

Batman: Dead End reste classé fan film. Les références de figurines reprenant
ses designs restent des objets documentaires distincts; leur existence ne
change pas le statut du film. Les prototypes et scènes coupées doivent porter
le statut correspondant et ne prouvent pas le contenu du montage final.

## Preuves visuelles

Chaque réalisation doit préciser l'œuvre, la version, le plan ou la planche,
la face du sujet, la perspective, la latéralité et les accessoires réellement
visibles. Une illustration promotionnelle seule n'établit pas la totalité
d'une silhouette, d'un mécanisme ou d'un intérieur de vaisseau.

`visual_fidelity_verified: false` reste obligatoire ici tant qu'une comparaison
effective d'un actif identifié avec ses références n'a pas été réalisée.
Les briefs d'actifs sont des consignes de production, pas des actifs livrés.

## Réemploi et diffusion

La base conserve des notices originales, métadonnées, liens et identifiants.
Les extraits publics de projets conservent leur provenance Git. Les données
de recherche importées restent consultables séparément du corpus documenté.
Les œuvres, marques et illustrations de tiers restent la propriété de leurs
ayants droit. La présence d'une URL n'accorde pas de licence pour réutiliser l'art.

## Limites du contrôle automatique

Les scripts contrôlent IDs, références, statuts, empreintes et exports. Ils ne
lisent pas chaque œuvre et ne prouvent pas l'exhaustivité éditoriale. L'absence
d'erreur de validation ne transforme jamais `partial` en `verified`.
