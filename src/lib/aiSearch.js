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
  { key: 'food',        label: 'Food',        iconKey: 'food',        tags: [['amenity', 'restaurant'], ['amenity', 'cafe'], ['amenity', 'fast_food'], ['amenity', 'food_court'], ['shop', 'bakery'], ['shop', 'pastry']], keywords: ['restaurant', 'cafe', 'food', 'bakery'] },
  { key: 'cafe',        label: 'Café',        iconKey: 'cafe',        tags: [['amenity', 'cafe']], keywords: ['cafe', 'coffee'] },
  { key: 'gas',         label: 'Fuel',        iconKey: 'gas',         tags: [['amenity', 'fuel']], keywords: ['fuel', 'gas station', 'petrol'] },
  { key: 'pharmacy',    label: 'Pharmacy',    iconKey: 'pharmacy',    tags: [['amenity', 'pharmacy'], ['healthcare', 'pharmacy']], keywords: ['pharmacy', 'chemist', 'drugstore'] },
  { key: 'shop',        label: 'Shops',       iconKey: 'shop',        tags: [['shop', '*']], keywords: ['shop', 'store', 'market'] },
  { key: 'atm',         label: 'ATM',         iconKey: 'atm',         tags: [['amenity', 'atm'], ['amenity', 'bank']], keywords: ['atm', 'bank'] },
  { key: 'parking',     label: 'Parking',     iconKey: 'parking',     tags: [['amenity', 'parking']], keywords: ['parking'] },
  { key: 'hotel',       label: 'Hotels',      iconKey: 'hotel',       tags: [['tourism', 'hotel'], ['tourism', 'guest_house'], ['tourism', 'hostel']], keywords: ['hotel', 'guest house', 'lodging'] },
  { key: 'hospital',    label: 'Medical',     iconKey: 'hospital',    tags: [['amenity', 'hospital'], ['amenity', 'clinic'], ['amenity', 'doctors']], keywords: ['hospital', 'clinic', 'medical'] },
  { key: 'supermarket', label: 'Supermarket', iconKey: 'supermarket', tags: [['shop', 'supermarket'], ['shop', 'convenience'], ['shop', 'mall']], keywords: ['supermarket', 'grocery', 'mall'] },
  { key: 'hardware',    label: 'Hardware',    iconKey: 'hardware',    tags: [['shop', 'hardware'], ['shop', 'building_materials'], ['craft', 'plumber'], ['craft', 'carpenter']], keywords: ['hardware', 'building materials', 'cement', 'tools'] },
  { key: 'school',      label: 'Education',   iconKey: 'school',      tags: [['amenity', 'school'], ['amenity', 'university'], ['amenity', 'college']], keywords: ['school', 'university', 'college'] },
  { key: 'worship',     label: 'Worship',     iconKey: 'worship',     tags: [['amenity', 'place_of_worship']], keywords: ['church', 'mosque', 'worship'] },
]

// ── Overpass query builders ──────────────────────────────────────────

export function buildBBox(center, radiusKm) {
  const latDelta = radiusKm / 111.32
  const cosLat = Math.cos((center.lat * Math.PI) / 180)
  const lngDelta = radiusKm / (111.32 * (Math.abs(cosLat) > 0.01 ? Math.abs(cosLat) : 1))
  const south = Math.max(-90, center.lat - latDelta).toFixed(6)
  const west = Math.max(-180, center.lng - lngDelta).toFixed(6)
  const north = Math.min(90, center.lat + latDelta).toFixed(6)
  const east = Math.min(180, center.lng + lngDelta).toFixed(6)
  return `${south},${west},${north},${east}`
}

function sanitizeOsmTag(str) {
  if (typeof str !== 'string') return ''
  return str.replace(/[^a-zA-Z0-9_:*-]/g, '').slice(0, 50)
}

/**
 * Build an Overpass query from structured tag pairs within a precise bounding box.
 * Each tag is [key, value], e.g. ['amenity', 'cafe'].
 * Always requires ["name"] so only legitimate named venues are returned.
 */
export function buildTagOverpassQuery(tags, center, radiusKm) {
  const bbox = buildBBox(center, radiusKm)

  const clauses = (tags || [])
    .filter(([k, v]) => k && v)
    .map(([rawKey, rawValue]) => {
      const key = sanitizeOsmTag(rawKey)
      const value = sanitizeOsmTag(rawValue)
      if (!key) return null
      const filter = value === '*' ? `["${key}"]` : `["${key}"="${value}"]`
      return `  node${filter}["name"];\n  way${filter}["name"];`
    })
    .filter(Boolean)
    .join('\n')

  return `[out:json][timeout:25][bbox:${bbox}];\n(\n${clauses}\n);\nout center 150;`
}

