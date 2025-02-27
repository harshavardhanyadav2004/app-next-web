import { motion } from "framer-motion"
import { Bot, Zap, Shield, Sparkles, Cpu, Globe, LucideIcon } from "lucide-react"

const features = [
  { icon: Bot, title: "Easy Bot Creation", description: "Build complex Apps with a simple interface" },
  { icon: Zap, title: "Lightning Fast", description: "Deploy your Apps in seconds, not hours" },
  { icon: Shield, title: "Secure & Reliable", description: "Bank-grade security for your Apps" },
  { icon: Sparkles, title: "AI-Powered", description: "Leverage cutting-edge AI for smarter Apps" },
  { icon: Cpu, title: "Advanced Automation", description: "Automate tasks with the AI" },
  { icon: Globe, title: "Global Scaling", description: "Scale your Apps to millions of users effortlessly" },
]

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}
export default function Features() {
  return (
    <section id="features" className="py-20 bg-gray-100">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">Powerful Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <FeatureCard {...feature} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FeatureCard({ icon: Icon, title, description } : FeatureCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
      <div className="mb-4 text-sky-500">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

