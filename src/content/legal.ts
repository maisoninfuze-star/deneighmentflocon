import { site, type Locale } from "@/lib/site";

/**
 * Legal copy lives here rather than in the message catalogues — it is long,
 * rarely touched, and structural (headed sections) rather than interface text.
 *
 * NOTE: this is a good-faith starting draft written to reflect how the business
 * actually operates, including Quebec's Law 25 requirements for personal
 * information. It has not been reviewed by a lawyer. Have counsel review it
 * before launch, and set a real privacy officer contact.
 */

export type LegalSection = { heading: string; body: string[] };
export type LegalDoc = { updated: string; intro: string; sections: LegalSection[] };

export const LAST_UPDATED = "2026-07-20";

export function getPrivacy(locale: Locale): LegalDoc {
  return locale === "fr" ? privacyFr : privacyEn;
}

export function getTerms(locale: Locale): LegalDoc {
  return locale === "fr" ? termsFr : termsEn;
}

/* ------------------------------------------------------------------ */
/* PRIVACY — FR                                                        */
/* ------------------------------------------------------------------ */

const privacyFr: LegalDoc = {
  updated: LAST_UPDATED,
  intro: `${site.name} respecte votre vie privée. Cette politique explique quels renseignements personnels nous recueillons, pourquoi nous les recueillons, comment nous les utilisons et quels sont vos droits. Elle est rédigée conformément à la Loi sur la protection des renseignements personnels dans le secteur privé du Québec, telle que modifiée par la Loi 25.`,
  sections: [
    {
      heading: "Renseignements que nous recueillons",
      body: [
        "Lorsque vous demandez une estimation ou communiquez avec nous, nous recueillons les renseignements que vous nous fournissez : votre nom, votre numéro de téléphone, votre adresse courriel, l'adresse de la propriété à déneiger, le type de service souhaité, les dimensions et caractéristiques de votre entrée, ainsi que toute note ou photo que vous choisissez de joindre.",
        "Nous recueillons également des renseignements techniques limités lors de votre visite : type d'appareil, navigateur, pages consultées et langue préférée. Ces données servent uniquement au bon fonctionnement du site et à en améliorer l'ergonomie.",
      ],
    },
    {
      heading: "Pourquoi nous les recueillons",
      body: [
        "Vos renseignements servent à préparer votre estimation, à communiquer avec vous au sujet de votre demande, à planifier et exécuter le service de déneigement, à facturer le service et à répondre à vos questions.",
        "Nous n'utilisons pas vos renseignements à des fins de profilage, de publicité ciblée ou de prise de décision automatisée.",
      ],
    },
    {
      heading: "Consentement",
      body: [
        "En soumettant le formulaire d'estimation ou de contact, vous consentez à être joint par téléphone, courriel ou message texte au sujet de votre demande. Vous pouvez retirer ce consentement en tout temps en nous écrivant, ou en répondant STOP à un message texte.",
        "Le retrait de votre consentement n'affecte pas la légalité des communications antérieures, mais peut nous empêcher de vous fournir le service demandé.",
      ],
    },
    {
      heading: "Communication à des tiers",
      body: [
        "Nous ne vendons jamais vos renseignements personnels et nous ne les échangeons pas à des fins commerciales.",
        "Nous les communiquons uniquement à des fournisseurs qui nous aident à exploiter l'entreprise — hébergement du site, envoi de courriels transactionnels, traitement des paiements — et uniquement dans la mesure nécessaire à leur mandat. Ces fournisseurs sont tenus contractuellement de protéger vos renseignements.",
        "Certains de ces fournisseurs peuvent stocker des données à l'extérieur du Québec. Nous procédons à une évaluation des facteurs relatifs à la vie privée avant tout transfert hors Québec, comme l'exige la Loi 25.",
      ],
    },
    {
      heading: "Conservation",
      body: [
        "Nous conservons les demandes d'estimation non converties pendant 24 mois, puis nous les supprimons.",
        "Les dossiers clients actifs, incluant les contrats et les factures, sont conservés pendant sept ans afin de respecter nos obligations fiscales et comptables.",
        "Les photos et vidéos que vous téléversez sont conservées pour la durée du contrat, puis supprimées dans les 12 mois suivant sa fin.",
      ],
    },
    {
      heading: "Sécurité",
      body: [
        "Le site est servi entièrement en HTTPS. Les données sont stockées dans une base de données à accès restreint, protégée par authentification. L'accès aux renseignements personnels est limité aux personnes qui en ont besoin pour exécuter le service.",
        "Aucun système n'est parfaitement sûr. En cas d'incident de confidentialité présentant un risque de préjudice sérieux, nous vous en aviserons ainsi que la Commission d'accès à l'information, comme l'exige la loi.",
      ],
    },
    {
      heading: "Vos droits",
      body: [
        "Vous avez le droit d'accéder aux renseignements personnels que nous détenons à votre sujet, de les faire rectifier s'ils sont inexacts, incomplets ou équivoques, de retirer votre consentement, et de demander leur suppression lorsque la loi le permet.",
        "Vous avez également le droit de recevoir les renseignements que vous nous avez fournis dans un format technologique structuré et couramment utilisé.",
        `Pour exercer l'un de ces droits, écrivez-nous à ${site.email} ou appelez le ${site.phone}. Nous répondons dans les 30 jours.`,
      ],
    },
    {
      heading: "Témoins (cookies)",
      body: [
        "Ce site utilise un seul témoin fonctionnel, qui mémorise votre choix de langue afin de vous présenter le site en français ou en anglais lors de vos visites suivantes.",
        "Nous n'utilisons aucun témoin publicitaire ni aucun traceur tiers à des fins de marketing.",
      ],
    },
    {
      heading: "Responsable de la protection des renseignements personnels",
      body: [
        `Toute question, demande d'accès ou plainte concernant le traitement de vos renseignements personnels peut être adressée au responsable de la protection des renseignements personnels de ${site.name}, à ${site.email} ou au ${site.phone}.`,
        "Si notre réponse ne vous satisfait pas, vous pouvez porter plainte auprès de la Commission d'accès à l'information du Québec.",
      ],
    },
  ],
};

