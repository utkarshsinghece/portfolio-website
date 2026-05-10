import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/hooks/useAuth";
import { Toaster } from "@/components/ui/sonner";
import { ScrollProgress } from "@/components/ScrollProgress";

import appCss from "../styles.css?url";

const PERSON_JSONLD = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Utkarsh Singh",
  jobTitle: "Senior Data Engineer",
  email: "mailto:sutkarsh28@gmail.com",
  url: "https://utkarshsingh.lovable.app",
  worksFor: [
    { "@type": "Organization", name: "Visa" },
    { "@type": "Organization", name: "Netflix" },
    { "@type": "Organization", name: "Wipro" },
  ],
  knowsAbout: ["PySpark", "Snowflake", "Airflow", "Kafka", "Azure Data Factory", "Databricks"],
  sameAs: [
    "https://www.linkedin.com/in/sutkarsh28",
    "https://github.com/sutkarsh28",
  ],
};

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Utkarsh Singh — Senior Data Engineer" },
      { name: "description", content: "Data Engineer with 5+ years building Spark, Kafka, Snowflake, Airflow pipelines. Visa · Netflix · Wipro." },
      { name: "author", content: "Utkarsh Singh" },
      { property: "og:title", content: "Utkarsh Singh — Senior Data Engineer" },
      { property: "og:description", content: "Data Engineer with 5+ years building Spark, Kafka, Snowflake, Airflow pipelines. Visa · Netflix · Wipro." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "Utkarsh Singh — Senior Data Engineer" },
      { name: "twitter:description", content: "Data Engineer with 5+ years building Spark, Kafka, Snowflake, Airflow pipelines. Visa · Netflix · Wipro." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/9202646c-139b-432b-8d03-fcaeb2596f2c" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/9202646c-139b-432b-8d03-fcaeb2596f2c" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "apple-touch-icon", href: "/favicon.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(PERSON_JSONLD),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <AuthProvider>
      <ScrollProgress />
      <Outlet />
      <Toaster theme="dark" />
    </AuthProvider>
  );
}
