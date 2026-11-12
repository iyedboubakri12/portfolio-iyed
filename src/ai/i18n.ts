import { useEffect, useState } from 'react'

export type Lang = 'en' | 'fr'

const KEY = 'iyedai-lang'
const EVT = 'iyedai:lang'

function initialLang(): Lang {
  try {
    const saved = localStorage.getItem(KEY)
    if (saved === 'en' || saved === 'fr') return saved
  } catch {
    /* storage unavailable */
  }
  return typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('fr') ? 'fr' : 'en'
}

let current: Lang = typeof window === 'undefined' ? 'en' : initialLang()

export function setLang(l: Lang) {
  current = l
  try {
    localStorage.setItem(KEY, l)
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent(EVT, { detail: l }))
}

export function useLang(): [Lang, (l: Lang) => void] {
  const [lang, set] = useState<Lang>(current)
  useEffect(() => {
    const on = (e: Event) => set((e as CustomEvent<Lang>).detail)
    window.addEventListener(EVT, on)
    return () => window.removeEventListener(EVT, on)
  }, [])
  return [lang, setLang]
}

const FR_HINTS = /\b(le|la|les|est|une|des|il|elle|quel|quelle|quels|compétences|expérience|projet|pourquoi|comment|avec|pour|sur|ses|son|peut|a-t-il|est-ce|bonjour|merci|poste)\b|[éèêàùç]/gi
const EN_HINTS = /\b(the|is|what|which|how|why|does|has|have|his|with|for|about|experience|skills|project|role|hello|thanks|can)\b/gi

/** Language of a recruiter message; falls back to the UI language when unclear. */
export function detectLang(text: string, fallback: Lang): Lang {
  const fr = (text.match(FR_HINTS) ?? []).length
  const en = (text.match(EN_HINTS) ?? []).length
  if (fr === en) return fallback
  return fr > en ? 'fr' : 'en'
}

