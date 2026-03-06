import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function MarkdownRenderer({ content }) {

  // Ensure content is always a string
  const safeContent = typeof content === "string" ? content : "";

  return (
    <div className="markdown-body">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {safeContent}
      </ReactMarkdown>
    </div>
  );
}

export default MarkdownRenderer;