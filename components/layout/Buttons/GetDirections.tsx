import { Button } from 'components/ui/button';

export default function GetDirections() {
  return (
    <a target="_blank" href={'https://maps.app.goo.gl/o3Ff3JmxNKssVWRAA'}>
      <Button className='outline outline-1 bg-white text-primary text-[10px] md:text-[14px] hover:text-white hover:bg-primary rounded-none duration-300 transition-all w-[160px] md:w-[215px] lg:w-[290px]'>
        Get Directions
      </Button>
    </a>
  );
}