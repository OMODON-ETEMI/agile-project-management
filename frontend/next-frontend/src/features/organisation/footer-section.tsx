"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Plus, ArrowRight, Crown } from "lucide-react"

export function FooterSection() {
  return (
    <>
      {/* CTA Section */}
      <motion.div
        className="max-w-6xl mx-auto px-6 mt-24 flex justify-center"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <motion.div
          className="bg-gradient-to-r from-primary to-accent rounded-2xl p-6 shadow-2xl w-80 text-primary-foreground"
          whileHover={{ y: 40, scale: 1.05 }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-center">
            <h3 className="font-bold text-lg mb-2">Ready to Get Started?</h3>
            <p className="text-sm text-primary-foreground/90 mb-4">Create your first organization today</p>
            <Button size="sm" className="bg-background text-foreground hover:bg-background/90">
              Get Started Free
            </Button>
          </div>
        </motion.div>
      </motion.div>

      {/* Upgrade CTA */}
      <motion.div
        className="relative mt-24 py-16 overflow-hidden"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary"
          animate={{
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
          style={{ backgroundSize: "200% 200%" }}
        />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.h2
            className="text-3xl md:text-5xl font-bold text-primary-foreground mb-6 font-serif"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Scale Your Organization
          </motion.h2>
          <motion.p
            className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            Unlock advanced features and unlimited workspaces with our premium plans
          </motion.p>
          <motion.div
            className="flex flex-wrap items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                className="h-14 px-10 text-lg font-semibold bg-background text-foreground hover:bg-background/90 border-0 shadow-lg transition-all duration-300"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Organization
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-10 text-lg font-semibold border-2 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 backdrop-blur-sm bg-transparent"
              >
                Learn More
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                className="h-14 px-10 text-lg font-semibold bg-gradient-to-r from-accent to-primary hover:opacity-90 border-0 shadow-lg transition-all duration-300"
              >
                <Crown className="w-5 h-5 mr-2" />
                Upgrade Plan
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </>
  )
}
