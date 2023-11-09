import { FileText, GraduationCap } from "lucide-react";
import { Instagram, LinkedIn, X } from "@/components/icons";

export default function Footer({ className } : { className?: string }) {
  return (
    <footer className={`flex w-full z-20 py-2 border-t ${className}`}>
      <div className="flex justify-between w-full text-slate-900 dark:text-slate-50">

        <span className="text-sm">
          © 2023 <a href="https://harangju.com/" className="hover:underline">Harang Ju</a>
        </span>
        
        <div className="flex items-center justify-center space-x-3 hover:text-slate-700 transition-all duration-100">
          <a href="/Harang Ju CV.pdf" target="_blank" rel="noreferrer">
            <FileText className="w-5 h-5 -mr-[3px]" />
          </a>
          <a href="https://scholar.google.com/citations?user=dDNw63AAAAAJ&hl=en" target="_blank" rel="noreferrer">
            <GraduationCap className="w-5 h-5" />
          </a>
          <a href="https://www.instagram.com/harangju/" target="_blank" rel="noreferrer">
            <Instagram className="w-5 h-5" />
          </a>
          <a href="https://x.com/harangju/" target="_blank" rel="noreferrer">
            <X className="w-5 h-5" />
          </a>
          <a href="https://www.linkedin.com/in/harangju/" target="_blank" rel="noreferrer">
            <LinkedIn className="w-5 h-5" />
          </a>
        </div>

      </div>
    </footer>
  );
}