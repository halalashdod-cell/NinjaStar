"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { branches, paths, contact } from "@/lib/content";
import { Icon } from "./icon";

export function Header() {
  const [open, setOpen] = useState(false);
  const [branchesOpen, setBranchesOpen] = useState(false);
  const pathname = usePathname();
  const close = () => {
    setOpen(false);
    setBranchesOpen(false);
  };
  return (
    <>
      <a className="skip-link" href="#main">
        דילוג לתוכן
      </a>
      <div className="demo-strip">
        מכירים את נינג׳ה סטאר מחדש <span>·</span> גרסת הדגמה
      </div>
      <header className="site-header">
        <div className="header-inner container">
          <Link
            href="/"
            className="brand"
            aria-label="נינג׳ה סטאר — עמוד הבית"
            onClick={close}
          >
            <Image
              src="/images/logo.png"
              alt="Ninja Star"
              width={88}
              height={72}
              priority
            />
          </Link>
          <nav className="desktop-nav" aria-label="ניווט ראשי">
            <div
              className="nav-dropdown"
              onKeyDown={(e) => {
                if (e.key === "Escape") setBranchesOpen(false);
              }}
            >
              <button
                aria-expanded={branchesOpen}
                aria-controls="branch-navigation"
                onClick={() => setBranchesOpen(!branchesOpen)}
              >
                הסניפים שלנו <Icon name="down" size={15} />
              </button>
              {branchesOpen && (
                <div id="branch-navigation" className="dropdown-panel">
                  {branches.map((b) => (
                    <Link key={b.id} href={`/${b.slug}/`} onClick={close}>
                      <Icon name="pin" size={17} />
                      <span>
                        {b.name}
                        <small>{b.label}</small>
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <Link
              className={
                decodeURI(pathname) === paths.attractions ? "active" : ""
              }
              href={paths.attractions}
            >
              המתקנים שלנו
            </Link>
            <Link
              className={
                decodeURI(pathname) === paths.birthdays ? "active" : ""
              }
              href={paths.birthdays}
            >
              ימי הולדת ואירועים
            </Link>
            <Link
              className={decodeURI(pathname) === paths.pricing ? "active" : ""}
              href={paths.pricing}
            >
              מחירון
            </Link>
            <Link href="/#contact">צרו קשר</Link>
          </nav>
          <div className="header-actions">
            <a
              href={contact.phoneHref}
              className="header-phone"
              aria-label={`חייגו ${contact.phone}`}
            >
              <Icon name="phone" size={19} />
              <span dir="ltr">{contact.phone}</span>
            </a>
            <Link
              className="button button-red header-cta"
              href={`${paths.birthdays}#enquiry`}
            >
              <Icon name="cake" size={17} />
              חוגגים אצלנו
            </Link>
            <button
              className="mobile-toggle"
              aria-label={open ? "סגירת תפריט" : "פתיחת תפריט"}
              aria-expanded={open}
              aria-controls="mobile-navigation"
              onClick={() => setOpen(!open)}
            >
              <Icon name={open ? "close" : "menu"} size={27} />
            </button>
          </div>
        </div>
        {open && (
          <nav
            id="mobile-navigation"
            className="mobile-nav"
            aria-label="ניווט לנייד"
          >
            <Link href="/" onClick={close}>
              עמוד הבית
            </Link>
            <p>הסניפים שלנו</p>
            {branches.map((b) => (
              <Link key={b.id} href={`/${b.slug}/`} onClick={close}>
                {b.name}
              </Link>
            ))}
            <Link href={paths.attractions} onClick={close}>
              המתקנים שלנו
            </Link>
            <Link href={paths.birthdays} onClick={close}>
              ימי הולדת ואירועים
            </Link>
            <Link href={paths.pricing} onClick={close}>
              מחירון
            </Link>
            <Link href="/#contact" onClick={close}>
              צרו קשר
            </Link>
          </nav>
        )}
      </header>
    </>
  );
}
