import { FileText, GitHub, GraduationCap, Instagram, LinkedIn, X } from "./icons";

function Footer() {
  return (
    <footer className="flex w-full z-20 py-2 border-t prose">
      <div className="flex justify-between w-full text-slate-900">
        <span className="text-sm">
          © 2025 <a href="https://harangju.com/" className="hover:underline">Harang Ju</a>
        </span>

        <div className="flex items-center justify-center space-x-3 transition-all duration-100">
          <a className="link-hover hover-scale-95" href="https://livejohnshopkins-my.sharepoint.com/:b:/g/personal/hju7_jh_edu/EbLwp2DavixGtxZVEA9WzCgBVKrlM1egzPWAWj_UdFwraw?e=f7miUq" target="_blank" rel="noreferrer">
            <FileText className="w-5 h-5" />
          </a>
          <a className="link-hover hover-scale-95" href="https://scholar.google.com/citations?user=dDNw63AAAAAJ&hl=en" target="_blank" rel="noreferrer">
            <GraduationCap className="w-5 h-5" />
          </a>
          <a className="link-hover hover-scale-95" href="https://github.com/harangju/homepage" target="_blank" rel="noreferrer">
            <GitHub className="w-5 h-5" />
          </a>
          <a className="link-hover hover-scale-95" href="https://www.instagram.com/harangju/" target="_blank" rel="noreferrer">
            <Instagram className="w-5 h-5" />
          </a>
          <a className="link-hover hover-scale-95" href="https://x.com/harangju/" target="_blank" rel="noreferrer">
            <X className="w-5 h-5" />
          </a>
          <a className="link-hover hover-scale-95" href="https://www.linkedin.com/in/harangju/" target="_blank" rel="noreferrer">
            <LinkedIn className="w-5 h-5" />
          </a>
        </div>
      </div>
    </footer>
  );
}

function Home() {
  return (
    <main>
      <div className="prose py-6 text-xl max-w-none leading-relaxed">
        <p className="mb-6">
          Hi, I'm Harang Ju, and I research applied AI.
        </p>

        <p className="mb-6">
          I'm an assistant professor <a href="https://carey.jhu.edu/" className="link">Johns Hopkins</a>, a digital fellow at <a href="https://ide.mit.edu" className="link">MIT</a>, and an advisor at <a href="https://twitter.com/Moku_HQ" className="link">Moku</a>. Previously, I was a postdoc at <a href="https://ide.mit.edu" className="link">MIT</a> and received my PhD in neuroscience at <a href="https://www.upenn.edu/" className="link">UPenn</a>.
        </p>

        <p className="mb-6">
          Outside of work, I enjoy taking <a href="https://www.instagram.com/harangju/" className="link">photos</a>. As my personal belief, I affirm the <a href="https://www.ccel.org/creeds/nicene.creed.html" className="link">Nicene Creed</a>.
        </p>
      </div>
    </main>
  );
}

export default function App() {
  return (
    <div className="flex flex-col h-screen justify-between max-w-2xl mx-auto pt-6 px-4">
      <Home />
      <Footer />
    </div>
  );
}
