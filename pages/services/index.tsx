import Layout from '../../components/layout/layout';
import Image from 'next/image';
import LifestyleMedicine from '../../public/images/service/lifestyle-medicine.png';

export default function Services() {
  const servicesList = [
    {
      title: 'Lifestyle Medicine',
      href: '/services#lifestyle-medicine',
      image: LifestyleMedicine,
    },
  ];

  return (
    <div className="w-[1440px] h-[1272px] relative bg-stone-800">
                <Image
            src={LifestyleMedicine}
            alt="Lifestyle Medicine"
            layout="responsive"
            width={1440}
            height={970}
          />
      <div className="w-[194px] h-5 left-[1086px] top-[29px] absolute text-right text-zinc-300 text-2xl font-normal font-['Denton'] leading-loose tracking-widest">Lifestyle Medicine</div>
      <div className="w-5 h-5 left-[162px] top-[29px] absolute text-zinc-300 text-2xl font-normal font-['Denton'] leading-loose tracking-widest">1.</div>
      <div className="w-[732px] h-[285px] left-[162px] top-[855px] absolute">
        <div className="w-[346px] h-[285px] left-0 top-0 absolute text-white text-base font-normal font-['Avenir Next'] leading-relaxed">Ut ultricies nulla metus, sit amet convallis lectus suscipit sit amet. Sed non est purus. Duis condimentum, nisi vitae elementum lacinia, neque leo pharetra lacus, vitae iaculis dui odio eget neque. <br/><br/>Ut ultricies nulla metus, sit amet convallis lectus suscipit sit amet. Sed non est purus. Duis condimentum, nisi vitae elementum lacinia, neque leo pharetra lacus, vitae iaculis dui odio eget neque.</div>
        <div className="w-[346px] h-[207px] left-[386px] top-0 absolute text-white text-base font-normal font-['Avenir Next'] leading-relaxed">Sed non est purus. Duis condimentum, nisi vitae elementum lacinia, neque leo pharetra lacus, vitae iaculis dui odio eget neque.<br/><br/> Ut ultricies nulla metus, sit amet convallis lectus suscipit sit amet.. Duis condimentum, nisi vitae elementum lacinia, neque leo pharetra lacus, vitae iaculis dui odio eget neque.</div>
      </div>
    </div>
  );
}