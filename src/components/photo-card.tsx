import Image from "next/image";
import { attractions } from "@/lib/content";

export function AttractionCard({
  attraction,
}: {
  attraction: (typeof attractions)[number];
}) {
  return (
    <article className="attraction-card" data-reveal>
      <div className="attraction-card-image">
        <Image
          src={attraction.image}
          alt={attraction.title + " בנינג׳ה סטאר"}
          fill
          sizes="(max-width: 650px) 90vw, (max-width: 1000px) 45vw, 30vw"
        />
        <div className="photo-shade" />
      </div>
      <div className="attraction-card-content">
        <h3>{attraction.title}</h3>
      </div>
    </article>
  );
}
