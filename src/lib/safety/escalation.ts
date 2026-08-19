import { EscalationLevel, RiskLevel, TrustedContact } from "@/types";

export interface EscalationDecision {
  level: EscalationLevel;
  shouldNotifyContacts: boolean;
  contactsToNotify: TrustedContact[];
  shouldPromptCheckIn: boolean;
  shouldPromptSOS: boolean;
  message: string;
}

/**
 * Intelligent Safety Escalation Resolver
 * Determines action protocols based on AI risk assessment and user preferences.
 */
export function determineEscalation(
  riskLevel: RiskLevel,
  riskScore: number,
  contacts: TrustedContact[],
  isOverdueCheckIn: boolean
): EscalationDecision {
  if (riskScore >= 76 || isOverdueCheckIn) {
    const highRiskContacts = contacts.filter((c) => c.notifyOnHighRisk || c.notifyOnSos);
    return {
      level: "CRITICAL",
      shouldNotifyContacts: true,
      contactsToNotify: highRiskContacts,
      shouldPromptCheckIn: true,
      shouldPromptSOS: true,
      message: "Critical safety anomaly detected. Escalating alert to trusted contacts.",
    };
  }

  if (riskScore >= 51) {
    const highRiskContacts = contacts.filter((c) => c.notifyOnHighRisk);
    return {
      level: "HIGH",
      shouldNotifyContacts: highRiskContacts.length > 0,
      contactsToNotify: highRiskContacts,
      shouldPromptCheckIn: true,
      shouldPromptSOS: false,
      message: "Elevated risk signals present. Proactive safety check-in recommended.",
    };
  }

  if (riskScore >= 26) {
    return {
      level: "LOW",
      shouldNotifyContacts: false,
      contactsToNotify: [],
      shouldPromptCheckIn: false,
      shouldPromptSOS: false,
      message: "Moderate conditions. Standard monitoring active.",
    };
  }

  return {
    level: "NONE",
    shouldNotifyContacts: false,
    contactsToNotify: [],
    shouldPromptCheckIn: false,
    shouldPromptSOS: false,
    message: "Journey conditions safe.",
  };
}
