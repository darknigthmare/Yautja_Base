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
