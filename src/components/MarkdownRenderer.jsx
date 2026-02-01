import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeExternalLinks from "rehype-external-links";

function MarkdownRenderer({ content }) {
  return (
    <div className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeExternalLinks, { target: "_blank" }]]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default MarkdownRenderer;
