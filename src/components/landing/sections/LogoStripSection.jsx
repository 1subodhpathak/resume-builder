import React from 'react';
import { motion } from 'framer-motion';

export default function LogoStripSection() {
  return (
<div className="landing-section landing-section--muted border-b py-14 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center">

          <h3 className="landing-heading px-6 mb-12 text-xl md:text-2xl font-bold">
            Our Partners have been hired at
          </h3>

          {/* Scrolling Container */}
          <div className="relative flex w-full overflow-hidden">
            {/* Gradient masks for smooth fade in/out on the edges */}
            <div className="absolute left-0 top-0 bottom-0 w-24 z-10 bg-[linear-gradient(90deg,var(--theme-section-muted-bg),transparent)] pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-24 z-10 bg-[linear-gradient(270deg,var(--theme-section-muted-bg),transparent)] pointer-events-none"></div>

            <motion.div
              className="flex items-center gap-x-12 md:gap-x-20 w-max pl-12 md:pl-20"
              animate={{ x: ["0%", "-50%"] }}
              transition={{
                repeat: Infinity,
                ease: "linear",
                duration: 30 // Increased duration slightly since these logos are wider
              }}
            >
              {/* Render the array TWICE to create a seamless loop */}
              {[...Array(2)].map((_, i) => (
                <React.Fragment key={i}>
                  {[
                    {
                      name: 'TCS',
                      url: 'https://upload.wikimedia.org/wikipedia/commons/0/0e/Tata_Consultancy_Services_old_logo.svg?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original',
                      height: 'h-8 md:h-10'
                    },
                    {
                      name: 'Genpact',
                      url: 'https://upload.wikimedia.org/wikipedia/commons/a/a0/Genpact_logo.svg',
                      height: 'h-8 md:h-10'
                    },
                    {
                      name: 'American Express',
                      url: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/American_Express_logo_%282018%29.svg',
                      height: 'h-10 md:h-12'
                    },
                    {
                      name: 'Airtel',
                      url: 'https://upload.wikimedia.org/wikipedia/commons/9/91/Bharti_Airtel_logo.svg?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original',
                      height: 'h-7 md:h-9'
                    },
                    {
                      name: 'BCG',
                      url: 'https://upload.wikimedia.org/wikipedia/commons/e/e8/BCG_Corporate_Logo.svg?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original',
                      height: 'h-8 md:h-10'
                    },
                    {
                      name: 'HDFC Bank',
                      url: 'https://upload.wikimedia.org/wikipedia/commons/2/28/HDFC_Bank_Logo.svg',
                      height: 'h-6 md:h-7'
                    },
                    {
                      name: 'Tech Mahindra',
                      url: 'https://upload.wikimedia.org/wikipedia/commons/3/34/Tech_Mahindra_New_Logo.svg?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original',
                      height: 'h-4 md:h-6'
                    },
                    {
                      name: 'Deloitte',
                      url: 'https://upload.wikimedia.org/wikipedia/commons/e/ed/Logo_of_Deloitte.svg?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original',
                      height: 'h-5 md:h-6'
                    }
                  ].map((company) => (
                    <img
                      key={`${i}-${company.name}`}
                      src={company.url}
                      alt={`${company.name} Logo`}
                      className={`${company.height} w-auto object-contain hover:scale-105 transition-transform duration-300 shrink-0 opacity-80 hover:opacity-100`}
                    />
                  ))}
                </React.Fragment>
              ))}
            </motion.div>
          </div>

        </div>
      </div>
  );
}