export const T = {
  en: {
    assistantName: 'Iyed AI',
    assistantRole: 'Technical recruiter assistant',
    open: 'Ask Iyed AI',
    close: 'Close assistant',
    online: 'Live AI',
    offline: 'Knowledge-base mode',
    welcome: "Hi! I'm Iyed AI. I can help you explore Iyed's technical skills, projects, experience, and potential fit for your team. What would you like to know?",
    grounded: 'Answers come only from Iyed’s verified portfolio content. If something is not documented, I will say so.',
    placeholder: 'Ask about skills, projects, experience…',
    send: 'Send',
    stop: 'Stop',
    newChat: 'New chat',
    tabs: { chat: 'Chat', job: 'Job match', interview: 'Interview' },
    suggestions: [
      'What are Iyed’s strongest technical skills?',
      'Tell me about his DevSecOps project.',
      'What experience does he have with Kubernetes?',
      'Has he worked with Terraform?',
      'What is his experience with AWS and Azure?',
      'What makes him a good candidate for a Junior DevOps role?',
      'Is he open to relocation?',
      'How can I contact him?',
    ],
    quick: {
      skills: 'Explore skills',
      projects: 'Explore projects',
      job: 'Analyze a job description',
      interview: 'Technical interview',
      cv: 'Download CV',
      contact: 'Contact Iyed',
      summary: 'Candidate summary',
      architecture: 'Interactive architecture',
    },
    sources: 'Sources',
    fallbackNote: 'Answered from the knowledge base (AI model unavailable).',
    convert: { text: 'Want to take this further?', email: 'Email Iyed', cv: 'Download CV', dismiss: 'Dismiss' },
    errors: {
      generic: 'Something went wrong. Please try again.',
      network: 'Network error. Check your connection and try again.',
      rate: 'Too many questions in a short time. Please wait a moment.',
    },
    job: {
      title: 'Job description analyzer',
      intro: 'Paste a job description. Skills are matched against documented evidence first; the AI then writes an honest assessment and interview questions.',
      placeholder: 'Paste the job description here (at least a few lines)…',
      analyze: 'Analyze fit',
      analyzing: 'Analyzing…',
      sample: 'Try a sample',
      coverage: 'Evidence-based coverage',
      coverageHint: 'Share of recognised requirements with hands-on evidence (training counts partially).',
      matched: 'Matching evidence',
      partial: 'Training only',
      missing: 'Not documented',
      none: 'None',
      years: (n: number) => `The role asks for ${n}+ years. Iyed's experience is internships plus a 6-month final-year project (2024–2026).`,
      senior: 'The description signals a senior role. Iyed is a junior profile.',
      unrecognised: 'No known skill keywords found. The AI analysis below still reads the full text.',
      aiTitle: 'AI assessment',
      tooShort: 'Please paste a longer job description (80 characters minimum).',
    },
    interview: {
      title: 'Technical interview mode',
      intro: 'Pick a topic. Each question shows what a strong answer covers and where Iyed’s documented work relates to it.',
      level: 'Evidence level',
      lookFor: 'A strong answer covers',
      evidence: 'Link to Iyed’s work',
      generate: 'Generate more questions with AI',
      followUp: 'Ask for a harder question, a follow-up, or an evaluation hint…',
      generating: 'Generating…',
    },
  },
  fr: {
    assistantName: 'Iyed AI',
    assistantRole: 'Assistant pour recruteurs techniques',
    open: 'Demander à Iyed AI',
    close: "Fermer l'assistant",
    online: 'IA active',
    offline: 'Mode base de connaissances',
    welcome: "Bonjour ! Je suis Iyed AI. Je peux vous aider à explorer les compétences techniques, les projets, l'expérience d'Iyed et son adéquation avec votre équipe. Que souhaitez-vous savoir ?",
    grounded: "Les réponses viennent uniquement du contenu vérifié du portfolio d'Iyed. Si une information n'est pas documentée, je le dirai.",
    placeholder: 'Posez une question sur ses compétences, projets, expérience…',
    send: 'Envoyer',
    stop: 'Arrêter',
    newChat: 'Nouvelle conversation',
    tabs: { chat: 'Chat', job: 'Offre', interview: 'Entretien' },
    suggestions: [
      'Quelles sont les compétences techniques les plus solides d’Iyed ?',
      'Parle-moi de son projet DevSecOps.',
      'Quelle expérience a-t-il avec Kubernetes ?',
      'A-t-il travaillé avec Terraform ?',
      'Quelle est son expérience sur AWS et Azure ?',
      'Pourquoi serait-il un bon candidat pour un poste DevOps junior ?',
      'Est-il ouvert à une relocalisation ?',
      'Comment le contacter ?',
    ],
    quick: {
      skills: 'Explorer les compétences',
      projects: 'Explorer les projets',
      job: 'Analyser une offre',
      interview: 'Entretien technique',
      cv: 'Télécharger le CV',
      contact: 'Contacter Iyed',
      summary: 'Synthèse candidat',
      architecture: 'Architecture interactive',
    },
    sources: 'Sources',
    fallbackNote: 'Réponse tirée de la base de connaissances (modèle IA indisponible).',
    convert: { text: 'Envie d’aller plus loin ?', email: 'Écrire à Iyed', cv: 'Télécharger le CV', dismiss: 'Masquer' },
    errors: {
      generic: 'Une erreur est survenue. Réessayez.',
      network: 'Erreur réseau. Vérifiez votre connexion et réessayez.',
      rate: 'Trop de questions en peu de temps. Patientez un instant.',
    },
    job: {
      title: "Analyseur d'offre d'emploi",
      intro: "Collez une offre. Les compétences sont d'abord comparées aux preuves documentées ; l'IA rédige ensuite une évaluation honnête et des questions d'entretien.",
      placeholder: "Collez l'offre d'emploi ici (quelques lignes au minimum)…",
      analyze: "Analyser l'adéquation",
      analyzing: 'Analyse…',
      sample: 'Essayer un exemple',
      coverage: 'Couverture prouvée',
      coverageHint: 'Part des exigences reconnues couvertes par une preuve pratique (la formation compte partiellement).',
      matched: 'Preuves correspondantes',
      partial: 'Formation uniquement',
      missing: 'Non documenté',
      none: 'Aucune',
      years: (n: number) => `Le poste demande ${n} an(s) ou plus. L'expérience d'Iyed : des stages et un PFE de 6 mois (2024–2026).`,
      senior: "L'offre vise un profil senior. Iyed est un profil junior.",
      unrecognised: "Aucun mot-clé de compétence connu. L'analyse IA ci-dessous lit tout de même le texte complet.",
      aiTitle: 'Évaluation IA',
      tooShort: "Collez une offre plus longue (80 caractères minimum).",
    },
    interview: {
      title: 'Mode entretien technique',
      intro: "Choisissez un thème. Chaque question indique ce que couvre une bonne réponse et le lien avec le travail documenté d'Iyed.",
      level: 'Niveau de preuve',
      lookFor: 'Une bonne réponse couvre',
      evidence: "Lien avec le travail d'Iyed",
      generate: "Générer d'autres questions avec l'IA",
      followUp: 'Demandez une question plus difficile, une relance ou un critère d’évaluation…',
      generating: 'Génération…',
    },
  },
} as const

export type Strings = (typeof T)['en']
