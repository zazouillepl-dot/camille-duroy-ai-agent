import { CVData } from "./types";

export const cvData: CVData = {
  name: "Camille Duroy",
  title: "Cheffe de produit Marketing & Data Analyse",
  phone: "06.47.57.01.61",
  email: "duroycamille@gmail.com",
  linkedin: "https://www.linkedin.com/in/duroycamille",
  languages: [
    { name: "Anglais", level: "B2 (Intermédiaire supérieur)" },
    { name: "Espagnol", level: "A2 (Élémentaire)" },
    { name: "Langue des Signes", level: "A2 (Élémentaire)" }
  ],
  interests: [
    { name: "Psychologie", detail: "Compréhension des comportements et biais décisionnels" },
    { name: "Tennis", detail: "Classée 30/5" },
    { name: "Piano", detail: "10 ans de pratique passionnée" }
  ],
  experiences: [
    {
      company: "Colissimo (Groupe La Poste)",
      role: "Cheffe de produit offre Hors Domicile",
      period: "Septembre 2024 - Septembre 2026",
      type: "Alternance",
      bullets: [
        "Stratégie et marché : étude de marché hors domicile (+9%), analyse des tendances, ciblage, positionnement et benchmark menant au lancement d’une nouvelle offre optimisée. Conception d’un panorama européen couvrant 24 pays des acteurs de la consigne/Locker et projection des usages à horizon 2030.",
        "Lancement et gestion de produits : adaptation des sujets Hors Domicile à la stratégie Go-To-Market (GTM) et pilotage du cycle de vie produit, suivi de la performance (-15,2% d’échecs de livraison en 2025 vs 2024). Création de roadmaps de rétroaction, optimisation du produit et de l’expérience destinataire.",
        "Analyse de la performance : suivi mensuel des indicateurs clés (volumes colis, CA, prix moyen, segments clients, mix d’offres, pricing, marge, ROI). Élaboration du bilan annuel (volume: +15%, CA: +12%).",
        "Analyse géo-marketing : optimisation du réseau national de points de retrait selon la proximité destinataires (82% de la population à < 5 km), réduisant de -35% les points inactifs pour optimiser les coûts et proposer une réduction de -20% sur le tarif général.",
        "Marketing opérationnel : création de contenus et argumentaires d'aide à la vente pour armer les équipes commerciales et faire face à la concurrence."
      ]
    },
    {
      company: "Sopra Steria (I2S)",
      role: "Assistante Marketing & Communication",
      period: "Juillet 2023 - Janvier 2024",
      type: "Stage (6 mois)",
      bullets: [
        "Stratégie de veille : veille concurrentielle active pour stimuler le développement de nouvelles offres de cybersécurité.",
        "Marketing opérationnel : création de supports visuels, présentations, flyers d'offres commerciales, kakémonos et vidéos de démonstration pour les salons et événements.",
        "Communication interne & externe : organisation, modération et présentation de webinaires hebdomadaires (environ 100 participants) portant sur la cybersécurité et l'intelligence de données.",
        "Événementiel : pilotage de A à Z d’événements phares internes et externes (programmation, traiteur, intervenants, logistique, animations) pour des audiences atteignant 260 participants."
      ]
    }
  ],
  certifications: [
    {
      category: "Data & Analyse",
      skills: ["Excel (TCD, formules complexes)", "Google Analytics", "Power BI", "Contentsquare", "Techaway data analysis"]
    },
    {
      category: "CRM & Automatisation",
      skills: ["Hubspot", "Salesforce"]
    },
    {
      category: "Gestion de Projet",
      skills: ["Jira", "Trello", "Asana", "Planner"]
    },
    {
      category: "Création & Design",
      skills: ["PowerPoint", "Canva", "Capcut", "Adobe Creative Suite (Photoshop, Illustrator, Premiere)"]
    }
  ],
  education: [
    {
      degree: "Master Programme Grande Ecole (Spécialisation: Marketing)",
      school: "ESCE PARIS",
      period: "2021 - 2026"
    },
    {
      degree: "Baccalauréat Général",
      school: "Lycée Alexandre Dumas",
      period: "2018 - 2021"
    }
  ],
  references: [
    {
      name: "Cécile Fouchet",
      company: "Colissimo",
      title: "Responsable Gamme Hors Domicile"
    },
    {
      name: "Paul Bianchi",
      company: "Colissimo",
      title: "Responsable Gamme Retour"
    }
  ]
};
