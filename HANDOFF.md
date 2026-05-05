# TSC ProcureFlow — Handoff Document

**Réponse au marché OEM43610 — WWF-RDC**
*Plateforme institutionnelle de gestion électronique du processus d'achat*

---

## 1. Quick reference

| | |
|---|---|
| **Production URL** | https://wwf-procureflow.onrender.com |
| **GitHub repo** | https://github.com/bunyinu/wwf-procureflow |
| **Render service** | `srv-d7spglreo5us73emmu5g` (Web · Free · Frankfurt) |
| **Render dashboard** | https://dashboard.render.com/web/srv-d7spglreo5us73emmu5g |
| **Database** | PostgreSQL — schema `procureflow` on `soko-db` (`dpg-d7q1405ckfvc739dvoqg-a`, Frankfurt, free tier) |
| **TDR reference** | `wwf_260430_01_07.pdf` — Réf. OEM43610 · publié 30 avril 2026 · clôture 21 mai 2026 17h Kinshasa |
| **Tender contact** | mngonga@wwfdrc.org · cbuinu@wwfdrc.org · bxilunga@wwfdrc.org |
| **Deposit address** | procurement@wwfdrc.org |

**Mot de passe commun pour tous les comptes démo : `demo123`**

---

## 2. The eight process-module roles

Aligned strictly to TDR §4 modules (not job titles). FINANCE is intentionally absent — the PDF doesn't name it; budget validation is folded into the Hierarchical Approver via thresholds.

| # | Rôle | Compte | Workspace principal | Owns |
|---|---|---|---|---|
| 1 | Demandeur | `requester@tsc.demo` | `/workspaces/requester` | Création/soumission, infos clés (dépt, projet, description, quantité, budget, ligne), pièces jointes, numéro auto |
| 2 | Approbateur Hiérarchique | `approver@tsc.demo` | `/workspaces/approver` | Validation hiérarchique selon les seuils, retours, rejets, historique des décisions |
| 3 | Officier Achats | `procurement@tsc.demo` | `/workspaces/procurement` | Classification 5 méthodes PDF, analyse offres, attribution marchés, suivi commandes |
| 4 | Gestionnaire Fournisseurs | `supplier@tsc.demo` | `/workspaces/supplier-manager` | Registre, préqualification, diligence raisonnable, Annexe B, statut fournisseur |
| 5 | Réceptionnaire | `receiver@tsc.demo` | `/workspaces/receiver` | Bons de réception (GRN), Constats d'acceptation de service (SAN), écarts, preuves |
| 6 | Officier Documents & Audit | `audit@tsc.demo` | `/workspaces/archive-audit` | Archivage sécurisé, recherche rapide, traçabilité, lecture seule absolue |
| 7 | Responsable Reporting | `reporting@tsc.demo` | `/workspaces/reporting` | KPI, retards, performance fournisseurs/commandes, exports Excel/PDF |
| 8 | Administrateur | `admin@tsc.demo` | `/workspaces/admin` | Utilisateurs, rôles, droits, départements, projets, lignes budgétaires, seuils workflow |

**Hard rule** : chaque rôle voit uniquement son workspace dans la sidebar. `/dashboard` n'est plus un tableau de bord filtré; il redirige seulement vers le workspace du rôle connecté. Aucun rôle ne peut bypass le workflow. Aucun rôle ne peut modifier les enregistrements clos. Le journal d'audit est append-only — y compris pour l'Admin.

---

## 3. Workflow lifecycle

```
DRAFT
 → SUBMITTED                 (Demandeur)
 → MANAGER_REVIEW            (Approbateur hiérarchique · tier 1)
 → PROCUREMENT_REVIEW        (Achats · classification + méthode PDF + analyse offres)
 → FINANCE_REVIEW            (Approbateur hiérarchique · seuil renforcé si requis)
 → PO_CREATED                (Achats · attribution + émission PO)
 → RECEIVED                  (Réceptionnaire · GRN/SAN)
 → CLOSED                    (Achats)

Branches off-track :
 ↳ RETURNED_FOR_REVISION     (correction demandée)
 ↳ REJECTED                  (rejet motivé)
```

