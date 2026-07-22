// Candidate colors — non-semantic, never ember (loss) or green (gain).
export const CAND_COLOR: Record<string, string> = {
  harris: "#b07fd6", newsom: "#52b7c4", buttigieg: "#7d9fd4", aoc: "#d0a54e",
  shapiro: "#c9cdd4", kelly: "#9aa79e", booker: "#c98f6a", beshear: "#8fb36a",
  pritzker: "#b98fd6", ossoff: "#eef1f4",
};
export function colorFor(key: string, i = 0): string {
  return CAND_COLOR[key] || ["#b07fd6", "#52b7c4", "#7d9fd4", "#d0a54e"][i % 4];
}
export const SHORT: Record<string, string> = {
  harris: "Harris", newsom: "Newsom", buttigieg: "Buttigieg", aoc: "AOC",
  shapiro: "Shapiro", kelly: "Kelly", booker: "Booker", beshear: "Beshear",
  pritzker: "Pritzker", ossoff: "Ossoff",
};
