import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Content } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize Gemini Client with standard agent options
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Exact CV Data parsed from Camille Duroy's Portfolio Document
const CV_DATA = `
--- CAMILLE DUROY - DETAILS EXTRAITS DU PORTFOLIO ---
POSTE RECHERCHÉ / TITRE:
Cheffe de produit Marketing & Data Analyse

COORDONNÉES:
- Téléphone: 06.47.57.01.61
- Email: duroymacille@gmail.com (duroycamille@gmail.com)
- LinkedIn: LinkedIn (duroycamille)
- Localisation: France (Paris/Colissimo)

PROFIL / MISSION:
Cheffe de produit dynamique alliant de solides compétences analytiques et marketing. Expérience prouvée dans l'optimisation d'offres de livraison Hors Domicile (Colissimo), le pilotage GTM (Go-To-Market), l'analyse des indicateurs de performance (KPIs) et l'analyse géo-marketing.

EXPÉRIENCES DE CAMILLE DUROY:

1. Colissimo (Groupe La Poste) - Septembre 2024 - Septembre 2026 (Alternance)
   Poste: Cheffe de produit offre Hors Domicile
   Réalisations & Impact:
   - Stratégie et marché : étude de marché hors domicile (+9%), analyse des tendances, ciblage, positionnement et benchmark menant au lancement d’une nouvelle offre optimisée. Conception, via la veille, d’un panorama européen couvrant 24 pays des acteurs de la consigne/Locker (6 fabricants, 12 réseaux, 16 exploitants) et projection des usages à horizon 2030 (1 consigne pour < 3000 Européens).
   - Lancement et gestion de produits : adaptation des sujets Hors Domicile (HD) à la stratégie Go-To-Market (GTM) et pilotage du cycle de vie produit, identification des temps forts annuels et suivi de la performance (-15,2% d’échecs de livraison en 2025 vs 2024). Création des roadmaps d’amélioration continue, optimisation du produit et de l’expérience destinataire, et déploiement d’un plan de communication clients.
   - Analyse de la performance : suivi mensuel des KPIs (volumes colis, CA, prix moyen, segments clients, mix d’offres, pricing, marge, ROI). Élaboration du bilan annuel avec atteinte des objectifs (volume : +15%, CA : +12%) et mise en œuvre d’actions correctrices. Réseau voisins-relais : analyse approfondie pour stabiliser et performer le réseau (-50% de voisins-relais en France métropolitaine).
   - Analyse géo-marketing : optimisation du réseau national de points de retrait selon la proximité destinataires (82% de la population à < 5 km) et la performance/disponibilité, entraînant une réduction de 35% de points de retrait (hors voisins-relais) et l'optimisation des tournées d'approvisionnement. Objectif final : réduction des coûts et diminution de -20% sur le tarif général.
   - Marketing opérationnel : création de contenus et argumentaires pour les équipes commerciales afin de structurer les approches clients et contrer la concurrence.

2. Sopra Steria (I2S) - Juillet 2023 - Janvier 2024 (Stage de 6 mois)
   Poste: Assistante Marketing & Communication
   Réalisations & Thèmes:
   - Stratégie : veille concurrentielle pour le développement de nouvelles offres de cybersécurité.
   - Marketing opérationnel : création de visuels, présentations, flyers, kakémonos (roll-ups) et vidéos promotionnelles pour des événements ciblés.
   - Gestion de la communication : organisation et présentation de webinaires hebdomadaires (100 participants) portant sur des sujets de cybersécurité ou de stockage de données (cœurs de métier de la filiale).
   - Événementiel : pilotage de bout en bout d’événements internes et externes (programmation, listes d'invités, lieux, prestataires, animations) réunissant jusqu’à 260 participants.

CERTIFICATIONS, LOGICIELS & MAÎTRISES:
- Analyse : Excel (Tableaux Croisés Dynamiques - TCD), Google Analytics, Power BI, Contentsquare, Techaway data analysis.
- CRM & Automatisation : Hubspot, Salesforce.
- Gestion de projet : Jira, Trello, Asana, Planner.
- Création : PowerPoint, Canva, Capcut, Suite Adobe (Photoshop, Illustrator, Premiere, etc.).

LANGUES:
- Anglais : B2 (Intermédiaire supérieur)
- Espagnol : A2 (Élémentaire)
- Langue des signes : A2 (Élémentaire)

CENTRES D'INTÉRÊT / HOBBIES:
- Psychologie
- Tennis (Classée 30/5)
- Piano (10 ans de pratique passionnée)

RÉFÉRENCES:
- Contacts de référence de ses tuteurs de stage/alternance transmissibles sur demande.
- Cécile Fouchet (Responsable Gamme Hors Domicile chez Colissimo)
- Paul Bianchi (Responsable Gamme Retour chez Colissimo)
`;

const SYSTEM_INSTRUCTION = `
You are the AI Voice Assistant representing Camille Duroy, a specialized Product Manager in Marketing & Data Analysis. Your mission is to provide recruiters with clear, accurate, and appealing information regarding Camille's achievements and profile.

CRITICAL DIRECTIVES:
1. Greeter / Starting Phrase Constraint:
   Every recruiter conversation must start with: "Hello i am Camille duroy voice agent, how can I help you ?" (or if they speak French: "Bonjour, je suis l'agent vocal de Camille Duroy, comment puis-je vous aider ?").
   
2. Interactive Speaking & Conversational Style:
   - Keep answers friendly, professional, structured, yet concise (1 to 4 sentences is perfect). Why? Because your answers are intended to be read aloud via Text-to-Speech (TTS). 
   - Speak on behalf of Camille as her smart interactive voice concierge. E.g. "Camille has worked as standard PM...", "At Colissimo, Camille accomplished...", "Yes, Camille is certified in Power BI and Excel...".
   - Use direct, highly professional corporate vocabulary.

3. Complete Languages Flexibility (French & English):
   - You must detect and adapt instantly to the language of the prompt. If the user asks in French, reply in French. If they ask in English, reply in English.
   - Encourage them to try voice inputs and explore Camille's interactive contact details.

4. Rigorous Truthfulness:
   - Rely ONLY on Camille's specified CV details: ${CV_DATA}.
   - Never hallucinate unmentioned companies, dates, or grades. If something is unknown, politely suggest related things Camille is certified in or say: "I don't have that specific detail on Camille's file, but she'd love to discuss it with you. You can reach her at duroycamille@gmail.com!"
`;

// API endpoint for chatbot query
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Adapt to manual or historical arrays
    const formattedHistory: Content[] = (history || []).map((step: any) => ({
      role: step.role === "user" ? "user" : "model",
      parts: [{ text: step.text }],
    }));

    // Spawn chat
    const chat = ai.chats.create({
      model: "gemini-3.5-flash",
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.65,
      },
      history: formattedHistory,
    });

    const output = await chat.sendMessage({ message });
    res.json({ text: output.text });
  } catch (err: any) {
    console.error("Gemini server error:", err);
    res.status(500).json({ error: err.message || "An internal error occurred" });
  }
});

// Start integration with Vite or production dist folder
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
