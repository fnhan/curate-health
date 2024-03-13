import { Button } from 'components/ui/button';
import { Input } from 'components/ui/input';
import { useToast } from 'components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

export default function Newsletter() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.target);
    const email = formData.get('email');

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        // Handle success, e.g., show a success message
        toast({
          title: 'You are now signed up!',
          description: 'Thank you for subscribing to our newsletter.',
        });
        setEmail('');
      } else {
        // Handle server-side validation errors or other issues
        toast({
          variant: 'destructive',
          title: 'Uh oh! Something went wrong.',
          description:
            'There was a problem with your request. Please try again.',
        });
      }
    } catch (error) {
      // Handle network errors or other unexpected issues
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'There was a problem with your request. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className='bg-secondary'>
      <div className='container py-4 md:py-8 2xl:py-9 flex flex-col md:flex-row gap-3 md:gap-16 2xl:justify-between items-center'>
        <h2 className='italic md:text-lg 2xl:text-2xl'>
          Sign up to our newsletter
        </h2>
        <form
          className='flex items-center max-w-sm justify-center mx-auto md:mx-0 flex-grow md:max-w-none 2xl:max-w-lg'
          onSubmit={handleSubmit}>
          <Input
            type='email'
            name='email'
            placeholder='Email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className='bg-transparent text-white placeholder:text-white rounded-none'
            required
          />
          <Button
            type='submit'
            className='rounded-none bg-transparent border font-normal'
            disabled={isLoading}>
            {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            Sign Up
          </Button>
        </form>
      </div>
    </section>
  );
}