**Seuils d'approbation** (configurables dans `/admin/settings`) :
- < 1 000 USD : revue hiérarchique + revue achats
- 1 000–10 000 USD : + seuil renforcé par Approbateur hiérarchique
- > 10 000 USD : + visa Direction (badge visuel)

**Numérotation automatique** : `PR-YYYY-NNNN` pour les réquisitions, `PO-YYYY-NNNN` pour les bons de commande. Généré côté serveur, jamais collidable.

**Transitions verrouillées** : `src/lib/workflow.ts` → `TRANSITIONS` map + `isValidTransition()`. Toute tentative invalide est rejetée par `decideAction`.

---

## 4. Permission matrix — single source of truth

Définie dans `src/lib/permissions.ts` :
- `can(user, action, entity, ctx)` — predicate utilisé partout
- `assertCan(...)` — version qui redirige si refusé, appelée au début de chaque server action
- `getPermissionMatrix()` — exporte la matrice consommée par l'UI `/admin/settings`

**Append-only enforcés** : approvals, audit logs, goods receipts. Personne (admin compris) ne peut update/delete.

**Soft delete** : utilisateurs et données de référence sont désactivés (`active = false`), jamais hard-deleted, pour préserver l'historique.

---

## 5. Stack technique

| Couche | Choix | Raison |
|---|---|---|
| Runtime | Node 20.20.2 | LTS stable supporté par Render |
| Framework | Next.js 14.2 (App Router) | RSC, server actions, edge-ready |
| Langage | TypeScript strict | Sécurité types end-to-end |
| UI | Tailwind CSS · Inter (sans) · Lora (serif) | Charte institutionnelle, premium feel |
| Icônes | lucide-react | Léger, cohérent |
| Charts | recharts | SVG, pas de canvas |
| ORM | Prisma 5.22 | Type-safe, migrations |
| BDD | PostgreSQL 16 | Production target, schema `procureflow` |
| Validation | Zod | Forms côté serveur |
| Auth (prototype) | Cookie session simple | Sera remplacé par Keycloak en prod |

---

## 6. Architecture des dossiers

