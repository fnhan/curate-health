import { Button } from 'components/ui/button';

export default function GetDirections() {
  return (
    <a target="_blank" href={'https://maps.app.goo.gl/o3Ff3JmxNKssVWRAA'}>
      <Button className='outline outline-1 bg-white text-primary text-[10px] md:text-[14px] lg:text-[16px] hover:text-white hover:bg-primary rounded-none duration-300 transition-all w-[178px] md:w-[230px] lg:w-[305px] h-[30px] md:h-[40px] lg:h-[45px]'>
        Get Directions
      </Button>
    </a>
  );
}