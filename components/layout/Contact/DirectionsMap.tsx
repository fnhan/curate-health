
export default function DirectionsMap({ }) {

  // const mapSrc = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2884.520962334508!2d-79.4302559!3d43.6997215!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x882b339f39d8e7ff%3A0xce828e8fdd1a6e50!2s989%20Eglinton%20Ave%20W%2C%20York%2C%20ON%20M6C%202C6!5e0!3m2!1sen!2sca!4v1709655312397!5m2!1sen!2sca"
  return (
    <section className="">
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2884.520962334508!2d-79.4302559!3d43.6997215!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x882b339f39d8e7ff%3A0xce828e8fdd1a6e50!2s989%20Eglinton%20Ave%20W%2C%20York%2C%20ON%20M6C%202C6!5e0!3m2!1sen!2sca!4v1709655312397!5m2!1sen!2sca"
        allow='autoplay; fullscreen; picture-in-picture'
        className='w-[320px] h-[300px] md:w-[765px] md:h-[431px] lg:w-[702] lg:h-[520]'
        title='curate-health-google-maps'>
      </iframe>
    </section>
  )
};