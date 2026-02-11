/**
 * Sector Profiles: Defines rules, constraints, and intent for different sectors.
 * 
 * Rules:
 * - No calculations here.
 * - No assumptions here.
 * - Only rules, constraints, and intent.
 */

const sectorProfiles = {
    NBFC: {
        fcfProxy: "PAT",
        allowedMetrics: ["REVENUE_GROWTH_YOY", "PAT_MARGIN", "ROE"],
        valuationModelsAllowed: ["DCF"],
        terminalGrowthCap: 6,
        notes: "PAT used as FCF proxy due to lending-based business model"
    },

    IT: {
        fcfProxy: "FCF",
        allowedMetrics: ["REVENUE_GROWTH_YOY", "PAT_MARGIN", "FCF_MARGIN"],
        valuationModelsAllowed: ["DCF", "Relative"],
        terminalGrowthCap: 5,
        notes: "FCF is a primary metric for asset-light IT services"
    }
};

module.exports = { sectorProfiles };
