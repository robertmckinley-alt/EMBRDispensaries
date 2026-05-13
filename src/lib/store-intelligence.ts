export type StoreIntelligenceMetric = {
  label: string;
  value: string;
  note: string;
};

export type StoreIntelligenceItem = {
  title: string;
  detail: string;
  impact: "Critical" | "High" | "Medium" | "Monitor";
};

export type StoreEventSignal = {
  date: string;
  title: string;
  detail: string;
};

export type StoreIntelligence = {
  storeId: string;
  storeNumber: string;
  statusLabel: string;
  address: string;
  marketSummary: string;
  metrics: StoreIntelligenceMetric[];
  competitorSignals: StoreIntelligenceItem[];
  eventSignals: StoreEventSignal[];
  priorityActions: StoreIntelligenceItem[];
};

export const storeIntelligence: StoreIntelligence[] = [
  {
    storeId: "springfield",
    storeNumber: "Store 01",
    statusLabel: "POS auth offline",
    address: "Springfield, MA",
    marketSummary:
      "High-potential Hampden County market with cross-border Connecticut demand; the immediate operating need is restoring POS access.",
    metrics: [
      { label: "POS status", value: "Offline", note: "Dutchie /whoami returns 401 for the configured key." },
      { label: "Market driver", value: "CT border", note: "Regional shoppers can lift demand when pricing and menu visibility are strong." },
      { label: "Seasonal spike", value: "Big E", note: "Eastern States Exposition planning should start ahead of September traffic." }
    ],
    competitorSignals: [
      {
        title: "Zaza Green and 6Bricks",
        detail: "Active Springfield competitors; monitor Weedmaps menu depth, price posture, and review velocity.",
        impact: "High"
      },
      {
        title: "INSA Springfield",
        detail: "Large operator with cultivation scale; benchmark value flower and vape pricing when POS access is restored.",
        impact: "Monitor"
      }
    ],
    eventSignals: [
      {
        date: "Sep-Oct",
        title: "Eastern States Exposition",
        detail: "Large regional event; prepare local search, bundles, and staffing plan once live data is back."
      },
      {
        date: "Weekly",
        title: "Auth recovery",
        detail: "Resolve API scope/key issue before the next reporting run so Springfield is not blind in rollups."
      }
    ],
    priorityActions: [
      {
        title: "Resolve Dutchie API key",
        detail: "Replace or re-scope the Springfield API key and rerun `npm.cmd run test:dutchie`.",
        impact: "Critical"
      },
      {
        title: "Prepare cross-border offers",
        detail: "Once live sales are restored, compare CT-border promotions against basket and transaction lift.",
        impact: "Medium"
      }
    ]
  },
  {
    storeId: "northampton",
    storeNumber: "Store 02",
    statusLabel: "MA live",
    address: "144 King St, Northampton, MA",
    marketSummary:
      "High-education, community-driven market where premium curation, Pride planning, and local menu freshness matter.",
    metrics: [
      { label: "All-time transactions", value: "183K", note: "Reference report baseline through the May sync window." },
      { label: "Customer base", value: "44K", note: "Large CRM file for targeted local and event campaigns." },
      { label: "Product file", value: "27.5K", note: "Broad catalog; active inventory lines need regular quality control." },
      { label: "Inventory lines", value: "939", note: "Reference weekly inventory footprint." }
    ],
    competitorSignals: [
      {
        title: "Honey Northampton",
        detail: "Visible local competitor; keep photos, menu keywords, and review responses current.",
        impact: "High"
      },
      {
        title: "The Source closure",
        detail: "Closed competitor creates share-capture opportunity if EMBR is easy to discover locally.",
        impact: "Medium"
      }
    ],
    eventSignals: [
      {
        date: "June",
        title: "Northampton Pride",
        detail: "Major community moment; plan inclusive bundles, local partnerships, and staffing coverage."
      },
      {
        date: "May",
        title: "Academic year transition",
        detail: "Student traffic fades while tourism rises; rebalance inventory and messaging."
      }
    ],
    priorityActions: [
      {
        title: "Pride Month activation",
        detail: "Build offers, local calendar placement, and CRM segments before June demand arrives.",
        impact: "High"
      },
      {
        title: "Weedmaps optimization",
        detail: "Refresh store photos, category keywords, and top-menu items to capture search demand.",
        impact: "Medium"
      }
    ]
  },
  {
    storeId: "fyre-ants",
    storeNumber: "Store 03",
    statusLabel: "MA live",
    address: "Easthampton, MA",
    marketSummary:
      "Portfolio-leading MA volume with a large customer file; new discount competition makes loyalty and price checks urgent.",
    metrics: [
      { label: "All-time transactions", value: "315K", note: "Highest MA volume in the reference weekly rollup." },
      { label: "Customer base", value: "64K", note: "Largest MA customer file; retention defense matters." },
      { label: "Product file", value: "31.5K", note: "Broad catalog supports differentiation if top sellers stay stocked." },
      { label: "Inventory lines", value: "1,174", note: "Active inventory records in the reference report." }
    ],
    competitorSignals: [
      {
        title: "OZ Club outlet model",
        detail: "New Route 5 discount threat; track bulk pricing and loyalty leakage.",
        impact: "High"
      },
      {
        title: "INSA Easthampton",
        detail: "Cultivator-retailer with scale; monitor pricing, flower availability, and promo cadence.",
        impact: "Monitor"
      }
    ],
    eventSignals: [
      {
        date: "Ongoing",
        title: "Eastworks and arts district traffic",
        detail: "Creative/local identity gives the store partnership and event-led promotion options."
      },
      {
        date: "June",
        title: "Pioneer Valley Pride spillover",
        detail: "Coordinate with Northampton calendar and shared customer segments."
      }
    ],
    priorityActions: [
      {
        title: "Defend loyalty",
        detail: "Segment high-frequency shoppers and compare churn against new discount competitors.",
        impact: "High"
      },
      {
        title: "Pull competitor menu pricing",
        detail: "Benchmark OZ Club, INSA, and local bulk offers against top EMBR categories.",
        impact: "Medium"
      }
    ]
  },
  {
    storeId: "la-mesa",
    storeNumber: "Store 04",
    statusLabel: "CA live",
    address: "San Diego East County, CA",
    marketSummary:
      "Hypercompetitive San Diego trade area where vertical integration, Weedmaps visibility, and student/tourist timing are the levers.",
    metrics: [
      { label: "All-time transactions", value: "184K", note: "Comparable volume to Northampton in the reference rollup." },
      { label: "Customer base", value: "48.6K", note: "Strong CRM base for SDSU and local-event targeting." },
      { label: "Product file", value: "27.7K", note: "Broad product file; category differentiation matters." },
      { label: "Inventory lines", value: "1,159", note: "Reference active inventory records." }
    ],
    competitorSignals: [
      {
        title: "61 local listings",
        detail: "La Mesa has heavy Weedmaps density; menu ranking, photos, and keyword coverage are table stakes.",
        impact: "Critical"
      },
      {
        title: "Cookies and Jungle Boys",
        detail: "Premium brand competition means Phat Panda vertical integration should be visible in-store and online.",
        impact: "High"
      },
      {
        title: "Urbn Leaf",
        detail: "Well-reviewed multi-location operator; monitor review velocity and value offers.",
        impact: "Monitor"
      }
    ],
    eventSignals: [
      {
        date: "May",
        title: "SDSU semester end",
        detail: "Finals and departures create last-purchase and loyalty-onboarding opportunities."
      },
      {
        date: "July",
        title: "San Diego Comic-Con",
        detail: "Regional tourist capture opportunity; prepare localized search and bundle strategy."
      },
      {
        date: "October",
        title: "La Mesa Oktoberfest",
        detail: "Large city event; start offer and staffing planning in late summer."
      }
    ],
    priorityActions: [
      {
        title: "Optimize Weedmaps now",
        detail: "Refresh photos, menu highlights, category keywords, and differentiators for a crowded market.",
        impact: "Critical"
      },
      {
        title: "SDSU promotion test",
        detail: "Run semester-end bundles and capture CRM opt-ins before students leave.",
        impact: "Medium"
      }
    ]
  },
  {
    storeId: "lake-elsinore",
    storeNumber: "Store 05",
    statusLabel: "CA live",
    address: "31881 Corydon Rd, Lake Elsinore, CA",
    marketSummary:
      "Large customer file and seasonal recreation demand, but low transaction frequency makes reactivation the near-term prize.",
    metrics: [
      { label: "All-time transactions", value: "92.7K", note: "Lowest CA transaction volume in the reference report." },
      { label: "Customer CRM", value: "46.9K", note: "Large dormant segment likely available for reactivation." },
      { label: "Trans/customer", value: "1.98x", note: "Lowest portfolio frequency ratio in the reference dashboard." },
      { label: "Active SKUs", value: "2,041", note: "Largest active SKU footprint in the monthly store report." }
    ],
    competitorSignals: [
      {
        title: "The Healing Tree",
        detail: "Early 7 AM opening and economy bulk pricing are direct threats to early-day and value traffic.",
        impact: "High"
      },
      {
        title: "Regional draw",
        detail: "Wildomar, Canyon Lake, Perris, Menifee, Hemet, Murrieta, and Temecula remain underserved.",
        impact: "Medium"
      }
    ],
    eventSignals: [
      {
        date: "May 25-26",
        title: "Memorial Day weekend",
        detail: "Lake recreation demand spikes; prepare outdoor, bulk flower, and extended-staffing plays."
      },
      {
        date: "Summer",
        title: "Lake recreation season",
        detail: "Weekend water-sports traffic can lift Corydon Road shopping."
      },
      {
        date: "Mar-Apr 2027",
        title: "Super Bloom planning",
        detail: "Walker Canyon tourism can be large; begin campaign planning months ahead."
      }
    ],
    priorityActions: [
      {
        title: "Customer reactivation",
        detail: "Segment 90+ day lapsed customers and test SMS/email return offers.",
        impact: "Critical"
      },
      {
        title: "SKU velocity audit",
        detail: "Find dead stock inside the large SKU footprint and protect top 50 movers before holiday traffic.",
        impact: "Medium"
      }
    ]
  },
  {
    storeId: "hlc-greenfield",
    storeNumber: "Store 06",
    statusLabel: "Monopoly market",
    address: "48 4th St, Greenfield, CA",
    marketSummary:
      "Only dispensary in its immediate South Monterey County market, with a very large customer file and Spanish-language activation opportunity.",
    metrics: [
      { label: "All-time transactions", value: "21.3K", note: "Smallest transaction base in the reference rollup." },
      { label: "Customer base", value: "58.5K", note: "Large file relative to transaction count; activation gap." },
      { label: "Active SKUs", value: "4,521", note: "Focused catalog compared with larger stores." },
      { label: "Inventory lines", value: "3,512", note: "Deep inventory relative to SKU count." }
    ],
    competitorSignals: [
      {
        title: "Monopoly position",
        detail: "Only local storefront in Greenfield and South Monterey County; defend convenience and price leadership.",
        impact: "High"
      },
      {
        title: "Hwy 101 travelers",
        detail: "Wine-country and Soledad/King City regional traffic can be captured with road-trip and value messaging.",
        impact: "Medium"
      }
    ],
    eventSignals: [
      {
        date: "May",
        title: "Agricultural income season",
        detail: "Value flower and reliable availability should align with local working-community demand."
      },
      {
        date: "May 18-26",
        title: "Armed Forces / Memorial Day window",
        detail: "Veteran and travel-weekend promotions can lift traffic across the portfolio."
      }
    ],
    priorityActions: [
      {
        title: "Spanish-language marketing",
        detail: "Launch bilingual offers and local-radio/social tests for Greenfield's majority-Hispanic community.",
        impact: "High"
      },
      {
        title: "Activation gap audit",
        detail: "Compare registered customers with recent purchase behavior and build a win-back sequence.",
        impact: "Critical"
      }
    ]
  }
];

export const storeIntelligenceById = Object.fromEntries(
  storeIntelligence.map((item) => [item.storeId, item])
) as Record<string, StoreIntelligence>;

export function getStoreIntelligence(storeId: string) {
  return storeIntelligenceById[storeId] ?? null;
}
