/**
 * LEXGUARD AI - Past Case Matcher Logic
 * * INPUT: query (str)
 * OUTPUT:
 * {
 * "success": True,
 * "cases": [
 * {
 * "title": str,
 * "summary": str,
 * "outcome": str
 * }
 * ]
 * }
 */

// --- 50 LANDMARK CASE DATABASE ---
const mockDatabase = [
  // Constitutional & Fundamental Rights
  {
    id: 1,
    case_name: "Kesavananda Bharati vs. State of Kerala",
    year: "1973",
    court: "Supreme Court",
    judges: "S.M. Sikri, A.N. Grover, B.C. Ray",
    judgement: "Basic Structure Doctrine Established",
    narrative:
      "The Supreme Court ruled that while Parliament has wide powers to amend the Constitution, it cannot alter its 'Basic Structure'.",
    key_people: "Kesavananda Bharati, Nani Palkhivala",
  },
  {
    id: 2,
    case_name: "Justice K.S. Puttaswamy vs. Union of India",
    year: "2017",
    court: "Supreme Court",
    judges: "J.S. Khehar, J. Chelameswar",
    judgement: "Right to Privacy declared Fundamental",
    narrative:
      "A 9-judge bench unanimously held that the Right to Privacy is an intrinsic part of the Right to Life and Liberty under Article 21.",
    key_people: "K.S. Puttaswamy, D.Y. Chandrachud",
  },
  {
    id: 3,
    case_name: "Maneka Gandhi vs. Union of India",
    year: "1978",
    court: "Supreme Court",
    judges: "M.H. Beg, P.N. Bhagwati",
    judgement: "Golden Triangle Rule (Art 14, 19, 21)",
    narrative:
      "Established that any law depriving personal liberty must be 'just, fair, and reasonable', not merely a procedure.",
    key_people: "Maneka Gandhi",
  },
  {
    id: 4,
    case_name: "A.D.M. Jabalpur vs. Shivkant Shukla",
    year: "1976",
    court: "Supreme Court",
    judges: "A.N. Ray, H.R. Khanna (Dissent)",
    judgement: "Habeas Corpus Case (Emergency Era)",
    narrative:
      "A controversial ruling stating fundamental rights could be suspended during an Emergency. Justice Khanna's dissent is legendary.",
    key_people: "H.R. Khanna, Indira Gandhi",
  },
  {
    id: 5,
    case_name: "S.R. Bommai vs. Union of India",
    year: "1994",
    court: "Supreme Court",
    judges: "S.R. Pandian, A.M. Ahmadi",
    judgement: "Secularism as Basic Structure",
    narrative:
      "Limited the power of the President to dismiss state governments under Article 356 and upheld Secularism.",
    key_people: "S.R. Bommai",
  },

  // Gender Equality & Women's Rights
  {
    id: 6,
    case_name: "Vishaka vs. State of Rajasthan",
    year: "1997",
    court: "Supreme Court",
    judges: "J.S. Verma, Sujata Manohar",
    judgement: "Sexual Harassment Guidelines",
    narrative:
      "Created 'Vishaka Guidelines' for workplace safety until the POSH Act 2013 was enacted.",
    key_people: "Bhanwari Devi",
  },
  {
    id: 7,
    case_name: "Shayara Bano vs. Union of India",
    year: "2017",
    court: "Supreme Court",
    judges: "J.S. Khehar, Kurian Joseph",
    judgement: "Triple Talaq declared Unconstitutional",
    narrative:
      "Struck down the practice of Talaq-e-Biddat (Instant Triple Talaq) as being arbitrary and against the Quran.",
    key_people: "Shayara Bano",
  },
  {
    id: 8,
    case_name: "Mary Roy vs. State of Kerala",
    year: "1986",
    court: "Supreme Court",
    judges: "P.N. Bhagwati, R.S. Pathak",
    judgement: "Equal Inheritance for Christian Women",
    narrative:
      "Granted Syrian Christian women in Kerala equal rights to inherit ancestral property.",
    key_people: "Mary Roy, Arundhati Roy",
  },
  {
    id: 9,
    case_name: "Laxmi vs. Union of India",
    year: "2014",
    court: "Supreme Court",
    judges: "R.M. Lodha",
    judgement: "Regulation of Acid Sales",
    narrative:
      "A landmark PIL that led to strict regulations on acid sales and compensation for acid attack survivors.",
    key_people: "Laxmi Agarwal",
  },
  {
    id: 10,
    case_name: "Joseph Shine vs. Union of India",
    year: "2018",
    court: "Supreme Court",
    judges: "Dipak Misra, D.Y. Chandrachud",
    judgement: "Adultery Decriminalized",
    narrative:
      "Struck down Section 497 of IPC, stating that treating a woman as the property of her husband is unconstitutional.",
    key_people: "Joseph Shine",
  },

  // Environmental Law
  {
    id: 11,
    case_name: "M.C. Mehta vs. Union of India (Oleum Gas Leak)",
    year: "1986",
    court: "Supreme Court",
    judges: "P.N. Bhagwati",
    judgement: "Absolute Liability Principle",
    narrative:
      "Enterprises in hazardous industries are absolutely liable for accidents, with no 'Act of God' exceptions.",
    key_people: "M.C. Mehta",
  },
  {
    id: 12,
    case_name: "Vellore Citizens Welfare Forum vs. Union of India",
    year: "1996",
    court: "Supreme Court",
    judges: "Kuldip Singh",
    judgement: "Polluter Pays Principle",
    narrative:
      "Tanneries in Tamil Nadu were ordered to pay for environmental damage caused to the Palar River.",
    key_people: "Kuldip Singh (Green Judge)",
  },
  {
    id: 13,
    case_name: "T.N. Godavarman Thirumulpad vs. Union of India",
    year: "1996",
    court: "Supreme Court",
    judges: "J.S. Verma",
    judgement: "Forest Protection Guidelines",
    narrative:
      "An ongoing case that redefined 'forest' and brought all forest land under constitutional protection.",
    key_people: "T.N. Godavarman",
  },
  {
    id: 14,
    case_name: "Subhash Kumar vs. State of Bihar",
    year: "1991",
    court: "Supreme Court",
    judges: "K.N. Singh",
    judgement: "Right to Clean Environment",
    narrative:
      "Held that the Right to Life (Art 21) includes the right to enjoy pollution-free water and air.",
    key_people: "Subhash Kumar",
  },
  {
    id: 15,
    case_name: "Rural Litigation and Entitlement Kendra vs. State of UP",
    year: "1985",
    court: "Supreme Court",
    judges: "P.N. Bhagwati",
    judgement: "Doon Valley Mining Ban",
    narrative:
      "The first case in India involving environmental protection where mining was stopped for ecological balance.",
    key_people: "P.N. Bhagwati",
  },

  // Criminal Justice & Human Rights
  {
    id: 16,
    case_name: "D.K. Basu vs. State of West Bengal",
    year: "1997",
    court: "Supreme Court",
    judges: "Kuldip Singh, A.S. Anand",
    judgement: "Guidelines for Arrest/Detention",
    narrative:
      "Laid down mandatory procedures for police during arrest to prevent custodial torture.",
    key_people: "D.K. Basu",
  },
  {
    id: 17,
    case_name: "Bachan Singh vs. State of Punjab",
    year: "1980",
    court: "Supreme Court",
    judges: "Y.V. Chandrachud",
    judgement: "Rarest of Rare Doctrine",
    narrative:
      "Established that the death penalty should only be awarded in the 'rarest of rare' cases.",
    key_people: "Bachan Singh",
  },
  {
    id: 18,
    case_name: "Hussainara Khatoon vs. State of Bihar",
    year: "1979",
    court: "Supreme Court",
    judges: "P.N. Bhagwati",
    judgement: "Right to Speedy Trial",
    narrative:
      "The first major PIL that led to the release of thousands of undertrials languishing in jail.",
    key_people: "Pushpa Kapila Hingorani",
  },
  {
    id: 19,
    case_name: "Nilabati Behera vs. State of Orissa",
    year: "1993",
    court: "Supreme Court",
    judges: "J.S. Verma",
    judgement: "Compensation for Custodial Death",
    narrative:
      "Confirmed that the state is liable to pay compensation for the violation of fundamental rights by its agents.",
    key_people: "Nilabati Behera",
  },
  {
    id: 20,
    case_name: "Aruna Shanbaug vs. Union of India",
    year: "2011",
    court: "Supreme Court",
    judges: "Markandey Katju",
    judgement: "Passive Euthanasia Allowed",
    narrative:
      "Allowed passive euthanasia under strict judicial monitoring for patients in a permanent vegetative state.",
    key_people: "Aruna Shanbaug, Pinki Virani",
  },

  // Social Justice & Reservation
  {
    id: 21,
    case_name: "Indra Sawhney vs. Union of India",
    year: "1992",
    court: "Supreme Court",
    judges: "B.P. Jeevan Reddy",
    judgement: "Mandal Commission Case",
    narrative:
      "Upheld 27% OBC reservation but capped total reservations at 50% and introduced the 'Creamy Layer'.",
    key_people: "B.P. Mandal",
  },
  {
    id: 22,
    case_name: "M. Nagaraj vs. Union of India",
    year: "2006",
    court: "Supreme Court",
    judges: "Y.K. Sabharwal",
    judgement: "Reservation in Promotion",
    narrative:
      "Upheld constitutional validity of reservations in promotions for SC/STs subject to quantifiable data.",
    key_people: "M. Nagaraj",
  },
  {
    id: 23,
    case_name: "Jarnail Singh vs. Lacchmi Narain Gupta",
    year: "2018",
    court: "Supreme Court",
    judges: "Dipak Misra",
    judgement: "Creamy Layer in SC/ST",
    narrative:
      "Held that the 'creamy layer' principle applies to SC/ST communities for the purpose of promotion.",
    key_people: "Jarnail Singh",
  },
  {
    id: 24,
    case_name: "NALSA vs. Union of India",
    year: "2014",
    court: "Supreme Court",
    judges: "K.S. Radhakrishnan",
    judgement: "Third Gender Recognition",
    narrative:
      "Recognized transgender people as the 'Third Gender' and affirmed their fundamental rights.",
    key_people: "Laxmi Narayan Tripathi",
  },
  {
    id: 25,
    case_name: "Navtej Singh Johar vs. Union of India",
    year: "2018",
    court: "Supreme Court",
    judges: "Dipak Misra, D.Y. Chandrachud",
    judgement: "Decriminalization of Gay Sex",
    narrative:
      "Partially struck down Section 377 IPC, decriminalizing consensual homosexual acts.",
    key_people: "Navtej Singh Johar",
  },

  // Privacy, Media & Tech
  {
    id: 26,
    case_name: "Shreya Singhal vs. Union of India",
    year: "2015",
    court: "Supreme Court",
    judges: "J. Chelameswar, R.F. Nariman",
    judgement: "Section 66A IT Act struck down",
    narrative:
      "Invalidated Section 66A of the IT Act, which allowed arrests for 'offensive' online posts, citing free speech.",
    key_people: "Shreya Singhal",
  },
  {
    id: 27,
    case_name: "People's Union for Civil Liberties vs. UOI",
    year: "1997",
    court: "Supreme Court",
    judges: "Kuldip Singh",
    judgement: "Right Against Phone Tapping",
    narrative:
      "Ruled that telephone tapping is a violation of the Right to Privacy unless strictly authorized by law.",
    key_people: "Kuldip Singh",
  },
  {
    id: 28,
    case_name: "Anuradha Bhasin vs. Union of India",
    year: "2020",
    court: "Supreme Court",
    judges: "N.V. Ramana",
    judgement: "Internet as a Tool for Rights",
    narrative:
      "Declared that freedom of speech and trade via the internet are protected under Article 19.",
    key_people: "Anuradha Bhasin",
  },
  {
    id: 29,
    case_name: "Bennett Coleman & Co. vs. Union of India",
    year: "1973",
    court: "Supreme Court",
    judges: "A.N. Ray",
    judgement: "Freedom of Press protected",
    narrative:
      "Struck down newsprint restrictions that limited the number of pages in newspapers.",
    key_people: "A.N. Ray",
  },
  {
    id: 30,
    case_name: "R. Rajagopal vs. State of Tamil Nadu",
    year: "1994",
    court: "Supreme Court",
    judges: "B.P. Jeevan Reddy",
    judgement: "Auto Shankar Case (Privacy)",
    narrative:
      "Established that the right to privacy includes the right to be let alone and protects against unauthorized biographies.",
    key_people: "Auto Shankar",
  },

  // Religious Freedom
  {
    id: 31,
    case_name: "Indian Young Lawyers Association vs. State of Kerala",
    year: "2018",
    court: "Supreme Court",
    judges: "Dipak Misra",
    judgement: "Sabarimala Temple Entry",
    narrative:
      "Allowed women of all age groups to enter the Sabarimala Temple, citing gender equality over custom.",
    key_people: "Indu Malhotra (Dissent)",
  },
  {
    id: 32,
    case_name: "Bijoe Emmanuel vs. State of Kerala",
    year: "1986",
    court: "Supreme Court",
    judges: "O. Chinnappa Reddy",
    judgement: "National Anthem Case",
    narrative:
      "Ruled that students cannot be forced to sing the national anthem if it violates their religious beliefs.",
    key_people: "Bijoe Emmanuel",
  },
  {
    id: 33,
    case_name: "M. Ismail Faruqui vs. Union of India",
    year: "1994",
    court: "Supreme Court",
    judges: "J.S. Verma",
    judgement: "Mosque not essential for Prayer",
    narrative:
      "Held that a mosque is not an 'essential part' of Islamic practice as Namaz can be offered anywhere.",
    key_people: "J.S. Verma",
  },
  {
    id: 34,
    case_name: "Church of God in India vs. KKRMC Welfare Assn",
    year: "2000",
    court: "Supreme Court",
    judges: "M.B. Shah",
    judgement: "Noise Pollution & Religion",
    narrative:
      "Held that no religion allows for noise pollution or the use of loudspeakers that disturb others.",
    key_people: "M.B. Shah",
  },
  {
    id: 35,
    case_name: "Sarla Mudgal vs. Union of India",
    year: "1995",
    court: "Supreme Court",
    judges: "Kuldip Singh",
    judgement: "Conversion & Bigamy",
    narrative:
      "Ruled that a Hindu husband cannot convert to Islam solely to marry a second wife without dissolving the first marriage.",
    key_people: "Sarla Mudgal",
  },

  // Corporate & Labor Law
  {
    id: 36,
    case_name: "Air India vs. Nargesh Meerza",
    year: "1981",
    court: "Supreme Court",
    judges: "S.M. Fazal Ali",
    judgement: "Discrimination against Air Hostesses",
    narrative:
      "Struck down regulations that terminated air hostesses' services upon their first pregnancy as 'insult to womanhood'.",
    key_people: "Nargesh Meerza",
  },
  {
    id: 37,
    case_name: "Randhir Singh vs. Union of India",
    year: "1982",
    court: "Supreme Court",
    judges: "O. Chinnappa Reddy",
    judgement: "Equal Pay for Equal Work",
    narrative:
      "Recognized 'Equal Pay for Equal Work' as a constitutional goal under Articles 14 and 16.",
    key_people: "Randhir Singh",
  },
  {
    id: 38,
    case_name: "Vodafone International Holdings vs. Union of India",
    year: "2012",
    court: "Supreme Court",
    judges: "S.H. Kapadia",
    judgement: "Taxation on Offshore Deals",
    narrative:
      "A massive tax dispute where the SC ruled that the IT department did not have jurisdiction over an offshore share transfer.",
    key_people: "Harish Salve",
  },
  {
    id: 39,
    case_name: "Standard Chartered Bank vs. Directorate of Enforcement",
    year: "2005",
    court: "Supreme Court",
    judges: "S.N. Variava",
    judgement: "Corporate Criminal Liability",
    narrative:
      "Confirmed that corporations can be prosecuted for offenses that have a mandatory prison sentence.",
    key_people: "S.N. Variava",
  },
  {
    id: 40,
    case_name: "Mohd. Ahmed Khan vs. Shah Bano Begum",
    year: "1985",
    court: "Supreme Court",
    judges: "Y.V. Chandrachud",
    judgement: "Maintenance for Muslim Women",
    narrative:
      "Held that Section 125 of CrPC (Maintenance) applies to all women regardless of religion.",
    key_people: "Shah Bano",
  },

  // Miscellaneous Landmark
  {
    id: 41,
    case_name: "Lily Thomas vs. Union of India",
    year: "2013",
    court: "Supreme Court",
    judges: "A.K. Patnaik",
    judgement: "Disqualification of Convicted MPs",
    narrative:
      "Ruled that any MP/MLA convicted of a crime with a 2-year sentence is immediately disqualified from office.",
    key_people: "Lily Thomas",
  },
  {
    id: 42,
    case_name: "Common Cause vs. Union of India",
    year: "2018",
    court: "Supreme Court",
    judges: "Dipak Misra",
    judgement: "Legalizing Living Wills",
    narrative:
      "Affirmed the right of a person to die with dignity by allowing 'Living Wills' for passive euthanasia.",
    key_people: "Prashant Bhushan",
  },
  {
    id: 43,
    case_name: "Public Interest Foundation vs. Union of India",
    year: "2018",
    court: "Supreme Court",
    judges: "Dipak Misra",
    judgement: "Criminalization in Politics",
    narrative:
      "Directed political parties to publish the criminal antecedents of their candidates on their websites.",
    key_people: "Dipak Misra",
  },
  {
    id: 44,
    case_name: "State of TN vs. K. Nalini",
    year: "1999",
    court: "Supreme Court",
    judges: "K.T. Thomas",
    judgement: "Rajiv Gandhi Assassination Case",
    narrative:
      "A major judgment on the conspiracy involving the assassination of the former Prime Minister.",
    key_people: "Rajiv Gandhi, Nalini",
  },
  {
    id: 45,
    case_name: "Supreme Court Advocates-on-Record vs. UOI",
    year: "2015",
    court: "Supreme Court",
    judges: "J.S. Khehar",
    judgement: "NJAC declared Unconstitutional",
    narrative:
      "Struck down the National Judicial Appointments Commission (NJAC) to maintain judicial independence.",
    key_people: "J.S. Khehar",
  },
  {
    id: 46,
    case_name: "Minerva Mills vs. Union of India",
    year: "1980",
    court: "Supreme Court",
    judges: "Y.V. Chandrachud",
    judgement: "Harmony between FR and DPSP",
    narrative:
      "Stated that the Constitution is founded on the bedrock of the balance between Fundamental Rights and Directive Principles.",
    key_people: "Nani Palkhivala",
  },
  {
    id: 47,
    case_name: "Champakam Dorairajan vs. State of Madras",
    year: "1951",
    court: "Supreme Court",
    judges: "S.R. Das",
    judgement: "First Amendment Trigger",
    narrative:
      "Led to the 1st Constitutional Amendment by striking down communal reservations in medical colleges.",
    key_people: "Champakam Dorairajan",
  },
  {
    id: 48,
    case_name: "Golaknath vs. State of Punjab",
    year: "1967",
    court: "Supreme Court",
    judges: "K. Subba Rao",
    judgement: "FR cannot be amended",
    narrative:
      "Held that Parliament had no power to take away or abridge any of the Fundamental Rights.",
    key_people: "K. Subba Rao",
  },
  {
    id: 49,
    case_name: "Kartar Singh vs. State of Punjab",
    year: "1994",
    court: "Supreme Court",
    judges: "S.R. Pandian",
    judgement: "TADA validity upheld",
    narrative:
      "Upheld the Terrorist and Disruptive Activities (Prevention) Act while providing safeguards against abuse.",
    key_people: "S.R. Pandian",
  },
  {
    id: 50,
    case_name: "Best Bakery Case",
    year: "2004",
    court: "Supreme Court",
    judges: "Arijit Pasayat",
    judgement: "Retrial ordered for Justice",
    narrative:
      "A landmark case where the SC ordered a retrial outside the state of Gujarat to ensure a fair trial for riot victims.",
    key_people: "Zahira Sheikh",
  },
];

