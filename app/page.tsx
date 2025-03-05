"use client"

import confetti from "canvas-confetti"
import { SiteHeader } from "./components/site-header"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { motion } from "framer-motion"
import { Footer } from "./components/footer"
import { Zap, Command, Scale, Bot, Shield, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import AboutPage from "./drag-component/page"
export default function Home() {
  const triggerConfetti = () => {
    const defaults = {
      origin: { y: 0.7 },
      spread: 90,
      ticks: 100,
    }

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(200 * particleRatio),
      })
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    })

    fire(0.2, {
      spread: 60,
    })

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    })

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    })

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    })
  }
  const router = useRouter();
  return (
    <div className="relative flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center space-y-10 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="container flex flex-col items-center justify-center gap-6 text-center"
          >
            <motion.a
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              href="#"
              className="inline-flex items-center rounded-full bg-muted px-4 py-1.5 text-sm font-medium"
              onClick={(e) => {
                e.preventDefault(); // Prevent default anchor behavior
                triggerConfetti(); // Call your function
              }}
            >
              🎉 <Separator className="mx-2 h-4" orientation="vertical" /> Introducing AppCraft
            </motion.a>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-4xl font-bold leading-tight tracking-tighter md:text-6xl lg:text-7xl lg:leading-[1.1]"
            >
              Build Mobile Applications
              <br />
              Without Code
            </motion.h1>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="max-w-[750px] text-center text-lg text-muted-foreground sm:text-xl"
            >
              Create, deploy, and scale Mobile Apps without writing a single line of code.
            </motion.span>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex gap-4"
            >
              <Button size="lg" className="h-12 px-8"
                onClick={() => router.push("/register")}
              >
                Start Building
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8"
                onClick={() => router.push("https://github.com/APPCRAFT-NO-CODE-MOBILE-APP")}
              >
                View Demo
              </Button>
            </motion.div>
          </motion.div>
        </section>

        <Separator className="my-12" />

        <section className="container space-y-12 py-12 md:py-24 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center"
          >
            <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">Features built for scale</h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              AppCraft provides all the tools you need to create powerful Mobile Apps that can scale to millions of users.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{
                  rotateX: index % 2 === 0 ? 5 : -5,
                  rotateY: index % 3 === 0 ? 5 : -5,
                  transition: { duration: 0.3 },
                }}
                className="flex flex-col items-center space-y-4 rounded-lg border border-gray-800 bg-background p-6 h-full"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">{feature.name}</h3>
                <p className="text-center text-gray-400 flex-grow">{feature.description}</p>
              </motion.div>
            ))}
          </div>

        </section>


        <Separator className="my-12" />

        <section className="w-full py-12 md:py-24 lg:py-32 text-white">
          <div className="container px-4 md:px-6">
            <AboutPage />
          </div>
        </section>

        <Separator className="my-12" />
        <section className="container py-12 md:py-24 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center"
          >
            <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">Ready to get started?</h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              Create your first App in minutes !!
            </p>
            <Button size="lg" className="mt-4"
              onClick={() => router.push("/register")}

            >
              Start Building Now
            </Button>
          </motion.div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

const features = [
  {
    name: "Easy Setup",
    description: "Get your App up and running in minutes with our intuitive interface.",
    icon: Zap,
  },
  {
    name: "Powerful Commands",
    description: "Create complex Apps with our Drag and Drop.",
    icon: Command,
  },
  {
    name: "Scale Infinitely",
    description: "Built to handle millions of users and Apps.",
    icon: Scale,
  },
  {
    name: "AI-Powered",
    description: "Leverage artificial intelligence to create smarter Apps.",
    icon: Bot,
  },
  {
    name: "Enterprise Security",
    description: "Bank-grade security to protect your Apps.",
    icon: Shield,
  },
  {
    name: "Custom Features",
    description: "Build custom features without touching any code.",
    icon: Sparkles,
  },
] as const

