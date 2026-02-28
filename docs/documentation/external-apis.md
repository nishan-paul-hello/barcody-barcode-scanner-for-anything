# External API Documentation

This document provides a concise overview of the barcode and product data APIs integrated into the system using their **Free Tier** limits.

---

## 1. Open Food Facts
- **Type:** Community-driven, Open Data.
- **Database Size:** 3M+ products.
- **Rate Limit:** 100 requests/min (reads), 10 requests/min (searches).
- **Setup:** No API key required. Provide a custom `User-Agent` header in requests.
- **Website:** https://world.openfoodfacts.org
- **API Docs:** https://openfoodfacts.github.io/openfoodfacts-server/api/
- **Base URL:** `https://world.openfoodfacts.org/api/v2/product/{barcode}.json`

---

## 2. Open Beauty Facts
- **Type:** Community-driven, Open Data.
- **Database Size:** 1M+ products.
- **Rate Limit:** 100 requests/min (reads), 10 requests/min (searches).
- **Setup:** No API key required. Same setup as Open Food Facts.
- **Website:** https://world.openbeautyfacts.org
- **API Docs:** https://world.openbeautyfacts.org/data
- **Base URL:** `https://world.openbeautyfacts.org/api/v2/product/{barcode}.json`

---

## 3. USDA FoodData Central
- **Type:** Official US Government, Public Data.
- **Database Size:** 1M+ US branded and scientific food products.
- **Rate Limit:** 1,000 requests/hour (per IP).
- **Setup:** Free API key required. Register at the link below.
- **Website:** https://fdc.nal.usda.gov
- **API Docs:** https://fdc.nal.usda.gov/api-guide/
- **Key Signup:** https://fdc.nal.usda.gov/api-key-signup/
- **Base URL:** `https://api.nal.usda.gov/fdc/v1/foods/search?query={barcode}&api_key={key}`
- **Env Variable:** `USDA_FOOD_DATA_API_KEY`

---

## 4. UPCitemdb
- **Type:** Commercial, Free Explorer Plan.
- **Database Size:** 686M+ barcodes.
- **Rate Limit:** 100 combined requests/day. Burst limit: 15 lookups / 5 searches per 30 seconds.
- **Setup:** No API key required for free Explorer plan. Use `/prod/trial/` endpoint path.
- **Website:** https://www.upcitemdb.com
- **API Docs:** https://devs.upcitemdb.com/
- **Base URL:** `https://api.upcitemdb.com/prod/trial/lookup?upc={barcode}`

---

## 5. Barcode Lookup
- **Type:** Commercial, Free Trial.
- **Database Size:** 500M+ products.
- **Rate Limit:** 100 requests/minute. Monthly limit depends on trial terms (check dashboard).
- **Setup:** API key required. Register at the link below.
- **Website:** https://www.barcodelookup.com
- **API Docs:** https://www.barcodelookup.com/api-documentation
- **Key Signup:** https://www.barcodelookup.com/api
- **Base URL:** `https://api.barcodelookup.com/v3/products?barcode={barcode}&key={key}`
- **Env Variable:** `BARCODE_LOOKUP_API_KEY`

---

## 6. Go-UPC
- **Type:** Commercial, Free Plan (manual approval required).
- **Database Size:** 500M+ products.
- **Rate Limit:** 150 requests/month. Max 2 requests/second.
- **Setup:** API key required. Apply for free plan at the link below. Note: approval is not instant.
- **Website:** https://go-upc.com
- **API Docs:** https://go-upc.com/plans/api
- **Key Signup:** https://go-upc.com/plans/api
- **Base URL:** `https://api.go-upc.com/v1/code/{barcode}`
- **Env Variable:** `GO_UPC_API_KEY`

---

## 7. SearchUPC
- **Type:** Commercial, Free Tier.
- **Database Size:** 1M+ products.
- **Rate Limit:** 100 lookups/day, 25 searches/day.
- **Setup:** API key required. Register at the link below.
- **Website:** https://searchupc.com
- **API Docs:** https://searchupc.com/developers/
- **Key Signup:** https://searchupc.com/developers/
- **Base URL:** `https://api.searchupc.com/v1.1/?request_type=product&key={key}&upc={barcode}`
- **Env Variable:** `SEARCH_UPC_API_KEY`
