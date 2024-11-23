import { Button } from "components/ui/button";

export default function PrimaryCTAButton({ cta }) {
  return (
    <a target="_blank" rel="noopener noreferrer" href={cta.ctaLink}>
      <Button className="rounded-none border border-white bg-card px-8 py-8 text-xl text-card-foreground transition-all duration-300 hover:bg-transparent hover:text-card-foreground hover:text-white">
        {cta.ctaText}
      </Button>
    </a>
  );
}
