import Link from "next/link";

export const metadata = {
  title: "Studio -- Horizon Drift",
};

export default function StudioPage() {
  return (
    <div className="work-page">
      <Link href="/" className="work-back">
        {"<- Back to Horizon Drift"}
      </Link>

      <h1>Studio</h1>

      <p className="work-detail-body">
        Horizon Drift is built around one idea: most 3D websites add
        spectacle without asking whether the site needed it. This one starts
        from the opposite direction -- one camera rig, one hero object, one
        clear interaction -- and only adds complexity once it earns its
        place.
      </p>
      <p className="work-detail-body" style={{ marginTop: "1.5rem" }}>
        Every project on this site follows the same discipline: a single
        visual idea, built well, rather than a dozen effects competing for
        attention. If that&apos;s the kind of site you&apos;re after,{" "}
        <Link href="/contact" className="project-panel-link">
          get in touch
        </Link>
        .
      </p>
    </div>
  );
}
