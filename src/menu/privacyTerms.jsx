// menu/privacyTerms.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Menu, X, ArrowUp, Mail, MapPin } from "lucide-react";

/*
  UE Learn — Privacy Policy & Terms of Use
  ------------------------------------------------------------
  This component is completely isolated from parent styles.
  All styles are self-contained and use CSS-in-JS.
*/

const COMPANY = {
  name: "Unity Elites Digital Limited",
  product: "UE Learn",
  version: "1.0",
  effectiveDate: "1 July 2026",
  email: "info@unityelites.com",
  address: "Academic City Area, Accra, Ghana. GE-190-1579",
};

const privacySections = [
  {
    id: "privacy-1",
    num: "1",
    title: "Introduction",
    blocks: [
      { type: "p", text: `This Privacy Policy explains how ${COMPANY.name} collects, uses, discloses, and protects personal data when you use the ${COMPANY.product} website, mobile application, browser extension, and related services (together, the "Service").` },
      { type: "p", text: "This Policy applies to all users of the Service, wherever located, and is designed to comply with the Ghana Data Protection Act, 2012 (Act 843) as the primary governing framework, and to meet or exceed the standards of the EU General Data Protection Regulation (GDPR) and comparable international data protection laws for users accessing the Service from outside Ghana." },
      { type: "p", text: "By creating an account, or otherwise using the Service, you acknowledge that you have read and understood this Policy. Where required by law, we will ask for your explicit, informed consent before processing your personal data, and you may withdraw that consent at any time as described in Section 12." },
    ],
  },
  {
    id: "privacy-2",
    num: "2",
    title: "Who we are — data controller",
    blocks: [
      { type: "p", text: "The data controller responsible for your personal data is:" },
      { type: "ul", items: [
        `Business name: ${COMPANY.name}`,
        `Trading as: ${COMPANY.product}`,
        `Registered address: ${COMPANY.address}`,
        `Contact email: ${COMPANY.email}`,
        "Data Protection Commission (Ghana) registration number: [DPC registration pending — application in process]",
        "Data Protection Officer: [To be appointed — contact info@unityelites.com for privacy-related matters in the meantime]",
      ]},
      { type: "p", text: "If Unity Elites Digital Limited is not yet registered with Ghana's Data Protection Commission as a data controller, this should be done before the Service processes personal data at scale — registration is a statutory requirement under Act 843 for most controllers." },
    ],
  },
  {
    id: "privacy-3",
    num: "3",
    title: "Personal data we collect",
    blocks: [
      { type: "p", text: "We collect only the data necessary to operate the Service, verify your identity, process payments, and improve the platform. Specifically, we collect the following categories of personal data, drawn directly from what the Service captures and stores:" },
      { type: "sub", text: "3.1 Account and identity data" },
      { type: "ul", items: [
        "First name and last name",
        "Email address",
        "Phone number (MSISDN), where provided for SMS verification",
        "Password — stored only as an irreversible cryptographic hash; we never store or can retrieve your plain-text password",
        "Profile photo (if uploaded or provided via Google Sign-In)",
        "CV / résumé link (for users applying as, or registered as, affiliates)",
        "Account type (regular user or affiliate) and account status",
      ]},
      { type: "sub", text: "3.2 Sign-in and authentication data" },
      { type: "ul", items: [
        "If you sign in with Google: your Google account email, first name, last name, and profile picture, as shared with us by Google after you grant permission",
        'Authentication provider indicator (e.g. "google" or standard email/password)',
        "Login timestamps and last-active timestamps",
        "Email and SMS one-time-passcode (OTP) verification status and history",
        'Session and refresh tokens, and a record of invalidated ("logged out") tokens, used to keep your account secure',
      ]},
      { type: "sub", text: "3.3 Usage and engagement data" },
      { type: "ul", items: [
        'Daily usage "streak" scores and your highest recorded streak',
        "A count of how many times you interact with certain platform features",
        "Courses, past-question papers, and topics you search for or view",
        "Solutions, answers, or content you submit or request through the Service, including content submitted via the browser extension",
        "Error reports you (or your device, automatically) submit to help us fix problems",
      ]},
      { type: "sub", text: "3.4 Referral, credits, and payment data" },
      { type: "ul", items: [
        "Your unique referral code, and the referral code of anyone who referred you",
        "Credit balance and full credit transaction history",
        "Payment references and payment status from our payment processor, Paystack (we do not collect or store your full card number, CVV, or mobile money PIN — these are entered directly with Paystack)",
        "For affiliates: wallet balance and commission earnings history",
      ]},
      { type: "sub", text: "3.5 Technical and security data" },
      { type: "ul", items: [
        "IP address",
        "Browser / device user-agent string",
        "Timestamps of requests, logins, and consent actions",
        "Activity logs associated with your account, used for security, troubleshooting, and fraud prevention",
      ]},
      { type: "sub", text: "3.6 Consent and legal records" },
      { type: "ul", items: [
        "A record of which version of this Privacy Policy and our Terms of Use you accepted, together with the date, time, IP address, and device/browser used at the moment of acceptance",
      ]},
      { type: "p", text: "We do not intentionally collect any special category data (such as health data, biometric data, religious belief, or political opinion) through the Service. Please do not submit such information to us, including inside free-text fields like error reports or submitted solutions." },
    ],
  },
  {
    id: "privacy-4",
    num: "4",
    title: "How we collect your data",
    blocks: [
      { type: "p", text: "We collect personal data in the following ways:" },
      { type: "ul", items: [
        "Directly from you — when you register, sign in, complete your profile, submit content, request a solution, or contact support.",
        "Automatically — through your use of the Service (technical data described in Section 3.5).",
        "From third parties — from Google, when you choose to sign in with Google; and from Paystack, which confirms whether a payment you initiated was successful.",
      ]},
    ],
  },
  {
    id: "privacy-5",
    num: "5",
    title: "Legal basis for processing",
    blocks: [
      { type: "p", text: "Under Act 843 and equivalent international standards, we only process your personal data where we have a valid legal basis, which will be one or more of the following:" },
      { type: "ul", items: [
        "Consent — for example, when you agree to this Policy, opt in to marketing communications, or accept a new policy version.",
        "Performance of a contract — to create your account, deliver the Service you asked for, process credit purchases, and pay affiliate commissions.",
        "Legal obligation — for example, retaining transaction records for tax, accounting, or anti-fraud purposes.",
        "Legitimate interests — such as securing the platform against abuse, improving the Service, and maintaining service logs — balanced against your rights and freedoms.",
      ]},
    ],
  },
  {
    id: "privacy-6",
    num: "6",
    title: "How we use your data",
    blocks: [
      { type: "p", text: "We use the personal data described above to:" },
      { type: "ul", items: [
        "Create, authenticate, and manage your account, including via Google Sign-In",
        "Verify your phone number and/or email address via OTP",
        "Provide, personalise, and improve the past-questions and solutions features of the Service",
        "Process credit purchases and verify payments through Paystack",
        "Operate the referral program and calculate and pay affiliate commissions",
        "Track streaks and usage to power in-app engagement features",
        "Investigate errors, bugs, and abuse, and keep the platform secure",
        "Communicate with you about your account, transactions, OTPs, and (where you have consented) product updates",
        "Comply with legal, regulatory, and tax obligations",
        "Maintain a record of your acceptance of our Privacy Policy and Terms of Use, and re-request your consent when either document is updated",
      ]},
      { type: "p", text: "We do not sell your personal data. We do not use your submitted academic content or personal data to train third-party advertising profiles." },
    ],
  },
  {
    id: "privacy-7",
    num: "7",
    title: "Sharing your data with third parties",
    blocks: [
      { type: "p", text: "We share personal data only with service providers who process it on our behalf, under appropriate contractual safeguards, and only to the extent necessary for them to provide their service to us:" },
      { type: "ul", items: [
        "Supabase — our database and backend infrastructure provider, which stores account and application data securely.",
        "Paystack — our payment processor, which handles and verifies your payment transactions. Paystack processes your card/mobile-money details directly and under its own privacy policy.",
        'Google — if you choose "Sign in with Google", Google authenticates you and shares your basic profile information with us, under Google\'s own privacy policy.',
        "Arkasel (or our SMS provider) — used solely to deliver SMS one-time passcodes to your phone number for verification.",
        "Third-party AI/solutions providers — used to process solution requests you submit; only the content necessary to generate a response (e.g. the question text) is shared, not your account credentials.",
        "Legal and regulatory authorities — where required by law, court order, or to protect the rights, safety, or property of Unity Elites Digital Limited, our users, or the public.",
      ]},
      { type: "p", text: "We do not share your personal data with third parties for their own independent marketing purposes without your explicit consent." },
    ],
  },
  {
    id: "privacy-8",
    num: "8",
    title: "International data transfers",
    blocks: [
      { type: "p", text: "Some of our service providers (for example, cloud infrastructure and payment processing partners) may store or process data outside Ghana. Where personal data is transferred internationally, we take steps required under Act 843 and, where applicable, GDPR-equivalent safeguards (such as standard contractual clauses or equivalent adequacy protections) to ensure your data continues to receive an appropriate level of protection." },
    ],
  },
  {
    id: "privacy-9",
    num: "9",
    title: "Data retention",
    blocks: [
      { type: "p", text: "We retain personal data only for as long as necessary to fulfil the purposes described in this Policy, including:" },
      { type: "ul", items: [
        "Account data — for as long as your account remains active, and for a limited period afterward to allow account recovery and to meet legal/accounting obligations.",
        "Transaction and payment records — for the period required by Ghanaian tax and financial record-keeping law (typically not less than six years).",
        "Consent and policy-acceptance records — retained indefinitely as an audit trail, even after account deletion, since these records demonstrate historical compliance rather than being used for any other purpose.",
        "Security/activity logs — retained for a limited rolling period sufficient for fraud detection and troubleshooting, then deleted or anonymised.",
      ]},
      { type: "p", text: "When retention is no longer necessary, we securely delete or irreversibly anonymise the data." },
    ],
  },
  {
    id: "privacy-10",
    num: "10",
    title: "Data security",
    blocks: [
      { type: "p", text: "We apply administrative, technical, and organisational safeguards appropriate to the sensitivity of the data we hold, including:" },
      { type: "ul", items: [
        "Encrypting passwords using industry-standard, one-way cryptographic hashing — we never store plain-text passwords",
        "Encrypting data in transit using HTTPS/TLS",
        "Access controls limiting who inside Unity Elites Digital Limited can view personal data, on a need-to-know basis",
        "Token-based authentication with the ability to revoke (blacklist) compromised sessions",
        "Monitoring and alerting for critical system errors that could indicate a security issue",
      ]},
      { type: "p", text: "No system is perfectly secure. If we become aware of a data breach that poses a risk to your rights and freedoms, we will notify the Data Protection Commission and affected users without undue delay, as required under Act 843." },
    ],
  },
  {
    id: "privacy-11",
    num: "11",
    title: "Your rights",
    blocks: [
      { type: "p", text: "Subject to applicable law (including Act 843 and, where relevant, GDPR), you have the right to:" },
      { type: "ul", items: [
        "Access — request a copy of the personal data we hold about you",
        "Rectification — ask us to correct inaccurate or incomplete data",
        "Erasure — ask us to delete your personal data, subject to our legal retention obligations described in Section 9",
        "Restriction — ask us to limit how we process your data in certain circumstances",
        "Objection — object to processing based on legitimate interests, including for marketing purposes",
        "Portability — request your data in a structured, commonly used, machine-readable format",
        "Withdraw consent — where processing is based on consent, withdraw it at any time without affecting the lawfulness of processing carried out before withdrawal",
      ]},
      { type: "p", text: `To exercise any of these rights, contact us at ${COMPANY.email}. We will respond within the time limits required by applicable law. You also have the right to lodge a complaint with the Data Protection Commission of Ghana, or, if you are located elsewhere, with your local data protection authority.` },
    ],
  },
  {
    id: "privacy-12",
    num: "12",
    title: "Withdrawing consent and managing preferences",
    blocks: [
      { type: "p", text: "Where we rely on your consent, you can withdraw it at any time from your account settings, or by contacting us directly. Withdrawing consent may limit or prevent your ability to use certain features of the Service (for example, you cannot use the Service without agreeing to process the account data necessary to operate it)." },
    ],
  },
  {
    id: "privacy-13",
    num: "13",
    title: "Children's privacy",
    blocks: [
      { type: "p", text: "The Service is intended for users who are at least 13 years old (or the minimum age of digital consent in your jurisdiction, if higher). We do not knowingly collect personal data from children below this age. If you believe a child has provided us with personal data without appropriate consent, contact us so we can delete it." },
    ],
  },
  {
    id: "privacy-14",
    num: "14",
    title: "Cookies and similar technologies",
    blocks: [
      { type: "p", text: "Our website and web-based tools use cookies and similar technologies (such as local storage) to keep you signed in, remember your preferences, and understand how the Service is used. We currently use only essential cookies that are necessary for the core functionality of the platform, including authentication, session management, and security." },
      { type: "p", text: "We do not currently use analytics or advertising cookies. However, as the platform grows, we may introduce optional analytics and functional cookies to improve your experience and better understand how users interact with the Service. If and when we do, we will implement a cookie consent banner that gives you full control over which cookies you accept, in compliance with applicable data protection laws." },
      { type: "p", text: "You can control cookies through your browser settings; disabling essential cookies may affect Service functionality." },
    ],
  },
  {
    id: "privacy-15",
    num: "15",
    title: "Changes to this policy — version history",
    blocks: [
      { type: "p", text: "We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. Each update is published as a new numbered version. Where changes are material, we will require you to review and re-accept the updated Policy before you can continue using the Service, and we keep a permanent record of which version you accepted and when." },
      { type: "ul", items: [`Version ${COMPANY.version} — ${COMPANY.effectiveDate} — Initial publication.`] },
    ],
  },
  {
    id: "privacy-16",
    num: "16",
    title: "Contact us and complaints",
    blocks: [
      { type: "p", text: "If you have questions about this Policy or how we handle your personal data, contact us at:" },
      { type: "ul", items: [`Email: ${COMPANY.email}`, `Address: ${COMPANY.name}, ${COMPANY.address}`] },
      { type: "p", text: "You may also contact the Data Protection Commission of Ghana:" },
      { type: "ul", items: ["Website: www.dataprotection.org.gh", "Address: Data Protection Commission, Ghana [INSERT/VERIFY CURRENT ADDRESS]"] },
    ],
  },
];

