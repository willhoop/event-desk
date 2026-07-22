import { useRef, useState } from "react";
import { useBets, toCSV, Bet } from "../useBets";
import { money, cents } from "../../engine/format";
import { Empty, Note, Badge } from "./ui";

interface Opt { slug: string; label: string; }

export function BetTracker({ options, priceFor }: { options: Opt[]; priceFor: (slug: string, venue: Bet["venue"]) => number | null }) {
  const { bets, add, remove, clear } = useBets();
  const [slug, setSlug] = useState(options[0]?.slug || "");
  const [side, setSide] = useState<Bet["side"]>("Yes");
  const [venue, setVenue] = useState<Bet["venue"]>("Polymarket");
  const [entry, setEntry] = useState("");
  const [size, setSize] = useState("100");
  const [shot, setShot] = useState<string | undefined>();
  const fileRef = useRef<HTMLInputElement>(null);

  const label = options.find((o) => o.slug === slug)?.label || slug;
  const live = priceFor(slug, venue);

  const save = () => {
    const e = parseFloat(entry), z = parseFloat(size);
    if (!z || z <= 0) return;
    if (!e || e <= 0 || e >= 100) return;
    add({ market: label, slug, side, venue, entry: e, size: z, shot });
    setEntry(""); setSize("100"); setShot(undefined); if (fileRef.current) fileRef.current.value = "";
  };
  const fillPrice = () => { if (live != null) setEntry((live * 100).toFixed(1)); };
  const onFile = (f: File | undefined) => {
    if (!f) return;
    const r = new FileReader();
    r.onload = () => setShot(r.result as string);
    r.readAsDataURL(f);
  };
  const download = () => {
    const blob = new Blob([toCSV(bets)], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "my-bets.csv"; a.click();
  };

  // book value
  let cost = 0, val = 0;
  const rows = bets.map((b) => {
    const yes = priceFor(b.slug, b.venue);
    const sell = yes == null ? null : b.side === "Yes" ? yes : 1 - yes;
    const nowVal = sell != null ? (b.size / (b.entry / 100)) * sell : null;
    const pl = nowVal != null ? nowVal - b.size : null;
    if (nowVal != null) { cost += b.size; val += nowVal; }
    return { b, nowVal, pl };
  });
  const bookPL = cost ? val - cost : 0;

  return (
    <div>
      <div className="bg-paper2 border border-rule rounded-md p-4">
        <div className="flex flex-wrap items-center gap-2 text-[14px]">
          <span>I put</span> $<input value={size} onChange={(e) => setSize(e.target.value)} type="number" className="w-20 text-right bg-paper2 border border-rule rounded px-2 py-1.5" />
          <span>on</span>
          <select value={slug} onChange={(e) => setSlug(e.target.value)} className="bg-paper2 border border-rule rounded px-2 py-1.5 max-w-[200px]">
            {options.map((o) => <option key={o.slug} value={o.slug}>{o.label}</option>)}
          </select>
          <select value={side} onChange={(e) => setSide(e.target.value as Bet["side"])} className="bg-paper2 border border-rule rounded px-2 py-1.5">
            <option value="Yes">happening</option><option value="No">NOT happening</option>
          </select>
          <span>on</span>
          <select value={venue} onChange={(e) => setVenue(e.target.value as Bet["venue"])} className="bg-paper2 border border-rule rounded px-2 py-1.5">
            <option>Polymarket</option><option>Kalshi</option>
          </select>
          <span>at</span> <input value={entry} onChange={(e) => setEntry(e.target.value)} type="number" step="0.5" placeholder={live != null ? (live * 100).toFixed(1) : "14"} className="w-16 text-right bg-paper2 border border-rule rounded px-2 py-1.5" /><span>¢</span>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          <button onClick={save} className="mono text-[11px] border border-ember text-ember rounded px-3.5 py-2 uppercase tracking-[0.06em]">Save bet</button>
          <button onClick={fillPrice} className="mono text-[11px] border border-rule text-ink2 rounded px-3.5 py-2 uppercase tracking-[0.06em]">Use today's price</button>
          <button onClick={() => fileRef.current?.click()} className="mono text-[11px] border border-rule text-ink2 rounded px-3.5 py-2 uppercase tracking-[0.06em]">{shot ? "Screenshot attached" : "Attach screenshot"}</button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
          {bets.length > 0 && <button onClick={download} className="mono text-[11px] border border-rule text-ink2 rounded px-3.5 py-2 uppercase tracking-[0.06em]">Download CSV</button>}
        </div>
        <Note>Nothing is bought here — this is a tracker. Log what you did on the real venue and watch it live. Attach a screenshot of your fill for your records; everything is stored only in your browser.</Note>
      </div>

      {rows.length === 0 ? <div className="mt-3"><Empty>No bets yet. Fill in the sentence above and hit Save.</Empty></div> : (
        <div className="mt-3 space-y-2">
          {rows.map(({ b, nowVal, pl }) => {
            const up = pl != null && pl >= 0;
            const sellFlag = nowVal != null && nowVal / b.size >= 1.1;
            return (
              <div key={b.id} className="bg-paper2 border border-rule rounded-md p-3 flex items-center gap-3 flex-wrap">
                {b.shot && <img src={b.shot} alt="fill screenshot" className="w-12 h-12 object-cover rounded border border-rule" />}
                <div className="flex-1 min-w-[160px]">
                  <div className="serif font-bold text-[15px]">{b.market}</div>
                  <div className="mono text-[11px] text-faint">{b.side === "Yes" ? "betting it happens" : "betting it does NOT happen"} · {b.venue} · {new Date(b.at).toLocaleDateString()}</div>
                </div>
                <div className="mono text-[13px] text-ink2">paid {cents(b.entry / 100, 1)} · {money(b.size)}</div>
                <div className="mono text-[13px] text-ink">{nowVal != null ? money(nowVal) : "—"}</div>
                <div className={"mono text-[13px] " + (pl == null ? "text-faint" : up ? "text-green" : "text-ember")}>
                  {pl != null ? (up ? "+" : "") + money(pl) : "—"}{sellFlag && <> <Badge kind="gain">SELL?</Badge></>}
                </div>
                <button onClick={() => remove(b.id)} className="mono text-[11px] text-faint hover:text-ember px-2">Remove</button>
              </div>
            );
          })}
          <div className="flex justify-between items-center px-1 pt-1">
            <span className="mono text-[11px] text-faint">A green SELL? tag means up 10%+ — worth thinking about cashing out.</span>
            {cost > 0 && <span className={"mono text-[13px] " + (bookPL >= 0 ? "text-green" : "text-ember")}>Overall {bookPL >= 0 ? "+" : ""}{money(bookPL)}</span>}
          </div>
          <button onClick={clear} className="mono text-[10px] text-faint underline">clear all</button>
        </div>
      )}
    </div>
  );
}
