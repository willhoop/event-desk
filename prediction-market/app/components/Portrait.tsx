import { useEffect, useState } from "react";
import { portrait, initials } from "../../engine/portraits";

export function Portrait({ name, size = 64 }: { name: string; size?: number }) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => { let a = true; portrait(name).then((s) => { if (a) setSrc(s); }); return () => { a = false; }; }, [name]);
  return (
    <div className="rounded-full bg-chip shrink-0 overflow-hidden flex items-center justify-center serif"
      style={{ width: size, height: size, fontSize: size * 0.32 }}>
      {src ? <img src={src} alt={name} className="w-full h-full object-cover" /> : initials(name)}
    </div>
  );
}