const termsSections = [
  {
    id: "terms-1",
    num: "1",
    title: "Acceptance of terms",
    blocks: [
      { type: "p", text: `These Terms of Use ("Terms") form a binding agreement between you and ${COMPANY.name}, governing your access to and use of the ${COMPANY.product} website, mobile application, browser extension, and related services (the "Service"). By creating an account or otherwise using the Service, you agree to these Terms and to our Privacy Policy, which is incorporated by reference.` },
      { type: "p", text: "If you do not agree to these Terms, you must not use the Service. As with the Privacy Policy, we maintain a version history of these Terms and will ask you to re-accept them whenever we publish a materially updated version." },
    ],
  },
  {
    id: "terms-2",
    num: "2",
    title: "Eligibility",
    blocks: [
      { type: "p", text: "You must be at least 13 years old (or the applicable minimum age in your jurisdiction) to use the Service. By using the Service, you confirm that you meet this requirement and that the information you provide during registration is accurate and current." },
    ],
  },
  {
    id: "terms-3",
    num: "3",
    title: "Description of the Service",
    blocks: [
      { type: "p", text: "UE Learn provides access to past examination questions, study resources, and AI-assisted solution generation, along with a credits-based system for accessing premium content, and a referral/affiliate program for approved partners. Features may be added, changed, or removed at our discretion." },
    ],
  },
  {
    id: "terms-4",
    num: "4",
    title: "Account registration and security",
    blocks: [
      { type: "ul", items: [
        "You are responsible for maintaining the confidentiality of your password and for all activity under your account.",
        "You must notify us immediately of any unauthorised use of your account.",
        "You agree to provide accurate registration information, including a valid email address and, where required, phone number for verification.",
        "We may suspend or terminate accounts that provide false information, or that we reasonably believe are compromised.",
      ]},
    ],
  },
  {
    id: "terms-5",
    num: "5",
    title: "Signing in with Google",
    blocks: [
      { type: "p", text: "If you choose to register or sign in using Google, you authorise us to receive your basic Google profile information (name, email address, and profile photo) for the purpose of creating and authenticating your account. Your use of Google Sign-In is also subject to Google's own terms of service and privacy policy." },
    ],
  },
  {
    id: "terms-6",
    num: "6",
    title: "Referral program and affiliates",
    blocks: [
      { type: "ul", items: [
        "Users may share a personal referral code; both the referring user and the referred user may receive benefits (such as bonus credits) as described in the app at the time.",
        "Affiliates are approved partners who may earn a commission on qualifying purchases made by users they refer, calculated and paid to an in-platform wallet as described in the app.",
        "We reserve the right to investigate, withhold, reverse, or claw back credits or commissions obtained through fraud, abuse, self-referral, or violation of these Terms.",
      ]},
    ],
  },
  {
    id: "terms-7",
    num: "7",
    title: "Credits, payments, and refunds",
    blocks: [
      { type: "ul", items: [
        "Certain features require credits, which may be purchased through our payment processor, Paystack, using the payment methods it supports.",
        "All fees are quoted in Ghana Cedis (GHS) unless stated otherwise, and are inclusive/exclusive of applicable taxes as indicated at checkout.",
        "Payments are verified directly with Paystack before credits are applied to your account; we are not responsible for delays or failures caused by your payment provider.",
        "Credits are generally non-refundable once successfully applied to your account, except where required by applicable consumer protection law, or where we determine in our discretion that a service failure warrants a refund or credit reversal.",
        "If a solution request fails to return a usable result, credits deducted for that request will be automatically restored to your balance.",
      ]},
    ],
  },
  {
    id: "terms-8",
    num: "8",
    title: "Acceptable use",
    blocks: [
      { type: "p", text: "You agree not to:" },
      { type: "ul", items: [
        "Use the Service for any unlawful purpose, or in a way that infringes the rights of others",
        "Attempt to gain unauthorised access to any account, system, or data not belonging to you",
        "Upload or submit content that is defamatory, obscene, infringing, or otherwise unlawful",
        "Abuse the referral or credits system, including through fraudulent or self-referral schemes",
        "Interfere with or disrupt the integrity or performance of the Service, including through malware, scraping at scale, or denial-of-service activity",
        "Reverse engineer, decompile, or attempt to extract the source code of the Service, except where permitted by law",
      ]},
    ],
  },
  {
    id: "terms-9",
    num: "9",
    title: "Intellectual property",
    blocks: [
      { type: "p", text: "The Service, including its design, software, trademarks, and the underlying compilation of past-questions content curated by Unity Elites Digital Limited, is owned by or licensed to Unity Elites Digital Limited and is protected by applicable intellectual property laws. Individual past examination papers may be owned by the respective educational institutions; we make no claim of ownership over the underlying academic questions themselves, only over our compiled platform, formatting, and generated solutions where applicable." },
      { type: "p", text: "You are granted a limited, non-exclusive, non-transferable, revocable licence to access and use the Service for your personal, non-commercial academic use." },
    ],
  },
  {
    id: "terms-10",
    num: "10",
    title: "User-submitted content",
    blocks: [
      { type: "p", text: "When you submit content to the Service (for example, a solution, an error report, or feedback), you grant Unity Elites Digital Limited a worldwide, royalty-free, non-exclusive licence to use, reproduce, store, and display that content for the purpose of operating, improving, and validating the Service (for example, showing validated solutions to other students). You confirm that you have the right to submit that content and that it does not infringe any third party's rights." },
    ],
  },
  {
    id: "terms-11",
    num: "11",
    title: "Third-party services",
    blocks: [
      { type: "p", text: "The Service integrates with third-party providers, including Paystack (payments), Google (sign-in), and third-party AI/solutions providers (answer generation). We are not responsible for the acts, omissions, availability, or content of these third-party services, which are governed by their own terms." },
    ],
  },
  {
    id: "terms-12",
    num: "12",
    title: "Disclaimer of warranties",
    blocks: [
      { type: "p", text: 'The Service, including any solutions or answers generated through it, is provided "as is" and "as available" without warranties of any kind, express or implied. We do not guarantee that solutions generated by AI or third-party tools are accurate, complete, or fit for examination purposes, and you remain responsible for independently verifying any academic content before relying on it.' },
    ],
  },
  {
    id: "terms-13",
    num: "13",
    title: "Limitation of liability",
    blocks: [
      { type: "p", text: "To the maximum extent permitted by applicable law, Unity Elites Digital Limited shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of data, revenue, or academic outcome, arising out of or relating to your use of the Service. Our total aggregate liability for any claim arising from these Terms or the Service shall not exceed the total amount you paid to us in the twelve (12) months preceding the claim." },
    ],
  },
  {
    id: "terms-14",
    num: "14",
    title: "Indemnification",
    blocks: [
      { type: "p", text: "You agree to indemnify and hold harmless Unity Elites Digital Limited, its officers, employees, and agents from any claims, damages, liabilities, and expenses (including reasonable legal fees) arising from your violation of these Terms or misuse of the Service." },
    ],
  },
  {
    id: "terms-15",
    num: "15",
    title: "Suspension and termination",
    blocks: [
      { type: "p", text: "We may suspend or terminate your access to the Service, with or without notice, if we reasonably believe you have violated these Terms, engaged in fraudulent activity, or if required to comply with applicable law. You may stop using the Service and request account deletion at any time, subject to our data retention obligations described in the Privacy Policy." },
    ],
  },
  {
    id: "terms-16",
    num: "16",
    title: "Governing law and dispute resolution",
    blocks: [
      { type: "p", text: "These Terms are governed by the laws of the Republic of Ghana, without regard to conflict-of-law principles. Any dispute arising from these Terms or the Service shall first be attempted to be resolved informally by contacting us. If unresolved, disputes shall be subject to the exclusive jurisdiction of the courts of Ghana, except where mandatory consumer-protection law in your country of residence provides otherwise." },
    ],
  },
  {
    id: "terms-17",
    num: "17",
    title: "Changes to these terms — version history",
    blocks: [
      { type: "p", text: "We may revise these Terms from time to time. Material changes will require you to re-accept the updated Terms before continued use of the Service, and we keep a permanent, auditable record of which version you accepted and when." },
      { type: "ul", items: [`Version ${COMPANY.version} — ${COMPANY.effectiveDate} — Initial publication.`] },
    ],
  },
  {
    id: "terms-18",
    num: "18",
    title: "Contact us",
    blocks: [
      { type: "ul", items: [`Email: ${COMPANY.email}`, `Address: ${COMPANY.name}, ${COMPANY.address}`] },
    ],
  },
];

