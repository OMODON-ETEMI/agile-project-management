"use client";
import React from 'react';
import { Plus, ArrowRight, Crown } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CreateOrganizationModal } from '@/src/features/organisation/createOrganisation';
import { useRouter } from 'next/navigation';



export default function NoOrganisation() {
    const router = useRouter();
    return (
        <motion.section
            className="relative py-24 pt-32 overflow-hidden"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
        >
            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-600 via-violet-600 to-blue-600"
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

            <motion.div
                className="relative z-10 max-w-4xl mx-auto px-6 text-center text-white"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
            >
                <motion.h2
                    className="text-3xl md:text-5xl font-bold mb-6 font-serif"
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    viewport={{ once: true }}
                >
                    Scale Your Organization
                </motion.h2>
                <motion.p
                    className="text-lg md:text-xl mb-10 text-white/90 max-w-2xl mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    viewport={{ once: true }}
                >
                    Empower your teams with the tools they need to collaborate effectively and achieve extraordinary results
                </motion.p>

                <motion.div
                    className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    viewport={{ once: true }}
                >
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <CreateOrganizationModal />
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                            size="lg"
                            variant="outline"
                            className="h-14 px-10 text-lg font-semibold border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm bg-transparent"
                        >
                            Learn More
                        </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                            size="lg"
                            className="h-12 px-6 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 border-0 shadow-lg hover:shadow-violet-500/25 transition-all duration-300"
                            onClick={() => (router.push('/billing'))}
                        >
                            <Crown className="w-5 h-5 mr-2" />
                            Upgrade Plan
                        </Button>
                    </motion.div>
                </motion.div>
            </motion.div>
        </motion.section>
    )
}
