export type ProductDetail = {
  slug: string;
  name: string;
  blurb: string;
  overview: string;
  benefits: string[];
  keyFacts: { label: string; value: string }[];
  faqs: { q: string; a: string }[];
};

export const INSURANCE_PRODUCTS: ProductDetail[] = [
  {
    slug: "health",
    name: "Health Insurance",
    blurb: "Cover hospitalization and medical expenses for you and your family.",
    overview:
      "Health insurance pays out for hospitalization, pre- and post-hospitalization care, and in many plans day-care procedures that don't require an overnight stay. A family floater plan covers your whole household under one sum insured.",
    benefits: [
      "Cashless treatment at network hospitals, no upfront payment for covered procedures.",
      "Covers pre-existing conditions after a waiting period (typically 2–4 years).",
      "Tax benefit on premiums paid under Section 80D.",
      "Optional add-ons: maternity cover, critical illness, room-rent waiver.",
    ],
    keyFacts: [
      { label: "Typical sum insured", value: "₹5 lakh – ₹1 crore" },
      { label: "Waiting period (pre-existing)", value: "2–4 years, plan dependent" },
      { label: "Claim settlement", value: "Cashless at network hospitals or reimbursement" },
    ],
    faqs: [
      { q: "Can I add my parents to the same policy?", a: "Most insurers offer a separate parent floater since premiums for older age groups are priced differently from a young family floater." },
      { q: "Is a pre-policy medical check-up required?", a: "Usually only above a certain age or sum insured; below that, most plans are issued without one." },
    ],
  },
  {
    slug: "life",
    name: "Life Insurance",
    blurb: "Financial protection for your family in your absence.",
    overview:
      "Life insurance pays a lump sum (the sum assured) to your nominee if you pass away during the policy term, helping your family maintain their standard of living and meet long-term goals like a child's education or a home loan.",
    benefits: [
      "Lump-sum payout to your nominee, usable for any purpose.",
      "Some plans combine protection with savings (endowment, ULIP).",
      "Premiums are tax-deductible under Section 80C; payout is tax-free under Section 10(10D).",
      "Can be assigned to a lender as collateral for a loan.",
    ],
    keyFacts: [
      { label: "Policy term", value: "10–40 years, plan dependent" },
      { label: "Payout type", value: "Lump sum, or lump sum + bonus for participating plans" },
      { label: "Premium payment", value: "Regular, limited-pay, or single premium" },
    ],
    faqs: [
      { q: "What's the difference from term insurance?", a: "Life insurance (endowment/whole life) builds a maturity value if you survive the term; pure term insurance pays only on death and has no maturity payout, which is why its premiums are much lower." },
    ],
  },
  {
    slug: "term",
    name: "Term Insurance",
    blurb: "High cover, low premium life protection for a fixed term.",
    overview:
      "Term insurance is pure life cover — no maturity benefit if you outlive the policy, which is exactly why it offers a much larger sum assured for a much smaller premium than endowment or whole-life plans.",
    benefits: [
      "Highest cover-to-premium ratio among life insurance products.",
      "Optional riders: critical illness, accidental death, waiver of premium.",
      "Can be structured to decrease alongside an outstanding home loan.",
      "Premiums are tax-deductible under Section 80C.",
    ],
    keyFacts: [
      { label: "Typical cover", value: "₹50 lakh – ₹2 crore+" },
      { label: "Premium", value: "Lowest among life insurance categories" },
      { label: "Maturity benefit", value: "None, unless a return-of-premium variant is chosen" },
    ],
    faqs: [
      { q: "At what age should I buy term insurance?", a: "The earlier the better — premiums are locked in at the age of purchase and rise steeply with age and any health conditions that develop later." },
      { q: "Does it cover accidental death?", a: "Base term plans cover death from any cause; accidental death riders add an extra payout specifically for accidents." },
    ],
  },
  {
    slug: "motor",
    name: "Motor Insurance",
    blurb: "Cover for your car or two-wheeler against damage and liability.",
    overview:
      "Motor insurance is mandatory by law in India (at minimum, third-party liability cover). A comprehensive policy additionally covers damage to your own vehicle from accidents, theft, fire, and natural calamities.",
    benefits: [
      "Third-party liability cover as required under the Motor Vehicles Act.",
      "Own-damage cover for accident, theft, fire, and natural disasters (comprehensive plans).",
      "No-claim bonus discount for claim-free years, transferable across insurers.",
      "Optional add-ons: zero depreciation, engine protection, roadside assistance.",
    ],
    keyFacts: [
      { label: "Mandatory cover", value: "Third-party liability" },
      { label: "No-claim bonus", value: "Up to 50% discount after 5 claim-free years" },
      { label: "Renewal", value: "Annual, with inspection if lapsed beyond the grace period" },
    ],
    faqs: [
      { q: "What voids a claim?", a: "Driving without a valid licence, under the influence, or using the vehicle for a purpose not declared in the policy (e.g. commercial use on a private policy) typically voids a claim." },
    ],
  },
  {
    slug: "travel",
    name: "Travel Insurance",
    blurb: "Cover for trip cancellations, medical emergencies, and lost baggage.",
    overview:
      "Travel insurance covers financial losses from trip cancellation or delay, medical emergencies abroad, and lost or delayed baggage — useful for both domestic and international travel, and mandatory for some visa applications.",
    benefits: [
      "Emergency medical cover abroad, including hospitalization and evacuation.",
      "Reimbursement for trip cancellation or curtailment due to covered reasons.",
      "Cover for lost, stolen, or delayed baggage and passport.",
      "Single-trip and annual multi-trip plans available.",
    ],
    keyFacts: [
      { label: "Plan types", value: "Single-trip or annual multi-trip" },
      { label: "Typical medical cover", value: "USD 50,000 – 500,000 for international plans" },
      { label: "Visa requirement", value: "Mandatory minimum cover for Schengen visa applications" },
    ],
    faqs: [
      { q: "Is COVID-19 covered?", a: "Most current plans include COVID-19-related medical expenses as a standard inclusion; check the policy wording for the specific sub-limit." },
    ],
  },
];

