import { useEffect, useRef } from "react";

export function Giscus({ slug }: { slug: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.setAttribute("data-repo", "harangju/homepage-discussions");
    script.setAttribute("data-repo-id", "R_kgDOREYzwA");
    script.setAttribute("data-category", "General");
    script.setAttribute("data-category-id", "DIC_kwDOREYzwM4C1nPM");
    script.setAttribute("data-mapping", "pathname");
    script.setAttribute("data-strict", "0");
    script.setAttribute("data-reactions-enabled", "1");
    script.setAttribute("data-emit-metadata", "0");
    script.setAttribute("data-input-position", "bottom");
    script.setAttribute("data-theme", "preferred_color_scheme");
    script.setAttribute("data-lang", "en");
    script.setAttribute("data-loading", "lazy");
    script.crossOrigin = "anonymous";
    script.async = true;

    ref.current.appendChild(script);

    return () => {
      if (ref.current) {
        ref.current.innerHTML = "";
      }
    };
  }, [slug]);

  return <div ref={ref} className="giscus" />;
}
