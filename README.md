# TSC ProcureFlow — WWF-RDC

Plateforme institutionnelle de gestion électronique du processus d'achat,
développée par **Tech Solutions Congo** en réponse au marché OEM43610 publié
par WWF-RDC le 30 avril 2026.

> Couvre l'intégralité du périmètre fonctionnel décrit aux TDR §4 :
> réquisitions, validation hiérarchique, suivi des délais, classification
> des achats, analyse des offres, attribution et suivi des marchés,
> réception (GRN / SAN), archivage électronique, tableau de bord
> interactif, export Excel/PDF, gestion fine des droits.

---

## Pile technique

- **Next.js 14** (App Router) + **TypeScript** + **Tailwind CSS**
- **Prisma ORM** + **PostgreSQL** (local via Docker, prod sur Render)
- Auth démo par cookie avec routage vers 8 workspaces distincts (à remplacer par Keycloak en production)
- **Recharts** pour les graphiques, **Lucide** pour les icônes
- Polices : **Inter** (UI) + **Lora** (titres et PDFs)

---

## Démarrage rapide (local)

Prérequis : Node ≥ 18, Docker.

```bash
docker compose up -d              # PostgreSQL local sur :5432
npm install
npm run db:reset                  # crée le schéma et seed les données
npm run dev                       # http://localhost:3000
```

Pour repartir d'un état propre :

```bash
npm run db:reset
```

Build de production :

```bash
npm run build && npm run start
```

---

## Comptes de démonstration

Mot de passe commun : **`demo123`**.

| Rôle / workspace                 | E-mail                  | Route |
|----------------------------------|-------------------------|-------|
| Requester Workspace              | requester@tsc.demo      | /workspaces/requester |
| Hierarchical Approver Workspace  | approver@tsc.demo       | /workspaces/approver |
| Procurement Officer Workspace    | procurement@tsc.demo    | /workspaces/procurement |
| Supplier Manager Workspace       | supplier@tsc.demo       | /workspaces/supplier-manager |
| Receiver Workspace               | receiver@tsc.demo       | /workspaces/receiver |
| Archive & Audit Workspace        | audit@tsc.demo          | /workspaces/archive-audit |
| Reporting Workspace              | reporting@tsc.demo      | /workspaces/reporting |
| Admin Workspace                  | admin@tsc.demo          | /workspaces/admin |

---

## Déploiement (Render)

Le dépôt contient un blueprint `render.yaml` :

- Service Web Next.js (free tier, région Frankfurt)
- Base PostgreSQL managée (free tier)
- Variables d'environnement injectées automatiquement
- `preDeployCommand` : `prisma db push` + seed
- Healthcheck : `/demo`

Connecter le dépôt à Render → "Blueprints" → New Blueprint Instance.
Première mise en ligne automatique, redéploiements à chaque push.

---

## Périmètre fonctionnel (TDR §4)

| TDR | Couverture |
|---|---|
| §4.1 Réquisitions (numéro auto, infos clés, quantité, justificatifs) | ✅ |
| §4.2 Workflow hiérarchique selon seuils + notifications + historique | ✅ |
| §4.3 Suivi par étape + identification des retards | ✅ |
| §4.4 Classification 5 types + analyse des offres + suivi marchés | ✅ |
| §4.5 Préqualification fournisseurs + diligence raisonnable | ✅ |
| §4.6 Module GRN + Service Acceptance Note + observations | ✅ |
| §4.7 Archivage sécurisé + droits + recherche rapide | ✅ |
| §4.8 Tableau de bord interactif + indicateurs + export Excel/PDF | ✅ |
| §4.9 Profils + droits d'accès + traçabilité actions | ✅ |
| Annexe B Lettre de certification anti-corruption | ✅ Module fournisseurs |

Les routes `/workspaces/*` sont les surfaces opérationnelles distinctes; `/dashboard` redirige seulement vers le workspace du rôle connecté.

---

## Architecture cible (production)

| Domaine        | Composant                                               |
|----------------|----------------------------------------------------------|
| Identité       | Keycloak (SSO + MFA, fédération AD)                      |
| Workflow       | Camunda 8 (BPMN/DMN)                                     |
| Stockage objet | MinIO (chiffrement, versioning, ACL)                     |
| Base           | PostgreSQL HA + sauvegardes chiffrées                    |
| Notifications  | SMTP transactionnel + SMS                                |
| Observabilité  | Grafana + Prometheus + Loki                              |
| Audit          | Journalisation immuable, hash chaîné, contre-signature   |

Voir `/architecture` (page publique) pour le détail.

---

## Licence et contexte

Préparé par **Tech Solutions Congo (TSC)** dans le cadre de la réponse au
marché **OEM43610** de **WWF-RDC**. Toute donnée incluse est fictive et à
but de démonstration uniquement.
