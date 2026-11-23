import Image from "next/image";
import Link from "next/link";
import { attractions } from "@/lib/content";
import { Icon } from "./icon";

export function AttractionCard({
  attraction,
}: {
  attraction: (typeof attractions)[number];
}) {
  return (
    <Link className="attraction-card" href={`/${attraction.slug}/`}>
      <Image
        src={attraction.image}
        alt={attraction.title + " בנינג׳ה סטאר"}
        fill
        sizes="(max-width: 650px) 90vw, (max-width: 1000px) 45vw, 30vw"
      />
      <div className="photo-shade" />
      <span className="attraction-tag">{attraction.tag}</span>
      <div className="attraction-card-content">
        <div>
          <p>{attraction.label}</p>
          <h3>{attraction.title}</h3>
        </div>
        <span className="card-discover">
          <Icon name="plus" size={23} />
        </span>
      </div>
    </Link>
  );
}
