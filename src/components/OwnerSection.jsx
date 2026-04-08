import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Github, Linkedin, FileText, Sparkles, GraduationCap } from "lucide-react";

export default function OwnerSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const containerVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: "easeOut", staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <section className="relative py-24 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-violet-900/10 to-transparent pointer-events-none"></div>
      
      <motion.div 
        ref={ref}
        variants={containerVariants}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        className="max-w-4xl mx-auto relative z-10"
      >
        <div className="text-center mb-12">
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-pink-500/30 bg-pink-500/8 text-pink-300 text-xs font-bold mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Built by the Creator
          </motion.div>
        </div>

        <div className="relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 md:p-12 shadow-2xl overflow-hidden">
          {/* Subtle glow background */}
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-violet-600/20 rounded-full blur-[80px]"></div>
          <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-cyan-600/20 rounded-full blur-[80px]"></div>

          <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16 relative z-10">
            {/* Left side: Profile Image */}
            <motion.div 
              animate={{ y: [-6, 6, -6] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="relative shrink-0"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-pink-500 to-cyan-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
              <div className="relative w-40 h-40 md:w-48 md:h-48 rounded-full border border-white/20 p-1.5 shadow-[0_0_30px_rgba(139,92,246,0.3)] bg-gradient-to-br from-white/10 to-transparent backdrop-blur-md">
                <div className="w-full h-full rounded-full overflow-hidden bg-[#080b14] flex items-center justify-center">
                  <img src="/hello.jpeg" alt="Founder" className="w-full h-full object-cover object-top grayscale hover:grayscale-0 transition-all duration-500" />
                </div>
              </div>
              <motion.div 
                 initial={{ scale: 0 }}
                 animate={inView ? { scale: 1 } : { scale: 0 }}
                 transition={{ delay: 0.6, type: "spring", stiffness: 200, damping: 15 }}
                 className="absolute -bottom-2 -right-2 bg-gradient-to-r from-violet-600 to-pink-600 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full border border-white/10 shadow-lg"
              >
                  Founder
              </motion.div>
            </motion.div>

            {/* Right side: Info */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <motion.h3 
                variants={itemVariants}
                className="text-3xl md:text-4xl font-black tracking-tight mb-2 text-white"
              >
                Code. Build. Scale.
              </motion.h3>
              
              <motion.div variants={itemVariants} className="flex items-center gap-2 mb-4 md:mb-5">
                <GraduationCap className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-semibold bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent tracking-wide">
                  Full Stack Developer | MERN | AI Enthusiast
                </span>
              </motion.div>

              <motion.p variants={itemVariants} className="text-white/60 text-base md:text-lg leading-relaxed mb-8 max-w-lg">
                "Passionate about building scalable coding platforms and solving real-world problems with technology."
              </motion.p>

              {/* Buttons */}
              <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                <a 
                  href="https://github.com/pratham9805" target="_blank" 
                  className="group relative px-6 py-2.5 rounded-xl border border-white/15 bg-white/5 backdrop-blur-sm text-white font-medium text-sm flex items-center gap-2 hover:bg-white/10 transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:-translate-y-1"
                >
                  <Github className="w-4 h-4 transition-transform group-hover:scale-110" />
                  GitHub
                </a>
                <a 
                  href="https://www.linkedin.com/in/pratham-patel-b6419a279?utm_source=share_via&utm_content=profile&utm_medium=member_android" 
                  className="group relative px-6 py-2.5 rounded-xl border border-blue-500/30 bg-blue-500/10 backdrop-blur-sm text-blue-300 font-medium text-sm flex items-center gap-2 hover:bg-blue-500/20 transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:-translate-y-1"
                >
                  <Linkedin className="w-4 h-4 transition-transform group-hover:scale-110" />
                  LinkedIn
                </a>
                <a 
                  href="/PrathamPatelResume (1).pdf" 
                  target="_blank"
                  className="group relative px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 text-white font-bold text-sm flex items-center gap-2 transition-all duration-300 hover:shadow-[0_0_25px_rgba(236,72,153,0.5)] hover:-translate-y-1"
                >
                  <FileText className="w-4 h-4 transition-transform group-hover:scale-110" />
                  Resume
                </a>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
