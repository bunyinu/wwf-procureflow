export const WWF_TDR = {
  sourcePdf: "/home/lus/Pictures/wwf_260430_01_07.pdf",
  envelopeId: "F63BFA61-89DD-8085-8369-8F01E77E06BF",
  client: "WWF-RDC",
  title:
    "Recrutement d’un consultant IT pour le développement d’une application web de gestion électronique du processus d’achat",
  projects: ["OD-40001336", "OD-403725"],
  publicationDate: "30 avril 2026",
  questionDeadline: "14 mai 2026",
  submissionDeadline: "21 mai 2026 à 17h00, heure de Kinshasa",
  publicationSite: "Media Congo",
  questionEmails: ["mngonga@wwfdrc.org", "cbuinu@wwfdrc.org", "bxilunga@wwfdrc.org"],
  submissionEmail: "procurement@wwfdrc.org",
  duration: "3 mois maximum à partir de la signature du contrat",
  offerObject:
    "Consultant IT développement d’une application web de gestion électronique du processus d’achat",
} as const;

export const WWF_TDR_OBJECTIVES = [
  "Gestion électronique des réquisitions d’achat",
  "Automatisation des validations",
  "Suivi des processus d’achat",
  "Archivage des documents",
  "Gestion de la réception des biens et services",
] as const;

export const WWF_FUNCTIONAL_REQUIREMENTS = [
  {
    section: "4.1",
    title: "Gestion des réquisitions d’achat",
    requirements: [
      "Création et soumission électronique des réquisitions",
      "Attribution automatique d’un numéro unique",
      "Informations clés : département, projet, description, quantité, budget, ligne budgétaire",
      "Ajout de pièces justificatives",
      "Sécurisation des accès et sauvegarde des données",
    ],
  },
  {
    section: "4.2",
    title: "Workflow de validation et d’approbation",
    requirements: [
      "Validation hiérarchique selon les seuils",
      "Acheminement automatique des demandes",
      "Notifications automatiques",
      "Historique complet des décisions",
      "Structuration obligatoire des étapes du processus",
    ],
  },
  {
    section: "4.3",
    title: "Suivi des processus d’achat",
    requirements: [
      "Identification des processus en cours, approuvés, rejetés ou clôturés",
      "Suivi des délais par étape",
      "Identification des retards",
      "Visualisation claire de l’état d’avancement",
    ],
  },
  {
    section: "4.4",
    title: "Classification, offres et attribution",
    requirements: [
      "Classification : achat direct, fournisseur préqualifié, cotations multiples, appel d’offres, source unique",
      "Définition des étapes et responsabilités",
      "Analyse des offres",
      "Attribution et suivi des marchés",
    ],
  },
  {
    section: "4.5",
    title: "Gestion des fournisseurs",
    requirements: [
      "Gestion et préqualification des fournisseurs",
      "Diligence raisonnable",
      "Suivi des fournisseurs et commandes",
      "Gestion des relations fournisseurs",
    ],
  },
  {
    section: "4.6",
    title: "Réception des biens et services",
    requirements: [
      "Module Goods Receipt Note (GRN)",
      "Module Service Acceptance Note",
      "Validation des livraisons et services",
      "Ajout d’observations et justificatifs",
    ],
  },
  {
    section: "4.7",
    title: "Archivage électronique et gestion documentaire",
    requirements: [
      "Archivage sécurisé de tous les documents",
      "Gestion des droits d’accès",
      "Traçabilité des actions",
      "Recherche rapide des documents",
    ],
  },
  {
    section: "4.8",
    title: "Tableau de bord et reporting",
    requirements: [
      "Tableau de bord interactif",
      "Suivi des réquisitions par statut",
      "Suivi des délais de traitement",
      "Indicateurs de performance",
      "Exportation des données Excel et PDF",
    ],
  },
  {
    section: "4.9",
    title: "Gestion des utilisateurs",
    requirements: [
      "Gestion des profils utilisateurs",
      "Gestion des droits d’accès",
      "Traçabilité des actions",
    ],
  },
] as const;

export const WWF_EXPECTED_METHODOLOGY = [
  "Analyse des besoins des utilisateurs",
  "Conception du système : architecture et design",
  "Développement et tests",
  "Déploiement du système",
  "Formation des utilisateurs",
  "Assistance technique après déploiement",
] as const;

export const WWF_EXPECTED_DELIVERABLES = [
  "Rapport d’analyse des besoins",
  "Architecture technique du système",
  "Prototype ou version pilote",
  "Version finale du logiciel web",
  "Manuel utilisateur simple",
  "Manuel technique du système",
  "Rapport final de mission",
] as const;

export const WWF_EVALUATION_CRITERIA = [
  {
    group: "Technique",
    label: "Lettre de manifestation d’intérêt adressée au Directeur National du WWF-DRC",
    points: 5,
  },
  {
    group: "Technique",
    label: "Diplôme en informatique, ingénierie logicielle ou domaine équivalent",
    points: 5,
  },
  {
    group: "Technique",
    label: "Curriculum vitae détaillé du candidat ou profil de la firme",
    points: 10,
  },
  {
    group: "Technique",
    label: "Brève présentation de l’approche méthodologique",
    points: 10,
  },
  {
    group: "Technique",
    label: "Note explicative technique du logiciel en rapport avec les Termes de Référence",
    points: 20,
  },
  {
    group: "Technique",
    label: "Expertise sur des marchés similaires en applications web, systèmes de gestion ou ERP",
    points: 15,
  },
  {
    group: "Technique",
    label: "Références professionnelles avec contacts, emails et téléphones",
    points: 10,
  },
  {
    group: "Technique",
    label: "Annexe B : lettre de certification et engagement dûment remplie et signée",
    points: 5,
  },
  {
    group: "Financière",
    label: "Offre financière",
    points: 20,
  },
] as const;

export const WWF_TECHNICAL_SCORE = 80;
export const WWF_FINANCIAL_SCORE = 20;
export const WWF_TOTAL_SCORE = 100;

