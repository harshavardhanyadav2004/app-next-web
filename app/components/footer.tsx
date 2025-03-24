import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { Github, Twitter, Linkedin } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container flex flex-col gap-6 py-8">
        <div className="flex justify-center gap-8">
          <Link
            href="https://x.com/sri_boora73837"
            className="text-muted-foreground hover:text-foreground transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Twitter className="h-6 w-6" />
            <span className="sr-only">Twitter</span>
          </Link>
          <Link
            href="https://github.com/harshavardhanyadav2004"
            className="text-muted-foreground hover:text-foreground transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github className="h-6 w-6" />
            <span className="sr-only">GitHub</span>
          </Link>
          <Link
            href="https://www.linkedin.com/in/harsha-vardhan-boora-551a1525b/"
            className="text-muted-foreground hover:text-foreground transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Linkedin className="h-6 w-6" />
            <span className="sr-only">LinkedIn</span>
          </Link>
        </div>
        <Separator />
        <div className="text-center">
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} CodeLoomer. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}


