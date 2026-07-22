// SNAPSHOT — not live data.
//
// What each suitor can actually pay LeBron James. These are reported cap
// figures, not computed values, so they carry a source and a date and the desk
// labels them as a snapshot on screen. Everything else on the Sports desk is
// read live from Polymarket.
//
// Source: Bobby Marks & Brian Windhorst, ESPN, "LeBron James' free agency
// market: What six teams can offer him", published 2026-07-10.
// https://www.espn.com/nba/story/_/id/49301354/

export const CAP_AS_OF = "2026-07-10";
export const CAP_SOURCE = "ESPN — Bobby Marks & Brian Windhorst";
export const CAP_URL = "https://www.espn.com/nba/story/_/id/49301354/lebron-james-2026-free-agency-market-offers-contract-money-team";

export interface Suitor {
  team: string;        // must match the Polymarket outcome name
  /** Most they can realistically pay, in $m. */
  max: number;
  /** True when that number needs another move to happen first. */
  conditional?: boolean;
  note: string;
  pitch: string;
  against: string;
}

export const SUITORS: Suitor[] = [
  {
    team: "Miami Heat",
    max: 7,
    note: "$10.5m under the first-apron hard cap. At $7m they can still sign a 14th player.",
    pitch: "James, Antetokounmpo and Adebayo would be the most athletic frontcourt ever assembled. Spoelstra and Riley to maximise it.",
    against: "The cupboard is bare after the Giannis trade, and last season's installed offence largely removes the pick-and-roll he has lived in for twenty years.",
  },
  {
    team: "Cleveland Cavaliers",
    max: 6.1,
    conditional: true,
    note: "$3.9m minimum, or the $6.1m tax mid-level — which one depends on where James Harden's next contract lands.",
    pitch: "The final homecoming. Eleven seasons, 1,001 games, the Akron house down the road, and a roster built to reach a Finals now.",
    against: "Using more than $6.1m hard-caps them at the first apron; opening real room means trading Strus or Schröder first.",
  },
  {
    team: "Philadelphia 76ers",
    max: 3.9,
    note: "Veteran minimum only — the mid-level went to Dean Wade and Anfernee Simons.",
    pitch: "Maxey and Edgecombe lean into the transition game he was still dominant in last season. Embiid gives him the big-man scorer he won a title beside in 2020.",
    against: "No title in 43 years and no conference finals in 25. Legacy upside, but the least money on the board.",
  },
  {
    team: "Golden State Warriors",
    max: 3.9,
    conditional: true,
    note: "$3.9m unless they move Moses Moody's $12.5m, which would open roughly $6m.",
    pitch: "He and Curry were the best version of themselves together at the 2024 Olympics, where James took tournament MVP. Long history with Green.",
    against: "Butler is out for a large part of the season with an ACL tear. The roster is the weakest of the finalists.",
  },
  {
    team: "Denver Nuggets",
    max: 3.9,
    note: "Veteran minimum. Over the tax and both aprons, with a tax bill that could approach $175m.",
    pitch: "Jokic is the smartest player in the sport, and James has always said he wants to play with intelligence. Gordon takes the hardest wing defensive assignment off him.",
    against: "In visible regression — no conference finals in three years despite prime Jokic.",
  },
  {
    team: "Minnesota Timberwolves",
    max: 3.9,
    note: "Veteran minimum. Only $4.4m below the second-apron hard cap.",
    pitch: "Edwards and Gobert give elite perimeter play and rim protection, and McDaniels covers the opposing wing scorer.",
    against: "LaMelo Ball's style is a genuine test of his patience, and the money is the league minimum.",
  },
];

export const VET_MIN = 3.9;
