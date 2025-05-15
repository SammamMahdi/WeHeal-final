import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { resetPayment } from "@/store/shop/order-slice";
import PaymentSuccess from "@/components/payment/PaymentSuccess";
import { Loader2 } from "lucide-react";

const PaymentSuccessPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { payment, paymentSuccess } = useSelector((state) => state.shopOrder);
  const [transactionId, setTransactionId] = useState(null);
  
  // Extract transaction ID from URL query params
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const tid = query.get("transactionId");
    if (tid) {
      setTransactionId(tid);
    }
  }, [location.search]);
  
  // Redirect if no payment success or transaction ID
  useEffect(() => {
    if (!paymentSuccess && !payment && !transactionId) {
      navigate("/shop/cart");
    }
  }, [payment, paymentSuccess, transactionId, navigate]);
  
  // Reset payment state when leaving the page
  useEffect(() => {
    return () => {
      // Cleanup on unmount
      dispatch(resetPayment());
    };
  }, [dispatch]);
  
  // If we're still loading or checking
  if (!payment && !transactionId) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-sm">
        <PaymentSuccess payment={payment} />
      </div>
    </div>
  );
};

export default PaymentSuccessPage; 