export const INVESTMENT_PRODUCTS: ProductDetail[] = [
  {
    slug: "mutual-funds",
    name: "Mutual Funds",
    blurb: "Market-linked funds across equity, debt, and hybrid categories.",
    overview:
      "A mutual fund pools money from many investors to buy a diversified portfolio of stocks, bonds, or both, managed by a professional fund manager. Returns are market-linked and not guaranteed.",
    benefits: [
      "Diversification across many securities with a single investment.",
      "Professional fund management and research.",
      "High liquidity — most open-ended funds can be redeemed on any business day.",
      "Choose a risk level: equity (higher risk/return), debt (lower risk/return), or hybrid.",
    ],
    keyFacts: [
      { label: "Lock-in", value: "None, except ELSS (3 years) and close-ended funds" },
      { label: "Risk level", value: "Varies by category — low (debt) to high (small-cap equity)" },
      { label: "Taxation", value: "Capital gains tax applies on redemption, rate depends on holding period and fund type" },
    ],
    faqs: [
      { q: "What's the difference between direct and regular plans?", a: "Direct plans have no distributor commission baked into the expense ratio, so they typically deliver slightly higher returns than regular plans for the same fund." },
    ],
  },
  {
    slug: "sip",
    name: "SIP",
    blurb: "Invest a fixed amount every month into a fund of your choice.",
    overview:
      "A Systematic Investment Plan (SIP) automates a fixed monthly investment into a mutual fund, using rupee-cost averaging to smooth out market volatility over time rather than timing a single lump-sum entry.",
    benefits: [
      "Disciplined, automated investing — no need to time the market.",
      "Rupee-cost averaging reduces the impact of short-term volatility.",
      "Start with amounts as low as ₹500 per month.",
      "Can be paused, increased, or stopped at any time (step-up SIPs available).",
    ],
    keyFacts: [
      { label: "Minimum amount", value: "Typically ₹500/month" },
      { label: "Frequency", value: "Monthly (weekly/quarterly options with some funds)" },
      { label: "Flexibility", value: "Pause, modify, or stop anytime; no penalty for most open-ended funds" },
    ],
    faqs: [
      { q: "Is a SIP a separate product from a mutual fund?", a: "No — a SIP is just a way of investing into a mutual fund (fixed, recurring instalments) rather than a one-time lump sum; the underlying fund and its returns are identical either way." },
    ],
  },
  {
    slug: "fixed-income",
    name: "Fixed Income",
    blurb: "Government and corporate bonds with predictable returns.",
    overview:
      "Fixed income instruments — government securities, corporate bonds, and debentures — pay a predetermined interest rate over a fixed term, offering more predictable (though generally lower) returns than equity.",
    benefits: [
      "Predictable, scheduled interest payouts.",
      "Government securities carry sovereign-backed low credit risk.",
      "Can be laddered across maturities to manage interest-rate risk.",
      "Generally lower volatility than equity-linked investments.",
    ],
    keyFacts: [
      { label: "Typical tenure", value: "1–30 years depending on instrument" },
      { label: "Risk level", value: "Low (government) to moderate (corporate bonds, rating dependent)" },
      { label: "Interest", value: "Fixed or floating, paid periodically or cumulatively" },
    ],
    faqs: [
      { q: "Can I sell before maturity?", a: "Most listed bonds can be sold on the exchange before maturity, but the price will fluctuate with prevailing interest rates — selling early isn't guaranteed to return the full face value." },
    ],
  },
  {
    slug: "ppf",
    name: "PPF",
    blurb: "Public Provident Fund — long-term, tax-advantaged savings.",
    overview:
      "The Public Provident Fund is a government-backed, long-term savings scheme with a 15-year lock-in, offering tax-free interest and triple tax exemption (contribution, interest, and maturity) under the EEE category.",
    benefits: [
      "Sovereign guarantee — one of the safest long-term savings instruments.",
      "Entirely tax-free interest and maturity proceeds.",
      "Partial withdrawal allowed from the 7th financial year.",
      "Can be used as collateral for a loan from the 3rd to 6th year.",
    ],
    keyFacts: [
      { label: "Lock-in", value: "15 years (extendable in blocks of 5)" },
      { label: "Annual contribution", value: "₹500 minimum, ₹1.5 lakh maximum" },
      { label: "Interest rate", value: "Set quarterly by the government, currently illustrative ~7.1% p.a." },
    ],
    faqs: [
      { q: "Can I open more than one PPF account?", a: "No — only one PPF account per individual is permitted (a separate account may be opened on behalf of a minor child)." },
    ],
  },
  {
    slug: "nps",
    name: "NPS",
    blurb: "National Pension System for retirement planning.",
    overview:
      "The National Pension System is a government-regulated, market-linked retirement savings scheme. Contributions build a corpus invested across equity, corporate debt, and government securities, with a mandatory partial annuitization at retirement.",
    benefits: [
      "Low fund management charges compared to most market-linked products.",
      "Additional ₹50,000 tax deduction under Section 80CCD(1B), over and above 80C.",
      "Choice of asset allocation (active or auto, with an equity cap).",
      "Portable across jobs and locations, one account for life.",
    ],
    keyFacts: [
      { label: "Lock-in", value: "Until age 60, with limited partial withdrawal allowed" },
      { label: "At maturity", value: "At least 40% of the corpus must be used to buy an annuity" },
      { label: "Equity cap", value: "Typically up to 75%, reducing automatically as you approach retirement" },
    ],
    faqs: [
      { q: "Is the annuity income taxable?", a: "Yes — annuity payouts received after retirement are taxed as income in the year they're received, while the lump-sum withdrawal portion (up to 60%) is tax-free." },
    ],
  },
  {
    slug: "gold",
    name: "Gold",
    blurb: "Digital gold and sovereign gold bonds.",
    overview:
      "Digital gold lets you buy and hold gold in small denominations without physical storage, backed by physical gold held by a custodian. Sovereign Gold Bonds (SGBs), issued by the government, additionally pay a fixed annual interest on top of gold-price appreciation.",
    benefits: [
      "No storage or purity concerns — digital gold is backed 1:1 by physical gold.",
      "SGBs pay 2.5% p.a. fixed interest, in addition to tracking the gold price.",
      "SGB capital gains are tax-free if held to maturity (8 years).",
      "Can be bought in small amounts, starting from as little as ₹1.",
    ],
    keyFacts: [
      { label: "SGB tenure", value: "8 years, with exit option from year 5" },
      { label: "SGB interest", value: "2.5% p.a., paid semi-annually" },
      { label: "Digital gold", value: "No fixed tenure, redeemable anytime; conversion to physical gold possible with making charges" },
    ],
    faqs: [
      { q: "Is digital gold the same as an SGB?", a: "No — digital gold is a direct claim on physical gold held by a custodian with no interest, while an SGB is a government bond whose value tracks gold price and additionally pays fixed interest." },
    ],
  },
];
