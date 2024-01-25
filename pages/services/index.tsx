import Layout from '../../components/layout/layout';
import LifestyleMedicine from './LifestyleMedicine';
import Rehabilitation from './Rehabilitation';
import PerformanceTraining from './PerformanceTraining';
import MentalHealth from './MentalHealth'
import Newsletter from '../../components/layout/Home/Newsletter';

export default function Index() {
  return (
    <Layout title="Services">
      <LifestyleMedicine />
      <Rehabilitation />
      <PerformanceTraining />
      <MentalHealth/>
      <Newsletter />
    </Layout>
  );
}