import Footer from "./Footer";
import Meta from "./Meta";
import Nav from "./Nav";

export default function Layout({
  title,
  children,
  navigation,
  footer,
  description,
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Meta title={title} description={description || "description"} />
      <Nav navigation={navigation} />
      <main className="flex flex-1 flex-col text-white antialiased">
        {children}
      </main>
      <Footer footer={footer} />
    </div>
  );
}
