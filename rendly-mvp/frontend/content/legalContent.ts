/**
 * Legal content for Rendly by Anoryx Tech Solutions Pvt Ltd.
 * Company: https://www.anoryxtechsolutions.com
 * Products: https://www.anoryxtechsolutions.com/products
 * Support: team@anoryxtechsolutions.com
 * CEO: afnan.ceo@anoryxtechsolutions.com
 */

export const COMPANY = {
  name: 'Anoryx Tech Solutions Pvt Ltd',
  appName: 'Rendly',
  website: 'https://www.anoryxtechsolutions.com',
  products: 'https://www.anoryxtechsolutions.com/products',
  supportEmail: 'team@anoryxtechsolutions.com',
  ceoEmail: 'afnan.ceo@anoryxtechsolutions.com',
} as const;

export const TERMS_EFFECTIVE = '1 March 2025';
export const TERMS_LAST_UPDATED = '1 March 2025';
export const PRIVACY_EFFECTIVE = '1 March 2025';
export const PRIVACY_LAST_UPDATED = '1 March 2025';

export type LegalSection = {
  title: string;
  level: 2 | 3 | 4;
  paragraphs?: string[];
  list?: string[];
  numbered?: string[];
  /** Paragraphs to show after a list (for flow like intro, list, then more text) */
  paragraphsAfterList?: string[];
};

export const TERMS_SECTIONS: LegalSection[] = [
  {
    title: 'Introduction',
    level: 2,
    paragraphs: [
      `Welcome to ${COMPANY.appName}, a social matching platform operated by ${COMPANY.name}. By using Rendly, you connect with others based on shared intents and interests. These Terms of Service govern your use of our application.`,
      `Effective date: ${TERMS_EFFECTIVE}. Last updated: ${TERMS_LAST_UPDATED}.`,
      `For questions, contact us at ${COMPANY.supportEmail} or ${COMPANY.ceoEmail}. Visit ${COMPANY.website} or ${COMPANY.products} for more information.`,
    ],
  },
  {
    title: 'Acceptance of Terms',
    level: 2,
    paragraphs: [
      'By accessing or using Rendly, you agree to be bound by these Terms of Service. If you do not agree, you may not use the application. We reserve the right to refuse service to anyone at our discretion.',
    ],
  },
  {
    title: 'Use License',
    level: 2,
    paragraphs: [
      `We grant you a limited, non-exclusive, non-transferable license to use Rendly for personal, non-commercial use in accordance with these terms. You may use the application for its intended purpose: connecting with others, participating in matches, video calls, messaging, and huddles.`,
      'You may not copy, modify, distribute, sell, or create derivative works from the application. You may not reverse-engineer or attempt to extract source code. Your license is revocable at any time.',
    ],
  },
  {
    title: 'User Responsibilities & Conduct',
    level: 2,
    paragraphs: [
      'You must provide accurate information when registering and keep your account secure. You are responsible for all activity under your account.',
      'You must not engage in the following:',
    ],
    list: [
      'Harassment, bullying, threats, or hate speech',
      'Sharing explicit, illegal, or inappropriate content',
      'Spamming, scams, fraud, or phishing',
      'Impersonating others or misrepresenting your identity',
      'Hacking, unauthorized access, or abuse of platform features',
      'Violating any applicable laws or third-party rights',
    ],
    paragraphsAfterList: [
      'We may issue warnings, suspend, or permanently ban accounts for violations. Serious violations may be reported to authorities.',
    ],
  },
  {
    title: 'Content Ownership & Rights',
    level: 2,
    paragraphs: [
      'You retain ownership of content you create (profile, messages, media). By posting content, you grant Rendly and Anoryx Tech Solutions a non-exclusive, royalty-free license to use, store, and display it for operating the platform.',
      'Rendly\'s logos, interface, features, and branding are our intellectual property. You may not claim ownership of or copy our platform design or content.',
    ],
  },
  {
    title: 'Third-Party Services',
    level: 2,
    paragraphs: [
      'Rendly uses third-party services including OAuth providers (LinkedIn, GitHub) for authentication. We are not responsible for their policies or availability. Your use of those services is subject to their terms and privacy policies.',
      'We do not endorse and are not liable for third-party content or services.',
    ],
  },
  {
    title: 'Disclaimer of Warranties',
    level: 2,
    paragraphs: [
      'Rendly is provided "as is" and "as available" without warranties of any kind. We do not guarantee uninterrupted, error-free, or secure operation. Your use of the service is at your own risk.',
    ],
  },
  {
    title: 'Indemnification',
    level: 2,
    paragraphs: [
      'You agree to indemnify and hold harmless Anoryx Tech Solutions Pvt Ltd, its officers, and employees from any claims, damages, or expenses arising from your use of Rendly, your content, or your violation of these terms.',
    ],
  },
  {
    title: 'Termination',
    level: 2,
    paragraphs: [
      'You may close your account at any time. We may suspend or terminate your account for violations of these terms. Upon termination, your right to use Rendly ceases. We may retain certain data as required by law or for legitimate purposes. Provisions that by nature should survive (e.g. indemnification, disclaimers) will remain in effect.',
    ],
  },
  {
    title: 'Governing Law & Jurisdiction',
    level: 2,
    paragraphs: [
      'These terms are governed by the laws of the jurisdiction in which Anoryx Tech Solutions Pvt Ltd operates. Any disputes shall be resolved in the appropriate courts. These terms constitute the entire agreement between you and us regarding Rendly.',
    ],
  },
  {
    title: 'Contact & Amendments',
    level: 2,
    paragraphs: [
      'For questions about these terms, contact us at team@anoryxtechsolutions.com or afnan.ceo@anoryxtechsolutions.com. We may update these terms from time to time; we will notify users of material changes. Continued use after changes constitutes acceptance.',
    ],
  },
];

