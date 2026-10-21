// Accueil FR / EN.
import { page, BOOKING, orgLd, type Lang } from "../layout.ts";

const ALT = { fr: "/", en: "/en/" };
const BK = (l: Lang) => `href="${BOOKING[l]}" data-booking target="_blank" rel="noopener noreferrer"`;

const ICON_CODE = `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m8 7-5 5 5 5M16 7l5 5-5 5M13.5 4l-3 16"/></svg>`;
const ICON_LOCK = `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="10.5" width="16" height="10" rx="2.5"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/></svg>`;

const PROOFS = {
  fr: [
    ["/realisations/claudy/", "/assets/realisations/claudy/calendrier.webp", "Calendrier d'occupation des gîtes et espaces d'un tiers-lieu", "Outil interne", "Réservations, paiements, reporting et vie collective dans un seul outil", "Claudy · Les 4 Sources"],
    ["/realisations/tranches-de-vie/", "/assets/realisations/tranches-de-vie/admin-fournee.webp", "Back-office de planification des fournées d'une boulangerie", "E-commerce et production", "Les commandes en ligne planifient chaque fournée, au gramme près", "Tranches de Vie"],
    ["/realisations/terranova/", "/assets/realisations/terranova/projets.webp", "Liste des projets d'une plateforme collaborative", "Plateforme sur mesure", "Un outil de projet taillé pour son métier, à la place d'un logiciel générique", "Terranova · Semisto"],
  ],
  en: [
    ["/en/case-studies/claudy/", "/assets/realisations/claudy/calendrier.webp", "Occupancy calendar of a shared estate's lodges and venues", "Internal tool", "Bookings, payments, reporting and community life in one tool", "Claudy · Les 4 Sources"],
    ["/en/case-studies/tranches-de-vie/", "/assets/realisations/tranches-de-vie/admin-fournee.webp", "Back-office planning a bakery's batches", "E-commerce and production", "Online orders plan every bake, down to the gram", "Tranches de Vie"],
    ["/en/case-studies/terranova/", "/assets/realisations/terranova/projets.webp", "Project list of a collaborative platform", "Custom platform", "A project tool built for the work, instead of generic software", "Terranova · Semisto"],
  ],
};

const proofs = (l: Lang) => PROOFS[l].map(([href, src, alt, k, h, who]) => `
                    <a href="${href}" class="proof plain">
                        <div class="shot"><img src="${src}" alt="${alt}" loading="lazy" width="1600" height="1000"></div>
                        <div class="body"><div class="k">${k}</div><h3>${h}</h3><div class="who">${who}</div></div>
                    </a>`).join("");

const REFS = `<a href="https://tranchesdevie.les4sources.be" target="_blank" rel="noopener noreferrer">Tranches de Vie</a>
                    <a href="https://www.silvea.org" target="_blank" rel="noopener noreferrer">Silvéa</a>
                    <a href="https://www.upcyclinarium.com" target="_blank" rel="noopener noreferrer">Upcyclinarium</a>
                    <a href="https://www.novabirra.com" target="_blank" rel="noopener noreferrer">Novabirra</a>
                    <a href="https://www.petitkiwi.be" target="_blank" rel="noopener noreferrer">Petit Kiwi</a>
                    <a href="https://www.notranet.net" target="_blank" rel="noopener noreferrer">Notranet</a>
                    <a href="https://www.semisto.org" target="_blank" rel="noopener noreferrer">Semisto</a>
                    <a href="https://www.les4sources.be" target="_blank" rel="noopener noreferrer">Les 4 Sources</a>`;