/**
 * find_cases Function
 * Filters database and returns formatted JSON structure
 */
function find_cases(query, year = "Any", court = "Any") {
  const searchTerm = query.toLowerCase();

  const filtered = mockDatabase.filter((item) => {
    const matchesQuery =
      !query ||
      item.case_name.toLowerCase().includes(searchTerm) ||
      item.narrative.toLowerCase().includes(searchTerm) ||
      item.key_people.toLowerCase().includes(searchTerm) ||
      item.judgement.toLowerCase().includes(searchTerm);

    const matchesYear = year === "Any" || item.year === year;
    const matchesCourt = court === "Any" || item.court === court;

    return matchesQuery && matchesYear && matchesCourt;
  });

  return {
    success: true,
    cases: filtered.map((c) => ({
      title: `${c.case_name} (${c.year})`,
      summary: c.narrative,
      outcome: c.judgement,
      raw_data: c,
    })),
  };
}

/**
 * handleSearch
 * Triggers search and updates UI
 */
function handleSearch() {
  const query = document.getElementById("caseKeyword").value;
  const year = document.getElementById("yearFilter").value;
  const court = document.getElementById("courtFilter").value;
  const grid = document.getElementById("casesGrid");
  const loader = document.getElementById("loadingIndicator");

  grid.style.opacity = "0.3";
  loader.style.display = "block";

  setTimeout(() => {
    const result = find_cases(query, year, court);
    renderResults(result);

    loader.style.display = "none";
    grid.style.opacity = "1";
  }, 400);
}

