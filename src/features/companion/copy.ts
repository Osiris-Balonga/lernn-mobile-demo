import type { CompanionActionType, CompanionSession } from "./types"

type Locale = "fr" | "en"

export function companionCopy(locale: Locale) {
  return locale === "en" ? enCompanionCopy : frCompanionCopy
}

export function getCompanionSessionTitle(session: CompanionSession) {
  return getCompanionActionLabel(session.action)
}

export function getCompanionActionLabel(action: CompanionActionType) {
  switch (action) {
    case "STUDENT_PHOTO":
    case "STUDENT_PHOTO_BATCH":
      return "Photos élèves"
    case "GATE_SCANNER":
      return "Scan entrée"
    case "COURSE_ATTENDANCE_ROUNDS":
      return "Appels de cours"
    case "DOCUMENT_VERIFY":
      return "Vérification document"
  }
}

export function getCompanionActionDescription(action: CompanionActionType) {
  switch (action) {
    case "STUDENT_PHOTO":
    case "STUDENT_PHOTO_BATCH":
      return "Préparer la prise ou le contrôle de photos élèves depuis le téléphone."
    case "GATE_SCANNER":
      return "Scanner les cartes Lernn pour enregistrer les entrées et les sorties."
    case "COURSE_ATTENDANCE_ROUNDS":
      return "Accompagner une tournée d'appel liée à un ou plusieurs cours."
    case "DOCUMENT_VERIFY":
      return "Vérifier un document ou un justificatif depuis une session temporaire."
  }
}

export function formatCompanionExpiry(
  session: CompanionSession,
  locale: Locale
) {
  const expiresAt = new Date(session.expiresAt)
  if (Number.isNaN(expiresAt.getTime())) {
    return locale === "en" ? "Temporary session" : "Session temporaire"
  }

  return locale === "en"
    ? `Expires ${expiresAt.toLocaleString("en", {
        dateStyle: "short",
        timeStyle: "short",
      })}`
    : `Expire le ${expiresAt.toLocaleString("fr", {
        dateStyle: "short",
        timeStyle: "short",
      })}`
}

const frCompanionCopy = {
  accountHomeDescription:
    "Ce compte peut recevoir des espaces personnels et ouvrir des sessions compagnon temporaires.",
  accountHomeTitle: "Compte Lernn",
  activeSessions: "Sessions compagnon actives",
  bind: "Lier au compte",
  bindDescription:
    "Cette session restera séparée de vos profils personnels et pourra être retrouvée depuis le switcher.",
  bound: "Session ajoutée au compte.",
  companion: "Compagnon",
  companionSpaces: "Espaces",
  emptySessions:
    "Aucune session compagnon active sur ce téléphone pour le moment.",
  forbidden: "Cette session n'est pas accessible avec ce compte.",
  invalid: "Session compagnon introuvable ou terminée.",
  loading: "Chargement de la session compagnon...",
  loginToBind: "Se connecter pour lier",
  notificationsEmpty:
    "Les notifications de compte sans profil seront affichées ici quand l'API les exposera.",
  openTemporary: "Ouvrir temporairement",
  pasteInvitation: "Accepter une invitation",
  placeholder:
    "Cette action n'est pas encore disponible dans l'application mobile.",
  scanCompanionQr: "Scanner un QR compagnon",
  scanHint: "Scannez le QR compagnon affiché dans Lernn.",
  switchSpacesDescription:
    "Choisissez un profil personnel ou une session compagnon active.",
  unavailable: "Impossible de charger cette session pour le moment.",
}

const enCompanionCopy = {
  accountHomeDescription:
    "This account can receive personal spaces and open temporary companion sessions.",
  accountHomeTitle: "Lernn account",
  activeSessions: "Active companion sessions",
  bind: "Link to account",
  bindDescription:
    "This session stays separate from your personal profiles and can be found from the switcher.",
  bound: "Session added to the account.",
  companion: "Companion",
  companionSpaces: "Spaces",
  emptySessions: "No active companion session on this phone yet.",
  forbidden: "This session is not available for this account.",
  invalid: "Companion session not found or closed.",
  loading: "Loading companion session...",
  loginToBind: "Sign in to link",
  notificationsEmpty:
    "Notifications for accounts without a profile will appear here when the API exposes them.",
  openTemporary: "Open temporarily",
  pasteInvitation: "Accept an invitation",
  placeholder: "This action is not available in the mobile app yet.",
  scanCompanionQr: "Scan companion QR",
  scanHint: "Scan the companion QR shown in Lernn.",
  switchSpacesDescription:
    "Choose a personal profile or an active companion session.",
  unavailable: "Unable to load this session right now.",
}
