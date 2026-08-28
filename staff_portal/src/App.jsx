import { Router, Routes, Route} from "react-router-dom"
import StaffDashboard from "./StaffDashboard"
import StaffLogin from "./StaffLogin"
import CustomerDashboard from "./CustomerDashboard"
import LoanDashboard from "./LoanDashboard"

function App() {
  

  return (
    
    <Routes>
      <Route path='/' element={<StaffLogin />} />
      <Route path='/home' element={<StaffDashboard />} />
      <Route path='/customer/:customerId' element={<CustomerDashboard />} />
      <Route path="/loan/:accountId" element={<LoanDashboard />} />
    </Routes>
    
  )
}

export default App
