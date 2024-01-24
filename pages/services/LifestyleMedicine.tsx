import Layout from '../../components/layout/layout';
import Image from 'next/image';
import lifestyleMedicine from '../../public/images/service/lifestyle-medicine.png';

export default function LifestyleMedicine() {
  const servicesList = [
    {
      title: 'Lifestyle Medicine',
      href: '/services#lifestyle-medicine',
      image: lifestyleMedicine,
    },
  ];

  return (
    <section>
      <div className='w-[194px] h-5 left-[1086px] top-[<adjust-top-value>] absolute text-right text-zinc-300 text-2xl font-normal font-["Denton"] leading-loose tracking-widest' style={{ whiteSpace: 'nowrap', fontStyle: 'italic' }}>
      Lifestyle Medicine
      </div>
      <div className="w-5 h-5 left-[162px] top-[<adjust-top-value>] absolute text-zinc-300 text-2xl font-normal font-['Denton'] leading-loose tracking-widest" style={{ whiteSpace: 'nowrap', fontStyle: 'italic' }}>1.</div>
      <Image
        width={1080}
        height={1440}
        src={lifestyleMedicine}
        alt='Lifestyle Medicine'
        style={{marginBottom: '50px'}}
        className='w-full object-cover max-h-[235px] md:max-h-[525px]'
      />
     
     <div className="w-[732px] h-[185px] left-[162px] top-[<adjust-top-value>] absolute">
        <div className="w-[346px] h-[285px] left-0 top-0 absolute text-white text-base font-normal font-['Avenir Next'] leading-relaxed">Ut ultricies nulla metus, sit amet convallis lectus suscipit sit amet. Sed non est purus. Duis condimentum, nisi vitae elementum lacinia, neque leo pharetra lacus, vitae iaculis dui odio eget neque. <br/><br/>Ut ultricies nulla metus, sit amet convallis lectus suscipit sit amet. Sed non est purus. Duis condimentum, nisi vitae elementum lacinia, neque leo pharetra lacus, vitae iaculis dui odio eget neque.</div>
        <div className="w-[346px] h-[207px] left-[386px] top-0 absolute text-white text-base font-normal font-['Avenir Next'] leading-relaxed">Sed non est purus. Duis condimentum, nisi vitae elementum lacinia, neque leo pharetra lacus, vitae iaculis dui odio eget neque.<br/><br/> Ut ultricies nulla metus, sit amet convallis lectus suscipit sit amet.. Duis condimentum, nisi vitae elementum lacinia, neque leo pharetra lacus, vitae iaculis dui odio eget neque.</div>
      </div>
    </section>
  );
}