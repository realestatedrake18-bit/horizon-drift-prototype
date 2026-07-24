import Link from "next/link";
import { notFound } from "next/navigation";
import { projects } from "@/lib/projects";

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const project = projects.find((p) => p.slug === params.slug);
  return { title: (project ? project.title : "Project") + " -- Horizon Drift" };
}

export default function ProjectPage({ params }: { params: { slug: string } }) {
  const project = projects.find((p) => p.slug === params.slug);
  if (!project) notFound();

  return (
    <div className="work-page">
      <Link href="/work" className="work-back">
        {"<- Back to Work"}
      </Link>

      <span className="project-panel-eyebrow">{project.eyebrow}</span>
      <h1>{project.title}</h1>
      <p className="work-detail-body">{project.body}</p>
    </div>
  );
}
