import Link from 'next/link';
import { FooterMobileAccordion } from './Home/Footer-Mobile-Accordion';

export default function Footer() {
  return (
    <footer className='flex flex-col pt-14 pb-8 w-full'>
      <div className='container text-white flex flex-col gap-10'>
        <div className='text-sm md:text-base'>
          <h5>Contact</h5>
          <div>
            <p>647-123-5678</p>
            <p>care@curatehealth.com</p>
          </div>
        </div>
        <div>
          <FooterMobileAccordion />
          <div className='hidden md:flex flex-col gap-2 md:flex-row md:justify-end md:gap-10 text-sm md:text-base'>
            <div className='border-b border-white md:border-none pb-2'>
              <h6 className='md:font-denton pl-3 md:mb-3'>Services</h6>
              <div className='hidden md:flex flex-col gap-1 pl-3'>
                <Link
                  className='hover:underline'
                  href={'/services/physical-health'}>
                  Physical Health
                </Link>
                <Link
                  className='hover:underline'
                  href={'/services/mental-health'}>
                  Mental Health
                </Link>
              </div>
            </div>
            <div className='border-b border-white md:border-none pb-2'>
              <h6 className='md:font-denton pl-3 md:mb-3'>About Us</h6>
              <div className='hidden md:flex flex-col gap-1 pl-3'>
                <Link className='hover:underline' href={'/about/team'}>
                  The Team
                </Link>
                <Link
                  className='hover:underline'
                  href={'/about/sustainability'}>
                  Sustainability
                </Link>
                <Link className='hover:underline' href={'/about/insights'}>
                  Insights
                </Link>
              </div>
            </div>
            <div className='border-b border-white md:border-none pb-2'>
              <h6 className='md:font-denton pl-3 md:mb-3'>Blog</h6>
              <div className='hidden md:flex flex-col gap-1 pl-3'>
                <Link className='hover:underline' href={'/blog/inner-health'}>
                  Inner Health
                </Link>
                <Link className='hover:underline' href={'/blog/outer-health'}>
                  Outer Health
                </Link>
                <Link className='hover:underline' href={'/blog/wellbeing'}>
                  Wellbeing
                </Link>
              </div>
            </div>
            <div className='border-b border-white md:border-none pb-2'>
              <h6 className='md:font-denton pl-3 md:mb-3'>Inquire</h6>
              <div className='hidden md:flex flex-col gap-1 pl-3'>
                <Link className='hover:underline' href={'/contact'}>
                  Contact
                </Link>
                <Link className='hover:underline' href={'/contact/partner'}>
                  Partner
                </Link>
                <Link className='hover:underline' href={'/contact/partner'}>
                  Press
                </Link>
                <Link className='hover:underline' href={'/contact/join'}>
                  Join
                </Link>
              </div>
            </div>
            <div>
              <h6 className='md:font-denton pl-3 md:mb-3'>Connect</h6>
              <div className='hidden md:flex flex-col gap-1 pl-3'>
                <a className='hover:underline' href={''}>
                  Instagram
                </a>
                <a className='hover:underline' href={''}>
                  X
                </a>
                <a className='hover:underline' href={''}>
                  LinkedIn
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className='flex flex-col md:flex-row justify-between gap-6'>
          <div className='text-xs'>
            &copy; {new Date().getFullYear()} Curate Health
          </div>
          <div className='flex justify-between md:justify-end md:gap-10 text-xs'>
            <Link className='hover:underline' href={'/terms-of-use'}>
              Terms of Use
            </Link>
            <Link href={'/privacy'} className='hover:underline'>
              Privacy + Cookies
            </Link>
            <Link href={'/accessibility'} className='hover:underline'>
              Accessibility
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