export const PRIVACY_SECTIONS: LegalSection[] = [
  {
    title: 'Introduction & Scope',
    level: 2,
    paragraphs: [
      `This Privacy Policy describes how ${COMPANY.name} collects, uses, and protects your information when you use Rendly. It applies to our application, website, and related services.`,
      `Effective date: ${PRIVACY_EFFECTIVE}. Last updated: ${PRIVACY_LAST_UPDATED}. Contact: ${COMPANY.supportEmail}, ${COMPANY.ceoEmail}. ${COMPANY.website} | ${COMPANY.products}.`,
    ],
  },
  {
    title: 'Information We Collect',
    level: 2,
  },
  {
    title: 'Information You Provide',
    level: 3,
    list: [
      'Account and registration data (name, email, profile picture)',
      'OAuth data from LinkedIn and GitHub (as you authorize)',
      'Profile details (interests, intents, bio, location)',
      'Messages, call data, and huddle chat content',
      'Media you upload (images, videos)',
      'Feedback and support communications',
    ],
  },
  {
    title: 'Information Collected Automatically',
    level: 3,
    list: [
      'Device type, OS, and browser',
      'IP address and approximate location',
      'Cookies and similar technologies',
      'Usage data (features used, time spent, interactions)',
      'Crash reports and diagnostics',
      'Analytics data',
    ],
  },
  {
    title: 'How We Use Your Information',
    level: 2,
    list: [
      'Provide and maintain Rendly',
      'Enable matchmaking and connections',
      'Facilitate video/voice calls and messaging',
      'Process OAuth authentication',
      'Improve and optimize the platform',
      'Provide customer support',
      'Send updates and notifications (where you have opted in)',
      'Detect and prevent fraud and abuse',
      'Comply with legal obligations',
      'Research and analytics (aggregated where possible)',
    ],
  },
  {
    title: 'Data Sharing & Third Parties',
    level: 2,
    paragraphs: [
      'We do not sell your personal data. We may share data with: OAuth providers (LinkedIn, GitHub) as needed for authentication; service providers (hosting, analytics, email) under strict agreements; legal authorities when required by law; and other users only to the extent you choose to share (e.g. matching, profile). Sharing is minimal and purpose-driven. Third-party services have their own privacy policies.',
    ],
  },
  {
    title: 'Data Security',
    level: 2,
    paragraphs: [
      'We use industry-standard measures: encryption in transit (TLS/HTTPS), secure storage, access controls, and authentication. No system is 100% secure; we are not liable for unauthorized access beyond our reasonable control. You are responsible for keeping your password safe. Report security issues to team@anoryxtechsolutions.com.',
    ],
  },
  {
    title: 'Your Privacy Rights & Choices',
    level: 2,
    list: [
      'Access your personal data',
      'Correct inaccurate data',
      'Delete your account and data',
      'Opt out of marketing communications',
      'Request data portability',
    ],
    paragraphs: [
      'To exercise these rights, contact us at team@anoryxtechsolutions.com or afnan.ceo@anoryxtechsolutions.com. We will respond within a reasonable time as required by applicable law.',
    ],
  },
  {
    title: 'Cookies & Tracking',
    level: 2,
    paragraphs: [
      'We use cookies for authentication, preferences, and analytics. You can control cookies via your browser settings. Essential cookies are required for the service to function; others can be disabled.',
    ],
  },
  {
    title: 'Retention of Data',
    level: 2,
    paragraphs: [
      'We retain data as needed: messages until you delete them; call logs typically up to 90 days; account data until deletion plus up to 30 days; backups up to 1 year. Legal or regulatory requirements may require longer retention.',
    ],
  },
  {
    title: "Children's Privacy",
    level: 2,
    paragraphs: [
      'Rendly is not intended for users under 18. We do not knowingly collect data from children. If you believe we have collected a child\'s data, contact us at team@anoryxtechsolutions.com.',
    ],
  },
  {
    title: 'International Data Transfers',
    level: 2,
    paragraphs: [
      'Data may be processed in different countries. We take steps to comply with applicable data protection laws and use safeguards for cross-border transfers where required (e.g. GDPR).',
    ],
  },
  {
    title: 'Third-Party Links',
    level: 2,
    paragraphs: [
      'Rendly may link to third-party sites (e.g. LinkedIn, GitHub). We are not responsible for their privacy practices. Review their policies before providing data.',
    ],
  },
  {
    title: 'Contact Us & Data Requests',
    level: 2,
    paragraphs: [
      `For privacy questions, data access or deletion requests, or complaints, contact: ${COMPANY.supportEmail}, ${COMPANY.ceoEmail}. Website: ${COMPANY.website}. Products: ${COMPANY.products}.`,
    ],
  },
  {
    title: 'Changes to This Privacy Policy',
    level: 2,
    paragraphs: [
      'We may update this policy. We will notify you of material changes (e.g. by email or in-app notice). Continued use after changes constitutes acceptance.',
    ],
  },
  {
    title: 'GDPR & Compliance',
    level: 2,
    paragraphs: [
      'If you are in the EEA/UK, you have additional rights under GDPR (access, rectification, erasure, restriction, portability, objection, withdrawal of consent). You may lodge a complaint with a supervisory authority. Contact us for any such requests or for our Data Protection Officer details if applicable.',
    ],
  },
];
