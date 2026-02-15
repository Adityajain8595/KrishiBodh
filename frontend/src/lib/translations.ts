import { useLanguage } from "../contexts/LanguageContext";

export type TranslationKey = 
  // Common
  | "common.dashboard"
  | "common.waterIrrigation"
  | "common.cropRecommendation"
  | "common.yieldPest"
  | "common.marketPrices"
  | "common.assistance"
  | "common.governmentSchemes"
  | "common.reports"
  | "common.settings"
  | "common.signOut"
  | "common.account"
  | "common.loading"
  | "common.error"
  | "common.success"
  | "common.cancel"
  | "common.save"
  | "common.delete"
  | "common.edit"
  | "common.close"
  | "common.back"
  | "common.next"
  | "common.previous"
  | "common.submit"
  | "common.search"
  | "common.filter"
  | "common.download"
  | "common.print"
  | "common.share"
  | "common.view"
  | "common.more"
  | "common.less"
  // Dashboard
  | "dashboard.title"
  | "dashboard.overview"
  | "dashboard.getStarted"
  | "dashboard.useCityState"
  | "dashboard.backendNotReachable"
  | "dashboard.apiConnected"
  | "dashboard.startApi"
  | "dashboard.totalYield"
  | "dashboard.healthScore"
  | "dashboard.waterUsage"
  | "dashboard.cropDistribution"
  | "dashboard.activeCrops"
  | "dashboard.weatherRisk"
  | "dashboard.yieldTrends"
  | "dashboard.liveData"
  | "dashboard.weatherUnavailable"
  | "dashboard.noLocation"
  | "dashboard.waterEfficiency"
  | "dashboard.marketTrend"
  | "dashboard.priceMovement"
  | "dashboard.cropYieldPrediction"
  | "dashboard.tonnesPerAcre"
  | "dashboard.weatherForecastRisk"
  | "dashboard.sevenDayOutlook"
  | "dashboard.soilNutrientDistribution"
  | "dashboard.levelsVsOptimal"
  | "dashboard.seasonDistribution"
  | "dashboard.currentCropSeasons"
  | "dashboard.marketPriceTrends"
  | "dashboard.inrPerQuintal"
  | "dashboard.allCrops"
  | "dashboard.allSeasons"
  // Water & Irrigation
  | "water.title"
  | "water.subtitle"
  // Crop Recommendation
  | "crop.title"
  | "crop.subtitle"
  // Yield & Pest
  | "yield.title"
  | "yield.subtitle"
  // Market Prices
  | "market.title"
  | "market.subtitle"
  // Assistance
  | "assistance.title"
  | "assistance.subtitle"
  | "assistance.placeholder"
  | "assistance.thinking"
  | "assistance.initialMessage"
  // Reports
  | "reports.title"
  | "reports.subtitle"
  | "reports.generate"
  | "reports.download"
  | "reports.print"
  | "reports.dateRange"
  | "reports.selectDateRange"
  | "reports.kpiSummary"
  | "reports.yieldTrends"
  | "reports.cropDistribution"
  | "reports.fieldPerformance"
  | "reports.insights"
  | "reports.dataTable"
  | "reports.noData"
  | "reports.generating"
  | "reports.generateReport"
  // Settings
  | "settings.title"
  | "settings.subtitle"
  // Seed Buying
  | "seed.title"
  | "seed.subtitle"
  | "seed.recommendations"
  | "seed.buyOnline"
  | "seed.externalLink"
  | "seed.basedOnCrop"
  | "seed.lowStock"
  | "seed.trustedVendors"
  // Login/SignUp
  | "auth.signIn"
  | "auth.signUp"
  | "auth.email"
  | "auth.password"
  | "auth.confirmPassword"
  | "auth.forgotPassword"
  | "auth.rememberMe"
  | "auth.createAccount"
  | "auth.alreadyHaveAccount"
  | "auth.dontHaveAccount"
  | "auth.continueWithGoogle"
  | "auth.signingIn"
  | "auth.creating"
  | "auth.accessWorkspace"
  | "auth.setupWorkspace"
  | "auth.welcomeBack"
  | "auth.getStarted"
  | "auth.useEmailPassword"
  | "auth.useEmailPasswordOrGoogle"
  // Form fields
  | "form.location"
  | "form.locationPlaceholder"
  | "form.farmSize"
  | "form.farmSizePlaceholder"
  | "form.cropType"
  | "form.growthStage"
  | "form.soilType"
  | "form.irrigationType"
  | "form.season"
  | "form.plantingDate"
  | "form.getRecommendations"
  | "form.optimize"
  | "form.analyze"
  | "form.submit"
  | "form.clear"
  | "form.reset"
  // Water Irrigation
  | "water.farmParameters"
  | "water.configureInputs"
  | "water.dailyWater"
  | "water.weeklyWater"
  | "water.schedule"
  | "water.efficiency"
  | "water.riskLevel"
  | "water.recommendations"
  | "water.confidence"
  // Crop Recommendation
  | "crop.inputParameters"
  | "crop.locationSoilSeason"
  | "crop.rankedRecommendations"
  | "crop.suitabilityYieldWater"
  | "crop.suitabilityScore"
  | "crop.expectedYield"
  | "crop.waterNeed"
  | "crop.riskFactors"
  | "crop.noRecommendations"
  | "crop.enterInputs"
  // Yield & Pest
  | "yield.cropFarmParameters"
  | "yield.inputsForPrediction"
  | "yield.predictedYield"
  | "yield.yieldPerAcre"
  | "yield.confidence"
  | "yield.assumptions"
  | "yield.pestRisk"
  | "yield.likelyPests"
  | "yield.preventionMeasures"
  | "yield.noData"
  // Market Prices
  | "market.commodity"
  | "market.state"
  | "market.district"
  | "market.market"
  | "market.minPrice"
  | "market.maxPrice"
  | "market.modalPrice"
  | "market.date"
  | "market.dataNotAvailable"
  // Settings
  | "settings.accountPreferences"
  | "settings.backendReady"
  | "settings.defaultLocation"
  | "settings.defaultUnit"
  | "settings.notifications"
  | "settings.emailAlerts"
  | "settings.language"
  | "settings.platformLanguage"
  | "settings.selectLanguage"
  // Common form labels
  | "common.hectares"
  | "common.liters"
  | "common.kg"
  | "common.tons"
  | "common.days"
  | "common.weeks"
  | "common.months"
  | "common.yes"
  | "common.no"
  | "common.or"
  | "common.and"
  | "common.from"
  | "common.to"
  | "common.select"
  | "common.enter"
  | "common.optional"
  | "common.required"
  // Validation
  | "validation.required"
  | "validation.invalidEmail"
  | "validation.passwordTooShort"
  | "validation.passwordsDontMatch"
  | "validation.invalidNumber"
  | "validation.requestFailed"
  | "validation.noDataAvailable"
  // Seasons
  | "season.rabi"
  | "season.kharif"
  | "season.zaid"
  | "season.yearRound"
  // Growth Stages
  | "stage.seedling"
  | "stage.vegetative"
  | "stage.flowering"
  | "stage.fruiting"
  | "stage.maturity"
  // Risk Levels
  | "risk.low"
  | "risk.medium"
  | "risk.high"
  // Additional
  | "common.all"
  | "common.optimizing"
  | "common.fetching"
  | "common.analyzing"
  | "common.runAnalysis"
  | "common.runOptimization"
  | "common.fetchPrices"
  | "common.assumptions"
  | "common.confidence"
  | "common.total"
  | "common.perWeek"
  | "common.perDay"
  | "common.temperature"
  | "common.humidity"
  | "common.precipitation"
  | "common.weatherAt"
  | "common.usedToAdjust"
  | "common.costImpact"
  | "common.waterCost"
  | "common.energyCost"
  | "common.monthly"
  | "common.ruleBased"
  | "common.noOverUnder"
  | "common.seeRecommendations"
  | "common.seeRiskIndicators"
  | "common.seeSchedule"
  | "common.seeWaterRequirement"
  | "common.seeEfficiency"
  | "common.chartWillAppear"
  | "common.useModule"
  | "common.viewAll"
  | "common.refresh"
  | "common.tryRefresh"
  | "common.updated"
  // Government Schemes
  | "schemes.title"
  | "schemes.subtitle"
  | "schemes.filters"
  | "schemes.state"
  | "schemes.district"
  | "schemes.crop"
  | "schemes.season"
  | "schemes.farmerType"
  | "schemes.applyFilters"
  | "schemes.applicableCrops"
  | "schemes.coveredRegion"
  | "schemes.keyBenefits"
  | "schemes.eligibilitySummary"
  | "schemes.applicationMode"
  | "schemes.deadline"
  | "schemes.viewDetails"
  | "schemes.howToApply"
  | "schemes.noSchemes"
  | "schemes.selectFilters"
  | "schemes.small"
  | "schemes.marginal"
  | "schemes.large"
  | "schemes.kharif"
  | "schemes.rabi"
  | "schemes.zaid"
  | "schemes.adminTitle"
  | "schemes.addScheme"
  | "schemes.editScheme"
  | "schemes.deactivate"
  | "schemes.selectState"
  | "schemes.selectStateError"
  | "schemes.selectCropOptional"
  | "schemes.selectStateToSee"
  | "schemes.learnMore"
  | "schemes.officialWebsite"
  | "schemes.addSchemeTitle"
  | "schemes.nameStateRequired"
  | "schemes.selectStateForStateLevel"
  | "schemes.schemeName"
  | "schemes.level"
  | "schemes.externalLinkOptional"
  | "schemes.cropsEmptyAll"
  | "schemes.needsReview"
  | "schemes.schemesList"
  | "schemes.addEditDeactivate"
  | "schemes.noSchemesAdmin"
  | "schemes.editSchemeTitle"
  | "schemes.description"
  | "schemes.activate"
  | "schemes.actions"
  | "schemes.active"
  | "schemes.central"
  | "schemes.stateLevel"
  | "common.any"
  | "schemes.id"
  | "common.decisionSupport";

