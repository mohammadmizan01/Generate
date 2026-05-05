import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import MyProject from "./pages/MyProject";
import Pricing from "./pages/Pricing";
import Projects from "./pages/Projects";
import Preview from "./pages/Preview";
import View from "./pages/View";
import Community from "./pages/Community";
// import NavBar from "./components/NavBar";
import Footer from "./components/Footer";


const App = () => {
  return(
    <div>
      {/* <NavBar /> */}
        <Routes>
          
          <Route path = "/" element={<Home />}   />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/projects/:projectId" element={<Projects/>} />
          <Route path="/myprojects" element={<MyProject />} />
          <Route path="/preview/:projectId" element={<Preview />} />
          <Route path="/preview/:projectId/:versionId" element={<Preview />} />
          <Route path="/view/:projectId" element={<View />} />
          <Route path="/community" element={<Community />} />

        </Routes>
        <Footer />
    </div>
  )
}

export default App;