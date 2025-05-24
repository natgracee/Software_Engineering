import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Notfound } from "./pages/notfound";
import { Home } from "./pages/home";
import { Register } from "./pages/Register";
import { Login } from "./pages/Login";
import { Main } from "./pages/Main";
import { Notification } from "./pages/Notification";
import { Account } from "./pages/Account";
import { Grouplist } from "./pages/Grouplist";
import { Newgroup } from "./pages/Newgroup";
import { Groupdetail } from './pages/Groupdetail';
// import { Scanresult } from "./pages/Scanresult";
import { Quickscan } from './pages/Quickscan';
import { GalleryScan } from "./pages/Galleryscan";
import { Scannedbill } from "./pages/Scannedbill";
import { Splitbill } from "./pages/Splitbill";
import { SplitDetail } from "./pages/Splitdetail";

function App() {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/main" element={<Main username="Name" />} />
          <Route path="/notification" element={<Notification />} />
          <Route path="/account" element={<Account />} />
          <Route path="/grouplist" element={<Grouplist />} />
          <Route path="/newgroup" element={<Newgroup />} />
          <Route path="/group/:id" element={<Groupdetail />} />
          {/* <Route path="/scanresult" element={<Scanresult />} />/ */}
          <Route path="/quickscan" element={<Quickscan />} />
          <Route path="/galleryscan" element={<GalleryScan />} />
          <Route path="/scannedbill" element={<Scannedbill />} />
          <Route path="splitbill" element={<Splitbill />} />
          <Route path="/splitdetail" element={<SplitDetail />} />
          <Route path="*" element={<Notfound />} /> 
          
        </Routes>
      </BrowserRouter>
    );
  }
export default App;
