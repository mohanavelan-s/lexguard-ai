"""
Seed the shared cases table with 50 landmark Indian court cases.
Works with the local SQLite fallback or a hosted Postgres DATABASE_URL.
"""
from sqlalchemy import delete, func, insert, select

from modules.database import cases_table, engine, get_database_backend, init_database

CASES = [
    (1, "Kesavananda Bharati vs. State of Kerala", "1973", "Supreme Court", "S.M. Sikri, A.N. Grover, B.C. Ray", "Basic Structure Doctrine Established", "The Supreme Court ruled that while Parliament has wide powers to amend the Constitution, it cannot alter its 'Basic Structure'.", "Kesavananda Bharati, Nani Palkhivala"),
    (2, "Justice K.S. Puttaswamy vs. Union of India", "2017", "Supreme Court", "J.S. Khehar, J. Chelameswar", "Right to Privacy declared Fundamental", "A 9-judge bench unanimously held that the Right to Privacy is an intrinsic part of the Right to Life and Liberty under Article 21.", "K.S. Puttaswamy, D.Y. Chandrachud"),
    (3, "Maneka Gandhi vs. Union of India", "1978", "Supreme Court", "M.H. Beg, P.N. Bhagwati", "Golden Triangle Rule (Art 14, 19, 21)", "Established that any law depriving personal liberty must be 'just, fair, and reasonable', not merely a procedure.", "Maneka Gandhi"),
    (4, "A.D.M. Jabalpur vs. Shivkant Shukla", "1976", "Supreme Court", "A.N. Ray, H.R. Khanna (Dissent)", "Habeas Corpus Case (Emergency Era)", "A controversial ruling stating fundamental rights could be suspended during an Emergency. Justice Khanna's dissent is legendary.", "H.R. Khanna, Indira Gandhi"),
    (5, "S.R. Bommai vs. Union of India", "1994", "Supreme Court", "S.R. Pandian, A.M. Ahmadi", "Secularism as Basic Structure", "Limited the power of the President to dismiss state governments under Article 356 and upheld Secularism.", "S.R. Bommai"),
    (6, "Vishaka vs. State of Rajasthan", "1997", "Supreme Court", "J.S. Verma, Sujata Manohar", "Sexual Harassment Guidelines", "Created 'Vishaka Guidelines' for workplace safety until the POSH Act 2013 was enacted.", "Bhanwari Devi"),
    (7, "Shayara Bano vs. Union of India", "2017", "Supreme Court", "J.S. Khehar, Kurian Joseph", "Triple Talaq declared Unconstitutional", "Struck down the practice of Talaq-e-Biddat (Instant Triple Talaq) as being arbitrary and against the Quran.", "Shayara Bano"),
    (8, "Mary Roy vs. State of Kerala", "1986", "Supreme Court", "P.N. Bhagwati, R.S. Pathak", "Equal Inheritance for Christian Women", "Granted Syrian Christian women in Kerala equal rights to inherit ancestral property.", "Mary Roy, Arundhati Roy"),
    (9, "Laxmi vs. Union of India", "2014", "Supreme Court", "R.M. Lodha", "Regulation of Acid Sales", "A landmark PIL that led to strict regulations on acid sales and compensation for acid attack survivors.", "Laxmi Agarwal"),
    (10, "Joseph Shine vs. Union of India", "2018", "Supreme Court", "Dipak Misra, D.Y. Chandrachud", "Adultery Decriminalized", "Struck down Section 497 of IPC, stating that treating a woman as the property of her husband is unconstitutional.", "Joseph Shine"),
    (11, "M.C. Mehta vs. Union of India (Oleum Gas Leak)", "1986", "Supreme Court", "P.N. Bhagwati", "Absolute Liability Principle", "Enterprises in hazardous industries are absolutely liable for accidents, with no 'Act of God' exceptions.", "M.C. Mehta"),
    (12, "Vellore Citizens Welfare Forum vs. Union of India", "1996", "Supreme Court", "Kuldip Singh", "Polluter Pays Principle", "Tanneries in Tamil Nadu were ordered to pay for environmental damage caused to the Palar River.", "Kuldip Singh (Green Judge)"),
    (13, "T.N. Godavarman Thirumulpad vs. Union of India", "1996", "Supreme Court", "J.S. Verma", "Forest Protection Guidelines", "An ongoing case that redefined 'forest' and brought all forest land under constitutional protection.", "T.N. Godavarman"),
    (14, "Subhash Kumar vs. State of Bihar", "1991", "Supreme Court", "K.N. Singh", "Right to Clean Environment", "Held that the Right to Life (Art 21) includes the right to enjoy pollution-free water and air.", "Subhash Kumar"),
    (15, "Rural Litigation and Entitlement Kendra vs. State of UP", "1985", "Supreme Court", "P.N. Bhagwati", "Doon Valley Mining Ban", "The first case in India involving environmental protection where mining was stopped for ecological balance.", "P.N. Bhagwati"),
    (16, "D.K. Basu vs. State of West Bengal", "1997", "Supreme Court", "Kuldip Singh, A.S. Anand", "Guidelines for Arrest/Detention", "Laid down mandatory procedures for police during arrest to prevent custodial torture.", "D.K. Basu"),
    (17, "Bachan Singh vs. State of Punjab", "1980", "Supreme Court", "Y.V. Chandrachud", "Rarest of Rare Doctrine", "Established that the death penalty should only be awarded in the 'rarest of rare' cases.", "Bachan Singh"),
    (18, "Hussainara Khatoon vs. State of Bihar", "1979", "Supreme Court", "P.N. Bhagwati", "Right to Speedy Trial", "The first major PIL that led to the release of thousands of undertrials languishing in jail.", "Pushpa Kapila Hingorani"),
    (19, "Nilabati Behera vs. State of Orissa", "1993", "Supreme Court", "J.S. Verma", "Compensation for Custodial Death", "Confirmed that the state is liable to pay compensation for the violation of fundamental rights by its agents.", "Nilabati Behera"),
    (20, "Aruna Shanbaug vs. Union of India", "2011", "Supreme Court", "Markandey Katju", "Passive Euthanasia Allowed", "Allowed passive euthanasia under strict judicial monitoring for patients in a permanent vegetative state.", "Aruna Shanbaug, Pinki Virani"),
    (21, "Indra Sawhney vs. Union of India", "1992", "Supreme Court", "B.P. Jeevan Reddy", "Mandal Commission Case", "Upheld 27% OBC reservation but capped total reservations at 50% and introduced the 'Creamy Layer'.", "B.P. Mandal"),
    (22, "M. Nagaraj vs. Union of India", "2006", "Supreme Court", "Y.K. Sabharwal", "Reservation in Promotion", "Upheld constitutional validity of reservations in promotions for SC/STs subject to quantifiable data.", "M. Nagaraj"),
    (23, "Jarnail Singh vs. Lacchmi Narain Gupta", "2018", "Supreme Court", "Dipak Misra", "Creamy Layer in SC/ST", "Held that the 'creamy layer' principle applies to SC/ST communities for the purpose of promotion.", "Jarnail Singh"),
    (24, "NALSA vs. Union of India", "2014", "Supreme Court", "K.S. Radhakrishnan", "Third Gender Recognition", "Recognized transgender people as the 'Third Gender' and affirmed their fundamental rights.", "Laxmi Narayan Tripathi"),
    (25, "Navtej Singh Johar vs. Union of India", "2018", "Supreme Court", "Dipak Misra, D.Y. Chandrachud", "Decriminalization of Gay Sex", "Partially struck down Section 377 IPC, decriminalizing consensual homosexual acts.", "Navtej Singh Johar"),
    (26, "Shreya Singhal vs. Union of India", "2015", "Supreme Court", "J. Chelameswar, R.F. Nariman", "Section 66A IT Act struck down", "Invalidated Section 66A of the IT Act, which allowed arrests for 'offensive' online posts, citing free speech.", "Shreya Singhal"),
    (27, "People's Union for Civil Liberties vs. UOI", "1997", "Supreme Court", "Kuldip Singh", "Right Against Phone Tapping", "Ruled that telephone tapping is a violation of the Right to Privacy unless strictly authorized by law.", "Kuldip Singh"),
    (28, "Anuradha Bhasin vs. Union of India", "2020", "Supreme Court", "N.V. Ramana", "Internet as a Tool for Rights", "Declared that freedom of speech and trade via the internet are protected under Article 19.", "Anuradha Bhasin"),
    (29, "Bennett Coleman & Co. vs. Union of India", "1973", "Supreme Court", "A.N. Ray", "Freedom of Press protected", "Struck down newsprint restrictions that limited the number of pages in newspapers.", "A.N. Ray"),
    (30, "R. Rajagopal vs. State of Tamil Nadu", "1994", "Supreme Court", "B.P. Jeevan Reddy", "Auto Shankar Case (Privacy)", "Established that the right to privacy includes the right to be let alone and protects against unauthorized biographies.", "Auto Shankar"),
    (31, "Indian Young Lawyers Association vs. State of Kerala", "2018", "Supreme Court", "Dipak Misra", "Sabarimala Temple Entry", "Allowed women of all age groups to enter the Sabarimala Temple, citing gender equality over custom.", "Indu Malhotra (Dissent)"),
    (32, "Bijoe Emmanuel vs. State of Kerala", "1986", "Supreme Court", "O. Chinnappa Reddy", "National Anthem Case", "Ruled that students cannot be forced to sing the national anthem if it violates their religious beliefs.", "Bijoe Emmanuel"),
    (33, "M. Ismail Faruqui vs. Union of India", "1994", "Supreme Court", "J.S. Verma", "Mosque not essential for Prayer", "Held that a mosque is not an 'essential part' of Islamic practice as Namaz can be offered anywhere.", "J.S. Verma"),
    (34, "Church of God in India vs. KKRMC Welfare Assn", "2000", "Supreme Court", "M.B. Shah", "Noise Pollution & Religion", "Held that no religion allows for noise pollution or the use of loudspeakers that disturb others.", "M.B. Shah"),
    (35, "Sarla Mudgal vs. Union of India", "1995", "Supreme Court", "Kuldip Singh", "Conversion & Bigamy", "Ruled that a Hindu husband cannot convert to Islam solely to marry a second wife without dissolving the first marriage.", "Sarla Mudgal"),
    (36, "Air India vs. Nargesh Meerza", "1981", "Supreme Court", "S.M. Fazal Ali", "Discrimination against Air Hostesses", "Struck down regulations that terminated air hostesses' services upon their first pregnancy as 'insult to womanhood'.", "Nargesh Meerza"),
    (37, "Randhir Singh vs. Union of India", "1982", "Supreme Court", "O. Chinnappa Reddy", "Equal Pay for Equal Work", "Recognized 'Equal Pay for Equal Work' as a constitutional goal under Articles 14 and 16.", "Randhir Singh"),
    (38, "Vodafone International Holdings vs. Union of India", "2012", "Supreme Court", "S.H. Kapadia", "Taxation on Offshore Deals", "A massive tax dispute where the SC ruled that the IT department did not have jurisdiction over an offshore share transfer.", "Harish Salve"),
    (39, "Standard Chartered Bank vs. Directorate of Enforcement", "2005", "Supreme Court", "S.N. Variava", "Corporate Criminal Liability", "Confirmed that corporations can be prosecuted for offenses that have a mandatory prison sentence.", "S.N. Variava"),
    (40, "Mohd. Ahmed Khan vs. Shah Bano Begum", "1985", "Supreme Court", "Y.V. Chandrachud", "Maintenance for Muslim Women", "Held that Section 125 of CrPC (Maintenance) applies to all women regardless of religion.", "Shah Bano"),
    (41, "Lily Thomas vs. Union of India", "2013", "Supreme Court", "A.K. Patnaik", "Disqualification of Convicted MPs", "Ruled that any MP/MLA convicted of a crime with a 2-year sentence is immediately disqualified from office.", "Lily Thomas"),
    (42, "Common Cause vs. Union of India", "2018", "Supreme Court", "Dipak Misra", "Legalizing Living Wills", "Affirmed the right of a person to die with dignity by allowing 'Living Wills' for passive euthanasia.", "Prashant Bhushan"),
    (43, "Public Interest Foundation vs. Union of India", "2018", "Supreme Court", "Dipak Misra", "Criminalization in Politics", "Directed political parties to publish the criminal antecedents of their candidates on their websites.", "Dipak Misra"),
    (44, "State of TN vs. K. Nalini", "1999", "Supreme Court", "K.T. Thomas", "Rajiv Gandhi Assassination Case", "A major judgment on the conspiracy involving the assassination of the former Prime Minister.", "Rajiv Gandhi, Nalini"),
    (45, "Supreme Court Advocates-on-Record vs. UOI", "2015", "Supreme Court", "J.S. Khehar", "NJAC declared Unconstitutional", "Struck down the National Judicial Appointments Commission (NJAC) to maintain judicial independence.", "J.S. Khehar"),
    (46, "Minerva Mills vs. Union of India", "1980", "Supreme Court", "Y.V. Chandrachud", "Harmony between FR and DPSP", "Stated that the Constitution is founded on the bedrock of the balance between Fundamental Rights and Directive Principles.", "Nani Palkhivala"),
    (47, "Champakam Dorairajan vs. State of Madras", "1951", "Supreme Court", "S.R. Das", "First Amendment Trigger", "Led to the 1st Constitutional Amendment by striking down communal reservations in medical colleges.", "Champakam Dorairajan"),
    (48, "Golaknath vs. State of Punjab", "1967", "Supreme Court", "K. Subba Rao", "FR cannot be amended", "Held that Parliament had no power to take away or abridge any of the Fundamental Rights.", "K. Subba Rao"),
    (49, "Kartar Singh vs. State of Punjab", "1994", "Supreme Court", "S.R. Pandian", "TADA validity upheld", "Upheld the Terrorist and Disruptive Activities (Prevention) Act while providing safeguards against abuse.", "S.R. Pandian"),
    (50, "Best Bakery Case", "2004", "Supreme Court", "Arijit Pasayat", "Retrial ordered for Justice", "A landmark case where the SC ordered a retrial outside the state of Gujarat to ensure a fair trial for riot victims.", "Zahira Sheikh"),
]


def _case_rows():
    columns = ("id", "case_name", "year", "court", "judges", "judgement", "narrative", "key_people")
    return [dict(zip(columns, case_record)) for case_record in CASES]


def seed(reset=False):
    init_database()

    with engine.begin() as conn:
        if reset:
            conn.execute(delete(cases_table))
        conn.execute(insert(cases_table), _case_rows())

    print(f"[OK] Seeded {len(CASES)} landmark cases into {get_database_backend()}")


def ensure_cases_seeded():
    init_database()

    with engine.connect() as conn:
        total_cases = conn.execute(select(func.count()).select_from(cases_table)).scalar_one()

    if total_cases == 0:
        seed(reset=False)


if __name__ == "__main__":
    seed(reset=True)
