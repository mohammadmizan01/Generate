import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import MyProject from "./pages/MyProject";
import Pricing from "./pages/Pricing";
import Projects from "./pages/Projects";
import Preview from "./pages/Preview";
import View from "./pages/View";
import Community from "./pages/Community";
import Footer from "./components/Footer";
import { Toaster } from "sonner";
import AuthPage from "./pages/auth/AuthPage";

const App = () => {
  return (
    <div>
      <Toaster />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/projects/:projectId" element={<Projects />} />
        <Route path="/myprojects" element={<MyProject />} />
        <Route path="/preview/:projectId" element={<Preview />} />
        <Route path="/preview/:projectId/:versionId" element={<Preview />} />
        <Route path="/view/:projectId" element={<View />} />
        <Route path="/community" element={<Community />} />
        <Route path="/auth/:view?" element={<AuthPage />} />
      </Routes>

      <Footer />
    </div>
  );
};

export default App;