/* ------------------------------------------------------------------ */
/* PRIVACY — EN                                                        */
/* ------------------------------------------------------------------ */

const privacyEn: LegalDoc = {
  updated: LAST_UPDATED,
  intro: `${site.name} respects your privacy. This policy explains what personal information we collect, why we collect it, how we use it, and what your rights are. It is written to comply with Quebec's Act respecting the protection of personal information in the private sector, as amended by Law 25.`,
  sections: [
    {
      heading: "Information we collect",
      body: [
        "When you request an estimate or contact us, we collect the information you provide: your name, phone number, email address, the address of the property to be cleared, the service you want, the dimensions and characteristics of your driveway, and any notes or photos you choose to attach.",
        "We also collect limited technical information during your visit: device type, browser, pages viewed and preferred language. This is used only to operate the site and improve its usability.",
      ],
    },
    {
      heading: "Why we collect it",
      body: [
        "Your information is used to prepare your estimate, communicate with you about your request, schedule and carry out the snow removal service, invoice for it, and answer your questions.",
        "We do not use your information for profiling, targeted advertising, or automated decision-making.",
      ],
    },
    {
      heading: "Consent",
      body: [
        "By submitting the estimate or contact form, you consent to being reached by phone, email or text message about your request. You may withdraw that consent at any time by writing to us, or by replying STOP to a text message.",
        "Withdrawing consent does not affect the lawfulness of prior communications, but may prevent us from providing the service you requested.",
      ],
    },
    {
      heading: "Disclosure to third parties",
      body: [
        "We never sell your personal information and we do not trade it for commercial purposes.",
        "We share it only with vendors who help us operate the business — website hosting, transactional email delivery, payment processing — and only to the extent their work requires. These vendors are contractually bound to protect your information.",
        "Some of these vendors may store data outside Quebec. We carry out a privacy impact assessment before any transfer outside Quebec, as Law 25 requires.",
      ],
    },
    {
      heading: "Retention",
      body: [
        "Estimate requests that do not convert are kept for 24 months, then deleted.",
        "Active client records, including contracts and invoices, are kept for seven years to meet our tax and accounting obligations.",
        "Photos and videos you upload are kept for the duration of the contract, then deleted within 12 months of its end.",
      ],
    },
    {
      heading: "Security",
      body: [
        "The site is served entirely over HTTPS. Data is stored in an access-restricted database protected by authentication. Access to personal information is limited to the people who need it to deliver the service.",
        "No system is perfectly secure. In the event of a confidentiality incident presenting a risk of serious injury, we will notify you and the Commission d'accès à l'information, as the law requires.",
      ],
    },
    {
      heading: "Your rights",
      body: [
        "You have the right to access the personal information we hold about you, to have it corrected if it is inaccurate, incomplete or ambiguous, to withdraw your consent, and to request its deletion where the law permits.",
        "You also have the right to receive the information you provided to us in a structured, commonly used technological format.",
        `To exercise any of these rights, write to ${site.email} or call ${site.phone}. We respond within 30 days.`,
      ],
    },
    {
      heading: "Cookies",
      body: [
        "This site uses a single functional cookie, which remembers your language choice so the site appears in French or English on your next visit.",
        "We use no advertising cookies and no third-party marketing trackers.",
      ],
    },
    {
      heading: "Privacy officer",
      body: [
        `Any question, access request or complaint about the handling of your personal information may be addressed to the privacy officer of ${site.name}, at ${site.email} or ${site.phone}.`,
        "If our response does not satisfy you, you may file a complaint with the Commission d'accès à l'information du Québec.",
      ],
    },
  ],
};