```
src/
├── app/
│   ├── (app)/                      # Routes authentifiées (sidebar + topbar)
│   │   ├── dashboard/              # Redirect uniquement vers /workspaces/<role>
│   │   ├── requisitions/           # Liste, détail, /new, server actions
│   │   │   ├── documents/          # Upload action
│   │   │   ├── new/                # Formulaire création
│   │   │   ├── [id]/               # Détail + décisions + timeline + SLA + offres
│   │   │   └── actions.ts          # createRequisitionAction, decideAction, etc.
│   │   ├── approvals/              # File d'approbation (scopée par rôle)
│   │   ├── workspaces/             # 8 workspaces séparés (requester, approver, procurement, supplier-manager, receiver, archive-audit, reporting, admin)
│   │   ├── procurement/            # Board Achats (classification + award + tracking)
│   │   ├── suppliers/              # Registre fournisseurs + détail
│   │   ├── purchase-orders/        # Liste PO
│   │   ├── receipts/               # Réceptions GRN/SAN
│   │   ├── documents/              # Explorateur documentaire
│   │   ├── reports/                # Rapports + exports CSV
│   │   ├── audit/                  # Journal d'audit (paginé)
│   │   ├── notifications/          # Centre de notifications
│   │   ├── aide/                   # Manuel utilisateur (par rôle)
│   │   ├── admin/                  # Console administrateur
│   │   │   ├── users/              # CRUD utilisateurs
│   │   │   ├── departments/        # CRUD départements
│   │   │   ├── projects/           # CRUD projets
│   │   │   ├── budget-lines/       # CRUD lignes budgétaires
│   │   │   └── settings/           # Seuils, SLA, matrice droits
│   │   ├── finance/                # Pages legacy (budget, cashflow) — encore accessibles
│   │   └── print/                  # 5 PDFs premium
│   │       ├── po/[id]/            # Bon de commande
│   │       ├── requisition/[id]/   # Réquisition
│   │       ├── receipt/[id]/       # GRN/SAN
│   │       ├── budget/             # État budgétaire
│   │       └── audit/              # Rapport d'audit
│   ├── (auth)/actions.ts           # login / quickLogin / logout
│   ├── api/export/                 # Endpoints CSV (requisitions, audit, budget)
│   ├── architecture/               # Page publique : architecture cible
│   ├── methodologie/               # Page publique : méthodologie 12 semaines
│   ├── proof/                      # Page publique : carte de conformité TDR §4
│   ├── demo/                       # Landing publique
│   ├── login/                      # Connexion (8 comptes en split-screen)
│   └── layout.tsx                  # Inter + Lora next/font
├── components/
│   ├── Sidebar.tsx                 # 8 navs distinctes par rôle
│   ├── Topbar.tsx                  # Cloche notif + badge rôle teinté
│   ├── Card / Stat / Badge         # Atoms premium (shadow-soft, gold rule)
│   ├── WorkflowTimeline.tsx        # Frise des étapes
│   ├── SlaPanel.tsx                # Suivi délais par étape
│   ├── QuoteAnalysis.tsx           # Analyse comparative offres
│   ├── PermissionsMatrix.tsx       # Affiche getPermissionMatrix()
│   ├── AttachmentsZone.tsx         # Upload fichiers (métadonnées)
│   ├── CongoMotif.tsx              # SVG décoratif Congo basin
│   ├── PrintButton.tsx             # window.print()
│   ├── print/PrintShell.tsx        # Shell premium pour PDFs
│   └── charts/                     # Donut, BudgetBars, TypeBars, CycleSparkline, CashFlowBars
└── lib/
    ├── auth.ts                     # Session cookie + requireUser
    ├── db.ts                       # Prisma singleton
    ├── enums.ts                    # 8 rôles + tous les enums comme strings
    ├── permissions.ts              # can() / assertCan() + matrice
    ├── workflow.ts                 # TRANSITIONS + STATUS_LABELS + ROLE_LABELS
    ├── sla.ts                      # computeStageTimings()
    ├── notifications.ts            # Notifications dérivées du audit log
    ├── audit.ts                    # logAudit() helper
    ├── csv.ts                      # Sérialiseur CSV (UTF-8 BOM)
    └── format.ts                   # formatCurrency / formatDate / relativeFromNow
prisma/
├── schema.prisma                   # PostgreSQL · 12 modèles
└── seed.ts                         # 8 users · 4 départements · 3 projets · 6 lignes · 8 fournisseurs · 15 réquisitions · 6 quotes · 3 PO · 2 réceptions · 30 audits
```

---

## 7. Conformité TDR §4 (livrée + renforcée)

Voir `/proof` pour la carte interactive avec liens directs vers chaque preuve. 28 exigences cartographiées :

