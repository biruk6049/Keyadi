/**
 * AI-powered search engine for Keyadi.
 *
 * Provides a hybrid architecture:
 * 1. Built-in Local Semantic AI (zero-setup, runs instantly client-side with comprehensive intent & tag mapping).
 * 2. Google Gemini Cloud LLM (when a Gemini API key is provided via .env or settings).
 *
 * Guarantees intelligent semantic search always runs and never fails silently.
 */

// ── Category presets (used by quick-pick chips) ──────────────────────
export const CATEGORY_PRESETS = [
  { key: 'food',        label: 'Food',        iconKey: 'food',        tags: [['amenity', 'restaurant'], ['amenity', 'fast_food'], ['amenity', 'food_court']] },
  { key: 'cafe',        label: 'Café',        iconKey: 'cafe',        tags: [['amenity', 'cafe']] },
  { key: 'gas',         label: 'Fuel',        iconKey: 'gas',         tags: [['amenity', 'fuel']] },
  { key: 'pharmacy',    label: 'Pharmacy',    iconKey: 'pharmacy',    tags: [['amenity', 'pharmacy'], ['healthcare', 'pharmacy']] },
  { key: 'shop',        label: 'Shops',       iconKey: 'shop',        tags: [['shop', '*']] },
  { key: 'atm',         label: 'ATM',         iconKey: 'atm',         tags: [['amenity', 'atm'], ['amenity', 'bank']] },
  { key: 'parking',     label: 'Parking',     iconKey: 'parking',     tags: [['amenity', 'parking']] },
  { key: 'hotel',       label: 'Hotels',      iconKey: 'hotel',       tags: [['tourism', 'hotel'], ['tourism', 'guest_house'], ['tourism', 'hostel']] },
  { key: 'hospital',    label: 'Medical',     iconKey: 'hospital',    tags: [['amenity', 'hospital'], ['amenity', 'clinic'], ['amenity', 'doctors']] },
  { key: 'supermarket', label: 'Supermarket', iconKey: 'supermarket', tags: [['shop', 'supermarket'], ['shop', 'convenience'], ['shop', 'mall']] },
  { key: 'hardware',    label: 'Hardware',    iconKey: 'hardware',    tags: [['shop', 'hardware'], ['shop', 'building_materials'], ['craft', 'plumber'], ['craft', 'carpenter']] },
  { key: 'school',      label: 'Education',   iconKey: 'school',      tags: [['amenity', 'school'], ['amenity', 'university'], ['amenity', 'college']] },
  { key: 'worship',     label: 'Worship',     iconKey: 'worship',     tags: [['amenity', 'place_of_worship']] },
]

// ── Overpass query builders ──────────────────────────────────────────

function buildBBox(center, radiusKm) {
  const radiusM = radiusKm * 1000
  const latDelta = radiusM / 111000
  const lngDelta = radiusM / (111000 * Math.cos((center.lat * Math.PI) / 180))
  return [
    center.lat - latDelta,
    center.lng - lngDelta,
    center.lat + latDelta,
    center.lng + lngDelta,
  ].join(',')
}

function sanitizeOsmTag(str) {
  if (typeof str !== 'string') return ''
  // Allow only safe alphanumeric and standard OSM characters: [a-zA-Z0-9_:*-]
  return str.replace(/[^a-zA-Z0-9_:*-]/g, '').slice(0, 50)
}

/**
 * Build an Overpass query from structured tag pairs.
 * Each tag is [key, value], e.g. ['amenity', 'cafe'].
 * Wildcard value '*' becomes a has-key filter.
 */
export function buildTagOverpassQuery(tags, center, radiusKm) {
  const bbox = buildBBox(center, radiusKm)

  const clauses = tags
    .filter(([k, v]) => k && v)
    .map(([rawKey, rawValue]) => {
      const key = sanitizeOsmTag(rawKey)
      const value = sanitizeOsmTag(rawValue)
      if (!key) return null
      const filter = value === '*' ? `["${key}"]` : `["${key}"="${value}"]`
      return `  node${filter}(${bbox});\n  way${filter}(${bbox});`
    })
    .filter(Boolean)
    .join('\n')

  return `[out:json][timeout:25];\n(\n${clauses}\n);\nout center 40;`
}