/* ------------------------------------------------------------------ */
/* TERMS — FR                                                          */
/* ------------------------------------------------------------------ */

const termsFr: LegalDoc = {
  updated: LAST_UPDATED,
  intro: `Les présentes conditions encadrent l'utilisation du site de ${site.name} et les services de déneigement que nous offrons. En utilisant ce site ou en retenant nos services, vous acceptez ces conditions.`,
  sections: [
    {
      heading: "Estimations",
      body: [
        "Une estimation soumise par ce site constitue une demande, non un contrat. Elle ne devient un engagement qu'une fois que nous vous avons transmis un prix écrit et que vous l'avez accepté.",
        "Les prix affichés ou évoqués à titre indicatif sur ce site sont des ordres de grandeur. Le prix final dépend de la taille de la surface, du nombre d'accès, des obstacles et de la disponibilité dans votre secteur.",
      ],
    },
    {
      heading: "Portée du service",
      body: [
        "Le service comprend le dégagement des surfaces convenues au contrat. Sauf mention écrite contraire, il exclut le déneigement de toiture, le déglaçage à la vapeur, le déblaiement des véhicules stationnés et le déplacement d'objets laissés sur les surfaces à déneiger.",
        "Nous intervenons automatiquement à partir du seuil d'accumulation prévu au contrat. Lors d'accumulations importantes, un premier passage de dégagement peut être suivi d'un passage de finition après la fin de la tempête.",
      ],
    },
    {
      heading: "Obligations du client",
      body: [
        "Vous vous engagez à laisser les surfaces à déneiger libres de véhicules, de poubelles et d'objets amovibles, et à nous signaler à l'avance tout obstacle fixe : pavé uni, aménagement paysager, système d'arrosage, muret ou dénivelé.",
        "Les obstacles non signalés qui subissent un dommage ne peuvent faire l'objet d'une réclamation.",
      ],
    },
    {
      heading: "Dommages",
      body: [
        "Nos lames sont munies de sabots de protection et chaque propriété est balisée à l'automne. Si nous causons un dommage à une surface correctement balisée et signalée, nous le réparons à nos frais au printemps suivant.",
        "Nous ne sommes pas responsables des dommages causés par la charrue municipale, du soulèvement du pavé dû au gel, de l'usure normale des surfaces, ni des dommages aux éléments non signalés ou dissimulés par la neige.",
      ],
    },
    {
      heading: "Paiement",
      body: [
        "Les contrats saisonniers sont payables en un versement ou en quatre versements mensuels égaux, de novembre à février. Les interventions d'urgence sont payables à la fin du service.",
        "Un compte en souffrance de plus de 30 jours peut entraîner la suspension du service jusqu'à régularisation.",
      ],
    },
    {
      heading: "Annulation",
      body: [
        "Vous pouvez annuler un contrat saisonnier avant la première chute de neige de la saison et obtenir un remboursement complet.",
        "Après le début de la saison, l'annulation donne droit à un remboursement au prorata des mois non entamés, moins les frais d'installation et de retrait des balises.",
      ],
    },
    {
      heading: "Force majeure",
      body: [
        "Nous ne pouvons être tenus responsables d'un retard ou d'une inexécution causés par des circonstances hors de notre contrôle raisonnable : tempête exceptionnelle, urgence civile, fermeture de routes, panne majeure d'équipement ou décision des autorités municipales.",
      ],
    },
    {
      heading: "Contenu du site",
      body: [
        `Le contenu de ce site, incluant les textes, illustrations et le logo, appartient à ${site.name} et ne peut être reproduit sans autorisation écrite.`,
        "Nous nous efforçons de garder l'information exacte et à jour, mais nous ne garantissons pas qu'elle soit exempte d'erreurs.",
      ],
    },
    {
      heading: "Droit applicable",
      body: [
        "Les présentes conditions sont régies par les lois en vigueur dans la province de Québec. Tout litige relève de la compétence exclusive des tribunaux du district judiciaire de Laval.",
      ],
    },
  ],
};

