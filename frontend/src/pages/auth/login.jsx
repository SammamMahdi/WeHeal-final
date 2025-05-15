import LoginForm from "../../components/auth/LoginForm";

const AuthLogin = () => {
  return (
    <div className="w-full">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold">Welcome Back</h1>
        <p className="text-gray-600 mt-2">Sign in to your account to continue</p>
      </div>
      
      <LoginForm />
    </div>
  );
};

export default AuthLogin;