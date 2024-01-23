import Blog from 'components/layout/Home/Blog';
import Clinic from 'components/layout/Home/Clinic';
import CurateCafe from 'components/layout/Home/CurateCafe';
import Highlight from 'components/layout/Home/Highlight';
import HomeLayout from 'components/layout/Home/HomeLayout';
import Newsletter from 'components/layout/Home/Newsletter';
import Products from 'components/layout/Home/Products';
import Services from 'components/layout/Home/Services';
import Survey from 'components/layout/Home/Survey';
import Sustainability from 'components/layout/Home/Sustainability';

export default function Index() {
  return (
    <HomeLayout title={'Home'}>
      <Highlight />
      <Clinic />
      <Services />
      <Products />
      <CurateCafe />
      <Blog />
      <Sustainability />
      <Survey />
      <Newsletter />
    </HomeLayout>
  );
}
