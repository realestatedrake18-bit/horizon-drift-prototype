import Link from "next/link";

export const metadata = {
  title: "Contact -- Horizon Drift",
};

export default function ContactPage() {
  return (
    <div className="work-page">
      <Link href="/" className="work-back">
        {"<- Back to Horizon Drift"}
      </Link>

      <h1>Contact</h1>

      <p className="work-detail-body">
        Have a project in mind, or just want to talk through an idea? Get in
        touch and we&apos;ll take it from there.
      </p>

      <a
        href="mailto:realestatedrake18@gmail.com"
        className="cta"
        style={{ marginTop: "2rem" }}
      >
        Email Aaron
        <span aria-hidden="true"> -&gt;</span>
      </a>
    </div>
  );
}