const FR = `
        <section class="hero">
            <div class="wrap hero-grid">
                <div>
                    <p class="eyebrow">Outils internes et agents IA sur mesure</p>
                    <h1 class="display">Votre équipe est là pour la mission, <em>pas pour recopier des tableurs.</em></h1>
                    <p class="lede">Je remplace vos tableurs, vos tâches répétitives et vos abonnements empilés par <strong>des outils internes et des agents IA construits pour votre entreprise</strong>. Le code vous appartient, et chaque euro facturé finance la mission de Semisto.</p>
                    <div class="actions">
                        <a ${BK("fr")} class="btn btn-primary plain">Réserver un call de 30 minutes <span class="arr">→</span></a>
                        <a href="/diagnostic-ia/" class="btn btn-line plain">Le Diagnostic IA</a>
                    </div>
                    <div class="hero-for" aria-label="Pour qui">
                        <span>Entreprises à impact</span><span>5 à 100 personnes</span><span>Wallonie et Bruxelles</span>
                    </div>
                </div>
                <div class="hero-art" aria-hidden="true">
                    <div class="lbl">Aujourd'hui</div>
                    <div class="mess">
                        <span class="chip xls"><i></i>inscriptions_2026_v4_FINAL.xlsx</span>
                        <span class="chip sub"><i></i>Formulaires <em class="x">/ mois</em></span>
                        <span class="chip msg"><i></i>Groupe « commandes »</span>
                        <span class="chip xls"><i></i>stock (copie).xlsx</span>
                        <span class="chip sub"><i></i>CRM <em class="x">/ utilisateur / mois</em></span>
                        <span class="chip sub"><i></i>Automatisations <em class="x">palier supérieur</em></span>
                    </div>
                    <div class="funnel">Demain : un seul outil, le vôtre</div>
                    <div class="app">
                        <div class="app-bar"><i></i><i></i><i></i><span>votre-outil</span></div>
                        <div class="app-row"><div><b>Nouvelle commande par e-mail</b><small>lue et encodée par l'agent</small></div><span class="tag ok">fait</span></div>
                        <div class="app-row"><div><b>Stock mis à jour</b><small>sans recopie</small></div><span class="tag">auto</span></div>
                        <div class="app-row"><div><b>Réponse au client</b><small>préparée par l'agent</small></div><span class="tag wait">à valider</span></div>
                        <div class="app-foot"><span>votre code</span><span>vos données</span><span>hébergé en Suisse</span></div>
                    </div>
                </div>
            </div>
        </section>

        <section class="sec band">
            <div class="wrap">
                <p class="eyebrow">Ce qui coûte cher sans se voir</p>
                <h2 class="h-sec">Deux fuites silencieuses <em>dans votre budget.</em></h2>
                <div class="pains">
                    <div class="pain">
                        <div class="num">01</div>
                        <h3>Les tableurs qui font tourner l'entreprise</h3>
                        <p>Commandes, inscriptions, stocks, plannings : tout passe par un fichier que tout le monde craint d'ouvrir. Il ne coûte rien à l'achat. Il se paie en heures de recopie, en erreurs et en dépendance à une seule personne.</p>
                        <ul><li>Une information saisie deux ou trois fois</li><li>Des versions qui se contredisent</li><li>Une seule personne qui sait comment ça marche</li></ul>
                    </div>
                    <div class="pain">
                        <div class="num">02</div>
                        <h3>Les abonnements qui s'empilent</h3>
                        <p>Formulaires, agenda, e-mailing, CRM, automatisations pour relier le tout. Chaque abonnement est raisonnable. Leur somme ne l'est plus, et elle grimpe à chaque nouvelle personne dans l'équipe.</p>
                        <ul><li>Un prix par utilisateur qui suit votre croissance</li><li>Des paliers qui sautent au mauvais moment</li><li>Des outils complets payés pour trois fonctions</li></ul>
                    </div>
                </div>
                <p class="pains-foot">Un outil sur mesure ne convient pas à tout le monde : il a lui aussi un coût mensuel. <strong>Le Diagnostic IA fait le calcul avec vous, sur cinq ans, avant de construire quoi que ce soit.</strong></p>
            </div>
        </section>

        <section class="sec" id="offre">
            <div class="wrap">
                <div class="sec-head">
                    <div>
                        <p class="eyebrow">L'offre</p>
                        <h2 class="h-sec">Trois temps, <em>une seule personne responsable.</em></h2>
                    </div>
                    <a href="/tarifs/" class="link-arrow plain">Tous les tarifs →</a>
                </div>
                <div class="offer">
                    <div class="offer-card is-first">
                        <div class="step">Le point de départ <b>1</b></div>
                        <h3>Diagnostic IA</h3>
                        <div class="price">3 500 € <small>prix fixe, HTVA</small></div>
                        <p>Deux semaines pour savoir où l'IA et le sur-mesure vous font gagner le plus.</p>
                        <ul><li>Interviews de vos équipes</li><li>Inventaire de vos tableurs et de vos abonnements</li><li>Top 3 des opportunités, chiffrées sur cinq ans</li><li>Déduit si on construit ensuite</li></ul>
                        <a href="/diagnostic-ia/" class="link-arrow plain">Le Diagnostic en détail →</a>
                    </div>
                    <div class="offer-card">
                        <div class="step">La construction <b>2</b></div>
                        <h3>Votre outil sur mesure</h3>
                        <div class="price">Sur devis <small>prix fixe annoncé d'avance</small></div>
                        <p>Je conçois et livre l'outil interne ou l'agent IA que le diagnostic a désigné.</p>
                        <ul><li>Outils de gestion et back-offices</li><li>Agents IA qui lisent, préparent, mettent à jour</li><li>Testé, documenté, mis en ligne</li><li>Le code source vous est remis</li></ul>
                        <a href="/realisations/" class="link-arrow plain">Voir des réalisations →</a>
                    </div>
                    <div class="offer-card">
                        <div class="step">La vie de l'outil <b>3</b></div>
                        <h3>Abonnement</h3>
                        <div class="price">dès 390 € <small>/ mois, HTVA, sans engagement</small></div>
                        <p>L'outil reste en vie, surveillé, à jour, et continue d'évoluer avec vous.</p>
                        <ul><li>Maintenance et mises à jour</li><li>Correction des bugs</li><li>Petites évolutions incluses chaque mois</li><li>Trois paliers : 390, 890 ou 1 890 €</li></ul>
                        <a href="/tarifs/#abonnements" class="link-arrow plain">Comparer les paliers →</a>
                    </div>
                </div>
                <div class="door">
                    <div class="door-k">ou</div>
                    <div>
                        <h3>Votre application existe déjà, mais elle vieillit ?</h3>
                        <p>Plus de mises à jour de sécurité, un développeur parti, la moindre demande qui devient un chantier. Je reprends toute application web : je la comprends, je la documente, je la remets à jour par paliers testés.</p>
                    </div>
                    <a href="/maintenance/" class="btn btn-line plain">Reprise d'application <span class="arr">→</span></a>
                </div>
            </div>
        </section>

        <section class="sec sec--soft">
            <div class="wrap split">
                <div>
                    <p class="eyebrow">Pour qui</p>
                    <h2 class="h-sec">Pour les entreprises <em>qui portent une mission.</em></h2>
                    <p class="sec-intro">Je ne m'adresse pas à tout le monde. Si vous vous reconnaissez dans ces quatre lignes, on devrait se parler.</p>
                </div>
                <div>
                    <ul class="checks">
                        <li><div><b>De 5 à 100 personnes</b><span>Assez grand pour que les tableurs coincent, assez petit pour qu'un logiciel d'entreprise soit démesuré. Un agent IA prend tout son sens au-delà d'une dizaine de personnes&nbsp;; en dessous, on commence par l'outil interne.</span></div></li>
                        <li><div><b>La durabilité au cœur du modèle</b><span>B Corp, coopérative, PME durable, producteur établi : l'impact fait partie de ce que vous vendez.</span></div></li>
                        <li><div><b>Des process qui tiennent sur Excel et WhatsApp</b><span>Et une facture d'abonnements que personne n'a vraiment décidée.</span></div></li>
                        <li><div><b>Quelqu'un qui peut décider</b><span>Une direction ou une coordination prête à investir pour que son équipe gagne du temps.</span></div></li>
                    </ul>
                    <p class="aside-note">Fondation ou ONG établie&nbsp;? Bienvenue aussi, sur devis.</p>
                </div>
            </div>
        </section>

        <section class="sec">
            <div class="wrap">
                <div class="sec-head">
                    <div>
                        <p class="eyebrow">Ce que je construis</p>
                        <h2 class="h-sec">Des outils qui font <em>le travail ingrat.</em></h2>
                    </div>
                </div>
                <div class="missions">
                    <div class="mission"><div class="who">Coopérative</div><p>Le suivi des commandes, des stocks et des livraisons, sans un seul tableur</p></div>
                    <div class="mission"><div class="who">Domaine viticole</div><p>La gestion des parcelles, des vendanges, des stocks et des ventes</p></div>
                    <div class="mission"><div class="who">Producteur</div><p>Une boutique en ligne reliée à la production et aux livraisons</p></div>
                    <div class="mission"><div class="who">PME à impact</div><p>Un CRM interne à la place de trois abonnements qui se recoupent</p></div>
                    <div class="mission"><div class="who">Organisme de formation</div><p>Inscriptions, sessions, formateurs et attestations dans un seul outil</p></div>
                    <div class="mission"><div class="who">Fondation</div><p>Le traitement des appels à projets, de la candidature au suivi</p></div>
                    <div class="mission"><div class="who">ONG</div><p>Un back-office complet pour les dons, les bénévoles et les campagnes</p></div>
                    <div class="mission"><div class="who">Toute équipe</div><p>Un agent IA qui trie les demandes et prépare les réponses à valider</p></div>
                </div>
            </div>
        </section>

        <section class="sec band--mauve">
            <div class="wrap manifesto-grid manifesto">
                <div>
                    <p class="eyebrow">Ma façon de travailler</p>
                    <p class="big">Les agents écrivent le code. <em>Je choisis ce qui reste.</em></p>
                    <p class="sub">J'orchestre une série d'agents IA qui travaillent avec moi. Direction, arbitrages, vérification : rien ne part en ligne sans que je l'aie relu et validé. Une personne responsable, la capacité d'une équipe.</p>
                </div>
                <div class="facts">
                    <div><b>Depuis 2004</b><span>analyste-programmeur, co-fondateur d'une agence web, de startups et d'e-commerces</span></div>
                    <div><b>Depuis 2023</b><span>des applications conçues avec des agents IA, d'abord pour mes propres structures</span></div>
                    <div><b>Un seul interlocuteur</b><span>vous parlez à la personne qui construit</span></div>
                </div>
            </div>
        </section>

        <section class="sec">
            <div class="wrap">
                <div class="sec-head">
                    <div>
                        <p class="eyebrow">Déjà en production</p>
                        <h2 class="h-sec">Des outils <em>qui tournent tous les jours.</em></h2>
                    </div>
                    <a href="/realisations/" class="link-arrow plain">Toutes les réalisations →</a>
                </div>
                <div class="proofs">${proofs("fr")}
                </div>
                <div class="logos"><span class="k">Ils m'ont fait confiance</span>
                    ${REFS}
                </div>
            </div>
        </section>

        <section class="sec sec--soft">
            <div class="wrap">
                <p class="eyebrow">Sans dépendance</p>
                <h2 class="h-sec">Votre outil <em>reste à vous.</em></h2>
                <p class="sec-intro">Travailler avec une seule personne pose une question légitime : et si elle disparaît&nbsp;? La réponse est écrite dans chaque projet.</p>
                <div class="trust">
                    <div class="trust-card">
                        <div class="ic">${ICON_CODE}</div>
                        <h3>Votre code vous appartient</h3>
                        <ul>
                            <li><b>Le code source vous est remis</b>, hébergé sur GitHub, dans un espace à votre nom.</li>
                            <li><b>Des technologies standard</b>, connues de milliers de développeurs.</li>
                            <li><b>Documentation et tests livrés</b> : un autre développeur peut reprendre le projet.</li>
                        </ul>
                    </div>
                    <div class="trust-card">
                        <div class="ic">${ICON_LOCK}</div>
                        <h3>Vos données</h3>
                        <ul>
                            <li><b>Hébergement chez Infomaniak, en Suisse</b>, un hébergeur indépendant.</li>
                            <li><b>Modèle IA&nbsp;: Claude, d'Anthropic</b>, utilisé via son API professionnelle.</li>
                            <li><b>Un agent ne fait que ce qu'on lui permet</b> : ce qui engage l'entreprise passe par une validation humaine.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>

        <section class="sec" id="semisto">
            <div class="wrap semisto">
                <div>
                    <p class="eyebrow">Semisto, c'est quoi&nbsp;?</p>
                    <p class="quote">Transformer l'Europe en un maillage <em>de forêts comestibles.</em></p>
                    <p class="prose">C'est la mission de <a href="https://www.semisto.org" target="_blank" rel="noopener noreferrer">Semisto</a>, l'association que j'ai fondée. Elle conçoit, plante et transmet des jardins-forêts&nbsp;: des écosystèmes nourriciers qui régénèrent le sol, la biodiversité et les liens entre les gens. Super Génial est son service IT.</p>
                    <div class="money"><b>Chaque euro facturé va à Semisto ASBL, sans actionnaire.</b> Il rémunère mon travail et finance la mission. Votre budget IT devient aussi un soutien, que vous pouvez citer dans votre rapport d'impact.</div>
                </div>
                <ul class="poles">
                    <li><b>Design Labs</b><span>le bureau d'études qui dessine les jardins-forêts</span></li>
                    <li><b>Mycorrhiza</b><span>la réalisation, avec un réseau de pros du jardin</span></li>
                    <li><b>Semisto Designer</b><span>l'outil en ligne pour concevoir son jardin-forêt</span></li>
                    <li><b>Academy</b><span>les formations, d'un jour à trente jours</span></li>
                    <li><b>Pépinière-école</b><span>des plants résilients, et un lieu pour apprendre à les multiplier</span></li>
                    <li><b>Food Forest Heroes</b><span>les bénévoles qui plantent, en musique</span></li>
                </ul>
            </div>
        </section>

        <section class="sec band" id="contact">
            <div class="wrap contact-band">
                <div>
                    <p class="eyebrow">On en parle&nbsp;?</p>
                    <h2 class="h-sec">Parlons de <em>vos tableurs.</em></h2>
                    <p>Trente minutes, sans engagement, pour voir si je peux vous être utile. Pour en tirer le meilleur, gardez en tête ces trois questions&nbsp;:</p>
                </div>
                <div>
                    <ol class="qs">
                        <li>Combien de personnes compte votre équipe&nbsp;?</li>
                        <li>Sur quels tableurs, outils et abonnements tourne-t-elle aujourd'hui&nbsp;?</li>
                        <li>Quelle tâche aimeriez-vous ne plus jamais faire à la main&nbsp;?</li>
                    </ol>
                    <a ${BK("fr")} class="btn btn-light plain">Réserver un call de 30 minutes <span class="arr">→</span></a>
                    <div class="contact-alt"><a href="mailto:team@supergenial.be">team@supergenial.be</a><a href="https://www.linkedin.com/in/michaelhulet/" target="_blank" rel="noopener noreferrer">LinkedIn</a><a href="https://t.me/supergenialdotbe" target="_blank" rel="noopener noreferrer">Telegram</a></div>
                </div>
            </div>
        </section>

        <section class="sec">
            <div class="wrap builder">
                <div>
                    <p class="eyebrow">Qui construit</p>
                    <h2 class="h-sec">Michael Hulet</h2>
                    <p class="role">Fondateur de Semisto, développeur, entrepreneur. Basé à Yvoir, au tiers-lieu Les 4 Sources.</p>
                </div>
                <ul>
                    <li>Analyste-programmeur depuis 2004, co-fondateur d'une agence web, de startups et d'e-commerces</li>
                    <li>Des deux côtés du comptoir&nbsp;: co-fondateur d'un magasin, d'un lieu d'accueil avec gîtes et salles, d'une association de formation</li>
                    <li>Fondateur de l'association <a href="https://www.semisto.org" target="_blank" rel="noopener noreferrer">Semisto</a> et co-fondateur du tiers-lieu <a href="https://www.les4sources.be" target="_blank" rel="noopener noreferrer">Les 4 Sources</a></li>
                    <li>Je construis d'abord pour mes propres structures, puis je propose aux autres ce qui a fait ses preuves</li>
                </ul>
            </div>
        </section>
`;

