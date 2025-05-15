import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

const UnauthPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <AlertCircle className="h-10 w-10 text-red-600" />
        </div>
        <h1 className="text-3xl font-bold">Access Denied</h1>
        <p className="text-gray-600">
          You don't have permission to access this page. Please log in with an appropriate account.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link to="/auth/login">Log In</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/shop/home">Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UnauthPage; 