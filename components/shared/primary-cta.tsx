import { Button } from 'components/ui/button';

export default function PrimaryCTAButton({ cta }) {
  return (
    <a target='_blank' rel='noopener noreferrer' href={cta.ctaLink}>
      <Button className='text-xl rounded-none duration-300 transition-all px-8 py-8 bg-card text-card-foreground hover:bg-transparent hover:text-card-foreground border border-white hover:text-white'>
        {cta.ctaText}
      </Button>
    </a>
  );
}