| TDR | Statut | Preuve | Rôle |
|---|---|---|---|
| §4.1 Création/soumission | ✅ Livré | `/requisitions/new` | Demandeur |
| §4.1 Numéro auto unique | ✅ Livré | Format `PR-AAAA-NNNN` côté serveur | Système |
| §4.1 Infos clés (dépt, projet, description, quantité, budget, ligne) | ✅ Livré | Formulaire complet + référentiels Admin | Demandeur + Admin |
| §4.1 Pièces justificatives | ✅ Livré | AttachmentsZone fonctionnelle (métadonnées) | Tous |
| §4.1 Sécurité accès | ✅ Livré | Matrice droits + Keycloak en prod | Admin |
| §4.2 Validation hiérarchique selon seuils | ✅ Livré | 3 paliers configurables | Approbateur |
| §4.2 Acheminement automatique | ✅ Livré | `currentApproverRole` calculé après chaque décision | Système |
| §4.2 Notifications automatiques | ✅ Livré | `/notifications` + cloche · SMTP/SMS prod | Système |
| §4.2 Historique des décisions | ✅ Livré | Table Approval + audit log | Tous · Auditeur lit |
| §4.2 Étapes obligatoires | ✅ Livré | Machine à états + assertCan() | Système |
| §4.3 Statuts (en cours/approuvés/rejetés/clôturés) | ✅ Livré | 11 statuts · badges colorés · filtres | Tous |
| §4.3 Suivi délais par étape | ★ Renforcé | SlaPanel par requisition + SLA configurable | Tous |
| §4.3 Identification des retards | ★ Renforcé | Badge "SLA dépassé" + panels Reporting/Approver | Approbateurs · Reporting |
| §4.4 Classification 5 types | ✅ Livré | Direct, Préqualifié, Cotations, Appel d'offres, Source unique | Achats |
| §4.4 Définition étapes & responsabilités | ★ Renforcé | Matrice droits explicite dans `/admin/settings` | Admin |
| §4.4 Analyse des offres | ★ Renforcé | QuoteAnalysis : tableau comparatif tech + financier | Achats |
| §4.4 Attribution + suivi marchés | ✅ Livré | `/procurement` workspace · PO · order tracking | Achats |
| §4.5 Préqualification + diligence | ✅ Livré | Checklist + Annexe B + score | Gestionnaire Fournisseurs |
| §4.5 Suivi fournisseurs/commandes | ✅ Livré | `/suppliers`, `/purchase-orders`, `/receipts` | Tous selon rôle |
| §4.6 Module GRN | ✅ Livré | `/receipts` type=GRN | Réceptionnaire |
| §4.6 Module Service Acceptance Note | ✅ Livré | `/receipts` type=SAN | Réceptionnaire |
| §4.6 Observations + justificatifs | ✅ Livré | Notes + écarts + AttachmentsZone | Réceptionnaire |
| §4.7 Archivage sécurisé + droits | ✅ Livré | Documents par dossier + matrice droits | Système + Admin |
| §4.7 Recherche rapide documents | ★ Renforcé | `/documents` plein texte + facettes | Tous |
| §4.8 Tableau de bord interactif + KPI | ★ Renforcé | 8 workspaces distincts (1 par rôle) + Reporting KPI | Tous |
| §4.8 Suivi délais traitement | ✅ Livré | Tile "Respect des SLA" + sparkline cycle | Reporting |
| §4.8 Export Excel + PDF | ✅ Livré | 3 exports CSV + 5 PDFs premium | Reporting |
| §4.9 Profils + droits + traçabilité | ✅ Livré | `/admin/users` CRUD + matrice + audit log | Admin · Auditeur |
| **Annexe B** Lettre certification anti-corruption | ✅ Livré | Module fournisseurs + clause sur PO PDF | Gestionnaire Fournisseurs |

---

## 8. Operational runbook

### 8.1 Local development

```bash
# Prérequis : Node 20+, Docker (pour PostgreSQL local)
docker compose up -d                  # PostgreSQL local sur :5432
unset DATABASE_URL                    # éviter qu'un global override le .env
npm install
npm run db:reset                      # crée le schéma et seed les données
npm run dev                           # http://localhost:3000
```

Pour repartir d'un état propre :
```bash
npm run db:reset
```

### 8.2 Production deploy (Render)

Auto-deploy à chaque `git push origin main`. Le `buildCommand` :
```bash
npm install \
  && npm run lint \
  && npm test \
  && npx prisma generate \
  && npx prisma db push --accept-data-loss --skip-generate \
  && npx tsx prisma/seed.ts \
  && npx next build
```

