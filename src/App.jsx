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
import { JoinGroup } from './pages/JoinGroup';
// import { Scanresult } from "./pages/Scanresult";
import { Quickscan } from './pages/Quickscan';
import { GalleryScan } from "./pages/Galleryscan";
import { Scannedbill } from "./pages/Scannedbill";
import { Splitbill } from "./pages/Splitbill";
import { SplitDetail } from "./pages/Splitdetail";
import { UserProvider } from "./context/UserContext";
import { SummaryView } from './pages/SummaryView';
import { InvoiceView } from './pages/InvoiceView';
import { BillDetail } from './pages/BillDetail';
import { ManualBill } from './pages/ManualBill';
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from './pages/ResetPassword';
// import { CompleteGoogleSignup } from './pages/CompleteGoogleSignup';
// import { GoogleOAuthProvider } from "@react-oauth/google";

function App() {
    return (
      <UserProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            {/* <Route path="/completegooglesignup" element={<CompleteGoogleSignup />} /> */}
            <Route path="/main" element={<Main />} />
            <Route path="/notification" element={<Notification />} />
            <Route path="/account" element={<Account />} />
            <Route path="/grouplist" element={<Grouplist />} />
            <Route path="/newgroup" element={<Newgroup />} />
            <Route path="/group/:id" element={<Groupdetail />} />
            <Route path="/join/:groupId" element={<JoinGroup />} />
            {/* <Route path="/scanresult" element={<Scanresult />} />/ */}
            <Route path="/quickscan" element={<Quickscan />} />
            <Route path="/galleryscan" element={<GalleryScan />} />
            <Route path="/scannedbill" element={<Scannedbill />} />
            <Route path="/manualbill/:id" element={<ManualBill />} />
            <Route path="/splitbill/:groupId" element={<Splitbill />} />
            <Route path="/splitdetail" element={<SplitDetail />} />
            <Route path="/summary/:id" element={<SummaryView />} />
            <Route path="/invoices/:id" element={<InvoiceView />} />
            <Route path="/bill/:billId" element={<BillDetail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="*" element={<Notfound />} /> 
          </Routes>
        </BrowserRouter>
      </UserProvider>
    );
  }
export default App;
