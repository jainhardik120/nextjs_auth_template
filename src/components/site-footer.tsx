import React from "react";

const Footer = () => {
  return (
    <footer className="mt-auto border-t border-border/40 py-6 dark:border-border md:px-8 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
        <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
          Built by{" "}
          {/* <a
                  href={siteConfig.links.twitter}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium underline underline-offset-4"
                >
                  shadcn
                </a> */}
          . The source code is available on{" "}
          {/* <a
                  href={siteConfig.links.github}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium underline underline-offset-4"
                >
                  GitHub
                </a> */}
          .
        </p>
      </div>
    </footer>
  );
};

export default Footer;