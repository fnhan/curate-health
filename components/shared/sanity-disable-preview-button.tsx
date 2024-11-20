import { Button } from '../ui/button';

export default function SanityDisablePreviewButton() {
  return (
    <Button asChild variant={'destructive'}>
      <a className='fixed right-0 bottom-0 m-4' href='/api/draft-mode/disable'>
        Disable preview mode
      </a>
    </Button>
  );
}
