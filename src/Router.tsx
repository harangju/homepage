import { useEffect, useState } from "react";

const NAVIGATE_EVENT = "navigate";

export function useRouter() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleNavigation = () => {
      setPath(window.location.pathname);
    };

    window.addEventListener("popstate", handleNavigation);
    window.addEventListener(NAVIGATE_EVENT, handleNavigation);

    return () => {
      window.removeEventListener("popstate", handleNavigation);
      window.removeEventListener(NAVIGATE_EVENT, handleNavigation);
    };
  }, []);

  const navigate = (newPath: string) => {
    window.history.pushState({}, "", newPath);
    window.dispatchEvent(new Event(NAVIGATE_EVENT));
  };

  return { path, navigate };
}

export function Link({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  const { navigate } = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(href);
  };

  return (
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}
