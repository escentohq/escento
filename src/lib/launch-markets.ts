export type LaunchMarket = {
  placeId: string;
  displayName: string;
  lat: number;
  lng: number;
  city: string;
  state: string;
  country: string;
  aliases?: string[];
};

export const LAUNCH_MARKETS: LaunchMarket[] = [
  { placeId: "launch:austin-tx", displayName: "Austin, TX", lat: 30.2672, lng: -97.7431, city: "Austin", state: "TX", country: "US" },
  { placeId: "launch:round-rock-tx", displayName: "Round Rock, TX", lat: 30.5083, lng: -97.6789, city: "Round Rock", state: "TX", country: "US" },
  { placeId: "launch:frisco-tx", displayName: "Frisco, TX", lat: 33.1507, lng: -96.8236, city: "Frisco", state: "TX", country: "US" },
  { placeId: "launch:dallas-tx", displayName: "Dallas, TX", lat: 32.7767, lng: -96.7970, city: "Dallas", state: "TX", country: "US" },
  { placeId: "launch:fort-worth-tx", displayName: "Fort Worth, TX", lat: 32.7555, lng: -97.3308, city: "Fort Worth", state: "TX", country: "US" },
  { placeId: "launch:houston-tx", displayName: "Houston, TX", lat: 29.7604, lng: -95.3698, city: "Houston", state: "TX", country: "US" },
  { placeId: "launch:san-antonio-tx", displayName: "San Antonio, TX", lat: 29.4252, lng: -98.4946, city: "San Antonio", state: "TX", country: "US" },
  { placeId: "launch:los-angeles-ca", displayName: "Los Angeles, CA", lat: 34.0549, lng: -118.2426, city: "Los Angeles", state: "CA", country: "US", aliases: ["LA"] },
  { placeId: "launch:new-york-ny", displayName: "New York, NY", lat: 40.7128, lng: -74.0060, city: "New York", state: "NY", country: "US", aliases: ["NYC"] },
  { placeId: "launch:nashville-tn", displayName: "Nashville, TN", lat: 36.1627, lng: -86.7816, city: "Nashville", state: "TN", country: "US" },
  { placeId: "launch:atlanta-ga", displayName: "Atlanta, GA", lat: 33.7490, lng: -84.3880, city: "Atlanta", state: "GA", country: "US" },
  { placeId: "launch:chicago-il", displayName: "Chicago, IL", lat: 41.8781, lng: -87.6298, city: "Chicago", state: "IL", country: "US" },
];

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function getLaunchMarketByPlaceId(placeId: string) {
  return LAUNCH_MARKETS.find((market) => market.placeId === placeId) ?? null;
}

export function getLaunchMarketSuggestions(query: string, limit = 5) {
  const normalized = normalize(query);
  if (normalized.length < 2) return [];

  return LAUNCH_MARKETS
    .filter((market) => {
      const haystack = [
        market.displayName,
        market.city,
        market.state,
        `${market.city} ${market.state}`,
        ...(market.aliases ?? []),
      ].map(normalize);

      return haystack.some((value) => value.startsWith(normalized) || value.includes(normalized));
    })
    .slice(0, limit);
}
