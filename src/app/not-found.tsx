import Link from "next/link";
import { NinjaStar } from "@/components/icon";
export default function NotFound() {
  return (
    <section className="not-found container">
      <NinjaStar />
      <p className="eyebrow">404</p>
      <h1>העמוד הזה קפץ למקום אחר.</h1>
      <p>בואו נחזור למסלול ונמצא את החוויה הבאה שלכם.</p>
      <Link className="button button-blue" href="/">
        חזרה לעמוד הבית
      </Link>
    </section>
  );
}