const parts = [
  { key: "privacy", label: "Privacy policy", accent: "indigo", sections: privacySections },
  { key: "terms", label: "Terms of use", accent: "amber", sections: termsSections },
];

function Block({ block }) {
  if (block.type === "p") {
    return <p className="policy-body">{block.text}</p>;
  }
  if (block.type === "sub") {
    return <h4 className="policy-subhead">{block.text}</h4>;
  }
  if (block.type === "ul") {
    return (
      <ul className="policy-list">
        {block.items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    );
  }
  return null;
}

function Section({ section, accent }) {
  return (
    <section id={section.id} className={`policy-section accent-${accent}`}>
      <div className="policy-section-head">
        <span className="policy-num">{section.num}</span>
        <h3 className="policy-title">{section.title}</h3>
      </div>
      {section.blocks.map((b, i) => (
        <Block key={i} block={b} />
      ))}
    </section>
  );
}

export default function PrivacyTermsPage() {
  const [activeId, setActiveId] = useState(privacySections[0].id);
  const [navOpen, setNavOpen] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const contentRef = useRef(null);

  const allSectionIds = useMemo(
    () => [...privacySections, ...termsSections].map((s) => s.id),
    []
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 }
    );

    allSectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [allSectionIds]);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 800);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function jumpTo(id) {
    setNavOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="pt-root">
      <style>{`
        /* Reset everything inside pt-root */
        .pt-root {
          all: initial;
          display: block;
          --paper: #f6f5f2;
          --ink: #1c1e24;
          --ink-soft: #4d505a;
          --rule: #dedad0;
          --indigo: #2e3f72;
          --indigo-soft: #e7eaf3;
          --amber: #8a5a2b;
          --amber-soft: #f3e9dc;
          background: var(--paper);
          color: var(--ink);
          font-family: 'Source Serif 4', Georgia, serif;
          min-height: 100vh;
          line-height: 1.5;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        /* Reset all children */
        .pt-root * {
          all: initial;
          display: revert;
          box-sizing: border-box;
        }

        /* Re-apply specific styles to elements */
        .pt-root .pt-sans {
          font-family: 'Work Sans', system-ui, -apple-system, sans-serif;
        }

        .pt-root .policy-body {
          display: block;
          font-size: 17px;
          line-height: 1.75;
          color: var(--ink);
          margin: 0 0 1.1em 0;
          max-width: 62ch;
          font-family: 'Source Serif 4', Georgia, serif;
        }

        .pt-root .policy-list {
          display: block;
          margin: 0 0 1.3em 0;
          padding-left: 1.3em;
          max-width: 62ch;
          list-style: none;
        }

        .pt-root .policy-list li {
          display: list-item;
          font-size: 17px;
          line-height: 1.7;
          margin-bottom: 0.55em;
          font-family: 'Source Serif 4', Georgia, serif;
          list-style-type: disc;
          color: var(--ink);
        }

        .pt-root .policy-subhead {
          display: block;
          font-family: 'Work Sans', system-ui, -apple-system, sans-serif;
          font-size: 14px;
          font-weight: 600;
          text-transform: none;
          color: var(--ink-soft);
          margin: 1.4em 0 0.6em 0;
        }

        .pt-root .policy-section {
          display: block;
          padding: 2.2rem 0;
          border-top: 1px solid var(--rule);
        }

        .pt-root .policy-section:first-of-type {
          border-top: none;
          padding-top: 0.5rem;
        }

        .pt-root .policy-section-head {
          display: flex;
          align-items: baseline;
          gap: 0.6rem;
          margin-bottom: 0.9rem;
        }

        .pt-root .policy-num {
          display: inline;
          font-family: 'Work Sans', system-ui, -apple-system, sans-serif;
          font-size: 15px;
          font-weight: 600;
          color: var(--ink-soft);
          min-width: 1.6em;
        }

        .pt-root .accent-indigo .policy-num {
          color: var(--indigo);
        }

        .pt-root .accent-amber .policy-num {
          color: var(--amber);
        }

        .pt-root .policy-title {
          display: inline;
          font-family: 'Source Serif 4', Georgia, serif;
          font-size: 22px;
          font-weight: 600;
          margin: 0;
          line-height: 1.3;
          color: var(--ink);
        }

        .pt-root .toc-link {
          display: block;
          font-family: 'Work Sans', system-ui, -apple-system, sans-serif;
          font-size: 13.5px;
          padding: 5px 0 5px 0.7rem;
          color: var(--ink-soft);
          border-left: 2px solid transparent;
          text-decoration: none;
          line-height: 1.4;
          cursor: pointer;
          background: transparent;
        }

        .pt-root .toc-link:hover {
          color: var(--ink);
        }

        .pt-root .toc-link.active.p-indigo {
          color: var(--indigo);
          border-left-color: var(--indigo);
          font-weight: 600;
        }

        .pt-root .toc-link.active.p-amber {
          color: var(--amber);
          border-left-color: var(--amber);
          font-weight: 600;
        }

        .pt-root .part-label {
          display: block;
          font-family: 'Work Sans', system-ui, -apple-system, sans-serif;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.02em;
          padding: 0.9rem 0 0.4rem 0.7rem;
        }

        .pt-root .p-indigo-label {
          color: var(--indigo);
        }

        .pt-root .p-amber-label {
          color: var(--amber);
        }

        /* Sticky header */
        .pt-root .sticky-top {
          position: sticky;
          top: 0;
          z-index: 20;
          background: var(--paper);
          border-bottom: 1px solid var(--rule);
          padding: 0.875rem 1.25rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .pt-root .sticky-top .brand {
          font-family: 'Source Serif 4', Georgia, serif;
          font-size: 18px;
          font-weight: 600;
          color: var(--ink);
          display: flex;
          align-items: baseline;
          gap: 0.5rem;
        }

        .pt-root .sticky-top .brand-sub {
          font-size: 12px;
          color: var(--ink-soft);
          font-family: 'Work Sans', system-ui, -apple-system, sans-serif;
        }

        .pt-root .nav-toggle {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 14px;
          padding: 0.375rem 0.75rem;
          border-radius: 0.375rem;
          border: 1px solid var(--rule);
          color: var(--ink);
          background: transparent;
          cursor: pointer;
          font-family: 'Work Sans', system-ui, -apple-system, sans-serif;
        }

        .pt-root .nav-toggle:hover {
          background: rgba(0,0,0,0.03);
        }

        .pt-root .main-grid {
          max-width: 64rem;
          margin: 0 auto;
          padding: 0 1.25rem;
          display: grid;
          gap: 2.5rem;
        }

        @media (min-width: 1024px) {
          .pt-root .main-grid {
            grid-template-columns: 220px 1fr;
          }
        }

        .pt-root .toc-sticky {
          position: sticky;
          top: 5.5rem;
          padding-top: 2rem;
        }

        .pt-root .toc-desktop {
          display: none;
        }

        @media (min-width: 1024px) {
          .pt-root .toc-desktop {
            display: block;
          }
        }

        .pt-root .toc-mobile {
          position: fixed;
          inset: 57px 0 0 0;
          z-index: 10;
          overflow-y: auto;
          padding: 1rem 1.25rem;
          background: var(--paper);
          display: none;
        }

        .pt-root .toc-mobile.open {
          display: block;
        }

        @media (min-width: 1024px) {
          .pt-root .toc-mobile {
            display: none !important;
          }
        }

        .pt-root .content-main {
          padding-top: 2rem;
          padding-bottom: 2rem;
        }

        .pt-root .header-meta {
          margin-bottom: 2.5rem;
        }

        .pt-root .header-meta .service-label {
          font-family: 'Work Sans', system-ui, -apple-system, sans-serif;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: var(--ink-soft);
          margin-bottom: 0.5rem;
          display: block;
        }

        .pt-root .header-meta h1 {
          font-family: 'Source Serif 4', Georgia, serif;
          font-size: 34px;
          font-weight: 600;
          line-height: 1.2;
          margin: 0 0 0.6rem 0;
          color: var(--ink);
        }

        .pt-root .header-meta .version-info {
          font-family: 'Work Sans', system-ui, -apple-system, sans-serif;
          font-size: 14px;
          color: var(--ink-soft);
        }

        .pt-root .part-header {
          margin-bottom: 0.5rem;
        }

        .pt-root .part-header .part-label {
          padding: 0;
          margin-bottom: 0.3rem;
        }

        .pt-root .part-header h2 {
          font-family: 'Source Serif 4', Georgia, serif;
          font-size: 26px;
          font-weight: 600;
          margin: 0 0 1.5rem 0;
        }

        .pt-root .part-header h2.indigo {
          color: var(--indigo);
        }

        .pt-root .part-header h2.amber {
          color: var(--amber);
        }

        .pt-root .footer-bottom {
          margin-top: 2.5rem;
          padding-top: 2rem;
          border-top: 1px solid var(--rule);
          font-family: 'Work Sans', system-ui, -apple-system, sans-serif;
        }

        .pt-root .footer-bottom .contact-line {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 13px;
          color: var(--ink-soft);
          margin-bottom: 0.375rem;
        }

        .pt-root .back-to-top {
          position: fixed;
          bottom: 1.5rem;
          right: 1.5rem;
          width: 44px;
          height: 44px;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--ink);
          color: var(--paper);
          border: none;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          cursor: pointer;
        }

        .pt-root .back-to-top:hover {
          background: #000;
        }

        /* Mobile responsive */
        @media (max-width: 640px) {
          .pt-root .header-meta h1 {
            font-size: 26px;
          }
          .pt-root .policy-section {
            padding: 1.5rem 0;
          }
          .pt-root .main-grid {
            padding: 0 1rem;
          }
        }
      `}</style>

      {/* Top bar */}
      <header className="sticky-top">
        <div className="brand">
          <span>{COMPANY.product}</span>
          <span className="brand-sub">Privacy policy &amp; terms of use</span>
        </div>
        <button className="nav-toggle" onClick={() => setNavOpen((v) => !v)}>
          {navOpen ? <X size={16} /> : <Menu size={16} />}
          Contents
        </button>
      </header>

      <div className="main-grid">
        {/* Sidebar TOC — desktop */}
        <nav className="toc-desktop">
          <div className="toc-sticky">
            {parts.map((part) => (
              <div key={part.key}>
                <div className={`part-label p-${part.accent}-label`}>{part.label}</div>
                {part.sections.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className={`toc-link p-${part.accent} ${activeId === s.id ? "active" : ""}`}
                    onClick={(e) => {
                      e.preventDefault();
                      jumpTo(s.id);
                    }}
                  >
                    {s.num}. {s.title}
                  </a>
                ))}
              </div>
            ))}
          </div>
        </nav>

        {/* Mobile TOC panel */}
        <nav className={`toc-mobile ${navOpen ? "open" : ""}`}>
          {parts.map((part) => (
            <div key={part.key}>
              <div className={`part-label p-${part.accent}-label`}>{part.label}</div>
              {part.sections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className={`toc-link p-${part.accent} ${activeId === s.id ? "active" : ""}`}
                  onClick={(e) => {
                    e.preventDefault();
                    jumpTo(s.id);
                  }}
                >
                  {s.num}. {s.title}
                </a>
              ))}
            </div>
          ))}
        </nav>

        {/* Content */}
        <main ref={contentRef} className="content-main">
          <div className="header-meta">
            <span className="service-label">
              {COMPANY.product} · a service operated by {COMPANY.name}
            </span>
            <h1>Privacy policy &amp; terms of use</h1>
            <p className="version-info">
              Version {COMPANY.version} · Effective {COMPANY.effectiveDate}
            </p>
          </div>

          <div id="privacy" className="part-header">
            <span className="part-label p-indigo-label">Part 1</span>
            <h2 className="indigo">Privacy policy</h2>
          </div>
          {privacySections.map((s) => (
            <Section key={s.id} section={s} accent="indigo" />
          ))}

          <div id="terms" className="part-header" style={{ marginTop: "1.5rem", paddingTop: "1rem" }}>
            <span className="part-label p-amber-label">Part 2</span>
            <h2 className="amber">Terms of use</h2>
          </div>
          {termsSections.map((s) => (
            <Section key={s.id} section={s} accent="amber" />
          ))}

          <footer className="footer-bottom">
            <div className="contact-line">
              <Mail size={14} /> {COMPANY.email}
            </div>
            <div className="contact-line">
              <MapPin size={14} /> {COMPANY.name}, {COMPANY.address}
            </div>
          </footer>
        </main>
      </div>

      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
          className="back-to-top"
        >
          <ArrowUp size={18} />
        </button>
      )}
    </div>
  );
}