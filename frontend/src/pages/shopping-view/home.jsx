import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import ProductCard from "../../components/shopping-view/ProductCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Pill, ThermometerIcon, Heart, Stethoscope, Thermometer, Syringe, Tablets, Droplets, Users } from "lucide-react";

// This would normally be imported from a slice
const fetchFeaturedProducts = () => ({
  type: "FETCH_FEATURED_PRODUCTS_REQUESTED"
});

const fetchFeatures = () => ({
  type: "FETCH_FEATURES_REQUESTED"
});

const fetchCategories = () => ({
  type: "FETCH_CATEGORIES_REQUESTED"
});

const HomePage = () => {
  const dispatch = useDispatch();
  const { products, categories, loading: productsLoading } = useSelector((state) => state.shopProducts);
  const { features, loading: featuresLoading } = useSelector((state) => state.commonFeature);

  useEffect(() => {
    dispatch(fetchFeaturedProducts());
    dispatch(fetchFeatures());
    dispatch(fetchCategories());
  }, [dispatch]);

  // Banners are features with type 'banner'
  const banners = features.filter(feature => feature.type === 'banner' && feature.isActive);
  
  // Promotions are features with type 'promotion'
  const promotions = features.filter(feature => feature.type === 'promotion' && feature.isActive);
  
  // Featured products
  const featuredProducts = products.filter(product => product.featured);

  // Common medical conditions - typically these would come from the database
  const medicalConditions = [
    { name: "Cold & Flu", icon: <Thermometer className="h-6 w-6" />, color: "bg-blue-100 text-blue-700" },
    { name: "Pain Relief", icon: <Tablets className="h-6 w-6" />, color: "bg-red-100 text-red-700" },
    { name: "Allergies", icon: <Droplets className="h-6 w-6" />, color: "bg-green-100 text-green-700" },
    { name: "Digestive Health", icon: <Users className="h-6 w-6" />, color: "bg-amber-100 text-amber-700" },
    { name: "Heart Health", icon: <Heart className="h-6 w-6" />, color: "bg-pink-100 text-pink-700" },
    { name: "Diabetes Care", icon: <Syringe className="h-6 w-6" />, color: "bg-purple-100 text-purple-700" }
  ];

  // Today's health tip - typically this would rotate or be fetched from an API
  const healthTip = {
    title: "Stay Hydrated",
    content: "Drink at least 8 glasses of water daily to maintain proper hydration levels, which helps with digestion, absorption of nutrients, and overall health.",
    icon: <Droplets className="h-8 w-8" />
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Main Banner */}
      <section className="mb-12">
        {featuresLoading ? (
          <Skeleton className="w-full h-[400px] rounded-lg" />
        ) : banners.length > 0 ? (
          <div className="relative rounded-lg overflow-hidden">
            <img 
              src={banners[0].imageUrl} 
              alt={banners[0].title} 
              className="w-full h-[400px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex flex-col justify-center p-8">
              <h1 className="text-4xl font-bold text-white mb-4">{banners[0].title}</h1>
              <p className="text-white text-lg mb-6 max-w-md">{banners[0].description}</p>
              <Link to={banners[0].linkUrl}>
                <Button size="lg">Shop Now</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-gray-100 rounded-lg h-[400px] flex items-center justify-center">
            <p className="text-gray-500">No banners available</p>
          </div>
        )}
      </section>

      {/* Health Categories Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <Stethoscope className="h-6 w-6 mr-2 text-primary" />
          Health Categories
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { name: "Medications", icon: <Pill className="h-8 w-8" />, color: "bg-blue-500" },
            { name: "Vitamins", icon: <Tablets className="h-8 w-8" />, color: "bg-orange-500" },
            { name: "First Aid", icon: <ThermometerIcon className="h-8 w-8" />, color: "bg-red-500" },
            { name: "Personal Care", icon: <Users className="h-8 w-8" />, color: "bg-green-500" },
            { name: "Baby & Child", icon: <Users className="h-8 w-8" />, color: "bg-purple-500" },
            { name: "Medical Devices", icon: <Stethoscope className="h-8 w-8" />, color: "bg-pink-500" }
          ].map((category, index) => (
            <Link
              key={index}
              to={`/shop/listing?category=${category.name}`}
              className="flex flex-col items-center p-4 rounded-lg bg-white shadow-sm border border-gray-100 hover:shadow-md transition-all"
            >
              <div className={`${category.color} text-white p-3 rounded-full mb-3`}>
                {category.icon}
              </div>
              <span className="text-sm font-medium text-center">{category.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Promotions Section */}
      {promotions.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <Pill className="h-6 w-6 mr-2 text-primary" />
            Special Offers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {promotions.map((promotion) => (
              <Link 
                key={promotion._id} 
                to={promotion.linkUrl}
                className="group relative rounded-lg overflow-hidden"
              >
                <img 
                  src={promotion.imageUrl} 
                  alt={promotion.title} 
                  className="w-full h-48 object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/50 flex flex-col justify-end p-4">
                  <h3 className="text-white font-bold text-lg">{promotion.title}</h3>
                  <p className="text-white/80 text-sm">{promotion.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Common Medical Conditions Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <Heart className="h-6 w-6 mr-2 text-primary" />
          Common Health Concerns
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {medicalConditions.map((condition, index) => (
            <Link
              key={index}
              to={`/shop/listing?medicalCondition=${condition.name}`}
              className="flex flex-col items-center p-4 rounded-lg bg-white shadow-sm border border-gray-100 hover:shadow-md transition-all"
            >
              <div className={`${condition.color} p-3 rounded-full mb-3`}>
                {condition.icon}
              </div>
              <span className="text-sm font-medium text-center">{condition.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Today's Health Tip */}
      <section className="mb-12">
        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6 border border-blue-100">
          <div className="flex items-start">
            <div className="bg-blue-100 text-blue-600 p-3 rounded-full mr-4">
              {healthTip.icon}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center">
                Today's Health Tip
              </h3>
              <h4 className="text-lg font-medium text-gray-800 mb-1">{healthTip.title}</h4>
              <p className="text-gray-600">{healthTip.content}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center">
            <Pill className="h-6 w-6 mr-2 text-primary" />
            Featured Medications
          </h2>
          <Link to="/shop/listing">
            <Button variant="outline">View All Products</Button>
          </Link>
        </div>
        
        {productsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex flex-col h-full">
                <Skeleton className="aspect-square w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4 mt-4" />
                <Skeleton className="h-4 w-full mt-2" />
                <Skeleton className="h-4 w-1/2 mt-2" />
                <div className="flex justify-between mt-4">
                  <Skeleton className="h-6 w-1/3" />
                  <Skeleton className="h-9 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-gray-100 rounded-lg p-8 text-center">
            <p className="text-gray-500">No featured products available</p>
          </div>
        )}
      </section>

      {/* Consultation CTA */}
      <section className="mt-12">
        <div className="bg-primary rounded-lg p-8 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0 md:mr-8">
              <h2 className="text-2xl font-bold mb-2">Have health questions?</h2>
              <p className="text-white/90 max-w-md">Our licensed pharmacists are available to provide expert advice on medications and health concerns.</p>
            </div>
            <div className="flex-shrink-0">
              <Button variant="secondary" size="lg">
                Schedule Consultation
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 