export const translations: Record<"en" | "hi", Record<TranslationKey, string>> = {
  en: {
    // Common
    "common.dashboard": "Dashboard",
    "common.waterIrrigation": "Water & Irrigation",
    "common.cropRecommendation": "Crop Recommendation",
    "common.yieldPest": "Yield & Pest",
    "common.marketPrices": "Market Prices",
    "common.assistance": "Assistance",
    "common.governmentSchemes": "Government Schemes",
    "common.reports": "Reports",
    "common.settings": "Settings",
    "common.signOut": "Sign out",
    "common.account": "Account",
    "common.loading": "Loading...",
    "common.error": "Error",
    "common.success": "Success",
    "common.cancel": "Cancel",
    "common.save": "Save",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.close": "Close",
    "common.back": "Back",
    "common.next": "Next",
    "common.previous": "Previous",
    "common.submit": "Submit",
    "common.search": "Search",
    "common.filter": "Filter",
    "common.download": "Download",
    "common.print": "Print",
    "common.share": "Share",
    "common.view": "View",
    "common.more": "More",
    "common.less": "Less",
    // Dashboard
    "dashboard.title": "Dashboard",
    "dashboard.overview": "Overview. Use the modules below to get irrigation, crop, yield, pest, and market insights for your location.",
    "dashboard.getStarted": "Get started",
    "dashboard.useCityState": "Use city and state",
    "dashboard.backendNotReachable": "Backend not reachable",
    "dashboard.apiConnected": "API connected",
    "dashboard.startApi": "Start the API with:",
    "dashboard.totalYield": "Total Yield",
    "dashboard.healthScore": "Health Score",
    "dashboard.waterUsage": "Water Usage",
    "dashboard.cropDistribution": "Crop Distribution",
    "dashboard.activeCrops": "Active Crops",
    "dashboard.weatherRisk": "Weather Risk Index",
    "dashboard.yieldTrends": "Yield Trends",
    "dashboard.liveData": "Live data synced",
    "dashboard.weatherUnavailable": "Weather data unavailable",
    "dashboard.noLocation": "No location",
    "dashboard.waterEfficiency": "Water Efficiency",
    "dashboard.marketTrend": "Market Trend",
    "dashboard.priceMovement": "Price movement",
    "dashboard.cropYieldPrediction": "Crop Yield Prediction",
    "dashboard.tonnesPerAcre": "Tonnes per acre by season",
    "dashboard.weatherForecastRisk": "Weather Forecast Risk",
    "dashboard.sevenDayOutlook": "7-day outlook",
    "dashboard.soilNutrientDistribution": "Soil Nutrient Distribution",
    "dashboard.levelsVsOptimal": "Current levels vs optimal",
    "dashboard.seasonDistribution": "Season Distribution",
    "dashboard.currentCropSeasons": "Current crop seasons",
    "dashboard.marketPriceTrends": "Market Price Trends",
    "dashboard.inrPerQuintal": "INR per quintal",
    "dashboard.allCrops": "All Crops",
    "dashboard.allSeasons": "All Seasons",
    // Water & Irrigation
    "water.title": "Water & Irrigation",
    "water.subtitle": "Daily and weekly water need and schedule.",
    // Crop Recommendation
    "crop.title": "Crop Recommendation",
    "crop.subtitle": "Ranked crops by soil, season, and real weather compatibility.",
    // Yield & Pest
    "yield.title": "Yield & Pest",
    "yield.subtitle": "Yield and pest risk from crop, stage, irrigation, and weather.",
    // Market Prices
    "market.title": "Market Prices",
    "market.subtitle": "Real mandi prices (min, max, modal) from government data when enabled.",
    // Assistance
    "assistance.title": "Assistance",
    "assistance.subtitle": "AI explanations for agricultural decision support",
    "assistance.placeholder": "Ask about irrigation, crops, yield, market, or weather...",
    "assistance.thinking": "Thinking...",
    "assistance.initialMessage": "I can help explain the results from your agricultural decision support system. You can ask about irrigation, crops, yield, market, or weather.",
    // Reports
    "reports.title": "Reports",
    "reports.subtitle": "Generate and download comprehensive agricultural reports",
    "reports.generate": "Generate Report",
    "reports.download": "Download PDF",
    "reports.print": "Print Report",
    "reports.dateRange": "Date Range",
    "reports.selectDateRange": "Select Date Range",
    "reports.kpiSummary": "KPI Summary",
    "reports.yieldTrends": "Yield Trends",
    "reports.cropDistribution": "Crop Distribution",
    "reports.fieldPerformance": "Field Performance",
    "reports.insights": "Insights",
    "reports.dataTable": "Data Table",
    "reports.noData": "No data available for the selected period.",
    "reports.generating": "Generating report...",
    "reports.generateReport": "Generate Report",
    // Settings
    "settings.title": "Settings",
    "settings.subtitle": "Manage your account and preferences",
    // Seed Buying
    "seed.title": "Seed Buying Recommendations",
    "seed.subtitle": "Find trusted vendors for your crop seeds",
    "seed.recommendations": "Recommendations",
    "seed.buyOnline": "Buy Online",
    "seed.externalLink": "External Link",
    "seed.basedOnCrop": "Based on your selected crop",
    "seed.lowStock": "Low stock indicator",
    "seed.trustedVendors": "Trusted Vendors",
    // Login/SignUp
    "auth.signIn": "Sign in",
    "auth.signUp": "Create account",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.confirmPassword": "Confirm password",
    "auth.forgotPassword": "Forgot password?",
    "auth.rememberMe": "Remember me",
    "auth.createAccount": "Create account",
    "auth.alreadyHaveAccount": "Already have an account?",
    "auth.dontHaveAccount": "Don't have an account?",
    "auth.continueWithGoogle": "Continue with Google",
    "auth.signingIn": "Signing in...",
    "auth.creating": "Creating...",
    "auth.accessWorkspace": "Access your Krishibodh workspace.",
    "auth.setupWorkspace": "Set up your Krishibodh workspace in minutes.",
    "auth.welcomeBack": "Welcome back",
    "auth.getStarted": "Get started",
    "auth.useEmailPassword": "Use email/password or Google",
    "auth.useEmailPasswordOrGoogle": "Email/password or Google",
    // Form fields
    "form.location": "Location",
    "form.locationPlaceholder": "e.g. Bengaluru, Karnataka",
    "form.farmSize": "Farm size (hectares)",
    "form.farmSizePlaceholder": "e.g. 12.5",
    "form.cropType": "Crop type",
    "form.growthStage": "Growth stage",
    "form.soilType": "Soil type",
    "form.irrigationType": "Irrigation type",
    "form.season": "Season",
    "form.plantingDate": "Planting date",
    "form.getRecommendations": "Get recommendations",
    "form.optimize": "Optimize irrigation",
    "form.analyze": "Analyze",
    "form.submit": "Submit",
    "form.clear": "Clear",
    "form.reset": "Reset",
    // Water Irrigation
    "water.farmParameters": "Farm and Crop Parameters",
    "water.configureInputs": "Configure inputs for irrigation optimization",
    "water.dailyWater": "Daily water need",
    "water.weeklyWater": "Weekly water need",
    "water.schedule": "Irrigation schedule",
    "water.efficiency": "Efficiency score",
    "water.riskLevel": "Risk level",
    "water.recommendations": "Recommendations",
    "water.confidence": "Confidence",
    // Crop Recommendation
    "crop.inputParameters": "Input parameters",
    "crop.locationSoilSeason": "Location, soil, season, and farm size",
    "crop.rankedRecommendations": "Ranked crop recommendations",
    "crop.suitabilityYieldWater": "Suitability, yield, water, and explanation",
    "crop.suitabilityScore": "Suitability score",
    "crop.expectedYield": "Expected yield",
    "crop.waterNeed": "Water need",
    "crop.riskFactors": "Risk factors",
    "crop.noRecommendations": "Enter inputs and click Get recommendations.",
    "crop.enterInputs": "Enter inputs and fetch recommendations.",
    // Yield & Pest
    "yield.cropFarmParameters": "Crop and farm parameters",
    "yield.inputsForPrediction": "Inputs for yield prediction and pest risk",
    "yield.predictedYield": "Predicted yield",
    "yield.yieldPerAcre": "Yield per acre",
    "yield.confidence": "Confidence",
    "yield.assumptions": "Assumptions",
    "yield.pestRisk": "Pest risk",
    "yield.likelyPests": "Likely pests",
    "yield.preventionMeasures": "Prevention measures",
    "yield.noData": "Enter inputs and click Analyze.",
    // Market Prices
    "market.commodity": "Commodity",
    "market.state": "State",
    "market.district": "District",
    "market.market": "Market",
    "market.minPrice": "Min price",
    "market.maxPrice": "Max price",
    "market.modalPrice": "Modal price",
    "market.date": "Date",
    "market.dataNotAvailable": "Market data not available",
    // Settings
    "settings.accountPreferences": "Account and platform preferences. Backend-ready for profile and tenant settings.",
    "settings.backendReady": "Backend-ready for profile and tenant settings.",
    "settings.defaultLocation": "Default location",
    "settings.defaultUnit": "Default unit",
    "settings.notifications": "Notifications",
    "settings.emailAlerts": "Email alerts",
    "settings.language": "Language",
    "settings.platformLanguage": "Platform language settings",
    "settings.selectLanguage": "Select Language",
    // Common form labels
    "common.hectares": "hectares",
    "common.liters": "L",
    "common.kg": "kg",
    "common.tons": "tons",
    "common.days": "days",
    "common.weeks": "weeks",
    "common.months": "months",
    "common.yes": "Yes",
    "common.no": "No",
    "common.or": "or",
    "common.and": "and",
    "common.from": "From",
    "common.to": "To",
    "common.select": "Select",
    "common.enter": "Enter",
    "common.optional": "Optional",
    "common.required": "Required",
    // Validation
    "validation.required": "This field is required",
    "validation.invalidEmail": "Enter a valid email address",
    "validation.passwordTooShort": "Password must be at least 6 characters",
    "validation.passwordsDontMatch": "Passwords do not match",
    "validation.invalidNumber": "Enter a valid number",
    "validation.requestFailed": "Request failed",
    "validation.noDataAvailable": "No data available",
    // Seasons
    "season.rabi": "Rabi",
    "season.kharif": "Kharif",
    "season.zaid": "Zaid",
    "season.yearRound": "Year-round",
    // Growth Stages
    "stage.seedling": "Seedling",
    "stage.vegetative": "Vegetative",
    "stage.flowering": "Flowering",
    "stage.fruiting": "Fruiting",
    "stage.maturity": "Maturity",
    // Risk Levels
    "risk.low": "Low",
    "risk.medium": "Medium",
    "risk.high": "High",
    // Additional
    "common.all": "All",
    "common.optimizing": "Optimizing...",
    "common.fetching": "Fetching...",
    "common.analyzing": "Analyzing...",
    "common.runAnalysis": "Run analysis",
    "common.runOptimization": "Run optimization",
    "common.fetchPrices": "Fetch prices",
    "common.assumptions": "Assumptions",
    "common.confidence": "Confidence",
    "common.total": "Total",
    "common.perWeek": "per week",
    "common.perDay": "per day",
    "common.temperature": "Temperature",
    "common.humidity": "Humidity",
    "common.precipitation": "Precipitation",
    "common.weatherAt": "Weather at",
    "common.usedToAdjust": "Used to adjust irrigation need",
    "common.costImpact": "Cost impact (estimated)",
    "common.waterCost": "Water cost (monthly)",
    "common.energyCost": "Energy (pump, monthly)",
    "common.monthly": "monthly",
    "common.ruleBased": "Rule-based optimization from your inputs",
    "common.noOverUnder": "No over- or under-irrigation indicated.",
    "common.seeRecommendations": "Run optimization to see recommendations.",
    "common.seeRiskIndicators": "Run optimization to see risk indicators.",
    "common.seeSchedule": "Run optimization to see recommended schedule.",
    "common.seeWaterRequirement": "Run optimization to see daily and weekly water requirement.",
    "common.seeEfficiency": "Run optimization to see efficiency and water need.",
    "common.chartWillAppear": "Chart will appear when data is available",
    "common.useModule": "Use module",
    "common.viewAll": "View All",
    "common.refresh": "Refresh",
    "common.tryRefresh": "Please try refreshing the page",
    "common.updated": "Updated",
    "schemes.title": "Government Schemes",
    "schemes.subtitle": "Crop- and region-specific government support schemes for farmers.",
    "schemes.filters": "Filters",
    "schemes.state": "State",
    "schemes.district": "District",
    "schemes.crop": "Crop",
    "schemes.season": "Season",
    "schemes.farmerType": "Farmer Type",
    "schemes.applyFilters": "Apply Filters",
    "schemes.applicableCrops": "Applicable crops",
    "schemes.coveredRegion": "Covered region",
    "schemes.keyBenefits": "Key benefits",
    "schemes.eligibilitySummary": "Eligibility summary",
    "schemes.applicationMode": "Application mode",
    "schemes.deadline": "Deadline",
    "schemes.viewDetails": "View Details",
    "schemes.howToApply": "How to Apply",
    "schemes.noSchemes": "No eligible schemes found for the selected filters.",
    "schemes.selectFilters": "Select state, crop, season and farmer type, then apply filters.",
    "schemes.small": "Small",
    "schemes.marginal": "Marginal",
    "schemes.large": "Large",
    "schemes.kharif": "Kharif",
    "schemes.rabi": "Rabi",
    "schemes.zaid": "Zaid",
    "schemes.adminTitle": "Manage Schemes",
    "schemes.addScheme": "Add Scheme",
    "schemes.editScheme": "Edit Scheme",
    "schemes.deactivate": "Deactivate",
    "schemes.selectState": "Please select a state.",
    "schemes.selectStateError": "Select a state to see schemes.",
    "schemes.selectCropOptional": "Select a crop to narrow down schemes (optional)",
    "schemes.learnMore": "Learn More / Official Website (opens in new tab)",
    "schemes.officialWebsite": "Official website (external link)",
    "schemes.addSchemeTitle": "Add scheme",
    "schemes.nameStateRequired": "Name and state required",
    "schemes.selectStateForStateLevel": "Please select state for State-level scheme.",
    "schemes.schemeName": "Scheme name",
    "schemes.level": "Level",
    "schemes.externalLinkOptional": "External link (optional)",
    "schemes.cropsEmptyAll": "Crops (empty = All)",
    "schemes.needsReview": "Needs Review",
    "schemes.schemesList": "Schemes list",
    "schemes.addEditDeactivate": "Add / edit / deactivate schemes",
    "schemes.noSchemesAdmin": "No schemes.",
    "schemes.editSchemeTitle": "Edit scheme",
    "schemes.description": "Description",
    "schemes.activate": "Activate",
    "schemes.actions": "Actions",
    "schemes.active": "Active",
    "schemes.central": "Central",
    "schemes.stateLevel": "State",
    "schemes.id": "ID",
    "common.any": "Any",
    "common.decisionSupport": "Decision Support",
  },
  hi: {
    // Common
    "common.dashboard": "डैशबोर्ड",
    "common.waterIrrigation": "पानी और सिंचाई",
    "common.cropRecommendation": "फसल सिफारिश",
    "common.yieldPest": "उपज और कीट",
    "common.marketPrices": "बाजार मूल्य",
    "common.assistance": "सहायता",
    "common.governmentSchemes": "सरकारी योजनाएं",
    "common.reports": "रिपोर्ट",
    "common.settings": "सेटिंग्स",
    "common.signOut": "साइन आउट",
    "common.account": "खाता",
    "common.loading": "लोड हो रहा है...",
    "common.error": "त्रुटि",
    "common.success": "सफल",
    "common.cancel": "रद्द करें",
    "common.save": "सहेजें",
    "common.delete": "हटाएं",
    "common.edit": "संपादित करें",
    "common.close": "बंद करें",
    "common.back": "वापस",
    "common.next": "अगला",
    "common.previous": "पिछला",
    "common.submit": "जमा करें",
    "common.search": "खोजें",
    "common.filter": "फ़िल्टर",
    "common.download": "डाउनलोड",
    "common.print": "प्रिंट",
    "common.share": "साझा करें",
    "common.view": "देखें",
    "common.more": "अधिक",
    "common.less": "कम",
    // Dashboard
    "dashboard.title": "डैशबोर्ड",
    "dashboard.overview": "अवलोकन। अपने स्थान के लिए सिंचाई, फसल, उपज, कीट और बाजार की जानकारी प्राप्त करने के लिए नीचे दिए गए मॉड्यूल का उपयोग करें।",
    "dashboard.getStarted": "शुरू करें",
    "dashboard.useCityState": "शहर और राज्य का उपयोग करें",
    "dashboard.backendNotReachable": "बैकएंड पहुंच योग्य नहीं",
    "dashboard.apiConnected": "API जुड़ा हुआ",
    "dashboard.startApi": "API शुरू करें:",
    "dashboard.totalYield": "कुल उपज",
    "dashboard.healthScore": "स्वास्थ्य स्कोर",
    "dashboard.waterUsage": "पानी का उपयोग",
    "dashboard.cropDistribution": "फसल वितरण",
    "dashboard.activeCrops": "सक्रिय फसलें",
    "dashboard.weatherRisk": "मौसम जोखिम सूचकांक",
    "dashboard.yieldTrends": "उपज रुझान",
    "dashboard.liveData": "लाइव डेटा सिंक",
    "dashboard.weatherUnavailable": "मौसम डेटा उपलब्ध नहीं",
    "dashboard.noLocation": "कोई स्थान नहीं",
    "dashboard.waterEfficiency": "पानी दक्षता",
    "dashboard.marketTrend": "बाजार रुझान",
    "dashboard.priceMovement": "मूल्य आंदोलन",
    "dashboard.cropYieldPrediction": "फसल उपज पूर्वानुमान",
    "dashboard.tonnesPerAcre": "प्रति एकड़ टन (मौसम के अनुसार)",
    "dashboard.weatherForecastRisk": "मौसम पूर्वानुमान जोखिम",
    "dashboard.sevenDayOutlook": "7-दिन का आउटलुक",
    "dashboard.soilNutrientDistribution": "मिट्टी पोषक तत्व वितरण",
    "dashboard.levelsVsOptimal": "वर्तमान स्तर बनाम इष्टतम",
    "dashboard.seasonDistribution": "मौसम वितरण",
    "dashboard.currentCropSeasons": "वर्तमान फसल मौसम",
    "dashboard.marketPriceTrends": "बाजार मूल्य रुझान",
    "dashboard.inrPerQuintal": "प्रति क्विंटल INR",
    "dashboard.allCrops": "सभी फसलें",
    "dashboard.allSeasons": "सभी मौसम",
    // Water & Irrigation
    "water.title": "पानी और सिंचाई",
    "water.subtitle": "दैनिक और साप्ताहिक पानी की आवश्यकता और अनुसूची।",
    // Crop Recommendation
    "crop.title": "फसल सिफारिश",
    "crop.subtitle": "मिट्टी, मौसम और वास्तविक मौसम अनुकूलता के अनुसार रैंक की गई फसलें।",
    // Yield & Pest
    "yield.title": "उपज और कीट",
    "yield.subtitle": "फसल, चरण, सिंचाई और मौसम से उपज और कीट जोखिम।",
    // Market Prices
    "market.title": "बाजार मूल्य",
    "market.subtitle": "सक्षम होने पर सरकारी डेटा से वास्तविक मंडी मूल्य (न्यूनतम, अधिकतम, मोडल)।",
    // Assistance
    "assistance.title": "सहायता",
    "assistance.subtitle": "कृषि निर्णय सहायता के लिए AI स्पष्टीकरण",
    "assistance.placeholder": "सिंचाई, फसल, उपज, बाजार, या मौसम के बारे में पूछें...",
    "assistance.thinking": "सोच रहा है...",
    "assistance.initialMessage": "मैं आपके कृषि निर्णय सहायता प्रणाली के परिणामों की व्याख्या करने में मदद कर सकता हूं। आप सिंचाई, फसल, उपज, बाजार, या मौसम के बारे में पूछ सकते हैं।",
    // Reports
    "reports.title": "रिपोर्ट",
    "reports.subtitle": "व्यापक कृषि रिपोर्ट उत्पन्न करें और डाउनलोड करें",
    "reports.generate": "रिपोर्ट उत्पन्न करें",
    "reports.download": "PDF डाउनलोड करें",
    "reports.print": "रिपोर्ट प्रिंट करें",
    "reports.dateRange": "तारीख सीमा",
    "reports.selectDateRange": "तारीख सीमा चुनें",
    "reports.kpiSummary": "KPI सारांश",
    "reports.yieldTrends": "उपज रुझान",
    "reports.cropDistribution": "फसल वितरण",
    "reports.fieldPerformance": "क्षेत्र प्रदर्शन",
    "reports.insights": "अंतर्दृष्टि",
    "reports.dataTable": "डेटा तालिका",
    "reports.noData": "चयनित अवधि के लिए कोई डेटा उपलब्ध नहीं है।",
    "reports.generating": "रिपोर्ट उत्पन्न हो रही है...",
    "reports.generateReport": "रिपोर्ट जेनरेट करें",
    // Settings
    "settings.title": "सेटिंग्स",
    "settings.subtitle": "अपने खाते और प्राथमिकताएं प्रबंधित करें",
    // Seed Buying
    "seed.title": "बीज खरीद सिफारिशें",
    "seed.subtitle": "अपनी फसल के बीज के लिए विश्वसनीय विक्रेता खोजें",
    "seed.recommendations": "सिफारिशें",
    "seed.buyOnline": "ऑनलाइन खरीदें",
    "seed.externalLink": "बाहरी लिंक",
    "seed.basedOnCrop": "आपकी चयनित फसल के आधार पर",
    "seed.lowStock": "कम स्टॉक संकेतक",
    "seed.trustedVendors": "विश्वसनीय विक्रेता",
    // Login/SignUp
    "auth.signIn": "साइन इन करें",
    "auth.signUp": "खाता बनाएं",
    "auth.email": "ईमेल",
    "auth.password": "पासवर्ड",
    "auth.confirmPassword": "पासवर्ड की पुष्टि करें",
    "auth.forgotPassword": "पासवर्ड भूल गए?",
    "auth.rememberMe": "मुझे याद रखें",
    "auth.createAccount": "खाता बनाएं",
    "auth.alreadyHaveAccount": "पहले से खाता है?",
    "auth.dontHaveAccount": "खाता नहीं है?",
    "auth.continueWithGoogle": "Google के साथ जारी रखें",
    "auth.signingIn": "साइन इन हो रहा है...",
    "auth.creating": "बनाया जा रहा है...",
    "auth.accessWorkspace": "अपने कृषिबोध वर्कस्पेस तक पहुंचें।",
    "auth.setupWorkspace": "मिनटों में अपना कृषिबोध वर्कस्पेस सेट अप करें।",
    "auth.welcomeBack": "वापसी पर स्वागत है",
    "auth.getStarted": "शुरू करें",
    "auth.useEmailPassword": "ईमेल/पासवर्ड या Google का उपयोग करें",
    "auth.useEmailPasswordOrGoogle": "ईमेल/पासवर्ड या Google",
    // Form fields
    "form.location": "स्थान",
    "form.locationPlaceholder": "उदा. बेंगलुरु, कर्नाटक",
    "form.farmSize": "खेत का आकार (हेक्टेयर)",
    "form.farmSizePlaceholder": "उदा. 12.5",
    "form.cropType": "फसल का प्रकार",
    "form.growthStage": "विकास चरण",
    "form.soilType": "मिट्टी का प्रकार",
    "form.irrigationType": "सिंचाई का प्रकार",
    "form.season": "मौसम",
    "form.plantingDate": "बुवाई की तारीख",
    "form.getRecommendations": "सिफारिशें प्राप्त करें",
    "form.optimize": "सिंचाई अनुकूलित करें",
    "form.analyze": "विश्लेषण करें",
    "form.submit": "जमा करें",
    "form.clear": "साफ करें",
    "form.reset": "रीसेट करें",
    // Water Irrigation
    "water.farmParameters": "खेत और फसल पैरामीटर",
    "water.configureInputs": "सिंचाई अनुकूलन के लिए इनपुट कॉन्फ़िगर करें",
    "water.dailyWater": "दैनिक पानी की आवश्यकता",
    "water.weeklyWater": "साप्ताहिक पानी की आवश्यकता",
    "water.schedule": "सिंचाई अनुसूची",
    "water.efficiency": "दक्षता स्कोर",
    "water.riskLevel": "जोखिम स्तर",
    "water.recommendations": "सिफारिशें",
    "water.confidence": "आत्मविश्वास",
    // Crop Recommendation
    "crop.inputParameters": "इनपुट पैरामीटर",
    "crop.locationSoilSeason": "स्थान, मिट्टी, मौसम और खेत का आकार",
    "crop.rankedRecommendations": "रैंक की गई फसल सिफारिशें",
    "crop.suitabilityYieldWater": "उपयुक्तता, उपज, पानी और स्पष्टीकरण",
    "crop.suitabilityScore": "उपयुक्तता स्कोर",
    "crop.expectedYield": "अपेक्षित उपज",
    "crop.waterNeed": "पानी की आवश्यकता",
    "crop.riskFactors": "जोखिम कारक",
    "crop.noRecommendations": "इनपुट दर्ज करें और सिफारिशें प्राप्त करें पर क्लिक करें।",
    "crop.enterInputs": "इनपुट दर्ज करें और सिफारिशें प्राप्त करें।",
    // Yield & Pest
    "yield.cropFarmParameters": "फसल और खेत पैरामीटर",
    "yield.inputsForPrediction": "उपज पूर्वानुमान और कीट जोखिम के लिए इनपुट",
    "yield.predictedYield": "पूर्वानुमानित उपज",
    "yield.yieldPerAcre": "प्रति एकड़ उपज",
    "yield.confidence": "आत्मविश्वास",
    "yield.assumptions": "धारणाएं",
    "yield.pestRisk": "कीट जोखिम",
    "yield.likelyPests": "संभावित कीट",
    "yield.preventionMeasures": "रोकथाम उपाय",
    "yield.noData": "इनपुट दर्ज करें और विश्लेषण करें पर क्लिक करें।",
    // Market Prices
    "market.commodity": "वस्तु",
    "market.state": "राज्य",
    "market.district": "जिला",
    "market.market": "बाजार",
    "market.minPrice": "न्यूनतम मूल्य",
    "market.maxPrice": "अधिकतम मूल्य",
    "market.modalPrice": "मोडल मूल्य",
    "market.date": "तारीख",
    "market.dataNotAvailable": "बाजार डेटा उपलब्ध नहीं",
    // Settings
    "settings.accountPreferences": "खाता और प्लेटफ़ॉर्म प्राथमिकताएं। प्रोफ़ाइल और टेनेंट सेटिंग्स के लिए बैकएंड-तैयार।",
    "settings.backendReady": "प्रोफ़ाइल और टेनेंट सेटिंग्स के लिए बैकएंड-तैयार।",
    "settings.defaultLocation": "डिफ़ॉल्ट स्थान",
    "settings.defaultUnit": "डिफ़ॉल्ट इकाई",
    "settings.notifications": "सूचनाएं",
    "settings.emailAlerts": "ईमेल अलर्ट",
    "settings.language": "भाषा",
    "settings.platformLanguage": "प्लेटफ़ॉर्म भाषा सेटिंग्स",
    "settings.selectLanguage": "भाषा चुनें",
    // Common form labels
    "common.hectares": "हेक्टेयर",
    "common.liters": "लीटर",
    "common.kg": "किग्रा",
    "common.tons": "टन",
    "common.days": "दिन",
    "common.weeks": "सप्ताह",
    "common.months": "महीने",
    "common.yes": "हाँ",
    "common.no": "नहीं",
    "common.or": "या",
    "common.and": "और",
    "common.from": "से",
    "common.to": "तक",
    "common.select": "चुनें",
    "common.enter": "दर्ज करें",
    "common.optional": "वैकल्पिक",
    "common.required": "आवश्यक",
    // Validation
    "validation.required": "यह फ़ील्ड आवश्यक है",
    "validation.invalidEmail": "एक वैध ईमेल पता दर्ज करें",
    "validation.passwordTooShort": "पासवर्ड कम से कम 6 वर्ण का होना चाहिए",
    "validation.passwordsDontMatch": "पासवर्ड मेल नहीं खाते",
    "validation.invalidNumber": "एक वैध संख्या दर्ज करें",
    "validation.requestFailed": "अनुरोध विफल",
    "validation.noDataAvailable": "कोई डेटा उपलब्ध नहीं",
    // Seasons
    "season.rabi": "रबी",
    "season.kharif": "खरीफ",
    "season.zaid": "ज़ायद",
    "season.yearRound": "साल भर",
    // Growth Stages
    "stage.seedling": "अंकुरण",
    "stage.vegetative": "वानस्पतिक",
    "stage.flowering": "फूल आना",
    "stage.fruiting": "फल लगना",
    "stage.maturity": "परिपक्वता",
    // Risk Levels
    "risk.low": "कम",
    "risk.medium": "मध्यम",
    "risk.high": "उच्च",
    // Additional
    "common.all": "सभी",
    "common.optimizing": "अनुकूलन हो रहा है...",
    "common.fetching": "प्राप्त कर रहा है...",
    "common.analyzing": "विश्लेषण कर रहा है...",
    "common.runAnalysis": "विश्लेषण चलाएं",
    "common.runOptimization": "अनुकूलन चलाएं",
    "common.fetchPrices": "मूल्य प्राप्त करें",
    "common.assumptions": "धारणाएं",
    "common.confidence": "आत्मविश्वास",
    "common.total": "कुल",
    "common.perWeek": "प्रति सप्ताह",
    "common.perDay": "प्रति दिन",
    "common.temperature": "तापमान",
    "common.humidity": "आर्द्रता",
    "common.precipitation": "वर्षा",
    "common.weatherAt": "मौसम",
    "common.usedToAdjust": "सिंचाई की आवश्यकता को समायोजित करने के लिए उपयोग किया गया",
    "common.costImpact": "लागत प्रभाव (अनुमानित)",
    "common.waterCost": "पानी की लागत (मासिक)",
    "common.energyCost": "ऊर्जा (पंप, मासिक)",
    "common.monthly": "मासिक",
    "common.ruleBased": "आपके इनपुट से नियम-आधारित अनुकूलन",
    "common.noOverUnder": "अधिक या कम सिंचाई का संकेत नहीं।",
    "common.seeRecommendations": "सिफारिशें देखने के लिए अनुकूलन चलाएं।",
    "common.seeRiskIndicators": "जोखिम संकेतक देखने के लिए अनुकूलन चलाएं।",
    "common.seeSchedule": "अनुशंसित अनुसूची देखने के लिए अनुकूलन चलाएं।",
    "common.seeWaterRequirement": "दैनिक और साप्ताहिक पानी की आवश्यकता देखने के लिए अनुकूलन चलाएं।",
    "common.seeEfficiency": "दक्षता और पानी की आवश्यकता देखने के लिए अनुकूलन चलाएं।",
    "common.chartWillAppear": "डेटा उपलब्ध होने पर चार्ट दिखाई देगा",
    "common.useModule": "मॉड्यूल का उपयोग करें",
    "common.viewAll": "सभी देखें",
    "common.refresh": "रिफ्रेश करें",
    "common.tryRefresh": "कृपया पृष्ठ रिफ्रेश करने का प्रयास करें",
    "common.updated": "अपडेट किया गया",
    "schemes.title": "सरकारी योजनाएं",
    "schemes.subtitle": "किसानों के लिए फसल- और क्षेत्र-विशिष्ट सरकारी सहायता योजनाएं।",
    "schemes.filters": "फ़िल्टर",
    "schemes.state": "राज्य",
    "schemes.district": "जिला",
    "schemes.crop": "फसल",
    "schemes.season": "मौसम",
    "schemes.farmerType": "किसान प्रकार",
    "schemes.applyFilters": "फ़िल्टर लगाएं",
    "schemes.applicableCrops": "लागू फसलें",
    "schemes.coveredRegion": "कवर क्षेत्र",
    "schemes.keyBenefits": "मुख्य लाभ",
    "schemes.eligibilitySummary": "पात्रता सारांश",
    "schemes.applicationMode": "आवेदन मोड",
    "schemes.deadline": "अंतिम तिथि",
    "schemes.viewDetails": "विवरण देखें",
    "schemes.howToApply": "कैसे आवेदन करें",
    "schemes.noSchemes": "चयनित फ़िल्टर के लिए कोई पात्र योजना नहीं मिली।",
    "schemes.selectFilters": "राज्य, फसल, मौसम और किसान प्रकार चुनें, फिर फ़िल्टर लगाएं।",
    "schemes.small": "छोटा",
    "schemes.marginal": "सीमांत",
    "schemes.large": "बड़ा",
    "schemes.kharif": "खरीफ",
    "schemes.rabi": "रबी",
    "schemes.zaid": "ज़ायद",
    "schemes.adminTitle": "योजनाएं प्रबंधित करें",
    "schemes.addScheme": "योजना जोड़ें",
    "schemes.editScheme": "योजना संपादित करें",
    "schemes.deactivate": "निष्क्रिय करें",
    "schemes.selectState": "कृपया राज्य चुनें।",
    "schemes.selectStateError": "योजनाएं देखने के लिए राज्य चुनें।",
    "schemes.selectCropOptional": "फसल चुनकर योजनाएं सीमित करें (वैकल्पिक)",
    "schemes.learnMore": "अधिक जानें / आधिकारिक वेबसाइट (नई टैब में खुलती है)",
    "schemes.officialWebsite": "आधिकारिक वेबसाइट (बाहरी लिंक)",
    "schemes.addSchemeTitle": "नई योजना जोड़ें",
    "schemes.nameStateRequired": "नाम और राज्य अनिवार्य",
    "schemes.selectStateForStateLevel": "राज्य स्तर की योजना के लिए राज्य चुनें।",
    "schemes.schemeName": "योजना का नाम",
    "schemes.level": "स्तर",
    "schemes.externalLinkOptional": "आधिकारिक लिंक (वैकल्पिक)",
    "schemes.cropsEmptyAll": "फसलें (खाली = सभी)",
    "schemes.needsReview": "समीक्षा आवश्यक",
    "schemes.schemesList": "योजनाएं सूची",
    "schemes.addEditDeactivate": "जोड़ें / संपादित करें / निष्क्रिय करें",
    "schemes.noSchemesAdmin": "कोई योजना नहीं।",
    "schemes.editSchemeTitle": "योजना संपादित करें",
    "schemes.description": "विवरण",
    "schemes.activate": "सक्रिय करें",
    "schemes.actions": "कार्रवाई",
    "schemes.active": "सक्रिय",
    "schemes.central": "केंद्रीय",
    "schemes.stateLevel": "राज्य",
    "schemes.id": "आईडी",
    "common.any": "कोई भी",
    "common.decisionSupport": "निर्णय सहायता",
  },
};

export function useTranslation() {
  const { language } = useLanguage();
  const t = (key: TranslationKey): string => {
    return translations[language][key] || key;
  };
  return { t };
}

// Helper function for direct access (can be used outside React components)
export function t(key: TranslationKey, lang?: "en" | "hi"): string {
  if (lang) {
    return translations[lang][key] || key;
  }
  // This will be used in components that have access to LanguageContext
  const stored = localStorage.getItem("krishibodh-language") || "en";
  const language = (stored === "hi" || stored === "en") ? stored : "en";
  return translations[language][key] || key;
}
