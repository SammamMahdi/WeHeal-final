import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchProducts, fetchCategories } from "@/store/shop/products-slice";
import ProductCard from "../../components/shopping-view/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SlidersHorizontal, ChevronLeft, ChevronRight, X, Pill, Stethoscope, BadgeX } from "lucide-react";

const ProductListing = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { products, categories, loading, error } = useSelector((state) => state.shopProducts);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  
  // Parse query params
  const queryParams = new URLSearchParams(location.search);
  const categoryParam = queryParams.get("category");
  const minPriceParam = queryParams.get("minPrice");
  const maxPriceParam = queryParams.get("maxPrice");
  const sortParam = queryParams.get("sort");
  const medicationTypeParam = queryParams.get("medicationType");
  const prescriptionRequiredParam = queryParams.get("prescriptionRequired");
  const medicalConditionParam = queryParams.get("medicalCondition");
  
  // State for filters
  const [filters, setFilters] = useState({
    category: categoryParam || "",
    minPrice: minPriceParam || "",
    maxPrice: maxPriceParam || "",
    sort: sortParam || "-createdAt",
    medicationType: medicationTypeParam || "",
    prescriptionRequired: prescriptionRequiredParam || "",
    medicalCondition: medicalConditionParam || ""
  });
  
  // Pharmacy-specific filter options
  const medicationTypes = ["Tablet", "Capsule", "Syrup", "Injection", "Cream", "Ointment", "Drops"];
  const medicalConditions = [
    "Cold & Flu", 
    "Allergies", 
    "Pain Relief", 
    "Digestive Health", 
    "Heart Health", 
    "Diabetes Care", 
    "Respiratory Care", 
    "First Aid"
  ];
  
  // Fetch products based on filters
  useEffect(() => {
    dispatch(fetchCategories());
    
    const params = {
      page: currentPage,
      limit: 12
    };
    
    if (filters.category) params.category = filters.category;
    if (filters.minPrice) params.minPrice = filters.minPrice;
    if (filters.maxPrice) params.maxPrice = filters.maxPrice;
    if (filters.sort) params.sort = filters.sort;
    if (filters.medicationType) params.medicationType = filters.medicationType;
    if (filters.prescriptionRequired) params.prescriptionRequired = filters.prescriptionRequired;
    if (filters.medicalCondition) params.medicalCondition = filters.medicalCondition;
    
    dispatch(fetchProducts(params))
      .then((action) => {
        if (action.payload) {
          setTotalPages(action.payload.totalPages || 1);
        }
      });
  }, [dispatch, currentPage, filters]);
  
  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (filters.category) params.set("category", filters.category);
    if (filters.minPrice) params.set("minPrice", filters.minPrice);
    if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
    if (filters.sort !== "-createdAt") params.set("sort", filters.sort);
    if (filters.medicationType) params.set("medicationType", filters.medicationType);
    if (filters.prescriptionRequired) params.set("prescriptionRequired", filters.prescriptionRequired);
    if (filters.medicalCondition) params.set("medicalCondition", filters.medicalCondition);
    
    navigate({
      pathname: location.pathname,
      search: params.toString()
    }, { replace: true });
  }, [filters, navigate, location.pathname]);
  
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setCurrentPage(1);
  };
  
  const clearFilters = () => {
    setFilters({
      category: "",
      minPrice: "",
      maxPrice: "",
      sort: "-createdAt",
      medicationType: "",
      prescriptionRequired: "",
      medicalCondition: ""
    });
    setCurrentPage(1);
  };
  
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const toggleMobileFilter = () => {
    setIsMobileFilterOpen(!isMobileFilterOpen);
  };
  
  // Sort options
  const sortOptions = [
    { value: "-createdAt", label: "Newest Arrivals" },
    { value: "price", label: "Price: Low to High" },
    { value: "-price", label: "Price: High to Low" },
    { value: "name", label: "Name: A to Z" },
    { value: "-name", label: "Name: Z to A" },
    { value: "-averageRating", label: "Top Rated" }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Pharmacy Products</h1>
      <p className="text-gray-600 mb-8">Browse our range of medicines and healthcare products</p>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden flex justify-between items-center mb-4">
          <Button variant="outline" onClick={toggleMobileFilter}>
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
          </Button>
          
          <div className="flex items-center">
            <label htmlFor="mobile-sort" className="mr-2 text-sm">Sort by:</label>
            <select
              id="mobile-sort"
              value={filters.sort}
              onChange={(e) => handleFilterChange("sort", e.target.value)}
              className="bg-white border rounded-md py-1 px-2 text-sm"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Filters - Desktop or Mobile when open */}
        <aside 
          className={`
            ${isMobileFilterOpen ? 'block' : 'hidden'} 
            lg:block w-full lg:w-72 bg-white p-4 rounded-lg shadow-sm border
            ${isMobileFilterOpen ? 'fixed inset-0 z-50 overflow-auto' : ''}
          `}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Filters</h2>
            {isMobileFilterOpen && (
              <Button variant="ghost" size="sm" onClick={toggleMobileFilter}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          {/* Category Filter */}
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-2 flex items-center">
              <Stethoscope className="h-4 w-4 mr-2" />
              Categories
            </h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  id="all-categories"
                  type="radio"
                  name="category"
                  checked={filters.category === ""}
                  onChange={() => handleFilterChange("category", "")}
                  className="h-4 w-4 text-primary"
                />
                <label htmlFor="all-categories" className="ml-2 text-sm">
                  All Categories
                </label>
              </div>
              
              {categories.map(category => (
                <div key={category} className="flex items-center">
                  <input
                    id={`category-${category}`}
                    type="radio"
                    name="category"
                    checked={filters.category === category}
                    onChange={() => handleFilterChange("category", category)}
                    className="h-4 w-4 text-primary"
                  />
                  <label htmlFor={`category-${category}`} className="ml-2 text-sm">
                    {category}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          {/* Medication Type Filter */}
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-2 flex items-center">
              <Pill className="h-4 w-4 mr-2" />
              Medication Type
            </h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  id="all-med-types"
                  type="radio"
                  name="medicationType"
                  checked={filters.medicationType === ""}
                  onChange={() => handleFilterChange("medicationType", "")}
                  className="h-4 w-4 text-primary"
                />
                <label htmlFor="all-med-types" className="ml-2 text-sm">
                  All Types
                </label>
              </div>
              
              {medicationTypes.map(type => (
                <div key={type} className="flex items-center">
                  <input
                    id={`med-type-${type}`}
                    type="radio"
                    name="medicationType"
                    checked={filters.medicationType === type}
                    onChange={() => handleFilterChange("medicationType", type)}
                    className="h-4 w-4 text-primary"
                  />
                  <label htmlFor={`med-type-${type}`} className="ml-2 text-sm">
                    {type}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          {/* Prescription Required Filter */}
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-2 flex items-center">
              <BadgeX className="h-4 w-4 mr-2" />
              Prescription
            </h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  id="all-prescription"
                  type="radio"
                  name="prescriptionRequired"
                  checked={filters.prescriptionRequired === ""}
                  onChange={() => handleFilterChange("prescriptionRequired", "")}
                  className="h-4 w-4 text-primary"
                />
                <label htmlFor="all-prescription" className="ml-2 text-sm">
                  All Products
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="prescription-yes"
                  type="radio"
                  name="prescriptionRequired"
                  checked={filters.prescriptionRequired === "yes"}
                  onChange={() => handleFilterChange("prescriptionRequired", "yes")}
                  className="h-4 w-4 text-primary"
                />
                <label htmlFor="prescription-yes" className="ml-2 text-sm">
                  Prescription Required
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="prescription-no"
                  type="radio"
                  name="prescriptionRequired"
                  checked={filters.prescriptionRequired === "no"}
                  onChange={() => handleFilterChange("prescriptionRequired", "no")}
                  className="h-4 w-4 text-primary"
                />
                <label htmlFor="prescription-no" className="ml-2 text-sm">
                  No Prescription Needed
                </label>
              </div>
            </div>
          </div>
          
          {/* Medical Condition Filter */}
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-2">Medical Condition</h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  id="all-conditions"
                  type="radio"
                  name="medicalCondition"
                  checked={filters.medicalCondition === ""}
                  onChange={() => handleFilterChange("medicalCondition", "")}
                  className="h-4 w-4 text-primary"
                />
                <label htmlFor="all-conditions" className="ml-2 text-sm">
                  All Conditions
                </label>
              </div>
              
              {medicalConditions.map(condition => (
                <div key={condition} className="flex items-center">
                  <input
                    id={`condition-${condition}`}
                    type="radio"
                    name="medicalCondition"
                    checked={filters.medicalCondition === condition}
                    onChange={() => handleFilterChange("medicalCondition", condition)}
                    className="h-4 w-4 text-primary"
                  />
                  <label htmlFor={`condition-${condition}`} className="ml-2 text-sm">
                    {condition}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          {/* Price Range Filter */}
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-2">Price Range ($)</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="min-price" className="text-xs text-gray-500">
                  Min Price
                </label>
                <Input
                  id="min-price"
                  type="number"
                  min="0"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange("minPrice", e.target.value)}
                  className="w-full"
                  placeholder="Min"
                />
              </div>
              
              <div>
                <label htmlFor="max-price" className="text-xs text-gray-500">
                  Max Price
                </label>
                <Input
                  id="max-price"
                  type="number"
                  min={filters.minPrice || "0"}
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
                  className="w-full"
                  placeholder="Max"
                />
              </div>
            </div>
          </div>
          
          {/* Sort - Desktop Only */}
          <div className="hidden lg:block mb-6">
            <h3 className="text-sm font-medium mb-2">Sort By</h3>
            <select
              value={filters.sort}
              onChange={(e) => handleFilterChange("sort", e.target.value)}
              className="w-full bg-white border rounded-md py-2 px-3 text-sm"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Clear Filters Button */}
          <Button 
            variant="outline" 
            className="w-full"
            onClick={clearFilters}
          >
            Clear Filters
          </Button>
        </aside>
        
        {/* Products Grid */}
        <div className="flex-1">
          {/* Active Filters Display */}
          {(filters.category || filters.medicationType || filters.prescriptionRequired || 
            filters.medicalCondition || filters.minPrice || filters.maxPrice) && (
            <div className="mb-4 flex flex-wrap gap-2 items-center">
              <span className="text-sm font-medium">Active Filters:</span>
              
              {filters.category && (
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center">
                  Category: {filters.category}
                  <button 
                    onClick={() => handleFilterChange("category", "")}
                    className="ml-1 hover:text-blue-900"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              
              {filters.medicationType && (
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center">
                  Type: {filters.medicationType}
                  <button 
                    onClick={() => handleFilterChange("medicationType", "")}
                    className="ml-1 hover:text-green-900"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              
              {filters.prescriptionRequired && (
                <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full flex items-center">
                  {filters.prescriptionRequired === "yes" ? "Prescription Required" : "No Prescription"}
                  <button 
                    onClick={() => handleFilterChange("prescriptionRequired", "")}
                    className="ml-1 hover:text-purple-900"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              
              {filters.medicalCondition && (
                <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full flex items-center">
                  For: {filters.medicalCondition}
                  <button 
                    onClick={() => handleFilterChange("medicalCondition", "")}
                    className="ml-1 hover:text-amber-900"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              
              {(filters.minPrice || filters.maxPrice) && (
                <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full flex items-center">
                  Price: ${filters.minPrice || "0"} - ${filters.maxPrice || "∞"}
                  <button 
                    onClick={() => {
                      handleFilterChange("minPrice", "");
                      handleFilterChange("maxPrice", "");
                    }}
                    className="ml-1 hover:text-gray-900"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearFilters}
                className="text-xs h-6"
              >
                Clear All
              </Button>
            </div>
          )}
          
          {loading ? (
            // Loading state
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex flex-col h-full">
                  <Skeleton className="aspect-square w-full rounded-lg" />
                  <Skeleton className="h-4 w-3/4 mt-4" />
                  <Skeleton className="h-4 w-full mt-2" />
                  <div className="flex justify-between mt-4">
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-9 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            // Error state
            <div className="bg-red-50 p-4 rounded-lg text-center">
              <p className="text-red-600">{error}</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => dispatch(fetchProducts())}
              >
                Try Again
              </Button>
            </div>
          ) : products.length > 0 ? (
            // Products grid
            <>
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  Showing {products.length} products {totalPages > 1 ? `(Page ${currentPage} of ${totalPages})` : ''}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {products.map(product => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex flex-col items-center space-y-3">
                  <div className="flex items-center bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePageChange(1)}
                      disabled={currentPage === 1}
                      className="h-8 w-8 p-0 mr-1"
                      aria-label="First page"
                    >
                      <span className="sr-only">First page</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="11 17 6 12 11 7"></polyline>
                        <polyline points="18 17 13 12 18 7"></polyline>
                      </svg>
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="h-8 w-8 p-0"
                      aria-label="Previous page"
                    >
                      <span className="sr-only">Previous page</span>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    
                    <div className="flex mx-2 items-center">
                      {[...Array(totalPages)].map((_, i) => {
                        const page = i + 1;
                        // Display logic for page numbers
                        if (
                          page === 1 || 
                          page === totalPages || 
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`relative h-8 w-8 mx-0.5 flex items-center justify-center rounded-full text-sm font-medium transition-colors
                                ${currentPage === page 
                                  ? "bg-primary text-white" 
                                  : "text-gray-700 hover:bg-gray-100"
                                }`}
                              aria-label={`Go to page ${page}`}
                              aria-current={currentPage === page ? "page" : undefined}
                            >
                              {page}
                              {currentPage === page && (
                                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                  <span className="animate-ping absolute h-full w-full rounded-full bg-primary opacity-50"></span>
                                  <span className="relative h-3 w-3 rounded-full bg-primary"></span>
                                </span>
                              )}
                            </button>
                          );
                        } 
                        // Show ellipsis for skipped pages
                        else if (
                          page === currentPage - 2 || 
                          page === currentPage + 2
                        ) {
                          return <span key={page} className="px-0.5 text-gray-500">...</span>;
                        }
                        return null;
                      })}
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="h-8 w-8 p-0"
                      aria-label="Next page"
                    >
                      <span className="sr-only">Next page</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePageChange(totalPages)}
                      disabled={currentPage === totalPages}
                      className="h-8 w-8 p-0 ml-1"
                      aria-label="Last page"
                    >
                      <span className="sr-only">Last page</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="13 17 18 12 13 7"></polyline>
                        <polyline points="6 17 11 12 6 7"></polyline>
                      </svg>
                    </Button>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
                      <Pill className="h-3 w-3 mr-1" />
                      Page {currentPage} of {totalPages}
                    </span>
                    <span className="mx-2">•</span>
                    <span>Showing {products.length} medications</span>
                  </div>
                </div>
              )}
            </>
          ) : (
            // No products found
            <div className="bg-gray-50 p-8 rounded-lg text-center">
              <p className="text-gray-500">No products found matching your criteria.</p>
              <Button onClick={clearFilters} className="mt-4">
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductListing; 