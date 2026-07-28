import { InnerPage } from "./InnerPage";

export function ArticlePage({
  title,
  intro,
  children,
}: {
  title: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <InnerPage eyebrow="Vehicle owner guide" title={title} intro={intro}>
      {children}
    </InnerPage>
  );
}
