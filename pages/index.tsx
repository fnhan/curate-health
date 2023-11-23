import Layout from 'components/layout/layout';
import Container from '../components/container';
import Intro from '../components/intro';

export default function Index() {
  return (
    <Layout title={'Home'}>
      <Container>
        <Intro />
      </Container>
    </Layout>
  );
}
