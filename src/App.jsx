import Header from "./components/Header";
import MainStory from "./components/MainStory";
import NewsSection from "./components/NewsSection";
import TransferWire from "./components/TransferWire";
import Fixtures from "./components/Fixtures";
import Footer from "./components/Footer";


function App() {
  return (
    <main className="newspaper">
      <Header />

      <MainStory />

      <NewsSection />

      <TransferWire />

      <Fixtures />

      <Footer />
    </main>
  );
}

export default App;
