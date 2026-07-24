import Interface from "@/components/Interface";

/**
 * Route-specific content for "/". The persistent 3D canvas, loading screen,
 * and cursor now live in AppShell (mounted from the root layout) so they
 * survive navigation to other routes -- this component only owns what's
 * unique to the homepage.
 */
export default function Experience() {
  return <Interface />;
}
