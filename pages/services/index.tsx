import Layout from '../../components/layout/layout';
import LifestyleMedicine from './LifestyleMedicine';
import Rehabilitation from './Rehabilitation';
import PerformanceTraining from './PerformanceTraining';
import MentalHealth from './MentalHealth'

export default function Index() {
  return (
    <Layout title="Services">
      <LifestyleMedicine />
      <Rehabilitation />
      <PerformanceTraining />
      <MentalHealth/>
    </Layout>
  );
}