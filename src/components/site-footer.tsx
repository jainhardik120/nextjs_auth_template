import React from "react";

const Footer = () => {
  return (
    <footer className="mt-auto border-t border-border/40 py-6 dark:border-border md:px-8 md:py-0">
      <div className="mx-auto container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-8">
          <p className="text-lg font-semibold">Hardik Jain</p>
          <p className="text-sm">All rights reserved</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