/* ------------------------------------------------------------------ */
/* TERMS — EN                                                          */
/* ------------------------------------------------------------------ */

const termsEn: LegalDoc = {
  updated: LAST_UPDATED,
  intro: `These terms govern your use of the ${site.name} website and the snow removal services we provide. By using this site or engaging our services, you accept these terms.`,
  sections: [
    {
      heading: "Estimates",
      body: [
        "An estimate submitted through this site is a request, not a contract. It becomes binding only once we have sent you a written price and you have accepted it.",
        "Any prices shown or referenced on this site are indicative ranges. The final price depends on the surface area, the number of access points, obstacles, and availability in your sector.",
      ],
    },
    {
      heading: "Scope of service",
      body: [
        "Service covers clearing the surfaces agreed in the contract. Unless stated otherwise in writing, it excludes roof snow removal, steam de-icing, clearing around parked vehicles, and moving objects left on the surfaces to be cleared.",
        "We dispatch automatically once accumulation reaches the threshold set in the contract. During heavy accumulation, an initial clearing pass may be followed by a finishing pass after the storm ends.",
      ],
    },
    {
      heading: "Client obligations",
      body: [
        "You agree to keep the surfaces to be cleared free of vehicles, bins and movable objects, and to tell us in advance about any fixed obstacle: pavers, landscaping, irrigation systems, retaining walls or changes in grade.",
        "Unreported obstacles that sustain damage are not eligible for a claim.",
      ],
    },
    {
      heading: "Damage",
      body: [
        "Our blades are fitted with protective shoes and every property is staked in the fall. If we damage a surface that was properly staked and reported, we repair it at our cost the following spring.",
        "We are not responsible for damage caused by the municipal plow, frost heave of pavers, normal wear of surfaces, or damage to items that were unreported or concealed by snow.",
      ],
    },
    {
      heading: "Payment",
      body: [
        "Seasonal contracts are payable in one instalment or in four equal monthly payments from November to February. Emergency calls are payable on completion of the service.",
        "An account more than 30 days overdue may result in service being suspended until the balance is settled.",
      ],
    },
    {
      heading: "Cancellation",
      body: [
        "You may cancel a seasonal contract before the season's first snowfall and receive a full refund.",
        "After the season begins, cancellation entitles you to a prorated refund for the months not started, less the cost of installing and removing the markers.",
      ],
    },
    {
      heading: "Force majeure",
      body: [
        "We cannot be held responsible for delay or non-performance caused by circumstances beyond our reasonable control: exceptional storms, civil emergencies, road closures, major equipment failure, or decisions by municipal authorities.",
      ],
    },
    {
      heading: "Site content",
      body: [
        `The content of this site, including text, illustrations and the logo, belongs to ${site.name} and may not be reproduced without written permission.`,
        "We work to keep the information accurate and current, but we do not warrant that it is free of errors.",
      ],
    },
    {
      heading: "Governing law",
      body: [
        "These terms are governed by the laws in force in the province of Quebec. Any dispute falls under the exclusive jurisdiction of the courts of the judicial district of Laval.",
      ],
    },
  ],
};
