import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, PlayCircle } from 'lucide-react';
import { testimonials } from '../data/landingData.jsx';

export default function TestimonialsSection({ currentPage, handleNextTestimonial, handlePrevTestimonial, itemsPerPage, numPages, onViewTemplates, testimonialIndex }) {
  return (
<section
  id="testimonials"
  className="relative overflow-hidden border-b border-[#D8E0EA] bg-[#F8F7F3] py-16 sm:py-20"
>
  {/* BACKGROUND */}
  <div className="pointer-events-none absolute inset-0">
    <div className="absolute inset-0 bg-[linear-gradient(135deg,#FAF8F2_0%,#F7F9FC_48%,#EEF3F8_100%)]" />

    <div className="absolute inset-0 opacity-[0.025] bg-[linear-gradient(#163A63_1px,transparent_1px),linear-gradient(90deg,#163A63_1px,transparent_1px)] bg-[size:42px_42px]" />

    <div className="absolute -right-[12%] -top-[40%] h-[560px] w-[560px] rounded-full bg-[#295D95]/10 blur-[130px]" />

    <div className="absolute -bottom-[50%] -left-[8%] h-[500px] w-[500px] rounded-full bg-[#B98A32]/8 blur-[130px]" />
  </div>

  <div className="relative z-20 mx-auto max-w-[1300px] px-6">

    {/* MAIN TESTIMONIAL PANEL */}
    <div className="relative overflow-hidden rounded-[1.75rem] border border-[#365C85]/30 bg-[linear-gradient(135deg,#07172B_0%,#0A2340_48%,#12375E_100%)] shadow-[0_28px_70px_rgba(6,23,44,0.18)]">

      {/* INNER BACKGROUND DETAILS */}
      <div className="pointer-events-none absolute inset-0">

        {/* grid */}
        <div className="absolute inset-0 opacity-[0.055] bg-[linear-gradient(rgba(255,255,255,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.2)_1px,transparent_1px)] bg-[size:36px_36px]" />

        {/* blue glow */}
        <div className="absolute -right-[10%] -top-[35%] h-[500px] w-[500px] rounded-full bg-[#3C78B5]/20 blur-[120px]" />

        {/* gold glow */}
        <div className="absolute -bottom-[50%] left-[20%] h-[400px] w-[400px] rounded-full bg-[#C59A42]/10 blur-[110px]" />

        {/* subtle lighting */}
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.05),transparent_32%,transparent_72%,rgba(212,173,84,0.05))]" />
      </div>

      <div className="relative z-10 grid gap-10 p-8 sm:p-10 md:p-12 lg:grid-cols-12 lg:p-14">

        {/* LEFT CONTENT */}
        <div className="flex flex-col justify-center lg:col-span-4">

          {/* EYEBROW */}
          <div className="mb-4 text-[10px] font-extrabold uppercase tracking-[0.22em]">
            <span className="bg-gradient-to-r from-[#D1A74D] via-[#F0D078] to-[#B8872D] bg-clip-text text-transparent">
              Candidate Experiences
            </span>
          </div>

          {/* HEADING */}
          <h2 className="mb-5 text-[2rem] font-extrabold leading-[1.05] tracking-[-0.04em] text-white sm:text-[2.35rem] md:text-[2.6rem]">
            Career
            <br />

            <span className="bg-gradient-to-b from-[#F2D783] via-[#C89B3C] to-[#9A6D1F] bg-clip-text text-transparent">
              Success Stories
            </span>
          </h2>

          {/* DESCRIPTION */}
          <p className="mb-7 max-w-[350px] text-[13px] font-medium leading-[1.75] text-[#AAB9CC] sm:text-[14px]">
            See how candidates are using CareerSense to eliminate manual
            struggle, align with target roles, and secure their dream jobs
            efficiently.
          </p>

          {/* CTA */}
          <button
            onClick={onViewTemplates}
            className="group inline-flex w-fit items-center gap-2.5 text-[13px] font-extrabold text-[#E0BD68] transition-all hover:text-[#F0D585]"
          >
            View Templates

            <PlayCircle className="h-[18px] w-[18px] transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>

        {/* RIGHT TESTIMONIALS */}
        <div className="flex flex-col lg:col-span-8">

          <AnimatePresence mode="wait">
            <motion.div
              key={testimonialIndex}
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -18 }}
              transition={{ duration: 0.3 }}
              className="mb-7 grid gap-4 md:grid-cols-3"
            >
              {testimonials
                .slice(testimonialIndex, testimonialIndex + itemsPerPage)
                .map((testimonial, idx) => (
                  <div
                    key={idx}
                    className="group relative flex h-full flex-col overflow-hidden rounded-[1.15rem] border border-white/10 bg-gradient-to-b from-white/[0.10] to-white/[0.05] shadow-[0_16px_40px_rgba(0,0,0,0.16)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#C99A3E]/35 hover:shadow-[0_22px_45px_rgba(0,0,0,0.22)]"
                  >
                    {/* IMAGE */}
                    <div className="relative h-36 w-full overflow-hidden bg-[#102A49]">
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="h-full w-full object-cover object-[center_24%] transition-transform duration-500 group-hover:scale-[1.03]"
                      />

                      {/* image overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#07172B]/45 via-transparent to-transparent" />
                    </div>

                    {/* QUOTE ICON */}
                    <div className="absolute left-4 top-[128px] z-20 flex h-8 w-8 items-center justify-center rounded-full border border-[#E0B75C]/35 bg-gradient-to-b from-[#D8B157] via-[#BB8D35] to-[#96681F] shadow-[0_6px_16px_rgba(0,0,0,0.22)]">
                      <span className="mt-1 font-serif text-xl leading-none text-white">
                        “
                      </span>
                    </div>

                    {/* CONTENT */}
                    <div className="flex flex-1 flex-col p-5 pt-7">
                      <p className="mb-5 flex-1 text-[11.5px] font-medium leading-[1.7] text-[#C8D3E1]">
                        {testimonial.text}
                      </p>

                      <div className="border-t border-white/[0.08] pt-4">
                        <h4 className="text-[12px] font-extrabold leading-tight text-white">
                          {testimonial.name}
                        </h4>

                        <span className="mt-1 block text-[10px] text-[#8499B2]">
                          {testimonial.role}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </motion.div>
          </AnimatePresence>

          {/* CONTROLS */}
          <div className="flex w-full items-center justify-between">

            {/* ARROWS */}
            <div className="flex gap-2">
              <button
                onClick={handlePrevTestimonial}
                aria-label="Previous testimonials"
                className="group flex h-9 w-9 items-center justify-center rounded-lg border border-[#7290B0]/30 bg-[#0B2849]/70 text-[#B9C8D9] shadow-sm transition-all hover:border-[#D0A34A]/45 hover:text-[#E2BD68] active:scale-95"
              >
                <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
              </button>

              <button
                onClick={handleNextTestimonial}
                aria-label="Next testimonials"
                className="group flex h-9 w-9 items-center justify-center rounded-lg border border-[#7290B0]/30 bg-[#0B2849]/70 text-[#B9C8D9] shadow-sm transition-all hover:border-[#D0A34A]/45 hover:text-[#E2BD68] active:scale-95"
              >
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>

            {/* PAGE INDICATORS */}
            <div className="mr-2 flex items-center gap-2">
              {[...Array(numPages)].map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === currentPage
                      ? "w-6 bg-gradient-to-r from-[#E1BF69] to-[#A97926]"
                      : "w-1.5 bg-[#698098]/45"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
  );
}
