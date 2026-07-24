"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useExperienceStore } from "@/store/useExperienceStore";
import { projects } from "@/lib/projects";

export default function Interface() {
  const soundOn = useExperienceStore((s) => s.soundOn);
  const toggleSound = useExperienceStore((s) => s.toggleSound);
  const status = useExperienceStore((s) => s.status);
  const setStatus = useExperienceStore((s) => s.setStatus);
  const activeIndex = useExperienceStore((s) => s.activeIndex);
  const setActiveIndex = useExperienceStore((s) => s.setActiveIndex);

  const focused = status === "focused";
  const contentRef = useRef<HTMLDivElement>(null);
  const active = projects[activeIndex] ?? projects[0];

  useEffect(() => {
    if (!contentRef.current) return;
    gsap.fromTo(
      contentRef.current,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
    );
  }, [activeIndex]);

  return (
    <>
    <div className="interface-layer">
      <header className="interface-header">
        <span className="wordmark">HORIZON&nbsp;DRIFT</span>
        <nav aria-label="Primary">
          <a href="#work">Work</a>
          <Link href="/studio">Studio</Link>
          <Link href="/contact">Contact</Link>
        </nav>
      </header>

      <main className="interface-hero" id="work">
        <h1>
          A single idea,
          <br />
          held together in motion.
        </h1>
        <p>
          A one-scene prototype built from the 3D Website Blueprint: one
          camera rig, one lit hero object, one particle field, one interface
          layer -- proven before anything bigger gets built on top of it.
        </p>
        <button
          type="button"
          className="cta"
          onClick={() => setStatus(focused ? "idle" : "focused")}
        >
          {focused ? "Back to overview" : "Enter the work"}
          <span aria-hidden="true"> {focused ? "<-" : "->"}</span>
        </button>
      </main>

      <aside
        className={"project-panel" + (focused ? " project-panel--visible" : "")}
        aria-hidden={!focused}
      >
        <div ref={contentRef}>
          <span className="project-panel-eyebrow">{active.eyebrow}</span>
          <h2>{active.title}</h2>
          <p>{active.summary}</p>
          <a className="project-panel-link" href={"/work/" + active.slug}>
            View full page{" ->"}
          </a>
        </div>

        <div className="project-panel-nav" aria-label="Project index">
          {projects.map((project, index) => (
            <button
              key={project.slug}
              type="button"
              className={
                "project-panel-dot" + (index === activeIndex ? " project-panel-dot--active" : "")
              }
              onClick={() => setActiveIndex(index)}
              aria-label={"Show " + project.title}
              aria-pressed={index === activeIndex}
            >
              {String(index + 1).padStart(2, "0")}
            </button>
          ))}
        </div>
      </aside>

      <footer className="interface-footer">
        <button
          type="button"
          onClick={toggleSound}
          aria-pressed={soundOn}
          className="sound-toggle"
        >
          {soundOn ? "Sound on" : "Sound off"}
        </button>
        <span className="scroll-cue" aria-hidden="true">
          Scroll
        </span>
      </footer>
    </div>
    <div className="scroll-spacer" aria-hidden="true" />
    </>
  );
}
