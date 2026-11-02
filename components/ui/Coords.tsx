import { PROFILE } from "@/lib/content";

/** Coordenadas con cada valor entero: en pantallas estrechas se parten por el "—", nunca dejan una letra sola. */
export default function Coords() {
  return (
    <>
      {PROFILE.coords.split(" — ").map((c, i) => (
        <span key={c}>
          {i > 0 && " — "}
          <span className="whitespace-nowrap">{c}</span>
        </span>
      ))}
    </>
  );
}
