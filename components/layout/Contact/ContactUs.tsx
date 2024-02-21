import Image from 'next/image';

export default function ContactUs({ }) {
  return (
    <section className='relative bg-platinum h-[435px] md:h-[1136px]'>
      <Image
        src="/images/contact-leaves.jpg"
        // src={builder
        //   .image(bgImage)
        //   .quality(80)
        //   .size(1440, 1080)
        //   .auto('format')
        //   .url()}
        width={1438}
        height={1136}
        alt="alt"
        className='w-full h-full object-fit'
      />
      <div className='absolute inset-0 flex items-center justify-center pt-12'>
        <div className='flex justify-center items-center bg-primary h-[400px] md:h-[600px] md:w-[450px] font-denton font-bold text-xl'>
          <h1>Contact Us</h1>
        </div>
        <iframe
          id="JotFormIFrame-240504327725250"
          title="Curate Health Contact Us Form"
          allow="geolocation; microphone; camera"
          src="https://form.jotform.com/240504327725250"
          allowFullScreen
          width="70%"
          height="100%"
        >
        </iframe>
      </div>
    </section>
  )
}