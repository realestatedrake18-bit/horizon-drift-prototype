import Link from "next/link";
import { projects } from "@/lib/projects";

export const metadata = {
  title: "Work -- Horizon Drift",
};

export default function WorkIndexPage() {
  return (
    <div className="work-page">
      <Link href="/" className="work-back">
        {"<- Back to Horizon Drift"}
      </Link>

      <h1>Work</h1>

      <ul className="work-list">
        {projects.map((project) => (
          <li key={project.slug}>
            <Link href={"/work/" + project.slug} className="work-list-item">
              <span className="work-list-eyebrow">{project.eyebrow}</span>
              <span className="work-list-title">{project.title}</span>
              <p>{project.summary}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
