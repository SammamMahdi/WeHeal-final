import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createOrder } from "@/store/shop/order-slice";
import { fetchCart, clearCart } from "@/store/shop/cart-slice";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { 
  CreditCard, 
  Building, 
  Phone, 
  ChevronRight, 
  ChevronDown, 
  Check, 
  Loader2, 
  AlertCircle,
  ShoppingBag 
} from "lucide-react";

// Payment components
import MobileBankingForm from "@/components/payment/MobileBankingForm";
import CardPaymentForm from "@/components/payment/CardPaymentForm";
import OnlineBankingForm from "@/components/payment/OnlineBankingForm";
import PaymentSuccess from "@/components/payment/PaymentSuccess";

const SHIPPING_PRICE = 5.00;
const TAX_RATE = 0.05; // 5% tax

const ShoppingCheckout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { user } = useSelector((state) => state.auth);
  const { items, totalPrice } = useSelector((state) => state.shopCart);
  const { addresses, loading: addressesLoading } = useSelector((state) => state.shopAddress);
  const { 
    order, 
    loading: orderLoading, 
    error: orderError,
    payment,
    paymentSuccess
  } = useSelector((state) => state.shopOrder);

  // Calculate order summary values
  const itemsPrice = totalPrice;
  const taxPrice = Number((itemsPrice * TAX_RATE).toFixed(2));
  const totalOrderPrice = Number((itemsPrice + SHIPPING_PRICE + taxPrice).toFixed(2));

  // State for checkout steps
  const [activeStep, setActiveStep] = useState(0);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [selectedPaymentProvider, setSelectedPaymentProvider] = useState(null);
  const [isOrderCreating, setIsOrderCreating] = useState(false);

  // Check if cart is empty and redirect if needed
  useEffect(() => {
    if (items.length === 0) {
      dispatch(fetchCart());
    }
  }, [dispatch, items.length]);

  useEffect(() => {
    if (items.length === 0 && !orderLoading) {
      toast({
        title: "Your cart is empty",
        description: "Add some products to your cart before checkout",
        variant: "destructive",
      });
      navigate("/shop/cart");
    }
  }, [items.length, navigate, toast, orderLoading]);

  // Load default address if available
  useEffect(() => {
    if (addresses && addresses.length > 0) {
      const defaultAddress = addresses.find(addr => addr.isDefault) || addresses[0];
      setSelectedAddress(defaultAddress);
    }
  }, [addresses]);

  // Redirect to payment success page after successful payment
  useEffect(() => {
    if (paymentSuccess && payment) {
      navigate(`/shop/payment-success?transactionId=${payment.transactionId}`);
      dispatch(clearCart());
    }
  }, [paymentSuccess, payment, navigate, dispatch]);

  // Function to handle order creation
  const handleCreateOrder = async () => {
    if (!selectedAddress || !selectedPaymentMethod || !selectedPaymentProvider) {
      toast({
        title: "Incomplete information",
        description: "Please select an address and payment method",
        variant: "destructive",
      });
      return;
    }

    setIsOrderCreating(true);

    try {
      // Create order
      const orderData = {
        orderItems: items.map(item => ({
          product: item.product,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          imageUrl: item.imageUrl
        })),
        shippingAddress: {
          fullName: selectedAddress.fullName,
          address: selectedAddress.address,
          city: selectedAddress.city,
          postalCode: selectedAddress.postalCode,
          country: selectedAddress.country,
          phoneNumber: selectedAddress.phoneNumber
        },
        paymentMethod: mapPaymentMethodToServer(selectedPaymentMethod),
        itemsPrice,
        shippingPrice: SHIPPING_PRICE,
        taxPrice,
        totalPrice: totalOrderPrice
      };

      await dispatch(createOrder(orderData)).unwrap();
      setActiveStep(2); // Move to payment step
    } catch (error) {
      toast({
        title: "Error creating order",
        description: error.message || "Failed to create order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsOrderCreating(false);
    }
  };

  // Helper to map payment method to server format
  const mapPaymentMethodToServer = (method) => {
    switch (method) {
      case "mobile_banking": return "Mobile Banking";
      case "card_payment": return "Credit/Debit Card";
      case "online_banking": return "Bank Transfer";
      default: return method;
    }
  };

  // Render select address step
  const renderAddressStep = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Select Shipping Address</h2>
      
      {addressesLoading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : addresses && addresses.length > 0 ? (
        <div className="space-y-4">
          {addresses.map((address) => (
            <div 
              key={address._id}
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                selectedAddress && selectedAddress._id === address._id 
                  ? "border-primary bg-primary/5" 
                  : "border-gray-200 hover:border-primary/50"
              }`}
              onClick={() => setSelectedAddress(address)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{address.fullName}</h3>
                  <p className="text-sm text-gray-600">{address.address}</p>
                  <p className="text-sm text-gray-600">
                    {address.city}, {address.postalCode}, {address.country}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Phone: {address.phoneNumber}</p>
                </div>
                {selectedAddress && selectedAddress._id === address._id && (
                  <div className="bg-primary text-white p-1 rounded-full">
                    <Check className="h-4 w-4" />
                  </div>
                )}
              </div>
            </div>
          ))}
          
          <div className="pt-2">
            <Button 
              variant="outline" 
              onClick={() => navigate("/shop/account/addresses")}
            >
              Add New Address
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No shipping addresses found</p>
          <Button onClick={() => navigate("/shop/account/addresses")}>
            Add New Address
          </Button>
        </div>
      )}
      
      <div className="pt-4 flex justify-between">
        <Button variant="outline" onClick={() => navigate("/shop/cart")}>
          Back to Cart
        </Button>
        <Button 
          onClick={() => setActiveStep(1)}
          disabled={!selectedAddress || addressesLoading}
        >
          Continue <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  // Render select payment method step
  const renderPaymentMethodStep = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Select Payment Method</h2>
      
      <div className="space-y-4">
        {/* Mobile Banking Option */}
        <div 
          className={`border rounded-lg p-4 cursor-pointer transition-colors ${
            selectedPaymentMethod === "mobile_banking" 
              ? "border-primary bg-primary/5" 
              : "border-gray-200 hover:border-primary/50"
          }`}
          onClick={() => {
            setSelectedPaymentMethod("mobile_banking");
            setSelectedPaymentProvider(null);
          }}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="bg-blue-100 p-2 rounded-full mr-3">
                <Phone className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium">Mobile Banking</h3>
                <p className="text-sm text-gray-600">Pay using bKash, Nagad, or Q Cash</p>
              </div>
            </div>
            {selectedPaymentMethod === "mobile_banking" ? (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronRight className="h-5 w-5 text-gray-400" />
            )}
          </div>
          
          {selectedPaymentMethod === "mobile_banking" && (
            <div className="mt-4 grid grid-cols-3 gap-3">
              {["bKash", "Nagad", "Q Cash"].map((provider) => (
                <div
                  key={provider}
                  className={`border rounded p-3 text-center cursor-pointer ${
                    selectedPaymentProvider === provider 
                      ? "border-primary bg-primary/5" 
                      : "border-gray-100 hover:border-gray-300"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPaymentProvider(provider);
                  }}
                >
                  <p className="font-medium">{provider}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Card Payment Option */}
        <div 
          className={`border rounded-lg p-4 cursor-pointer transition-colors ${
            selectedPaymentMethod === "card_payment" 
              ? "border-primary bg-primary/5" 
              : "border-gray-200 hover:border-primary/50"
          }`}
          onClick={() => {
            setSelectedPaymentMethod("card_payment");
            setSelectedPaymentProvider("Credit/Debit Card");
          }}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="bg-green-100 p-2 rounded-full mr-3">
                <CreditCard className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium">Credit/Debit Card</h3>
                <p className="text-sm text-gray-600">Pay using Visa, Mastercard, or other cards</p>
              </div>
            </div>
            {selectedPaymentMethod === "card_payment" ? (
              <Check className="h-5 w-5 text-green-600" />
            ) : (
              <ChevronRight className="h-5 w-5 text-gray-400" />
            )}
          </div>
        </div>
        
        {/* Online Banking Option */}
        <div 
          className={`border rounded-lg p-4 cursor-pointer transition-colors ${
            selectedPaymentMethod === "online_banking" 
              ? "border-primary bg-primary/5" 
              : "border-gray-200 hover:border-primary/50"
          }`}
          onClick={() => {
            setSelectedPaymentMethod("online_banking");
            setSelectedPaymentProvider("Bank Transfer");
          }}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="bg-purple-100 p-2 rounded-full mr-3">
                <Building className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium">Online Banking</h3>
                <p className="text-sm text-gray-600">Pay using direct bank transfer</p>
              </div>
            </div>
            {selectedPaymentMethod === "online_banking" ? (
              <Check className="h-5 w-5 text-purple-600" />
            ) : (
              <ChevronRight className="h-5 w-5 text-gray-400" />
            )}
          </div>
        </div>
      </div>
      
      <div className="pt-4 flex justify-between">
        <Button variant="outline" onClick={() => setActiveStep(0)}>
          Back
        </Button>
        <Button 
          onClick={handleCreateOrder}
          disabled={!selectedPaymentMethod || !selectedPaymentProvider || isOrderCreating}
        >
          {isOrderCreating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
            </>
          ) : (
            <>
              Proceed to Payment <ChevronRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );

  // Render payment step
  const renderPaymentStep = () => {
    if (!order) {
      return (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    let PaymentForm;
    switch (selectedPaymentMethod) {
      case "mobile_banking":
        PaymentForm = MobileBankingForm;
        break;
      case "card_payment":
        PaymentForm = CardPaymentForm;
        break;
      case "online_banking":
        PaymentForm = OnlineBankingForm;
        break;
      default:
        PaymentForm = () => <div>Payment method not supported</div>;
    }

    if (paymentSuccess) {
      return <PaymentSuccess payment={payment} />;
    }

    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Complete Payment</h2>
        
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="font-medium text-gray-700 mb-2">Order Summary</h3>
          <div className="flex justify-between text-sm mb-1">
            <span>Order ID:</span>
            <span className="font-medium">{order._id}</span>
          </div>
          <div className="flex justify-between text-sm mb-1">
            <span>Total Amount:</span>
            <span className="font-medium">${totalOrderPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Payment Method:</span>
            <span className="font-medium">{selectedPaymentProvider}</span>
          </div>
        </div>
        
        <PaymentForm 
          orderId={order._id} 
          amount={totalOrderPrice}
          paymentMethod={selectedPaymentMethod}
          provider={selectedPaymentProvider}
        />
      </div>
    );
  };

  // Render order summary
  const renderOrderSummary = () => (
    <div className="bg-gray-50 rounded-lg p-6 sticky top-6">
      <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
      
      <div className="space-y-4 mb-6">
        {items.slice(0, 3).map((item) => (
          <div key={item._id} className="flex items-center">
            <div className="w-12 h-12 rounded bg-gray-200 overflow-hidden flex-shrink-0">
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium truncate">{item.name}</p>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Qty: {item.quantity}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))}
        
        {items.length > 3 && (
          <p className="text-sm text-gray-500 text-center">
            +{items.length - 3} more items
          </p>
        )}
      </div>
      
      <div className="space-y-2 pt-4 border-t border-gray-200">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal</span>
          <span>${itemsPrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Shipping</span>
          <span>${SHIPPING_PRICE.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Tax (5%)</span>
          <span>${taxPrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-semibold pt-2 border-t border-gray-200">
          <span>Total</span>
          <span>${totalOrderPrice.toFixed(2)}</span>
        </div>
      </div>
      
      <div className="mt-6 text-sm text-gray-500">
        <div className="flex items-start mb-2">
          <ShoppingBag className="h-4 w-4 mr-2 mt-0.5" />
          <span>Free shipping for orders over $50</span>
        </div>
        <div className="flex items-start">
          <AlertCircle className="h-4 w-4 mr-2 mt-0.5" />
          <span>
            Prescription items will need verification before shipment
          </span>
        </div>
      </div>
    </div>
  );

  // Determine which step to render
  const renderCheckoutStep = () => {
    switch (activeStep) {
      case 0:
        return renderAddressStep();
      case 1:
        return renderPaymentMethodStep();
      case 2:
        return renderPaymentStep();
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Step Indicators */}
      <div className="mb-8">
        <div className="flex items-center justify-center">
          {["Shipping", "Payment Method", "Complete Order"].map((step, index) => (
            <div key={step} className="flex items-center">
              <div 
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  activeStep >= index 
                    ? "bg-primary text-white" 
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {index + 1}
              </div>
              <div 
                className={`ml-2 mr-6 font-medium text-sm ${
                  activeStep >= index 
                    ? "text-gray-900" 
                    : "text-gray-400"
                }`}
              >
                {step}
              </div>
              {index < 2 && (
                <div 
                  className={`w-20 h-0.5 mr-2 ${
                    activeStep > index 
                      ? "bg-primary" 
                      : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {renderCheckoutStep()}
        </div>
        <div className="lg:col-span-1">
          {renderOrderSummary()}
        </div>
      </div>
    </div>
  );
};

export default ShoppingCheckout; 