"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { branches, paths, contact } from "@/lib/content";
import { Icon } from "./icon";
import { BrandMark } from "./brand-mark";
import { useDisclosureMotion } from "./use-disclosure-motion";

export function Header() {
  const [open, setOpen] = useState(false);
  const [branchesOpen, setBranchesOpen] = useState(false);
  const branchesRef = useRef<HTMLDivElement>(null);
  const branchesButtonRef = useRef<HTMLButtonElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const mobileButtonRef = useRef<HTMLButtonElement>(null);
  const branchesPanelRef = useDisclosureMotion<HTMLDivElement>(branchesOpen);
  const mobilePanelRef = useDisclosureMotion<HTMLElement>(open);
  const pathname = usePathname();
  useEffect(() => {
    if (!branchesOpen) return;
    const dismissOutside = (event: Event) => {
      if (
        event.target instanceof Node &&
        !branchesRef.current?.contains(event.target)
      ) {
        setBranchesOpen(false);
      }
    };
    document.addEventListener("pointerdown", dismissOutside);
    document.addEventListener("focusin", dismissOutside);
    return () => {
      document.removeEventListener("pointerdown", dismissOutside);
      document.removeEventListener("focusin", dismissOutside);
    };
  }, [branchesOpen]);
  useEffect(() => {
    if (!open) return;
    const dismissOutside = (event: Event) => {
      if (event.target instanceof Node && !headerRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };
    const desktop = matchMedia("(min-width: 1051px)");
    const onResize = () => {
      if (desktop.matches) setOpen(false);
    };
    document.addEventListener("pointerdown", dismissOutside);
    document.addEventListener("focusin", dismissOutside);
    desktop.addEventListener("change", onResize);
    return () => {
      document.removeEventListener("pointerdown", dismissOutside);
      document.removeEventListener("focusin", dismissOutside);
      desktop.removeEventListener("change", onResize);
    };
  }, [open]);
  const close = () => {
    setOpen(false);
    setBranchesOpen(false);
  };
  return (
    <>
      <a className="skip-link" href="#main">
        דילוג לתוכן
      </a>
      <header
        ref={headerRef}
        className="site-header"
        onKeyDown={(event) => {
          if (event.key === "Escape" && open) {
            setOpen(false);
            mobileButtonRef.current?.focus();
          }
        }}
      >
        <div className="header-inner container">
          <Link
            href="/"
            className="brand"
            aria-label="נינג׳ה סטאר — עמוד הבית"
            onClick={close}
          >
            <BrandMark eager />
          </Link>
          <nav className="desktop-nav" aria-label="ניווט ראשי">
            <Link
              href="/"
              className={pathname === "/" ? "active" : undefined}
              aria-current={pathname === "/" ? "page" : undefined}
              onClick={close}
            >
              עמוד הבית
            </Link>
            <div
              ref={branchesRef}
              className="nav-dropdown"
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setBranchesOpen(false);
                  branchesButtonRef.current?.focus();
                }
              }}
            >
              <button
                ref={branchesButtonRef}
                aria-expanded={branchesOpen}
                aria-controls="branch-navigation"
                onClick={() => setBranchesOpen((value) => !value)}
              >
                הסניפים שלנו <Icon name="down" size={15} />
              </button>
              <div
                ref={branchesPanelRef}
                id="branch-navigation"
                className="dropdown-panel"
                hidden
                inert={!branchesOpen}
                aria-hidden={!branchesOpen}
              >
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
              className="button button-blue header-cta"
              href={`${paths.birthdays}#enquiry`}
            >
              <Icon name="cake" size={17} />
              חוגגים אצלנו
            </Link>
            <button
              ref={mobileButtonRef}
              className="mobile-toggle"
              aria-label={open ? "סגירת תפריט" : "פתיחת תפריט"}
              aria-expanded={open}
              aria-controls="mobile-navigation"
              onClick={() => setOpen((value) => !value)}
            >
              <span className="menu-glyph" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
            </button>
          </div>
        </div>
        <nav
          ref={mobilePanelRef}
          id="mobile-navigation"
          className="mobile-nav"
          hidden
          inert={!open}
          aria-hidden={!open}
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
      </header>
    </>
  );
}
