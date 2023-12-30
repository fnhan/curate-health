import Clinic from 'components/layout/Home/Clinic';
import Highlight from 'components/layout/Home/Highlight';
import HomeLayout from 'components/layout/Home/HomeLayout';
import Products from 'components/layout/Home/Products';
import Services from 'components/layout/Home/Services';

export default function Index() {
  return (
    <HomeLayout title={'Home'}>
      <Highlight />
      <Clinic />
      <Services />
      <Products />
    </HomeLayout>
  );
}
