export default function Frame() {
  return (
    <div className="container 2xl:flex 2xl:text-center flex-col text-black py-24 2xl:px-40 ">
      <div className="text-[16px] md:text-[32px] 2xl:text-[50px] pr-36 md:pr-80 xl:px-40">
        Here’s what sets our Exercise Therapy apart
      </div>
      <div className="italic font-light mt-8 md:mt-12 text-[16px] md:text-[22px] 2xl:text-[40px] pr-36 md:pr-96 2xl:px-40">
        Customized Exercise Programs
      </div>
      <div className="mt-8 md:mt-12 text-[11px] md:text-[14px] 2xl:text-[16px] pr-12 md:pr-96 2xl:px-40">
        Tailored specifically to your health status, goals, and preferences.
      </div>
      <hr className="border-black mt-16" />
    </div>
  );
}