import { GraduationCap } from "lucide-react";
import { LinkedIn, X } from "@/components/icons";

export default function Footer() {
  return (
    <footer className="fixed bottom-0 w-full z-20 max-w-2xl py-2 px-4 border-t">
      <div className="flex justify-between w-full">

        <span className="text-sm text-gray-500 sm:text-center dark:text-gray-400">
          © 2023 <a href="https://harangju.com/" className="hover:underline">Harang Ju</a>
        </span>
        
        <div className="flex items-center justify-center space-x-4">
          <a href="https://x.com/harangju/" target="_blank" rel="noreferrer">
            <X className="w-4 h-4 text-gray-500 hover:text-gray-400 transition-all duration-100" />
          </a>
          <a href="https://scholar.google.com/citations?user=dDNw63AAAAAJ&hl=en" target="_blank" rel="noreferrer">
            <GraduationCap className="w-5 h-5 text-gray-500 hover:text-gray-400 transition-all duration-100" />
          </a>
          <a href="https://www.linkedin.com/in/harangju/" target="_blank" rel="noreferrer">
            <LinkedIn className="w-5 h-5 text-gray-500 hover:text-gray-400 transition-all duration-100" />
          </a>

        </div>

      </div>
    </footer>
  );
}