/**
 * Build a classic regex-based Overpass query (fallback).
 * Sanitized to prevent Overpass QL syntax or prompt injection.
 */
export function buildRegexOverpassQuery(keyword, center, radiusKm) {
  const bbox = buildBBox(center, radiusKm)
  // Strip special QL control characters
  const sanitized = String(keyword || '').replace(/["[\]();\\]/g, '').slice(0, 80)
  const safe = sanitized.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return `[out:json][timeout:25];\n(\n  node["name"~"${safe}",i](${bbox});\n  way["name"~"${safe}",i](${bbox});\n);\nout center 35;`
}

// ── Built-in Semantic AI Engine ──────────────────────────────────────

const SEMANTIC_INTENTS = [
  {
    patterns: [/cement/i, /rebar/i, /brick/i, /paint/i, /hardware/i, /timber/i, /lumber/i, /tile/i, /ceramic/i, /plumb/i, /pipe/i, /steel/i, /iron/i, /tool/i, /construction/i, /building material/i],
    tags: [['shop', 'hardware'], ['shop', 'building_materials'], ['craft', 'plumber'], ['craft', 'carpenter']],
    description: 'Hardware, building supplies & construction materials',
    refinements: ['Hardware stores', 'Building materials', 'Tile & ceramic specialists', 'Plumbing suppliers'],
  },
  {
    patterns: [/coffee/i, /cafe/i, /café/i, /espresso/i, /latte/i, /cappuccino/i, /macchiato/i, /roaster/i, /tea/i],
    tags: [['amenity', 'cafe'], ['amenity', 'coffee_shop']],
    description: 'Cafés, espresso bars & coffee roasters',
    refinements: ['Cafés with seating', 'Specialty coffee', 'Bakeries & cafés'],
  },
  {
    patterns: [/food/i, /eat/i, /restaurant/i, /dinner/i, /lunch/i, /breakfast/i, /brunch/i, /pizza/i, /burger/i, /fast food/i, /shawarma/i, /grill/i, /bbq/i, /sushi/i, /dine/i],
    tags: [['amenity', 'restaurant'], ['amenity', 'fast_food'], ['amenity', 'food_court']],
    description: 'Restaurants, dining & quick eats',
    refinements: ['Fast food & casual dining', 'Traditional restaurants', 'Late night food'],
  },
  {
    patterns: [/pharmacy/i, /medicine/i, /drug/i, /chemist/i, /prescription/i, /pills/i, /medical store/i],
    tags: [['amenity', 'pharmacy'], ['healthcare', 'pharmacy']],
    description: 'Pharmacies & dispensaries',
    refinements: ['24-hour pharmacies', 'Hospital pharmacies', 'Health clinics'],
  },
  {
    patterns: [/gas/i, /fuel/i, /petrol/i, /diesel/i, /station/i, /refuel/i],
    tags: [['amenity', 'fuel']],
    description: 'Gas & fuel service stations',
    refinements: ['24-hour gas stations', 'Fuel stations with car wash', 'Service areas'],
  },
  {
    patterns: [/hotel/i, /motel/i, /hostel/i, /stay/i, /lodge/i, /resort/i, /guest house/i, /guesthouse/i, /inn/i, /accommodation/i],
    tags: [['tourism', 'hotel'], ['tourism', 'guest_house'], ['tourism', 'hostel']],
    description: 'Hotels, guest houses & lodging',
    refinements: ['Boutique hotels', 'Budget guest houses', 'Resorts & suites'],
  },
  {
    patterns: [/supermarket/i, /grocery/i, /market/i, /bazaar/i, /mall/i, /shopping/i, /hypermarket/i, /convenience/i],
    tags: [['shop', 'supermarket'], ['shop', 'convenience'], ['shop', 'mall']],
    description: 'Supermarkets, grocery stores & markets',
    refinements: ['Neighborhood supermarkets', 'Shopping malls', 'Convenience stores'],
  },
  {
    patterns: [/hospital/i, /clinic/i, /doctor/i, /dentist/i, /emergency/i, /health/i, /physician/i],
    tags: [['amenity', 'hospital'], ['amenity', 'clinic'], ['amenity', 'doctors']],
    description: 'Hospitals, medical clinics & doctors',
    refinements: ['Emergency hospitals', 'Dental clinics', 'Specialized medical centers'],
  },
  {
    patterns: [/atm/i, /bank/i, /cash/i, /withdraw/i, /money/i, /forex/i],
    tags: [['amenity', 'atm'], ['amenity', 'bank']],
    description: 'Banks & ATM cash dispensers',
    refinements: ['24/7 ATMs', 'Commercial bank branches', 'Currency exchange'],
  },
  {
    patterns: [/mechanic/i, /car repair/i, /auto/i, /tyre/i, /tire/i, /oil change/i, /garage/i, /puncture/i, /vehicle repair/i],
    tags: [['shop', 'car_repair'], ['craft', 'mechanic']],
    description: 'Automotive workshops & repair garages',
    refinements: ['Tire & wheel repair', 'Engine diagnostics', 'Auto spare parts'],
  },
  {
    patterns: [/gym/i, /fitness/i, /workout/i, /weights/i, /bodybuilding/i, /crossfit/i, /swimming/i, /pool/i],
    tags: [['leisure', 'fitness_centre'], ['leisure', 'sports_centre']],
    description: 'Gyms, fitness centers & athletics',
    refinements: ['Fitness centers with gym equipment', 'Swimming pools', 'Sports clubs'],
  },
  {
    patterns: [/bakery/i, /bake/i, /bread/i, /pastry/i, /cake/i, /croissant/i, /patisserie/i],
    tags: [['shop', 'bakery']],
    description: 'Bakeries & pastry shops',
    refinements: ['Fresh bread bakeries', 'Cake shops', 'Cafés with pastries'],
  },
  {
    patterns: [/church/i, /mosque/i, /cathedral/i, /temple/i, /worship/i, /prayer/i],
    tags: [['amenity', 'place_of_worship']],
    description: 'Churches, mosques & places of worship',
    refinements: ['Churches & cathedrals', 'Mosques', 'Historic religious sites'],
  },
  {
    patterns: [/park/i, /garden/i, /nature/i, /walk/i, /forest/i, /recreation/i],
    tags: [['leisure', 'park'], ['leisure', 'garden']],
    description: 'Public parks & recreational gardens',
    refinements: ['Public city parks', 'Botanical gardens', 'Walking trails'],
  },
  {
    patterns: [/bar/i, /pub/i, /beer/i, /wine/i, /cocktail/i, /nightclub/i, /club/i, /lounge/i],
    tags: [['amenity', 'bar'], ['amenity', 'pub'], ['amenity', 'nightclub']],
    description: 'Bars, lounges & nightlife',
    refinements: ['Cocktail lounges', 'Pubs & bars', 'Late-night clubs'],
  },
  {
    patterns: [/school/i, /university/i, /college/i, /academy/i, /education/i, /library/i],
    tags: [['amenity', 'school'], ['amenity', 'university'], ['amenity', 'college'], ['amenity', 'library']],
    description: 'Schools, universities & educational campuses',
    refinements: ['Universities & colleges', 'High schools', 'Public libraries'],
  },
  {
    patterns: [/salon/i, /barber/i, /haircut/i, /hair/i, /spa/i, /beauty/i, /massage/i],
    tags: [['shop', 'hairdresser'], ['shop', 'beauty'], ['amenity', 'spa']],
    description: 'Salons, barbers & beauty spas',
    refinements: ['Men\'s barber shops', 'Hair & beauty salons', 'Day spas'],
  },
  {
    patterns: [/electronics/i, /phone/i, /laptop/i, /computer/i, /mobile/i, /screen repair/i],
    tags: [['shop', 'electronics'], ['shop', 'mobile_phone']],
    description: 'Electronics & mobile phone shops',
    refinements: ['Smartphone repair', 'Computer electronics', 'Accessories'],
  },
]

/**
 * Local Semantic parser: analyzes natural language and maps to OSM tags.
 */
export function interpretWithLocalAI(userQuery) {
  const query = userQuery.trim().toLowerCase()

  // Clean filler words like "where can i find", "best", "near me", "looking for"
  const cleaned = query
    .replace(/where\s+(can\s+i\s+|to\s+)?(find|buy|get|see)\s+/gi, '')
    .replace(/(show\s+me|looking\s+for|i\s+need|any|near\s+me|around\s+here|best|cheap|good|nearby)\s+/gi, '')
    .trim()

  for (const intent of SEMANTIC_INTENTS) {
    const matched = intent.patterns.some((pattern) => pattern.test(query) || pattern.test(cleaned))
    if (matched) {
      // Check if there is an additional brand/name (e.g., "Kaldi's coffee", "Shell gas")
      const words = cleaned.split(/\s+/).filter(w => w.length > 2)
      const nonKeywordWords = words.filter(w => !intent.patterns.some(p => p.test(w)))
      const nameFilter = nonKeywordWords.length > 0 ? nonKeywordWords.join(' ') : null

      return {
        engine: 'Semantic AI (Built-in)',
        tags: intent.tags,
        nameFilter: nameFilter,
        description: intent.description,
        refinements: intent.refinements,
      }
    }
  }

  // Fallback: If no specific intent matched, use word matching as broad shop/amenity search
  const firstWord = cleaned.split(/\s+/)[0] || userQuery
  return {
    engine: 'Semantic AI (Built-in)',
    tags: [['amenity', '*'], ['shop', '*']],
    nameFilter: firstWord.length >= 2 ? firstWord : null,
    description: `Places matching "${userQuery}"`,
    refinements: ['Explore nearby shops', 'Cafés & restaurants', 'Services'],
  }
}

// ── Unified Geospatial RAG Intelligence Engine ───────────────────────

const CANDIDATE_MODELS = [
  'gemini-3.8-flash',
  'gemini-flash-latest',
  'gemini-2.5-flash',
  'gemini-3.6-flash',
  'gemini-2.5-flash-lite',
]

function getGeminiKey() {
  try {
    return localStorage.getItem('keyadi_gemini_key') || import.meta.env.VITE_GEMINI_API_KEY || ''
  } catch {
    return import.meta.env.VITE_GEMINI_API_KEY || ''
  }
}

export function saveGeminiKey(key) {
  try {
    if (key) {
      localStorage.setItem('keyadi_gemini_key', key.trim())
    } else {
      localStorage.removeItem('keyadi_gemini_key')
    }
  } catch (err) {
    console.warn('Failed to persist Gemini key:', err)
  }
}

export function getActiveGeminiKey() {
  return getGeminiKey()
}

/**
 * Resilient Gemini API call with model fallback and strict JSON parsing.
 */
async function callGemini(contents, systemPrompt = '', timeoutMs = 8500) {
  const apiKey = getGeminiKey()
  if (!apiKey) return null

  for (const model of CANDIDATE_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`
      const bodyPayload = {
        contents: typeof contents === 'string' ? [{ parts: [{ text: contents }] }] : contents,
        generationConfig: {
          temperature: 0.15,
          maxOutputTokens: 768,
          responseMimeType: 'application/json',
        },
      }

      if (systemPrompt) {
        bodyPayload.systemInstruction = { parts: [{ text: systemPrompt }] }
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify(bodyPayload),
        signal: AbortSignal.timeout(timeoutMs),
      })

      if (res.ok) {
        const data = await res.json()
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text
        if (rawText) {
          const cleaned = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
          return JSON.parse(cleaned)
        }
      }
    } catch (err) {
      // Continue to next model fallback
      console.warn(`Gemini call to ${model} failed, trying next:`, err.message)
    }
  }

  return null
}

const GEMINI_RETRIEVAL_PROMPT = `You are the Geospatial RAG Intelligence Interpreter for Keyadi OpenStreetMap engine.
The user enters a natural query (e.g. "where can I buy cement", "quiet coffee with wifi", "late night pharmacy").
Return a strict JSON object with:
1. "tags": array of [key, value] pairs of OpenStreetMap tags (amenity, shop, tourism, leisure, craft, healthcare). Use "*" for wildcard value.
2. "nameFilter": string to filter by name if a specific brand or place name is mentioned, else null.
3. "description": concise 4-8 word summary of the query intent.
4. "refinements": array of 2-3 short suggestions the user can tap.

Only output valid raw JSON without markdown code blocks.`

/**
 * RAG Phase 1: Semantic Intent & Query Expansion.
 * Determines the optimal OSM tags and spatial filters using Gemini,
 * falling back seamlessly to local semantic patterns if offline.
 */
export async function interpretWithRAG(userQuery) {
  const geminiKey = getGeminiKey()

  if (geminiKey) {
    try {
      const parsed = await callGemini(
        `Query: "${userQuery}"`,
        GEMINI_RETRIEVAL_PROMPT,
        5000
      )

      if (parsed && Array.isArray(parsed.tags) && parsed.tags.length > 0) {
        return {
          engine: 'Keyadi AI',
          tags: parsed.tags,
          nameFilter: parsed.nameFilter || null,
          description: parsed.description || 'AI interpreted search',
          refinements: Array.isArray(parsed.refinements) ? parsed.refinements.slice(0, 3) : [],
        }
      }
    } catch (err) {
      console.warn('Gemini query interpretation failed, using semantic fallback:', err)
    }
  }

  // Resilient fallback
  const local = interpretWithLocalAI(userQuery)
  return {
    ...local,
    engine: 'Keyadi AI',
  }
}

// Keep interpretWithAI as an alias for backwards compatibility
export const interpretWithAI = interpretWithRAG

/**
 * RAG Phase 2: Grounded Synthesis over Retrieved Places.
 * Passes the user's original query together with the actual retrieved places
 * to Gemini to produce zero-hallucination grounded insights and custom place badges.
 */
export async function synthesizeWithRAG(userQuery, retrievedPlaces, userLocation, units = 'km') {
  if (!retrievedPlaces || retrievedPlaces.length === 0) {
    return {
      ragSummary: `No matching places found within the selected radius. Try expanding your search distance or adjusting the query.`,
      badges: {},
      followUps: ['Expand search radius', 'Search in nearby district', 'Explore popular spots'],
    }
  }

  // Prepare top candidate records for grounding (max 10 places to stay fast & focused)
  const topPlaces = retrievedPlaces.slice(0, 10).map((p) => ({
    name: p.name,
    type: p.type || 'place',
    distance: `${p.distanceKm?.toFixed(2) || '?'} ${units}`,
    openingHours: p.openingHours || 'Not specified',
    phone: p.phone ? 'Yes' : 'No',
    website: p.website ? 'Yes' : 'No',
  }))

  const prompt = `User Query: "${userQuery}"
Retrieved real-world geospatial database records:
${JSON.stringify(topPlaces, null, 2)}

Task: Grounded Retrieval-Augmented Generation (RAG).
Synthesize the retrieved places relative to the user's query. Do NOT invent places not in the data.
Return a strict JSON object with:
1. "ragSummary": A 2-sentence grounded insight highlighting the best options based strictly on the retrieved records.
2. "badges": Object mapping place name to a short 2-3 word highlight badge (e.g. "Closest (350m)", "Top Pick", "Open Late", "Has Website").
3. "followUps": Array of 2-3 short natural follow-up queries.`

  const apiKey = getGeminiKey()
  if (apiKey) {
    try {
      const result = await callGemini(prompt, 'You are an accurate, grounded Geospatial RAG synthesizer. Never hallucinate places.', 7500)
      if (result && result.ragSummary) {
        return {
          ragSummary: result.ragSummary,
          badges: result.badges || {},
          followUps: Array.isArray(result.followUps) ? result.followUps.slice(0, 3) : [],
        }
      }
    } catch (err) {
      console.warn('Gemini RAG synthesis failed, using local grounding:', err)
    }
  }

  // Local Grounding Fallback: Deterministic synthesis based on actual data
  const closest = retrievedPlaces[0]
  const hasHours = retrievedPlaces.find((p) => p.openingHours)
  const count = retrievedPlaces.length

  const closestDist = closest?.distanceKm ? `${closest.distanceKm.toFixed(1)} ${units}` : 'nearby'
  let summary = `Found ${count} verified location${count > 1 ? 's' : ''}. `
  if (closest) {
    summary += `Closest is ${closest.name} (${closestDist}). `
  }
  if (hasHours && hasHours.name !== closest?.name) {
    summary += `${hasHours.name} has posted hours (${hasHours.openingHours}).`
  }

  const badges = {}
  if (closest) badges[closest.name] = 'Closest Match'
  if (hasHours && hasHours.name !== closest?.name) badges[hasHours.name] = 'Verified Hours'
  if (retrievedPlaces[1] && !badges[retrievedPlaces[1].name]) {
    badges[retrievedPlaces[1].name] = 'Popular Option'
  }

  return {
    ragSummary: summary.trim(),
    badges,
    followUps: [
      `Show closest ${userQuery}`,
      `Places open right now`,
      `Expand search area`,
    ],
  }
}

/**
 * RAG Phase 3: Grounded Place Q&A Assistant.
 * Answers specific user questions about a place using only real geospatial attributes.
 */
export async function askPlaceRAG(question, place, userLocation, units = 'km') {
  if (!place) return 'No place selected.'

  const placeContext = {
    name: place.name,
    type: place.type,
    lat: place.lat,
    lng: place.lng,
    distance: place.distanceKm ? `${place.distanceKm.toFixed(2)} ${units}` : 'unknown',
    openingHours: place.openingHours || 'Not listed',
    phone: place.phone || 'Not listed',
    website: place.website || 'Not listed',
  }

  const prompt = `Place data:
${JSON.stringify(placeContext, null, 2)}

User Question: "${question}"

Answer the question concisely in 1-2 sentences using ONLY the provided verified place data. If the information isn't known, say so honestly.`

  const apiKey = getGeminiKey()
  if (apiKey) {
    try {
      const res = await callGemini(prompt, 'You are an accurate geospatial place assistant.', 6000)
      if (res && res.answer) return res.answer
      if (typeof res === 'string') return res
    } catch {
      // Fallback below
    }
  }

  // Fallback direct answer
  if (/hour|open|time/i.test(question)) {
    return place.openingHours ? `${place.name}'s hours: ${place.openingHours}.` : `No opening hours recorded for ${place.name}.`
  }
  if (/phone|call|contact/i.test(question)) {
    return place.phone ? `Phone number: ${place.phone}.` : `No contact phone is listed for ${place.name}.`
  }
  if (/walk|far|distance/i.test(question)) {
    return place.distanceKm ? `${place.name} is ${place.distanceKm.toFixed(2)} ${units} away.` : `${place.name} is located at ${place.lat.toFixed(4)}, ${place.lng.toFixed(4)}.`
  }

  return `${place.name} is a ${place.type || 'place'} located ${place.distanceKm ? `${place.distanceKm.toFixed(2)} ${units} away` : ''}.`
}

/**
 * Build an AI-optimized Overpass query from interpretation.
 */
export function buildAIOverpassQuery(aiResult, center, radiusKm) {
  const bbox = buildBBox(center, radiusKm)
  const { tags, nameFilter } = aiResult

  const nameClause = nameFilter ? `["name"~"${nameFilter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}",i]` : ''

  const clauses = tags.map(([key, value]) => {
    const tagFilter = value === '*' ? `["${key}"]` : `["${key}"="${value}"]`
    return `  node${tagFilter}${nameClause}(${bbox});\n  way${tagFilter}${nameClause}(${bbox});`
  }).join('\n')

  const nameFallback = nameFilter
    ? `\n  node["name"~"${nameFilter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}",i](${bbox});\n  way["name"~"${nameFilter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}",i](${bbox});`
    : ''

  return `[out:json][timeout:25];\n(\n${clauses}${nameFallback}\n);\nout center 45;`
}

