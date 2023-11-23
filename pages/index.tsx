import Head from 'next/head';
import Container from '../components/container';
import Intro from '../components/intro';
import Layout from '../components/layout';

export default function Index() {
  return (
    <Layout>
      <Head>
        <title>Curate Health</title>
      </Head>
      <Container>
        <Intro />
      </Container>
    </Layout>
  );
}
