# Travail dans Yautja_Base

Ce référentiel alimente plusieurs jeux. Lire `README.md`, `docs/SOURCE_POLICY.md`
et `docs/INTEGRATION.md` avant de modifier les données.

- Conserver les identifiants publiés et les identifiants locaux des consommateurs.
- Un film, son adaptation, une classe PHG, un jouet et un personnage de fan film
  sont des références distinctes. Lier explicitement les variantes.
- Citer une source réellement consultée pour chaque nouvelle assertion. Distinguer
  métadonnées de publication, détails narratifs, observations visuelles et règles.
- Une page de vente prouve une édition et son résumé, pas chaque plan du film.
- Conserver `to_verify`/`partial` tant que la preuve manque. Ne jamais transformer
  un import de jeu en preuve officielle ou une apparence générée en visuel 1:1.
- Les valeurs d'équilibrage, sauvegardes et déblocages restent dans chaque jeu.
- L'ajout d'un dossier n'installe rien chez les consommateurs. Les correspondances
  et l'état réel d'intégration sont consignés séparément.
- Les fiches restent des synthèses originales; référencer les œuvres et les médias.
- Toute correction de preuve conserve la provenance et explique le changement.
- Exécuter `npm run check` avant livraison. Mettre à jour les exports avec
  `npm run build`. Les contrôles de structure ne certifient pas tout le lore.

Le travail se fait sur des sources publiques et des extraits de projets autorisés.
Le registre privé `alien_base` reste une référence d'architecture; ses données ne
sont rapprochées ici qu'à partir des instantanés déjà publics des consommateurs.

<!-- BEGIN:shared-ai-tooling -->
## Outils de développement IA

Ce dépôt peut utiliser [Spec Kit](https://github.com/github/spec-kit),
[Superpowers](https://github.com/obra/superpowers) et, avec Claude Code,
[Claude Code Game Studios](https://github.com/Donchitos/Claude-Code-Game-Studios).

Lire le [guide d'intégration](.ai-tools/README.md) et les
[révisions de référence](.ai-tools/sources.json) avant leur première utilisation.

- **Spec Kit** : cadrer une fonctionnalité ou une évolution importante en
  spécification, plan et tâches ; réutiliser les documents et le suivi existants.
- **Superpowers** : choisir les pratiques pertinentes pour l'implémentation,
  le diagnostic, la revue et la vérification. Garder un seul plan de travail.
- **Claude Code Game Studios** : utiliser les agents spécialisés dans les
  sessions Claude Code pour les tâches de jeu concernées. Pour un autre type de
  projet, conserver cette possibilité sans imposer une organisation de studio.
- Adapter ces outils à la demande en cours et aux contrats du projet. Préserver
  l'architecture, les conventions, les consignes et les autorisations existantes.
- Vérifier leur disponibilité réelle avant d'annoncer une commande ou un plugin
  comme installé. Le guide fournit les étapes d'activation et un diagnostic local.

Ces consignes ajoutent des outils au projet ; leurs références externes ne
constituent pas une autorisation de modifier les permissions ou de publier.
<!-- END:shared-ai-tooling -->
