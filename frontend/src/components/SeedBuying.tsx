import React from "react";
import { ExternalLink, ShoppingBag, AlertCircle, CheckCircle } from "lucide-react";
import { Card, CardHeader, CardContent } from "./ui/Card";
import { useTranslation } from "../lib/translations";
import { useLanguage } from "../contexts/LanguageContext";

interface SeedVendor {
  name: string;
  nameHi: string;
  url: string;
  seedTypes: string[];
  trusted: boolean;
}

// Curated list of trusted seed vendors (static data)
const SEED_VENDORS: SeedVendor[] = [
  {
    name: "Ugaoo",
    nameHi: "उगाओ",
    url: "https://www.ugaoo.com",
    seedTypes: ["Vegetables", "Flowers", "Herbs", "Fruits"],
    trusted: true,
  },
  {
    name: "Nursery Live",
    nameHi: "नर्सरी लाइव",
    url: "https://www.nurserylive.com",
    seedTypes: ["Vegetables", "Flowers", "Herbs", "Fruits", "Grains"],
    trusted: true,
  },
  {
    name: "AgriBegri",
    nameHi: "एग्रीबेगरी",
    url: "https://www.agribegri.com",
    seedTypes: ["Vegetables", "Grains", "Pulses", "Oilseeds"],
    trusted: true,
  },
  {
    name: "Bighaat",
    nameHi: "बिघाट",
    url: "https://www.bighaat.com",
    seedTypes: ["Vegetables", "Flowers", "Herbs", "Grains"],
    trusted: true,
  },
  {
    name: "Krishidhan",
    nameHi: "कृषिधन",
    url: "https://www.krishidhan.com",
    seedTypes: ["Grains", "Pulses", "Oilseeds", "Vegetables"],
    trusted: true,
  },
];

interface SeedBuyingProps {
  selectedCrop?: string;
  showLowStock?: boolean;
}

export const SeedBuying: React.FC<SeedBuyingProps> = ({ selectedCrop, showLowStock = false }) => {
  const { t } = useTranslation();
  const { isHindi } = useLanguage();

  // Filter vendors based on crop type
  const getRelevantVendors = (): SeedVendor[] => {
    if (!selectedCrop) {
      return SEED_VENDORS.slice(0, 3); // Show top 3 if no crop selected
    }

    // Map crop to seed type category
    const cropToCategory: Record<string, string[]> = {
      Wheat: ["Grains"],
      Maize: ["Grains"],
      Rice: ["Grains"],
      Barley: ["Grains"],
      "Pearl Millet": ["Grains"],
      Cotton: ["Oilseeds"],
      Soybean: ["Oilseeds", "Pulses"],
      Mustard: ["Oilseeds"],
      Groundnut: ["Oilseeds"],
      Chickpea: ["Pulses"],
      Lentil: ["Pulses"],
      "Pigeon Pea": ["Pulses"],
      Potato: ["Vegetables"],
      Onion: ["Vegetables"],
      Tomato: ["Vegetables"],
      Sugarcane: ["Grains"],
    };

    const categories = cropToCategory[selectedCrop] || ["Vegetables", "Grains"];
    
    return SEED_VENDORS.filter((vendor) =>
      vendor.seedTypes.some((type) => categories.includes(type))
    ).slice(0, 4); // Show up to 4 relevant vendors
  };

  const relevantVendors = getRelevantVendors();

  if (relevantVendors.length === 0) {
    return null;
  }

  return (
    <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
      <CardHeader
        title={isHindi ? "बीज खरीद सिफारिशें" : "Seed Buying Recommendations"}
        subtitle={
          selectedCrop
            ? isHindi
              ? `${selectedCrop} के लिए विश्वसनीय विक्रेता`
              : `Trusted vendors for ${selectedCrop}`
            : isHindi
            ? "विश्वसनीय बीज विक्रेता"
            : "Trusted seed vendors"
        }
      />
      {showLowStock && (
        <div className="px-6 pb-2">
          <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
            <span className="text-sm text-amber-700">
              {isHindi ? "कम स्टॉक संकेतक सक्रिय है" : "Low stock indicator is active"}
            </span>
          </div>
        </div>
      )}
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          {relevantVendors.map((vendor, idx) => (
            <div
              key={idx}
              className="flex items-start justify-between rounded-lg border border-surface-200 bg-white p-4 hover:border-primary-300 hover:shadow-sm transition-all"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <ShoppingBag className="h-5 w-5 text-primary-600" />
                  <h3 className="font-semibold text-surface-900">{isHindi ? vendor.nameHi : vendor.name}</h3>
                  {vendor.trusted && (
                    <span className="flex items-center gap-1 text-xs text-green-600">
                      <CheckCircle className="h-3 w-3" />
                      {isHindi ? "विश्वसनीय" : "Trusted"}
                    </span>
                  )}
                </div>
                <p className="text-sm text-surface-600 mb-3">
                  {isHindi
                    ? `उपलब्ध: ${vendor.seedTypes.join(", ")}`
                    : `Available: ${vendor.seedTypes.join(", ")}`}
                </p>
                <a
                  href={vendor.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary-700 hover:text-primary-800 transition-colors"
                >
                  {isHindi ? "ऑनलाइन खरीदें" : "Buy Online"}
                  <ExternalLink className="h-4 w-4" />
                </a>
                <p className="text-xs text-surface-500 mt-1">
                  {isHindi ? "बाहरी लिंक" : "External Link"}
                </p>
              </div>
            </div>
          ))}
        </div>
        {selectedCrop && (
          <div className="mt-4 p-3 rounded-lg bg-primary-50 border border-primary-200">
            <p className="text-sm text-surface-700">
              {isHindi
                ? `💡 ${selectedCrop} के बीज खरीदने के लिए उपरोक्त विक्रेताओं से संपर्क करें। सभी लिंक बाहरी वेबसाइटों पर जाते हैं।`
                : `💡 Contact the above vendors to buy ${selectedCrop} seeds. All links go to external websites.`}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