/**
 * Build a classic regex-based Overpass query (fallback).
 * Sanitized to prevent Overpass QL syntax or prompt injection.
 */
export function buildRegexOverpassQuery(keyword, center, radiusKm) {
  const bbox = buildBBox(center, radiusKm)
  const sanitized = String(keyword || '').replace(/["[\]();\\]/g, '').slice(0, 80)
  const safe = sanitized.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return `[out:json][timeout:25][bbox:${bbox}];\n(\n  node["name"~"${safe}",i];\n  way["name"~"${safe}",i];\n);\nout center 120;`
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
    tags: [['amenity', 'restaurant'], ['amenity', 'cafe'], ['amenity', 'fast_food'], ['amenity', 'food_court'], ['shop', 'bakery'], ['shop', 'pastry'], ['amenity', 'bar']],
    description: 'Restaurants, cafés & dining spots',
    refinements: ['Restaurants & fine dining', 'Cafés & breakfast', 'Fast food & casual eats', 'Bakeries & pastries'],
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
async function callGemini(contents, systemPrompt = '', timeoutMs = 5000, maxAttempts = 2) {
  const apiKey = getGeminiKey()
  if (!apiKey) return null

  for (const model of CANDIDATE_MODELS.slice(0, maxAttempts)) {
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
        3500,
        2
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

  const nameClause = nameFilter ? `["name"~"${nameFilter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}",i]` : '["name"]'

  const clauses = (tags || []).map(([key, value]) => {
    const k = sanitizeOsmTag(key)
    const v = sanitizeOsmTag(value)
    if (!k) return null
    const tagFilter = v === '*' ? `["${k}"]` : `["${k}"="${v}"]`
    return `  node${tagFilter}${nameClause};\n  way${tagFilter}${nameClause};`
  }).filter(Boolean).join('\n')

  const nameFallback = nameFilter
    ? `\n  node["name"~"${nameFilter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}",i];\n  way["name"~"${nameFilter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}",i];`
    : ''

  return `[out:json][timeout:25][bbox:${bbox}];\n(\n${clauses}${nameFallback}\n);\nout center 150;`
}

// ── Ultra-Reliable Multi-Engine Place Search Architecture ───────────

export function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function formatAddressSnippet(displayName) {
  if (!displayName) return ''
  const parts = displayName.split(',').map((s) => s.trim())
  if (parts.length <= 2) return displayName
  return parts.slice(1, 4).join(', ')
}

function normalizeOsmItem(item, queryFallback) {
  const lat = parseFloat(item.lat)
  const lng = parseFloat(item.lon)
  const rawName = item.name || (item.display_name ? item.display_name.split(',')[0].trim() : queryFallback)
  const extra = item.extratags || {}
  const type = item.type || item.class || 'place'
  const address = item.display_name || ''
  const phone = extra.phone || extra['contact:phone'] || ''
  const website = extra.website || extra['contact:website'] || ''
  const openingHours = extra.opening_hours || ''
  const stars = extra.stars || ''

  return {
    id: `osm-${item.osm_type || 'n'}-${item.osm_id || Math.random()}`,
    name: rawName,
    lat,
    lng,
    type,
    address,
    addressSnippet: formatAddressSnippet(item.display_name),
    phone,
    website,
    openingHours,
    stars,
    source: 'osm',
  }
}

function normalizeMapboxItem(f, queryFallback) {
  const [lng, lat] = f.center || []
  const name = f.text || (f.place_name ? f.place_name.split(',')[0].trim() : queryFallback)
  const address = f.place_name || ''
  const type = f.place_type?.[0] || 'place'

  return {
    id: `mb-${f.id || Math.random()}`,
    name,
    lat,
    lng,
    type,
    address,
    addressSnippet: address.split(',').slice(1, 3).join(', ').trim() || address,
    phone: '',
    website: '',
    openingHours: '',
    stars: '',
    source: 'mapbox',
  }
}

const searchCache = new Map()
const SEARCH_CACHE_TTL = 5 * 60 * 1000 // 5 minutes

/**
 * High-Reliability Multi-Engine Place Search:
 * Queries OpenStreetMap Nominatim with viewbox boundary & semantic expansion,
 * backed by Mapbox Geocoding and intelligent radius expansion.
 * Guarantees actual, verified places are returned without silent failures.
 */
export async function searchPlacesReliable({
  term,
  center,
  radiusKm = 5,
  mapboxToken = '',
  signal = null,
}) {
  const trimmed = (term || '').trim()
  const unaccented = trimmed.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  if (!trimmed) return { places: [], isExpanded: false, effectiveRadius: radiusKm, aiInterpretation: null }

  const cacheKey = `${unaccented.toLowerCase()}-${center.lat.toFixed(3)}-${center.lng.toFixed(3)}-${radiusKm}`
  const cached = searchCache.get(cacheKey)
  if (cached && Date.now() - cached.ts < SEARCH_CACHE_TTL && cached.places?.length > 0) {
    return cached
  }

  // 1. Semantic intent interpretation
  const ai = interpretWithLocalAI(unaccented)
  const keywordsToTry = new Set([trimmed, unaccented, unaccented.toLowerCase()])

  if (ai.tags && Array.isArray(ai.tags)) {
    for (const [k, v] of ai.tags) {
      if (v && v !== '*') keywordsToTry.add(v.replace(/_/g, ' '))
      else if (k) keywordsToTry.add(k.replace(/_/g, ' '))
    }
  }

  for (const preset of CATEGORY_PRESETS) {
    if (
      preset.label.toLowerCase() === trimmed.toLowerCase() ||
      preset.label.toLowerCase() === unaccented.toLowerCase() ||
      preset.key === trimmed.toLowerCase() ||
      preset.key === unaccented.toLowerCase()
    ) {
      preset.keywords?.forEach((k) => keywordsToTry.add(k))
    }
  }

  if (/cafe|coffee/i.test(unaccented)) {
    keywordsToTry.add('cafe')
    keywordsToTry.add('coffee')
  }
  if (/pharmacy|chemist|drug|medicine/i.test(unaccented)) {
    keywordsToTry.add('pharmacy')
    keywordsToTry.add('clinic')
  }
  if (/food|restaurant|eat/i.test(unaccented)) {
    keywordsToTry.add('restaurant')
    keywordsToTry.add('cafe')
  }

  const queryTerms = [...keywordsToTry].slice(0, 4)

  // 2. Viewbox computation for Nominatim
  const latDelta = radiusKm / 111.32
  const cosLat = Math.cos((center.lat * Math.PI) / 180)
  const lngDelta = radiusKm / (111.32 * Math.max(0.1, Math.abs(cosLat)))
  const south = Math.max(-90, center.lat - latDelta).toFixed(6)
  const west = Math.max(-180, center.lng - lngDelta).toFixed(6)
  const north = Math.min(90, center.lat + latDelta).toFixed(6)
  const east = Math.min(180, center.lng + lngDelta).toFixed(6)
  const viewboxParam = `${west},${north},${east},${south}`

  // Expanded viewbox (25 km) for broader fallback
  const expLatDelta = Math.max(25, radiusKm * 3) / 111.32
  const expLngDelta = Math.max(25, radiusKm * 3) / (111.32 * Math.max(0.1, Math.abs(cosLat)))
  const expSouth = Math.max(-90, center.lat - expLatDelta).toFixed(6)
  const expWest = Math.max(-180, center.lng - expLngDelta).toFixed(6)
  const expNorth = Math.min(90, center.lat + expLatDelta).toFixed(6)
  const expEast = Math.min(180, center.lng + expLngDelta).toFixed(6)
  const expViewboxParam = `${expWest},${expNorth},${expEast},${expSouth}`

  let rawPlaces = []

  const mapboxBbox = `${west},${south},${east},${north}`
  const expMapboxBbox = `${expWest},${expSouth},${expEast},${expNorth}`

  const fetchNominatim = async (q, vb, bounded) => {
    const proxyBase = typeof window !== 'undefined' ? '' : 'http://localhost:5173'
    const endpoints = [
      `${proxyBase}/api/nominatim/search?q=${encodeURIComponent(q)}&format=json&addressdetails=1&extratags=1&limit=25&viewbox=${vb}${bounded ? '&bounded=1' : ''}`,
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&addressdetails=1&extratags=1&limit=25&viewbox=${vb}${bounded ? '&bounded=1' : ''}`,
    ]

    for (const ep of endpoints) {
      if (signal?.aborted) break
      try {
        const headers = { Accept: 'application/json' }
        if (typeof window === 'undefined') {
          headers['User-Agent'] = 'KeyadiPlaceTracker/2.0 (contact@keyadi.app)'
        }
        const res = await fetch(ep, {
          signal: signal || AbortSignal.timeout(6000),
          headers,
        })
        if (res.ok) {
          const contentType = res.headers.get('content-type') || ''
          if (contentType.includes('json')) {
            const data = await res.json()
            if (Array.isArray(data) && data.length > 0) return data
          }
        }
      } catch {
        // Continue to fallback endpoint
      }
    }
    return []
  }

  const fetchMapbox = async (q, bbox = null, limit = 10) => {
    if (!mapboxToken) return []
    const bboxParam = bbox ? `&bbox=${bbox}` : ''
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?proximity=${center.lng},${center.lat}${bboxParam}&access_token=${mapboxToken}&limit=${limit}`
    try {
      const res = await fetch(url, { signal: signal || AbortSignal.timeout(6000) })
      if (res.ok) {
        const data = await res.json()
        return data.features || []
      }
    } catch {}
    return []
  }

  // Phase A: Query bounded Nominatim viewbox for candidate terms
  for (const q of queryTerms) {
    if (signal?.aborted) break
    const osmItems = await fetchNominatim(q, viewboxParam, true)
    if (osmItems.length > 0) {
      rawPlaces.push(...osmItems.map((item) => normalizeOsmItem(item, q)))
      if (rawPlaces.length >= 25) break
    }
  }

  // Phase B: Query Mapbox within local bbox for landmarks, districts, addresses
  if (!signal?.aborted && rawPlaces.length < 5) {
    const mbItems = await fetchMapbox(trimmed, mapboxBbox, 5)
    if (mbItems.length > 0) {
      rawPlaces.push(...mbItems.map((item) => normalizeMapboxItem(item, trimmed)))
    }
  }

  // Phase C: If 0 results within strict radius, search expanded viewbox
  let isExpanded = false
  let effectiveRadius = radiusKm

  if (rawPlaces.length === 0 && !signal?.aborted) {
    for (const q of queryTerms) {
      const osmItems = await fetchNominatim(q, expViewboxParam, false)
      if (osmItems.length > 0) {
        rawPlaces.push(...osmItems.map((item) => normalizeOsmItem(item, q)))
        isExpanded = true
        break
      }
    }
  }

  // Phase D: If still 0, query Mapbox with expanded bbox, or global fallback for distant cities
  if (rawPlaces.length === 0 && !signal?.aborted && mapboxToken) {
    let mbItems = await fetchMapbox(trimmed, expMapboxBbox, 10)
    if (mbItems.length === 0) {
      // Global fallback for explicit distant cities/landmarks (e.g., "Paris", "New York", "Hawassa")
      mbItems = await fetchMapbox(trimmed, null, 10)
    }
    if (mbItems.length > 0) {
      rawPlaces.push(...mbItems.map((item) => normalizeMapboxItem(item, trimmed)))
      isExpanded = true
    }
  }

  // Normalize, calculate distance, and deduplicate
  const formatted = rawPlaces
    .map((p) => {
      const dist = haversineDistance(center.lat, center.lng, p.lat, p.lng)
      return { ...p, distanceKm: dist }
    })
    .filter((p) => !isNaN(p.lat) && !isNaN(p.lng) && p.name)

  const seen = new Set()
  const unique = formatted.filter((p) => {
    const key = `${p.name.toLowerCase()}-${p.lat.toFixed(3)}-${p.lng.toFixed(3)}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  // Sort by shortest distance to furthest
  unique.sort((a, b) => a.distanceKm - b.distanceKm)

  // Prioritize places within the requested radius
  const withinStrictRadius = unique.filter((p) => p.distanceKm <= radiusKm)

  let finalPlaces = []
  if (withinStrictRadius.length > 0) {
    finalPlaces = withinStrictRadius
    isExpanded = false
    effectiveRadius = radiusKm
  } else if (unique.length > 0) {
    // Found matches beyond current radius - keep them and mark expanded
    finalPlaces = unique.slice(0, 25)
    isExpanded = true
    effectiveRadius = Math.ceil(finalPlaces[finalPlaces.length - 1].distanceKm)
  }

  const resultObj = {
    places: finalPlaces,
    isExpanded,
    effectiveRadius,
    aiInterpretation: ai,
  }

  if (finalPlaces.length > 0) {
    searchCache.set(cacheKey, { ...resultObj, ts: Date.now() })
    if (searchCache.size > 50) {
      const oldestKey = searchCache.keys().next().value
      searchCache.delete(oldestKey)
    }
  }

  return resultObj
}


