import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { searchProducts, setSearchQuery, setFilters, clearFilters } from "@/store/shop/search-slice";
import { addToCart } from "@/store/shop/cart-slice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2, Search, Filter, X, ShoppingCart, Star } from "lucide-react";
import { toast } from "react-hot-toast";

const SearchProducts = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { searchResults, searchQuery, filters, loading, error, totalResults } = useSelector(
    (state) => state.shopSearch
  );
  
  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    category: "",
    minPrice: "",
    maxPrice: "",
    sort: "relevance",
  });
  const [priceRange, setPriceRange] = useState([0, 1000]);
  
  // Categories for filter
  const categories = [
    "Medicines",
    "First Aid",
    "Personal Care",
    "Baby Care",
    "Vitamins & Supplements",
    "Medical Devices",
    "Health Foods",
  ];
  
  // Extract search query from URL on initial load
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const q = query.get("q");
    
    if (q && q !== searchQuery) {
      dispatch(setSearchQuery(q));
      
      // Perform search with the query
      dispatch(searchProducts({ query: q, filters }));
    }
  }, [location.search, dispatch, searchQuery, filters]);
  
  // Update local filters when global filters change
  useEffect(() => {
    setLocalFilters(filters);
    setPriceRange([
      filters.minPrice ? Number(filters.minPrice) : 0,
      filters.maxPrice ? Number(filters.maxPrice) : 1000,
    ]);
  }, [filters]);
  
  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    // Update URL with search query
    navigate(`/shop/search?q=${encodeURIComponent(searchQuery)}`);
    
    // Perform search
    dispatch(searchProducts({ query: searchQuery, filters }));
  };
  
  // Apply filters
  const applyFilters = () => {
    dispatch(setFilters({
      ...localFilters,
      minPrice: priceRange[0].toString(),
      maxPrice: priceRange[1].toString(),
    }));
    
    dispatch(searchProducts({ 
      query: searchQuery, 
      filters: {
        ...localFilters,
        minPrice: priceRange[0].toString(),
        maxPrice: priceRange[1].toString(),
      }
    }));
    
    if (window.innerWidth < 768) {
      setShowFilters(false);
    }
  };
  
  // Reset filters
  const resetFilters = () => {
    dispatch(clearFilters());
    setLocalFilters({
      category: "",
      minPrice: "",
      maxPrice: "",
      sort: "relevance",
    });
    setPriceRange([0, 1000]);
    
    // Re-search with cleared filters
    dispatch(searchProducts({ query: searchQuery, filters: {} }));
  };
  
  // Add product to cart
  const handleAddToCart = (product) => {
    dispatch(addToCart({
      product: product._id,
      name: product.name,
      price: product.discountPrice || product.price,
      imageUrl: product.imageUrl,
      quantity: 1
    }));
    
    toast.success(`Added ${product.name} to cart`);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search bar */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search for products..."
            value={searchQuery}
            onChange={(e) => dispatch(setSearchQuery(e.target.value))}
            className="pr-12"
          />
          <Button 
            type="submit" 
            size="icon" 
            className="absolute right-1 top-1 h-8 w-8"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
      
      {/* Results info and filter toggle */}
      <div className="flex justify-between items-center mb-6">
        <div>
          {searchQuery && (
            <p className="text-sm text-gray-600">
              {loading ? "Searching..." : `${totalResults} results for "${searchQuery}"`}
            </p>
          )}
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowFilters(!showFilters)}
          className="md:hidden"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Filters sidebar */}
        <div className={`
          md:w-64 flex-shrink-0 
          ${showFilters ? 'block' : 'hidden'} md:block
          fixed md:relative top-0 left-0 right-0 bottom-0 md:inset-auto
          bg-white md:bg-transparent z-40 md:z-auto
          p-4 md:p-0
        `}>
          <div className="bg-white md:border md:rounded-lg md:p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold">Filters</h2>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowFilters(false)}
                className="md:hidden"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Category filter */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-2">Category</h3>
              <Select 
                value={localFilters.category} 
                onValueChange={(value) => setLocalFilters({...localFilters, category: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Price range filter */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-2">Price Range</h3>
              <Slider
                value={priceRange}
                min={0}
                max={1000}
                step={10}
                onValueChange={setPriceRange}
                className="my-6"
              />
              <div className="flex items-center justify-between">
                <span className="text-sm">${priceRange[0]}</span>
                <span className="text-sm">${priceRange[1]}</span>
              </div>
            </div>
            
            {/* Sort options */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-2">Sort By</h3>
              <Select 
                value={localFilters.sort} 
                onValueChange={(value) => setLocalFilters({...localFilters, sort: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Relevance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="price_asc">Price: Low to High</SelectItem>
                  <SelectItem value="price_desc">Price: High to Low</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-col gap-2">
              <Button onClick={applyFilters}>Apply Filters</Button>
              <Button variant="outline" onClick={resetFilters}>Reset</Button>
            </div>
          </div>
        </div>
        
        {/* Search results */}
        <div className="flex-1">
          {error ? (
            <div className="text-center py-8">
              <p className="text-red-500">{error}</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => dispatch(searchProducts({ query: searchQuery }))}
              >
                Try Again
              </Button>
            </div>
          ) : loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : searchResults.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map((product) => (
                <div key={product._id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <div 
                    className="h-48 bg-gray-100 cursor-pointer"
                    onClick={() => navigate(`/shop/product/${product._id}`)}
                  >
                    <img 
                      src={product.imageUrl} 
                      alt={product.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 
                      className="font-medium mb-1 cursor-pointer hover:text-primary"
                      onClick={() => navigate(`/shop/product/${product._id}`)}
                    >
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">{product.category}</p>
                    <div className="flex items-center mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${
                            i < (product.rating || 0) 
                              ? "text-yellow-400 fill-yellow-400" 
                              : "text-gray-300"
                          }`} 
                        />
                      ))}
                      <span className="text-xs text-gray-500 ml-1">
                        ({product.numReviews || 0})
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        {product.discountPrice ? (
                          <div className="flex items-center">
                            <span className="text-lg font-semibold">${product.discountPrice}</span>
                            <span className="text-sm text-gray-500 line-through ml-2">
                              ${product.price}
                            </span>
                          </div>
                        ) : (
                          <span className="text-lg font-semibold">${product.price}</span>
                        )}
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock <= 0}
                      >
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : searchQuery ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No products found for "{searchQuery}"</p>
              <p className="text-sm text-gray-500 mt-2">Try different keywords or filters</p>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Search for products to see results</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchProducts; 