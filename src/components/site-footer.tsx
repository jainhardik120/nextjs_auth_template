import React from "react";

const Footer = () => {
  return (
    <footer className="mt-auto border-t border-border/40 py-6 dark:border-border md:px-8 md:py-0">
      <div className="mx-auto container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
        <p className="w-full text-balance text-center text-sm leading-loose text-muted-foreground">
          Built with ❤️ by Hardik Jain 
        </p>
      </div>
    </footer>
  );
};

export default Footer;
