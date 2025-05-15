import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import LabTestCard from '../../components/shopping-view/LabTestCard';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

const LabTests = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    priceMin: searchParams.get('priceMin') || '',
    priceMax: searchParams.get('priceMax') || '',
    isHomeCollection: searchParams.get('isHomeCollection') === 'true',
    search: searchParams.get('search') || '',
    page: parseInt(searchParams.get('page')) || 1
  });
  const [totalPages, setTotalPages] = useState(1);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/lab-tests/categories');
        if (response.data.success) {
          setCategories(response.data.categories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  // Fetch tests when filters change
  useEffect(() => {
    const fetchTests = async () => {
      setLoading(true);
      try {
        // Build query parameters
        const params = new URLSearchParams();
        if (filters.category) params.append('category', filters.category);
        if (filters.priceMin) params.append('priceMin', filters.priceMin);
        if (filters.priceMax) params.append('priceMax', filters.priceMax);
        if (filters.isHomeCollection) params.append('isHomeCollection', filters.isHomeCollection);
        if (filters.search) params.append('search', filters.search);
        params.append('page', filters.page);
        params.append('limit', 12);

        const response = await axios.get(`http://localhost:5000/api/lab-tests?${params.toString()}`);

        if (response.data.success) {
          setTests(response.data.tests);
          setTotalPages(response.data.totalPages);
        }
      } catch (error) {
        console.error('Error fetching tests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
    
    // Update URL search params
    const newSearchParams = new URLSearchParams();
    if (filters.category) newSearchParams.append('category', filters.category);
    if (filters.priceMin) newSearchParams.append('priceMin', filters.priceMin);
    if (filters.priceMax) newSearchParams.append('priceMax', filters.priceMax);
    if (filters.isHomeCollection) newSearchParams.append('isHomeCollection', filters.isHomeCollection.toString());
    if (filters.search) newSearchParams.append('search', filters.search);
    newSearchParams.append('page', filters.page);
    
    setSearchParams(newSearchParams);
  }, [filters, setSearchParams]);

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value,
      page: name === 'page' ? value : 1 // Reset page when filters change
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    handleFilterChange('search', e.target.elements.search.value);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Lab Tests</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
        {/* Filters */}
        <div className="col-span-1">
          <Card className="p-4">
            <CardContent className="p-0">
              <h2 className="text-xl font-semibold mb-4">Filters</h2>
              
              {/* Search */}
              <form onSubmit={handleSearch} className="mb-4">
                <div className="flex gap-2">
                  <Input 
                    name="search"
                    placeholder="Search tests..."
                    defaultValue={filters.search}
                    className="flex-1"
                  />
                  <Button type="submit">Search</Button>
                </div>
              </form>
              
              {/* Category filter */}
              <div className="mb-4">
                <Label htmlFor="category" className="mb-2 block">Category</Label>
                <Select 
                  value={filters.category} 
                  onValueChange={(value) => handleFilterChange('category', value)}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Price filter */}
              <div className="mb-4">
                <Label className="mb-2 block">Price Range</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.priceMin}
                    onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                    className="w-1/2"
                  />
                  <span>to</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.priceMax}
                    onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                    className="w-1/2"
                  />
                </div>
              </div>
              
              {/* Home collection filter */}
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="home-collection" 
                  checked={filters.isHomeCollection}
                  onCheckedChange={(checked) => handleFilterChange('isHomeCollection', checked)}
                />
                <Label htmlFor="home-collection">Home Collection</Label>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Test listing */}
        <div className="col-span-1 lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, index) => (
                <Card key={index} className="w-full h-64 animate-pulse">
                  <div className="h-full flex flex-col p-4">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="flex-1 bg-gray-200 rounded mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/3 self-end"></div>
                  </div>
                </Card>
              ))}
            </div>
          ) : tests.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tests.map(test => (
                  <LabTestCard key={test._id} test={test} />
                ))}
              </div>
              
              {/* Pagination */}
              <Pagination className="mt-8">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => handleFilterChange('page', Math.max(1, filters.page - 1))}
                      disabled={filters.page === 1}
                    />
                  </PaginationItem>
                  
                  {[...Array(totalPages)].map((_, index) => {
                    const page = index + 1;
                    // Show limited number of page links
                    if (
                      page === 1 || 
                      page === totalPages || 
                      (page >= filters.page - 1 && page <= filters.page + 1)
                    ) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => handleFilterChange('page', page)} 
                            isActive={page === filters.page}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    } else if (
                      page === filters.page - 2 ||
                      page === filters.page + 2
                    ) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }
                    return null;
                  })}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => handleFilterChange('page', Math.min(totalPages, filters.page + 1))}
                      disabled={filters.page === totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium mb-2">No tests found</h3>
              <p className="text-gray-500">Try changing your search criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LabTests; 