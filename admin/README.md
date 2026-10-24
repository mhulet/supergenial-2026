# Admin Super Génial

Gestion interne : clients et contacts, projets, heures prestées en régie, packs d'heures, contrats récurrents
(maintenance, hébergement, noms de domaine, refacturations), frais fixes et factures. Remplace la Google Sheet
« M&V / Abonnements ». Les factures restent émises dans OkiOki : l'admin dit quoi facturer et quand, et garde
le n° OkiOki.

Rails 8.1, SQLite (+ Solid Cache/Queue/Cable), Hotwire, propshaft, sans build JS.

## En local

```
cd admin
bin/setup --skip-server
bin/rails users:create EMAIL=toi@exemple.be PASSWORD=…
bin/dev
```

## Reprendre la Google Sheet

Le repo est public : aucune donnée client n'y est versionnée, l'import les lit à l'exécution.

- Sheet partagée « tous les utilisateurs disposant du lien » : `bin/rails import:sheet SHEET_ID=14z7…`
- Sinon, exporter chaque onglet en CSV (`Prestations.csv`, `Revenus.csv`, `Outils M&V.csv`, `Noms de domaine.csv`,
  `Refacturations.csv`) dans un dossier : `bin/rails import:sheet DIR=chemin/du/dossier`

L'import est idempotent (le relancer met à jour sans dupliquer) et affiche ce qu'il faut vérifier : clients déduits
d'un libellé, montants sans statut, packs sans taux. Les factures importées sont datées au 1er janvier, sans n° OkiOki.

## Déploiement (Coolify, VPS Semisto)

Nouvelle application dans Coolify, à côté du site statique :

- Source : ce repo, branche `main`, **Base directory `/admin`**, build pack Dockerfile
- Domaine : `https://admin.supergenial.be` (port 80 du conteneur)
- Volume persistant : `/rails/storage` (les bases SQLite ; c'est le seul dossier à sauvegarder)
- Variables : `SECRET_KEY_BASE` (générer avec `bin/rails secret`), optionnellement `ANNUAL_TARGET` (défaut 30000)
- Health check : `/up`

La base est créée et migrée au démarrage du conteneur. Créer ensuite le compte depuis le terminal Coolify :
`bin/rails users:create EMAIL=… PASSWORD=…`, puis lancer l'import.

## Modèle

| Modèle | Rôle |
| --- | --- |
| `Client` | Organisation ou particulier, taux horaire par défaut (80 €) |
| `Contact` | Personnes d'un client, un contact principal |
| `Project` | Forfait, régie ou pack ; taux horaire propre possible |
| `TimeEntry` | Heures prestées : à facturer, facturé, imputé au pack, offert |
| `Pack` | Heures prépayées, solde calculé |
| `Contract` | Récurrent : prix, coût, périodicité, prochaine échéance ; « Facturé » crée la facture et avance l'échéance |
| `FixedCost` | Frais de Super Génial, actuel et prévisionnel (vide = inchangé, 0 = supprimé) |
| `Invoice` | Référence d'une facture OkiOki, sert au chiffre d'affaires |
| `Dashboard` | Les totaux de l'ancien onglet « Revenus » |
