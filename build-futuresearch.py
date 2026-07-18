"""build-futuresearch.py — asks FutureSearch for a calibrated per-candidate
probability of the 2028 Democratic nomination and writes futuresearch.json,
which the site reads same-origin (like kalshi.json / polls.json).

Runs server-side in a GitHub Action so the API key never touches the browser
bundle. The key is read from the FUTURESEARCH_API_KEY environment variable,
supplied by the repo Actions secret of the same name.

Safety: on any error (missing key, API failure, unexpected shape) it exits 0
WITHOUT writing, so a bad run never overwrites good data or breaks the site.
"""
import os, sys, json, asyncio, datetime

# full name -> our candidate key (matches src/data/polls.ts)
CANDS = {
    "Kamala Harris": "harris", "Gavin Newsom": "newsom", "Pete Buttigieg": "buttigieg",
    "Alexandria Ocasio-Cortez": "aoc", "Josh Shapiro": "shapiro", "Mark Kelly": "kelly",
    "Cory Booker": "booker", "Andy Beshear": "beshear", "JB Pritzker": "pritzker",
    "Jon Ossoff": "ossoff",
}

async def run():
    from pandas import DataFrame
    from futuresearch.ops import forecast

    questions = DataFrame([{
        "question": "Who will win the 2028 Democratic Party presidential nomination?",
        "resolution_criteria": "The person selected as the Democratic Party's nominee for U.S. President at the 2028 Democratic National Convention.",
        "background": "Open primary field. Compare against Polymarket/Kalshi nomination markets and national primary polling.",
        "candidates": list(CANDS.keys()) + ["Other"],
    }])
    result = await forecast(
        input=questions,
        forecast_type="categorical",     # one probability per candidate, summing to 100
        categories_field="candidates",
        effort_level="HIGH",             # categorical requires HIGH
    )
    row = result.data.iloc[0]
    probs = row["probabilities"]
    if isinstance(probs, str):
        probs = json.loads(probs)
    out_probs = {}
    for name, p in probs.items():
        out_probs[CANDS.get(name, "other")] = round(float(p), 1)
    return {
        "updated": datetime.date.today().isoformat(),
        "source": "futuresearch",
        "probs": out_probs,
        "rationale": str(row.get("rationale", ""))[:1200],
    }

def main():
    if not os.environ.get("FUTURESEARCH_API_KEY"):
        print("FUTURESEARCH_API_KEY not set — leaving futuresearch.json unchanged.")
        return 0
    try:
        payload = asyncio.run(run())
    except Exception as e:
        print(f"FutureSearch call failed ({e}) — keeping existing futuresearch.json.")
        return 0
    if not payload["probs"] or len(payload["probs"]) < 3:
        print("Too few candidate probabilities returned — refusing to overwrite.")
        return 0
    with open("futuresearch.json", "w") as f:
        json.dump(payload, f)
    print("Wrote futuresearch.json:", payload["probs"])
    return 0

if __name__ == "__main__":
    sys.exit(main())
