import Highlight from 'components/layout/Home/Highlight';
import HomeLayout from 'components/layout/Home/HomeLayout';
import Intro from '../components/layout/Home/Hero';

export default function Index() {
  return (
    <HomeLayout title={'Home'}>
      <Highlight />
    </HomeLayout>
  );
}
