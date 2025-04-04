"use client"

import { useState, useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Search, RotateCcw } from "lucide-react"
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getCategories } from "@/lib/api"
import { Category, SearchFormData } from "@/lib/types"
import { SearchResults } from "@/components/search/search-results"
import { debounce, DebouncedFunction } from "@/lib/utils"

const formSchema = z.object({
  keyword: z.string().trim().optional(),
  categoryId: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface SearchFormProps {
  onSearch?: (data: SearchFormData) => void;
  showReset?: boolean;
  initialValues?: {
    keyword?: string;
    categoryId?: string;
  };
}

export function SearchForm({ onSearch, showReset = false, initialValues }: SearchFormProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [searchData, setSearchData] = useState<SearchFormData>({
    keyword: initialValues?.keyword || '',
    categoryId: initialValues?.categoryId ? parseInt(initialValues.categoryId) : undefined
  })
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  
  // Track if initial render is complete
  const isInitialRender = useRef(true)

  console.log('SearchForm: Rendering with initialValues:', initialValues);
  console.log('SearchForm: Current searchData:', searchData);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      keyword: initialValues?.keyword || "",
      categoryId: initialValues?.categoryId || "all",
    },
  })
  
  // Update form when initialValues change
  useEffect(() => {
    if (initialValues) {
      console.log('SearchForm: Updating form with new initialValues:', initialValues);
      form.setValue('keyword', initialValues.keyword || '');
      form.setValue('categoryId', initialValues.categoryId || 'all');
    }
  }, [initialValues, form]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories()
        setCategories(data)
      } catch (error) {
        console.error("Error fetching categories:", error)
      } finally {
        setIsLoadingCategories(false)
      }
    }

    fetchCategories()
    
    // Set initial render to false after component mounts
    isInitialRender.current = false
  }, [])

  // Create stable debouncedSearch function with useRef
  const debouncedSearchRef = useRef<DebouncedFunction<(values: FormValues) => void> | null>(null)
  
  useEffect(() => {
    // Create the debounced search function
    const debouncedFn = debounce((values: FormValues) => {
      const formattedData = getSearchFormData(values);
      console.log('Search form values:', values)
      
      setSearchData(formattedData)
      
      if (onSearch) {
        onSearch(formattedData)
      }
    }, 500)
    
    debouncedSearchRef.current = debouncedFn
  }, [onSearch])

  const handleInputChange = (value: string) => {
    console.log('SearchForm: Input changed to:', value);
    form.setValue("keyword", value)
    
    // Ensure debounced function exists
    if (debouncedSearchRef.current) {
      debouncedSearchRef.current(form.getValues())
    }
  }

  const handleCategoryChange = (value: string) => {
    console.log('SearchForm: Category changed to:', value, typeof value);
    form.setValue("categoryId", value)
    
    // For category changes, update immediately without debounce
    const currentValues = form.getValues()
    console.log('SearchForm: Current form values after category change:', currentValues)
    
    const formattedData = getSearchFormData(currentValues);
    console.log('SearchForm: Formatted data after category change:', formattedData);
    setSearchData(formattedData)
    
    if (onSearch) {
      console.log('SearchForm: Calling onSearch with category change:', formattedData);
      onSearch(formattedData)
    }
  }

  const getSearchFormData = (formValues: FormValues): SearchFormData => {
    let categoryId;
    
    if (formValues.categoryId && formValues.categoryId !== 'all') {
      categoryId = parseInt(formValues.categoryId);
      console.log('SearchForm: Parsed categoryId:', formValues.categoryId, '->', categoryId);
    } else {
      categoryId = undefined;
      console.log('SearchForm: Using undefined categoryId from:', formValues.categoryId);
    }
      
    const data = {
      keyword: formValues.keyword || '',
      categoryId: categoryId,
    }
    console.log('SearchForm: Final formatted data:', data);
    return data
  }
  
  const handleReset = () => {
    console.log('SearchForm: Reset button clicked');
    form.reset({
      keyword: "",
      categoryId: "all",
    })
    
    const resetData = {
      keyword: '',
      categoryId: undefined,
    }
    
    setSearchData(resetData)
    
    if (onSearch) {
      console.log('SearchForm: Calling onSearch after reset:', resetData);
      onSearch(resetData)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Form {...form}>
        <form 
          className="flex flex-col md:flex-row gap-3 items-end"
          onSubmit={(e) => {
            e.preventDefault() // Prevent form submission
            
            // Ensure search is triggered on form submit
            const values = form.getValues();
            console.log('SearchForm: Form submitted with values:', values);
            
            const formData = getSearchFormData(values);
            console.log('SearchForm: Formatted form data for submission:', formData);
            
            setSearchData(formData)
            
            if (onSearch) {
              console.log('SearchForm: Calling onSearch on form submit');
              onSearch(formData)
            }
          }}
        >
          <FormField
            control={form.control}
            name="keyword"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Tìm kiếm Bài báo..."
                      className="pl-9 w-full"
                      value={field.value || ''}
                      onChange={(e) => handleInputChange(e.target.value)}
                      // Add input blur handler to ensure search is triggered
                      onBlur={() => {
                        if (debouncedSearchRef.current) {
                          // Cancel any pending debounce and search immediately
                          debouncedSearchRef.current.cancel();
                          const formData = getSearchFormData(form.getValues())
                          setSearchData(formData)
                          
                          if (onSearch) {
                            onSearch(formData)
                          }
                        }
                      }}
                    />
                  </div>
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem className="w-full md:w-48">
                <Select 
                  value={field.value} 
                  onValueChange={handleCategoryChange}
                  disabled={isLoadingCategories}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Danh mục" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="all">Tất cả danh mục</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          
          <div className="flex gap-2 w-full md:w-auto">
            <Button type="submit" className="flex-1 md:flex-none">Tìm kiếm</Button>
            
            {showReset && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleReset}
                title="Đặt lại bộ lọc"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </form>
      </Form>

      {!onSearch && (
        <div className="mt-8">
          <h2 className="mb-6 text-xl font-semibold text-center">
            {searchData.keyword 
              ? `Kết quả tìm kiếm cho "${searchData.keyword}"` 
              : "Kết quả tìm kiếm"}
          </h2>
          
          <div className="p-12 text-center rounded-xl border border-border/30">
            <p className="text-muted-foreground">Nhập từ khóa để tìm kiếm hoặc chọn danh mục.</p>
          </div>
        </div>
      )}
    </div>
  )
}