const EN = `
        <section class="hero">
            <div class="wrap hero-grid">
                <div>
                    <p class="eyebrow">Custom internal tools and AI agents</p>
                    <h1 class="display">Your team is here for the mission, <em>not to copy spreadsheets.</em></h1>
                    <p class="lede">I replace your spreadsheets, your repetitive tasks and your pile of software subscriptions with <strong>internal tools and AI agents built for your company</strong>. You own the code, and every euro invoiced funds Semisto's mission.</p>
                    <div class="actions">
                        <a ${BK("en")} class="btn btn-primary plain">Book a 30-minute call <span class="arr">→</span></a>
                        <a href="/en/ai-assessment/" class="btn btn-line plain">The AI Assessment</a>
                    </div>
                    <div class="hero-for" aria-label="Who it is for">
                        <span>Impact-driven companies</span><span>5 to 100 people</span><span>Wallonia and Brussels</span>
                    </div>
                </div>
                <div class="hero-art" aria-hidden="true">
                    <div class="lbl">Today</div>
                    <div class="mess">
                        <span class="chip xls"><i></i>registrations_2026_v4_FINAL.xlsx</span>
                        <span class="chip sub"><i></i>Forms <em class="x">/ month</em></span>
                        <span class="chip msg"><i></i>“Orders” group chat</span>
                        <span class="chip xls"><i></i>stock (copy).xlsx</span>
                        <span class="chip sub"><i></i>CRM <em class="x">/ user / month</em></span>
                        <span class="chip sub"><i></i>Automations <em class="x">next tier up</em></span>
                    </div>
                    <div class="funnel">Tomorrow: one tool, yours</div>
                    <div class="app">
                        <div class="app-bar"><i></i><i></i><i></i><span>your-tool</span></div>
                        <div class="app-row"><div><b>New order by e-mail</b><small>read and entered by the agent</small></div><span class="tag ok">done</span></div>
                        <div class="app-row"><div><b>Stock updated</b><small>no copying</small></div><span class="tag">auto</span></div>
                        <div class="app-row"><div><b>Reply to the customer</b><small>drafted by the agent</small></div><span class="tag wait">to approve</span></div>
                        <div class="app-foot"><span>your code</span><span>your data</span><span>hosted in Switzerland</span></div>
                    </div>
                </div>
            </div>
        </section>

        <section class="sec band">
            <div class="wrap">
                <p class="eyebrow">What costs a lot without showing</p>
                <h2 class="h-sec">Two silent leaks <em>in your budget.</em></h2>
                <div class="pains">
                    <div class="pain">
                        <div class="num">01</div>
                        <h3>The spreadsheets that run the company</h3>
                        <p>Orders, registrations, stock, schedules: everything goes through a file everyone is afraid to open. It costs nothing to buy. You pay for it in hours of copying, in mistakes and in depending on a single person.</p>
                        <ul><li>The same information typed two or three times</li><li>Versions that contradict each other</li><li>Only one person who knows how it works</li></ul>
                    </div>
                    <div class="pain">
                        <div class="num">02</div>
                        <h3>The subscriptions that pile up</h3>
                        <p>Forms, calendar, e-mailing, CRM, automations to connect it all. Each subscription is reasonable. Their sum no longer is, and it climbs with every new person on the team.</p>
                        <ul><li>A per-user price that follows your growth</li><li>Tiers that jump at the worst moment</li><li>Full products paid for three features</li></ul>
                    </div>
                </div>
                <p class="pains-foot">A custom tool is not for everyone: it has a monthly cost too. <strong>The AI Assessment does the maths with you, over five years, before anything is built.</strong></p>
            </div>
        </section>

        <section class="sec" id="offer">
            <div class="wrap">
                <div class="sec-head">
                    <div>
                        <p class="eyebrow">The offer</p>
                        <h2 class="h-sec">Three steps, <em>one accountable person.</em></h2>
                    </div>
                    <a href="/en/pricing/" class="link-arrow plain">Full pricing →</a>
                </div>
                <div class="offer">
                    <div class="offer-card is-first">
                        <div class="step">The starting point <b>1</b></div>
                        <h3>AI Assessment</h3>
                        <div class="price">€3,500 <small>fixed price, excl. VAT</small></div>
                        <p>Two weeks to find where AI and custom tools save you the most.</p>
                        <ul><li>Interviews with your teams</li><li>Inventory of your spreadsheets and subscriptions</li><li>Top 3 opportunities, costed over five years</li><li>Deducted if we build next</li></ul>
                        <a href="/en/ai-assessment/" class="link-arrow plain">The Assessment in detail →</a>
                    </div>
                    <div class="offer-card">
                        <div class="step">The build <b>2</b></div>
                        <h3>Your custom tool</h3>
                        <div class="price">On quote <small>fixed price, agreed upfront</small></div>
                        <p>I design and deliver the internal tool or AI agent the assessment pointed to.</p>
                        <ul><li>Management tools and back-offices</li><li>AI agents that read, draft and update</li><li>Tested, documented, deployed</li><li>The source code is handed over</li></ul>
                        <a href="/en/case-studies/" class="link-arrow plain">See case studies →</a>
                    </div>
                    <div class="offer-card">
                        <div class="step">The tool's life <b>3</b></div>
                        <h3>Subscription</h3>
                        <div class="price">from €390 <small>/ month, excl. VAT, no lock-in</small></div>
                        <p>The tool stays alive, monitored, up to date, and keeps evolving with you.</p>
                        <ul><li>Maintenance and updates</li><li>Bug fixes</li><li>Small improvements included every month</li><li>Three tiers: €390, €890 or €1,890</li></ul>
                        <a href="/en/pricing/#subscriptions" class="link-arrow plain">Compare tiers →</a>
                    </div>
                </div>
                <div class="door">
                    <div class="door-k">or</div>
                    <div>
                        <h3>You already have an application, but it is ageing?</h3>
                        <p>No more security updates, a developer who left, every small request turning into a project. I take over any web application: I understand it, document it and bring it up to date in tested steps.</p>
                    </div>
                    <a href="/en/maintenance/" class="btn btn-line plain">Application take-over <span class="arr">→</span></a>
                </div>
            </div>
        </section>

        <section class="sec sec--soft">
            <div class="wrap split">
                <div>
                    <p class="eyebrow">Who it is for</p>
                    <h2 class="h-sec">For companies <em>that carry a mission.</em></h2>
                    <p class="sec-intro">I don't work for everyone. If these four lines sound like you, we should talk.</p>
                </div>
                <div>
                    <ul class="checks">
                        <li><div><b>5 to 100 people</b><span>Big enough for spreadsheets to break, small enough for enterprise software to be overkill. An AI agent really pays off beyond ten or so people; below that, we start with the internal tool.</span></div></li>
                        <li><div><b>Sustainability at the core</b><span>B Corp, cooperative, sustainable SME, established producer: impact is part of what you sell.</span></div></li>
                        <li><div><b>Processes held together by Excel and WhatsApp</b><span>And a subscriptions bill nobody really decided on.</span></div></li>
                        <li><div><b>Someone who can decide</b><span>Management ready to invest so the team gets its time back.</span></div></li>
                    </ul>
                    <p class="aside-note">An established foundation or NGO? Welcome too, on quote.</p>
                </div>
            </div>
        </section>

        <section class="sec">
            <div class="wrap">
                <div class="sec-head">
                    <div>
                        <p class="eyebrow">What I build</p>
                        <h2 class="h-sec">Tools that do <em>the thankless work.</em></h2>
                    </div>
                </div>
                <div class="missions">
                    <div class="mission"><div class="who">Cooperative</div><p>Tracking orders, stock and deliveries, without a single spreadsheet</p></div>
                    <div class="mission"><div class="who">Wine estate</div><p>Managing plots, harvests, stock and sales</p></div>
                    <div class="mission"><div class="who">Producer</div><p>An online shop connected to production and deliveries</p></div>
                    <div class="mission"><div class="who">Impact SME</div><p>An in-house CRM instead of three overlapping subscriptions</p></div>
                    <div class="mission"><div class="who">Training provider</div><p>Registrations, sessions, trainers and certificates in one tool</p></div>
                    <div class="mission"><div class="who">Foundation</div><p>Handling calls for projects, from application to follow-up</p></div>
                    <div class="mission"><div class="who">NGO</div><p>A complete back-office for donations, volunteers and campaigns</p></div>
                    <div class="mission"><div class="who">Any team</div><p>An AI agent that sorts requests and drafts replies to approve</p></div>
                </div>
            </div>
        </section>

        <section class="sec band--mauve">
            <div class="wrap manifesto-grid manifesto">
                <div>
                    <p class="eyebrow">How I work</p>
                    <p class="big">The agents write the code. <em>I decide what stays.</em></p>
                    <p class="sub">I orchestrate a set of AI agents that work with me. Direction, trade-offs, verification: nothing goes live until I have reviewed and approved it. One accountable person, the capacity of a team.</p>
                </div>
                <div class="facts">
                    <div><b>Since 2004</b><span>analyst-programmer, co-founder of a web agency, start-ups and online shops</span></div>
                    <div><b>Since 2023</b><span>applications built with AI agents, first for my own organisations</span></div>
                    <div><b>One contact</b><span>you talk to the person who builds</span></div>
                </div>
            </div>
        </section>

        <section class="sec">
            <div class="wrap">
                <div class="sec-head">
                    <div>
                        <p class="eyebrow">Already in production</p>
                        <h2 class="h-sec">Tools <em>used every day.</em></h2>
                    </div>
                    <a href="/en/case-studies/" class="link-arrow plain">All case studies →</a>
                </div>
                <div class="proofs">${proofs("en")}
                </div>
                <div class="logos"><span class="k">They trusted me</span>
                    ${REFS}
                </div>
            </div>
        </section>

        <section class="sec sec--soft">
            <div class="wrap">
                <p class="eyebrow">No lock-in</p>
                <h2 class="h-sec">Your tool <em>stays yours.</em></h2>
                <p class="sec-intro">Working with a single person raises a fair question: what if they disappear? The answer is written into every project.</p>
                <div class="trust">
                    <div class="trust-card">
                        <div class="ic">${ICON_CODE}</div>
                        <h3>You own your code</h3>
                        <ul>
                            <li><b>The source code is handed over</b>, hosted on GitHub, in a space in your name.</li>
                            <li><b>Standard technologies</b>, known by thousands of developers.</li>
                            <li><b>Documentation and tests delivered</b>: another developer can take over.</li>
                        </ul>
                    </div>
                    <div class="trust-card">
                        <div class="ic">${ICON_LOCK}</div>
                        <h3>Your data</h3>
                        <ul>
                            <li><b>Hosted by Infomaniak, in Switzerland</b>, an independent provider.</li>
                            <li><b>AI model: Claude, by Anthropic</b>, used through its business API.</li>
                            <li><b>An agent only does what it is allowed to</b>: anything that commits the company goes through human approval.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>

        <section class="sec" id="semisto">
            <div class="wrap semisto">
                <div>
                    <p class="eyebrow">What is Semisto?</p>
                    <p class="quote">Turning Europe into a network <em>of edible forests.</em></p>
                    <p class="prose">That is the mission of <a href="https://www.semisto.org" target="_blank" rel="noopener noreferrer">Semisto</a>, the association I founded. It designs, plants and teaches food forests: food-producing ecosystems that regenerate soil, biodiversity and the bonds between people. Super Génial is its IT service.</p>
                    <div class="money"><b>Every euro invoiced goes to Semisto ASBL, with no shareholders.</b> It pays for my work and funds the mission. Your IT budget also becomes support you can cite in your impact report.</div>
                </div>
                <ul class="poles">
                    <li><b>Design Labs</b><span>the design studio that draws food forests</span></li>
                    <li><b>Mycorrhiza</b><span>the planting, with a network of garden professionals</span></li>
                    <li><b>Semisto Designer</b><span>the online tool to design your own food forest</span></li>
                    <li><b>Academy</b><span>training, from one day to thirty</span></li>
                    <li><b>Nursery school</b><span>resilient plants, and a place to learn how to propagate them</span></li>
                    <li><b>Food Forest Heroes</b><span>the volunteers who plant, to music</span></li>
                </ul>
            </div>
        </section>

        <section class="sec band" id="contact">
            <div class="wrap contact-band">
                <div>
                    <p class="eyebrow">Shall we talk?</p>
                    <h2 class="h-sec">Let's talk about <em>your spreadsheets.</em></h2>
                    <p>Thirty minutes, no commitment, to see whether I can help. To make the most of it, keep these three questions in mind:</p>
                </div>
                <div>
                    <ol class="qs">
                        <li>How many people are on your team?</li>
                        <li>Which spreadsheets, tools and subscriptions does it run on today?</li>
                        <li>Which task would you love to never do by hand again?</li>
                    </ol>
                    <a ${BK("en")} class="btn btn-light plain">Book a 30-minute call <span class="arr">→</span></a>
                    <div class="contact-alt"><a href="mailto:team@supergenial.be">team@supergenial.be</a><a href="https://www.linkedin.com/in/michaelhulet/" target="_blank" rel="noopener noreferrer">LinkedIn</a><a href="https://t.me/supergenialdotbe" target="_blank" rel="noopener noreferrer">Telegram</a></div>
                </div>
            </div>
        </section>

        <section class="sec">
            <div class="wrap builder">
                <div>
                    <p class="eyebrow">Who builds</p>
                    <h2 class="h-sec">Michael Hulet</h2>
                    <p class="role">Founder of Semisto, developer, entrepreneur. Based in Yvoir, Belgium, at the Les 4 Sources community estate.</p>
                </div>
                <ul>
                    <li>Analyst-programmer since 2004, co-founder of a web agency, start-ups and online shops</li>
                    <li>On both sides of the counter: co-founder of a shop, a guest house with venues, and a training association</li>
                    <li>Founder of the <a href="https://www.semisto.org" target="_blank" rel="noopener noreferrer">Semisto</a> association and co-founder of the <a href="https://www.les4sources.be" target="_blank" rel="noopener noreferrer">Les 4 Sources</a> community estate</li>
                    <li>I build for my own organisations first, then offer others what has proven itself</li>
                </ul>
            </div>
        </section>
`;

export const home = (lang: Lang) => page({
  lang, path: ALT[lang], alt: ALT, wide: true, bodyClass: "page-home",
  title: lang === "fr" ? "Super Génial · Outils internes et agents IA sur mesure" : "Super Génial · Custom internal tools and AI agents",
  description: lang === "fr"
    ? "Le service IT de Semisto remplace vos tableurs et vos abonnements empilés par des outils internes et des agents IA sur mesure, pour les entreprises à impact."
    : "Semisto's IT service replaces your spreadsheets and stacked subscriptions with custom internal tools and AI agents, for impact-driven companies.",
  og: "home", ogAlt: lang === "fr" ? "Super Génial by Semisto : votre équipe est là pour la mission, pas pour recopier des tableurs" : "Super Génial by Semisto: your team is here for the mission, not to copy spreadsheets",
  jsonld: [orgLd(lang)],
  body: lang === "fr" ? FR : EN,
});