**Effet** : chaque deploy reset les données en repartant du seed. C'est volontaire pour le prototype démo. Pour la production, retirer le `tsx prisma/seed.ts` et utiliser `prisma migrate deploy`.

### 8.3 Trigger un redeploy manuel

Via l'API Render :
```bash
RA="$RENDER_API"  # depuis ~/.bashrc
SID="srv-d7spglreo5us73emmu5g"
curl -X POST "https://api.render.com/v1/services/$SID/deploys" \
  -H "Authorization: Bearer $RA" \
  -H "Content-Type: application/json" \
  -d '{"clearCache":"do_not_clear"}'
```

Récupérer le statut :
```bash
curl -H "Authorization: Bearer $RA" \
  "https://api.render.com/v1/services/$SID/deploys?limit=1"
```

### 8.4 Logs

Build :
```bash
curl -H "Authorization: Bearer $RA" \
  "https://api.render.com/v1/logs?ownerId=tea-d6vircs50q8c739ltq6g&resource=$SID&type=build&direction=backward&limit=80"
```

Application :
```bash
curl -H "Authorization: Bearer $RA" \
  "https://api.render.com/v1/logs?ownerId=tea-d6vircs50q8c739ltq6g&resource=$SID&type=app&direction=backward&limit=80"
```

### 8.5 Accès direct DB production

```bash
PGPASSWORD=oKHbPO80TsWVpx0gk1LbytpWs2XC0GAp psql \
  -h dpg-d7q1405ckfvc739dvoqg-a.frankfurt-postgres.render.com \
  -p 5432 -U soko soko_815x

# Une fois connecté :
SET search_path TO procureflow;
\dt
SELECT email, role FROM "User";
```

### 8.6 Reset complet des données

```bash
psql ...
SET search_path TO procureflow;
TRUNCATE "AuditLog","Document","GoodsReceipt","Quote","PurchaseOrder",
  "Approval","PurchaseRequisition","BudgetLine","Project","Supplier",
  "User","Department","Setting" CASCADE;
\q
# Puis trigger un redeploy → le seed re-créera tout
```

### 8.7 Variables d'environnement Render

| Clé | Valeur |
|---|---|
| `NODE_VERSION` | `20.20.2` |
| `DATABASE_URL` | `postgresql://soko:****@dpg-d7q1405ckfvc739dvoqg-a/soko_815x?schema=procureflow` |
| `SESSION_COOKIE_NAME` | `tsc_session` |
| `APP_NAME` | `TSC ProcureFlow` |
| `NODE_ENV` | `production` |

---

## 9. Limitations volontaires du prototype

| Sujet | Statut prototype | Statut production cible |
|---|---|---|
| Authentification | Mot de passe en clair, cookie session 8h | **Keycloak** SSO + MFA + fédération AD |
| Stockage objet | Métadonnées seules, pas de bytes | **MinIO** S3-compatible, chiffrement repos, versioning |
| Notifications | In-app uniquement | + **SMTP** transactionnel + **SMS** (passerelle locale RDC) |
| Workflow engine | Machine à états TS | **Camunda 8** (BPMN/DMN) |
| Audit log | Append-only DB | + **hash chaîné** + contre-signature |
| Sauvegardes | Aucune | 3-2-1 + restauration mensuelle testée |
| Export PDF | Print-CSS via navigateur | + génération serveur (Puppeteer) pour batch |
| Multi-tenant | Mono-organisation | Architecture prête (rôles non-tenants) |
| HA | Single instance free tier | + réplica DB + autoscaling |
| Observabilité | Render metrics basiques | **Grafana + Prometheus + Loki** + alertes |

Voir `/architecture` (page publique) pour le détail.

---

## 10. Checklist de soumission (TDR §9)