/**
 * renderResults
 * Injects case cards into HTML grid
 */
function renderResults(result) {
  const grid = document.getElementById("casesGrid");
  grid.innerHTML = "";

  if (result.cases.length === 0) {
    grid.innerHTML = `
            <div class="no-cases">
                <p>No precedents match your search.</p>
                <small>Try "Privacy", "Environment", or "Reservation".</small>
            </div>`;
    return;
  }

  result.cases.forEach((item) => {
    const card = document.createElement("div");
    card.className = "case-card";
    card.onclick = () => openModal(item.raw_data);

    card.innerHTML = `
            <div class="case-header">
                <div class="case-meta">${item.raw_data.court} • ${item.raw_data.year}</div>
                <h3 class="case-title">${item.raw_data.case_name}</h3>
            </div>
            <p class="case-summary">${item.summary}</p>
            <div class="case-outcome">${item.outcome}</div>
        `;
    grid.appendChild(card);
  });
}

/**
 * openModal
 * Displays detailed case information
 */
function openModal(data) {
  const modal = document.getElementById("caseModal");
  const modalBody = document.getElementById("modalBody");

  modalBody.innerHTML = `
        <h2 style="margin-bottom: 20px; color: #fff; font-size: 1.8rem;">${data.case_name}</h2>
        
        <div style="background: rgba(74, 158, 255, 0.1); padding: 20px; border-radius: 12px; margin-bottom: 25px; border: 1px solid rgba(74, 158, 255, 0.2);">
            <p style="margin-bottom: 8px;"><strong>Court:</strong> ${data.court}</p>
            <p style="margin-bottom: 8px;"><strong>Year:</strong> ${data.year}</p>
            <p style="margin-bottom: 8px;"><strong>Bench:</strong> ${data.judges}</p>
            <p><strong>Key Figures:</strong> ${data.key_people}</p>
        </div>

        <div style="margin-bottom: 25px;">
            <h3 style="color: #4a9eff; margin-bottom: 12px; font-size: 1.1rem; text-transform: uppercase;">Legal Narrative</h3>
            <p style="color: #d1d9e6; line-height: 1.8;">${data.narrative}</p>
        </div>

        <div style="padding-top: 20px; border-top: 1px solid #3a4b62;">
            <h3 style="color: #2ecc71; margin-bottom: 8px; font-size: 1.1rem; text-transform: uppercase;">Final Verdict</h3>
            <p style="color: #ffffff; font-weight: 600; font-size: 1.1rem;">${data.judgement}</p>
        </div>
    `;
  modal.style.display = "flex";
}

function closeModal() {
  document.getElementById("caseModal").style.display = "none";
}

// Global Event Listeners
window.onclick = (e) => {
  const modal = document.getElementById("caseModal");
  if (e.target == modal) closeModal();
};

document.addEventListener("DOMContentLoaded", handleSearch);
