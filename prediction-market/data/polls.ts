export interface Poll {
  p: string; d: string; n: number; pop: "LV" | "RV" | "A";
  q: number; s: Record<string, number | null>;
}
export const NAMES: Record<string, string> = {
  harris: "Kamala Harris", newsom: "Gavin Newsom", buttigieg: "Pete Buttigieg",
  aoc: "Alexandria Ocasio-Cortez", shapiro: "Josh Shapiro", kelly: "Mark Kelly",
  booker: "Cory Booker", beshear: "Andy Beshear", pritzker: "JB Pritzker", ossoff: "Jon Ossoff",
};
export const PARTISAN: Record<string, number> = {
  "McLaughlin": 1, "Lake Research": 1, "Big Data Poll": 0.5, "Rasmussen": 0.5,
};
export const POLLS: Poll[] = [
  { p: "Zogby", d: "2026-07-04", n: 391, pop: "LV", q: 0.5, s: { harris: 38, newsom: 19, aoc: 12, buttigieg: 9, shapiro: 7, kelly: 6, pritzker: 5 } },
  { p: "Quantus Insights", d: "2026-07-07", n: 1140, pop: "LV", q: 1.5, s: { harris: 35.3, newsom: 17.7, buttigieg: 12.9, aoc: 11.1, shapiro: 7.1 } },
  { p: "Daily Mail/JL Partners", d: "2026-06-26", n: 1040, pop: "RV", q: 2.0, s: { harris: 29, newsom: 15, buttigieg: 11, aoc: 6, kelly: 5, booker: 4, shapiro: 3, pritzker: 3, beshear: 3, ossoff: 2 } },
  { p: "McLaughlin", d: "2026-06-23", n: 464, pop: "LV", q: 0.5, s: { harris: 26, newsom: 16, aoc: 9, buttigieg: 8, booker: 5, pritzker: 5, shapiro: 5, kelly: 3 } },
  { p: "Echelon Insights", d: "2026-06-14", n: 515, pop: "LV", q: 2.8, s: { harris: 20, newsom: 14, buttigieg: 14, aoc: 12, shapiro: 6, kelly: 4, booker: 3, pritzker: 3, beshear: 2, ossoff: 2 } },
  { p: "Public Sentiment Inst.", d: "2026-06-15", n: 366, pop: "RV", q: 1.0, s: { harris: 29.2, newsom: 15.2, buttigieg: 11.3, aoc: 7.2, kelly: 6.1, beshear: 3.2, ossoff: 3.5 } },
  { p: "Noble Predictive", d: "2026-06-04", n: 1013, pop: "RV", q: 2.0, s: { harris: 27, newsom: 14, buttigieg: 11, aoc: 8, pritzker: 2, beshear: 2 } },
  { p: "Focaldata", d: "2026-06-01", n: 685, pop: "RV", q: 2.0, s: { harris: 37, newsom: 17, buttigieg: 8, aoc: 7, kelly: 5, shapiro: 3, beshear: 3, pritzker: 2, ossoff: 1 } },
  { p: "Harvard Harris", d: "2026-05-31", n: 1725, pop: "RV", q: 1.5, s: { harris: 44, newsom: 26, aoc: 8, pritzker: 7, shapiro: 10 } },
  { p: "I&I/TIPP", d: "2026-05-28", n: 593, pop: "RV", q: 1.8, s: { harris: 31, newsom: 14, buttigieg: 6, aoc: 5, shapiro: 6, booker: 4, kelly: 4, pritzker: 3, beshear: 2, ossoff: 2 } },
  { p: "Big Data Poll", d: "2026-05-27", n: 1378, pop: "LV", q: 1.5, s: { harris: 28, newsom: 17, buttigieg: 11, aoc: 9, shapiro: 6, kelly: 6, beshear: 3 } },
  { p: "Emerson College", d: "2026-05-25", n: 432, pop: "LV", q: 2.9, s: { buttigieg: 17.9, newsom: 15.9, aoc: 11.1, shapiro: 10.0, harris: 9.9, beshear: 8.5, pritzker: 4.4, ossoff: 1 } },
  { p: "Rasmussen", d: "2026-05-20", n: 433, pop: "LV", q: 1.5, s: { harris: 34, newsom: 12, aoc: 11, buttigieg: 10, shapiro: 9, kelly: 9, beshear: 4, pritzker: 2 } },
  { p: "Overton Insights", d: "2026-05-20", n: 661, pop: "LV", q: 1.5, s: { buttigieg: 16, newsom: 13, aoc: 12, harris: 9, shapiro: 8, booker: 7, kelly: 4, beshear: 3, pritzker: 1 } },
  { p: "Echelon Insights", d: "2026-05-18", n: 501, pop: "LV", q: 2.8, s: { harris: 23, newsom: 17, aoc: 11, buttigieg: 10, kelly: 6, shapiro: 5, pritzker: 4, booker: 3, beshear: 2, ossoff: 2 } },
  { p: "McLaughlin", d: "2026-05-18", n: 459, pop: "LV", q: 0.5, s: { harris: 28, newsom: 16, buttigieg: 9, aoc: 7, shapiro: 6, booker: 5, pritzker: 2 } },
  { p: "Lake Research", d: "2026-05-11", n: 800, pop: "LV", q: 1.5, s: { harris: 26, newsom: 17, buttigieg: 16, aoc: 10, kelly: 8, shapiro: 7, booker: 5, pritzker: 4, beshear: 2 } },
  { p: "AtlasIntel", d: "2026-05-07", n: 2069, pop: "A", q: 2.7, s: { aoc: 26, buttigieg: 22.4, newsom: 21.2, harris: 12.9, beshear: 4.1, booker: 3.9, shapiro: 2.4 } },
  { p: "Focaldata", d: "2026-05-05", n: 1339, pop: "LV", q: 2.0, s: { harris: 38, newsom: 16, aoc: 9, buttigieg: 9, shapiro: 5, kelly: 5, pritzker: 3, beshear: 2 } },
  { p: "Harvard Harris", d: "2026-04-26", n: 2745, pop: "RV", q: 1.5, s: { harris: 50, newsom: 22, aoc: 8, shapiro: 9, pritzker: 6 } },
  { p: "Verasight", d: "2026-04-23", n: 864, pop: "A", q: 2.0, s: { harris: 22, newsom: 15, aoc: 13, buttigieg: 12, kelly: 6, booker: 4, shapiro: 4, pritzker: 2 } },
  { p: "Echelon Insights", d: "2026-04-20", n: 525, pop: "RV", q: 2.8, s: { harris: 22, newsom: 21, buttigieg: 12, aoc: 10, shapiro: 5, booker: 4, kelly: 3, pritzker: 3, beshear: 2, ossoff: 2 } },
  { p: "McLaughlin", d: "2026-04-15", n: 457, pop: "RV", q: 0.5, s: { harris: 29, newsom: 15, buttigieg: 10, shapiro: 4, aoc: 4, booker: 4, pritzker: 3 } },
  { p: "YouGov", d: "2026-04-13", n: 968, pop: "RV", q: 2.9, s: { harris: 24, newsom: 12, buttigieg: 9, aoc: 9, shapiro: 5, pritzker: 3, booker: 2 } },
  { p: "Harvard Harris", d: "2026-03-26", n: 2009, pop: "RV", q: 1.5, s: { harris: 41, newsom: 26, aoc: 8, pritzker: 7, shapiro: 10 } },
  { p: "Echelon Insights", d: "2026-03-16", n: 1033, pop: "LV", q: 2.8, s: { harris: 21, newsom: 19, aoc: 11, buttigieg: 9, shapiro: 5, booker: 4, beshear: 4, kelly: 4, pritzker: 2 } },
  { p: "Focaldata", d: "2026-03-10", n: 1782, pop: "RV", q: 2.0, s: { harris: 39, newsom: 22, aoc: 11, buttigieg: 8, shapiro: 6, pritzker: 4, kelly: 4, beshear: 2 } },
  { p: "Yale Youth Poll", d: "2026-03-09", n: 1557, pop: "RV", q: 1.5, s: { harris: 19.7, newsom: 19.2, buttigieg: 13.9, aoc: 12.7, kelly: 6.7, shapiro: 3.5, pritzker: 3.5, beshear: 2.4, booker: 2.2 } },
  { p: "Noble Predictive", d: "2026-03-05", n: 1152, pop: "RV", q: 2.0, s: { harris: 31, newsom: 16, buttigieg: 7, aoc: 6, shapiro: 5, booker: 3, pritzker: 2 } },
  { p: "JL Partners", d: "2026-02-27", n: 1095, pop: "RV", q: 2.0, s: { harris: 23, newsom: 19, buttigieg: 10, aoc: 9, booker: 5, shapiro: 5, pritzker: 4 } },
  { p: "Harvard Harris", d: "2026-02-26", n: 1999, pop: "RV", q: 1.5, s: { harris: 39, newsom: 24, aoc: 14, pritzker: 6, shapiro: 10 } },
  { p: "Emerson College", d: "2026-02-22", n: 438, pop: "LV", q: 2.9, s: { newsom: 20, buttigieg: 16, harris: 13, aoc: 9, shapiro: 7, beshear: 5, pritzker: 3 } },
  { p: "Echelon Insights", d: "2026-02-23", n: 1002, pop: "LV", q: 2.8, s: { newsom: 24, harris: 18, aoc: 9, buttigieg: 8, shapiro: 4, pritzker: 4, booker: 3, kelly: 4, beshear: 2 } },
  { p: "YouGov/BGSU", d: "2026-02-18", n: 556, pop: "RV", q: 2.9, s: { newsom: 21, harris: 18, aoc: 11, buttigieg: 11, kelly: 7, pritzker: 6, shapiro: 3, beshear: 3, booker: 2 } },
  { p: "YouGov/Yahoo", d: "2026-02-12", n: 1704, pop: "RV", q: 2.9, s: { newsom: 19, harris: 18, buttigieg: 13, aoc: 12, kelly: 9, pritzker: 6, booker: 3 } },
  { p: "Harvard Harris", d: "2026-01-29", n: 2000, pop: "RV", q: 1.5, s: { harris: 39, newsom: 30, aoc: 12, pritzker: 7, shapiro: 9 } },
  { p: "Rasmussen", d: "2026-01-27", n: 1115, pop: "LV", q: 1.5, s: { harris: 34, newsom: 20, buttigieg: 10, aoc: 7, shapiro: 10, booker: 6 } },
  { p: "Echelon Insights", d: "2026-01-26", n: 1029, pop: "LV", q: 2.8, s: { newsom: 27, harris: 21, aoc: 9, buttigieg: 8, booker: 3, shapiro: 3, pritzker: 3, kelly: 4, beshear: 2 } },
  { p: "Big Data Poll", d: "2026-01-24", n: 1346, pop: "LV", q: 1.5, s: { harris: 31.4, newsom: 22.2, buttigieg: 11.7, aoc: 6.4, shapiro: 6.1, beshear: 2.5 } },
  { p: "YouGov", d: "2026-01-14", n: 2250, pop: "LV", q: 2.9, s: { harris: 20, newsom: 17, aoc: 9, buttigieg: 8, kelly: 7, booker: 3, pritzker: 3, beshear: 2, shapiro: 2 } },
  { p: "Zogby Analytics", d: "2026-01-07", n: 374, pop: "LV", q: 0.5, s: { harris: 30, newsom: 21, aoc: 11, buttigieg: 8, kelly: 7, shapiro: 6, pritzker: 5 } },
];
export const SNAP_MKT: Record<string, number> = {
  harris: 8, newsom: 18, buttigieg: 5.1, aoc: 15, ossoff: 14.5,
  beshear: 2.3, shapiro: 3, kelly: 1.5, pritzker: 1.2, booker: 0.6,
};
