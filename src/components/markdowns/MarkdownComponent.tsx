import { useApp } from "@/hooks/useApp";
import { App } from "obsidian";
import * as React from "react";
import { SpecialComponents } from "react-markdown/lib/ast-to-react";
import { NormalComponents } from "react-markdown/lib/complex-types";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import rehypeRaw from "rehype-raw";
import { RpgManagerInterface } from "src/RpgManagerInterface";
import { useApi } from "src/hooks/useApi";

const transformMarkdownLinks = (api: RpgManagerInterface, markdown: string) => {
  return markdown.replace(/\[\[(.*?)(?:\|(.*?))?\]\]/g, (_, link, alias) => {
    return `<a href="${link}" data-id="${link}">${alias || link}</a>`;
  });
};

export default function MarkdownComponent({
  value,
  specificComponent,
  className,
}: {
  value?: string;
  specificComponent?: "sensory";
  className?: string;
}): React.ReactElement {
  const api: RpgManagerInterface = useApi();
  const app: App = useApp();

  const transformedValue = transformMarkdownLinks(api, value ?? ""); //.replaceAll("\n\n", "<br/>&nbsp;\n");

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.stopPropagation();

    if (e.currentTarget.href) {
      app.workspace.openLinkText(e.currentTarget.dataset.id, "", false);
    }
  };

  let components: Partial<
    Omit<NormalComponents, keyof SpecialComponents> & SpecialComponents
  > = {
    p: ({ ...props }) => (
      <p {...props} className="!mb-0 !mt-0  !bg-transparent" />
    ),
    a: ({ node, ...props }) => (
      <a
        {...props}
        className="!no-underline cursor-pointer text-[--text-accent] hover:text-[--text-accent-hover]"
        onClick={handleLinkClick}
      />
    ),
    ul: ({ node, ordered, ...props }) => (
      <ul {...props} className="list-disc list-inside" />
    ),
    ol: ({ node, ordered, ...props }) => (
      <ol
        {...props}
        style={{ listStyleType: "decimal" }}
        className=" list-inside"
      />
    ),
    li: ({ node, ordered, ...props }) => <li {...props} className={"!mb-0"} />,
    h2: ({ node, ...props }) => (
      <h2
        {...props}
        className="!mt-3 !mb-6 !text-2xl !font-bold border-b border-b-[--background-modifier-border]"
      />
    ),
    h3: ({ node, ...props }) => (
      <h3 {...props} className="!mt-3 !mb-1 !text-xl !font-extralight" />
    ),
    small: ({ node, ...props }) => (
      <small {...props} className="!text-xs text-[--text-muted]" />
    ),
  };

  if (specificComponent === "sensory") {
    components = {
      p: ({ ...props }) => (
        <p {...props} className="!mb-0 !mt-0  !bg-transparent" />
      ),
      a: ({ node, ...props }) => (
        <a
          {...props}
          className="!no-underline cursor-pointer text-[--text-accent] hover:text-[--text-accent-hover]"
          onClick={handleLinkClick}
        />
      ),
      ul: ({ node, ordered, ...props }) => (
        <ul {...props} className="list-disc" />
      ),
      ol: ({ node, ordered, ...props }) => (
        <ol {...props} className="list-none" />
      ),
      li: ({ node, ordered, ...props }) => (
        <li {...props} className={"!mb-1"} />
      ),
      h2: ({ node, ...props }) => (
        <h2
          {...props}
          className="!mt-3 !mb-6 !text-2xl !font-bold border-b border-b-[--background-modifier-border]"
        />
      ),
      h3: ({ node, ...props }) => (
        <h3 {...props} className="!mt-3 !mb-1 !text-xl !font-extralight" />
      ),
      small: ({ node, ...props }) => (
        <small {...props} className="!text-xs text-[--text-muted]" />
      ),
    };
  }

  return (
    <div className={`markdown-content ${className ?? ""}`}>
      <ReactMarkdown
        rehypePlugins={[rehypeRaw]}
        children={transformedValue}
        components={components}
      />
    </div>
  );
}
