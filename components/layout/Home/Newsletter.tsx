import { Button } from 'components/ui/button';
import { Input } from 'components/ui/input';

export default function Newsletter() {
  return (
    <section className='bg-secondary'>
      <div className='container py-4 md:py-8 2xl:py-9 flex flex-col md:flex-row gap-3 md:gap-16 2xl:justify-between items-center'>
        <h4 className='font-denton italic md:text-lg 2xl:text-2xl'>
          Sign up to our newsletter
        </h4>
        <div className='flex items-center max-w-sm justify-center mx-auto md:mx-0 flex-grow md:max-w-none 2xl:max-w-lg'>
          <Input
            type='email'
            placeholder='Email'
            className='bg-transparent text-white placeholder:text-white rounded-none'
          />
          <Button
            type='submit'
            className='rounded-none bg-transparent border font-normal'>
            Sign Up
          </Button>
        </div>
      </div>
    </section>
  );
}
