/**
 * Privacy Policy content.
 *
 * Written to match how this website and the RASPIX platform actually work
 * (contact form & newsletter open the visitor's email app; client sign-in via
 * Firebase Authentication; bulk sending with open/click/bounce tracking and
 * suppression lists; Google Maps and Google Fonts embeds).
 *
 * Have it reviewed by a qualified lawyer before relying on it, and keep it in
 * sync if any of the practices above change.
 */

import { CONTACT } from "./content";

/** A block is a paragraph, a bullet list, or a small sub-heading. */
export type PolicyBlock = string | { list: string[] } | { sub: string };
export type PolicySection = { id: string; title: string; body: PolicyBlock[] };

export const PRIVACY = {
  title: "Privacy Policy",
  updated: "Last updated: 27 November 2026",
  lead: "How RASPIX Media Services collects, uses, shares and protects personal data, and the choices and rights you have.",
};

export const PRIVACY_SECTIONS: PolicySection[] = [
  {
    id: "who-we-are",
    title: "Who we are",
    body: [
      `RASPIX Media Services (“RASPIX”, “we”, “us” or “our”) provides email marketing, bulk email delivery and related digital marketing services. We are based at ${CONTACT.address}, India.`,
      "This policy applies to personal data we handle through this website (raspixmedia.com), our client portal, and the email services we provide.",
    ],
  },
  {
    id: "our-role",
    title: "Our role: controller and processor",
    body: [
      "Depending on the situation, we act in one of two roles:",
      {
        list: [
          "Controller (or “Data Fiduciary” under India’s Digital Personal Data Protection Act, 2023): for personal data of website visitors, people who contact us, newsletter subscribers, and the contact details of our clients and their staff. We decide why and how that data is used.",
          "Processor (or “Data Processor”): for the email lists, message content and campaign data that our clients upload or send through our platform. We process that data only on our client’s instructions. The client is responsible for having a lawful basis and any required consent to email the people on their lists.",
        ],
      },
      "If you received an email sent by one of our clients, please contact the sender directly about your data, or use the unsubscribe link in that email. If you contact us instead, we will pass your request to the relevant client.",
    ],
  },
  {
    id: "data-we-collect",
    title: "Information we collect",
    body: [
      { sub: "Information you give us" },
      {
        list: [
          "Contact enquiries: your name, email address, contact number and message when you use our contact form or write to us.",
          "Newsletter: your email address if you ask to join our newsletter.",
          "Client accounts: the name, business email address and sign-in credentials of people who use our client portal, and business and billing details needed to provide and invoice our services.",
          "Correspondence: anything else you choose to share with us by email or phone.",
        ],
      },
      { sub: "Information collected automatically" },
      {
        list: [
          "Technical data such as IP address, browser type, device type, pages visited and the date and time of access, recorded in standard server logs.",
          "Sign-in session data stored in your browser so you stay signed in to the client portal (see “Cookies and similar technologies”).",
        ],
      },
      { sub: "Campaign data we process for clients" },
      {
        list: [
          "Recipient email addresses and any other fields a client includes in a list (for example, a first name used to personalise a message).",
          "Message content, sending domains and schedules.",
          "Delivery and engagement data: whether a message was delivered or bounced, whether it was opened, which links were clicked, unsubscribes and spam complaints, along with the time, approximate location derived from IP address, and device or email-client type.",
        ],
      },
    ],
  },
  {
    id: "how-we-use",
    title: "How we use information",
    body: [
      {
        list: [
          "To respond to your enquiries and provide information you request.",
          "To create and secure client accounts and provide the client portal.",
          "To send, track and report on email campaigns on behalf of our clients.",
          "To protect deliverability and sender reputation: processing bounces and complaints, maintaining suppression lists and detecting abuse or spam.",
          "To send our newsletter and service updates, where you have asked for them or where the law otherwise allows. You can opt out at any time.",
          "To keep our website and services secure, troubleshoot problems and improve how they work.",
          "To meet legal, tax and accounting obligations, and to establish or defend legal claims.",
        ],
      },
      "We do not sell personal data, and we do not use our clients’ recipient lists for our own marketing.",
    ],
  },
  {
    id: "legal-bases",
    title: "Legal bases for processing",
    body: [
      "We process personal data only where the law allows. Depending on the activity, this is:",
      {
        list: [
          "Consent: for example, newsletter sign-ups. You can withdraw consent at any time, and withdrawal does not affect processing that happened before.",
          "Performance of a contract: to provide services to our clients and manage their accounts.",
          "Legitimate uses or legitimate interests: to answer enquiries, keep our services secure and protect email deliverability, balanced against your rights.",
          "Legal obligation: where we must keep or disclose information by law.",
        ],
      },
      "For people in India, we process digital personal data in line with the Digital Personal Data Protection Act, 2023. For people in the European Economic Area or the United Kingdom, these bases correspond to Article 6 of the GDPR / UK GDPR.",
    ],
  },
  {
    id: "email-tracking",
    title: "Email tracking and suppression",
    body: [
      "Emails sent through our platform can contain tracked links and a small tracking image so our clients can see whether messages are delivered, opened and clicked. This data is reported to the client who sent the campaign and is used to manage deliverability.",
      "Email addresses that bounce, unsubscribe or report spam are added to suppression lists so they are not emailed again. We keep a suppression record for as long as needed to honour your choice, even after other data is deleted.",
      "Many email apps let you block images, which also prevents open tracking.",
    ],
  },
  {
    id: "cookies",
    title: "Cookies and similar technologies",
    body: [
      "This website does not use advertising or analytics cookies.",
      {
        list: [
          "Essential storage: when you sign in to the client portal, a session token is kept in your browser’s session storage so you stay signed in. It is cleared when you close the tab or sign out.",
          "Google Maps: the map on our Contact page is provided by Google and may set cookies or collect your IP address when it loads. Google’s privacy policy applies to that data.",
          "Google Fonts: our text fonts are loaded from Google’s servers, which receive your IP address when the page loads.",
        ],
      },
      "You can block or delete cookies and site data in your browser settings. Blocking essential storage will stop the client portal sign-in from working.",
    ],
  },
  {
    id: "sharing",
    title: "How we share information",
    body: [
      "We share personal data only as needed to run our business and provide our services:",
      {
        list: [
          "Service providers that host and operate our website, platform and email-sending infrastructure, under contracts that require them to protect the data and use it only for the services they provide to us.",
          "Google (Firebase Authentication), which manages client portal sign-in.",
          "Our clients, who receive delivery and engagement reports for the campaigns they send.",
          "Professional advisers such as lawyers and accountants, under a duty of confidentiality.",
          "Authorities, regulators or courts when required by law, or to protect the rights, safety and security of RASPIX, our clients or others.",
          "A buyer or successor if our business is reorganised, merged or sold, subject to this policy.",
        ],
      },
    ],
  },
  {
    id: "transfers",
    title: "International transfers",
    body: [
      "We are based in India, and some of our service providers store or process data in other countries. When personal data is transferred across borders, we take steps to protect it as required by applicable law, including the Digital Personal Data Protection Act, 2023 and, where relevant, appropriate safeguards such as standard contractual clauses for transfers from the EEA or UK.",
    ],
  },
  {
    id: "retention",
    title: "How long we keep data",
    body: [
      {
        list: [
          "Enquiries and correspondence: for as long as needed to respond and follow up, and then as long as reasonably necessary for our records.",
          "Client account and billing data: for the duration of the relationship and afterwards for as long as required for legal, tax and accounting purposes.",
          "Campaign data: for as long as the client keeps it in their account or as agreed with the client, after which it is deleted or anonymised.",
          "Suppression records: for as long as needed to make sure we do not email someone who has opted out, bounced or complained.",
          "Server logs: for a limited period for security and troubleshooting.",
        ],
      },
      "When data is no longer needed, we delete or anonymise it.",
    ],
  },
  {
    id: "security",
    title: "How we protect data",
    body: [
      "We use reasonable technical and organisational safeguards to protect personal data, including encrypted connections (HTTPS), access controls and authenticated sign-in for the client portal, and limiting access to people who need it for their work.",
      "No method of transmission or storage is completely secure. If a personal data breach occurs, we will notify affected people and the relevant authorities where the law requires.",
    ],
  },
  {
    id: "your-rights",
    title: "Your rights",
    body: [
      "Depending on where you live, you may have the right to:",
      {
        list: [
          "access a summary of the personal data we hold about you and how it is used;",
          "correct, complete or update inaccurate or incomplete data;",
          "have your data erased when it is no longer needed or when you withdraw consent;",
          "withdraw consent at any time, where processing is based on consent;",
          "object to or restrict certain processing, and receive your data in a portable format (EEA/UK);",
          "nominate another person to exercise your rights in the event of your death or incapacity (India);",
          "have your grievance addressed by us, and complain to the Data Protection Board of India or your local data protection authority.",
        ],
      },
      `To exercise a right, email ${CONTACT.privacyEmail}. We may need to verify your identity before acting on a request. We will respond within the time required by applicable law.`,
    ],
  },
  {
    id: "marketing",
    title: "Unsubscribing from marketing",
    body: [
      `You can stop receiving our newsletter or marketing emails at any time by using the unsubscribe link in any email we send, or by writing to ${CONTACT.privacyEmail}. We will still send you messages that are necessary for any service you use, such as account or security notices.`,
      "Commercial emails sent through our platform must include a working unsubscribe link and accurate sender information, in line with laws such as the CAN-SPAM Act (US), CASL (Canada) and the GDPR.",
    ],
  },
  {
    id: "children",
    title: "Children",
    body: [
      "Our website and services are intended for businesses and are not directed at children. We do not knowingly collect personal data from anyone under 18. If you believe a child has given us personal data, please contact us and we will delete it.",
    ],
  },
  {
    id: "other-sites",
    title: "Links to other websites",
    body: [
      "Our website may link to other websites, such as LinkedIn or Google Maps. We are not responsible for their privacy practices, and we encourage you to read their privacy policies.",
    ],
  },
  {
    id: "changes",
    title: "Changes to this policy",
    body: [
      "We may update this policy from time to time to reflect changes in our services or the law. We will post the updated version on this page and change the “Last updated” date. If the changes are significant, we will take reasonable steps to let you know.",
    ],
  },
  {
    id: "contact",
    title: "Contact and grievance officer",
    body: [
      `For questions, requests or complaints about this policy or how we handle personal data, please contact our Grievance Officer:`,
      {
        list: [
          "Grievance Officer, RASPIX Media Services",
          `Email: ${CONTACT.privacyEmail}`,
          `Address: ${CONTACT.address}, India`,
        ],
      },
      "We will acknowledge your complaint and work to resolve it promptly, within the timelines required by applicable law.",
    ],
  },
];