| Élément requis | Statut |
|---|---|
| Lettre de manifestation d'intérêt au Directeur National WWF-DRC (5 pts) | À rédiger |
| Diplôme info/ingé en annexe (5 pts) | À joindre |
| CV détaillé / profil firme (10 pts) | À rédiger |
| Note méthodologique (10 pts) | Voir `/methodologie` (page publique) — peut servir de base |
| Note explicative technique (20 pts) | Voir `/architecture` + `/proof` (pages publiques) |
| Présentation expertise marchés similaires (15 pts) | À documenter |
| Références professionnelles avec contacts (10 pts) | À fournir |
| Lettre Annexe B signée (5 pts) | À signer (modèle dans le PDF original) |
| Offre financière (20 pts) | À chiffrer |
| **Total** | **80 pts technique + 20 pts financier = 100 pts** |

**Date limite** : 21 mai 2026, 17h00 Kinshasa, à `procurement@wwfdrc.org`.

---

## 11. Évolutions immédiates suggérées (post-démo)

Par ordre de valeur :
1. **Workspace Receveur enrichi** : actuellement `/workspaces/receiver` et `/receipts` sont OK mais pourraient avoir un mode "scanner / mobile" pour les missions terrain.
2. **Workflow editor visuel** dans `/admin/settings` (drag-drop des étapes) — pré-câblage Camunda.
3. **Module RFQ complet** : actuellement les quotes sont seedées; ajouter "lancer une consultation" qui envoie aux fournisseurs préqualifiés et collecte leurs réponses.
4. **Délégation temporaire** : un Approbateur en congé peut désigner un suppléant.
5. **Notifications réelles** : intégrer Mailjet/Sendgrid SMTP pour envoyer vraiment.
6. **Multi-langue** : EN en plus de FR (le code est prêt, juste à externaliser les strings).
7. **Tests automatisés** : `scripts/workspace-contract.test.ts` couvre la séparation des 8 workspaces; ajouter Playwright pour les parcours critiques.
8. **Observability** : logs structurés + traces OpenTelemetry vers Grafana.

---

## 12. Anomalies / dette technique connues

- **`/finance/budget` et `/finance/cashflow`** : pages héritées de la période où Finance était un rôle distinct. Elles sont désormais accessibles au rôle Reporting uniquement, hors sidebar principale. À supprimer ou fusionner dans `/workspaces/reporting` si elles deviennent redondantes.
- **Cross-region DB** : la DB `appeal-control-db` (paid, Virginia) est connectée à `wwf-procureflow.onrender.com` (Frankfurt) via SSL externe. La connexion fonctionne mais la latence est ~150ms par requête. Le déploiement utilise actuellement `soko-db` (free, même région) qui est plus rapide.
- **Build SSR + next/font** : le build Render fait des requêtes externes vers `fonts.googleapis.com`. Si le réseau Render bloque temporairement, le build retry 3× puis utilise les fallbacks système. Pas bloquant en pratique.
- **`prisma db push` au build** : non destructif sauf en cas de changement schema incompatible. Le seed clear+reseed à chaque deploy. À retirer pour la prod (utiliser `migrate deploy`).
- **Pas de pagination sur `/requisitions`, `/suppliers`, `/purchase-orders`** : OK avec ~15 lignes seedées mais à ajouter quand la volumétrie augmente. `/audit` et `/notifications` sont déjà paginés.

---

## 13. Contacts

| Rôle | Personne |
|---|---|
| Maintainer code | Tech Solutions Congo |
| GitHub | bunyinu (https://github.com/bunyinu) |
| Render workspace | `tea-d6vircs50q8c739ltq6g` (resolving0001@outlook.com) |
| WWF-RDC (questions tender) | mngonga@wwfdrc.org · cbuinu@wwfdrc.org · bxilunga@wwfdrc.org |
| WWF-RDC (dépôt offre) | procurement@wwfdrc.org |

---

*Document de handoff · Tech Solutions Congo · 2026 · Référence marché OEM43610*
