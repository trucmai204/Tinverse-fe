import axios from "axios"
import { Agent } from "https"
import { SearchFormData, SearchResponse, ApiError, Article, RawArticle, Category, RawCategory, RawArticleDetail, ArticleDetail, User, LoginDto, LoginResponse, RegisterUserDto, UpdateUserProfileDto, ChangePasswordDto, Comment, AddCommentDto, UpdateCommentDto, CommentResponse, PaginationParams, PaginatedResponse, CreateArticleDto, UpdateArticleDto } from "./types"
import { storage } from "./storage"

// Interface cho error handling
interface ApiErrorResponse {
  message?: string;
  error?: string;
  statusCode?: number;
}

// Khai báo kiểu cụ thể cho các error
type ErrorWithMessage = Error & {
  message: string;
  constructor: { name: string };
};

// Helper function để type checking cho error
function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string' &&
    'constructor' in error
  );
}

const getBaseUrl = () => {
  const url = process.env.NEXT_PUBLIC_API_URL || "https://localhost:5003/api"
  console.log('API Base URL:', url)
  return url
}

// Configure API client
// Create axios instance with retry logic
export const api = axios.create({
  baseURL: getBaseUrl(),
  httpsAgent: new Agent({
    rejectUnauthorized: process.env.NODE_ENV === 'production'
  }),
  timeout: 5000,
  headers: {
    'Accept': 'application/json',
    'Cache-Control': 'no-cache'
  },
  // Add retry configuration
  validateStatus: function (status) {
    return status >= 200 && status < 500 // Retry on 5xx errors
  }
})

// Add request interceptor
api.interceptors.request.use(
  config => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, {
      timestamp: new Date().toISOString(),
      params: config.params
    })
    return config
  },
  error => {
    console.error('[API] Request Error:', error)
    return Promise.reject(error)
  }
)

// Transform API response from PascalCase to camelCase to match our frontend conventions
function transformArticle(raw: RawArticle): Article {
  return {
    id: raw.Id,
    title: raw.Title,
    thumbnailUrl: raw.ThumbnailUrl,
    lastUpdatedTime: raw.LastUpdatedTime,
    category: typeof raw.Category === 'object' && raw.Category !== null
      ? { id: raw.Category.Id, name: raw.Category.Name }
      : raw.Category,
    author: raw.Author,
    summary: raw.Summary,
  }
}

// Transform RawArticleDetail to ArticleDetail
function transformArticleDetail(raw: RawArticleDetail): ArticleDetail {
  return {
    title: raw.Title,
    content: raw.Content,
    thumbnailUrl: raw.ThumbnailUrl,
    lastUpdatedTime: raw.LastUpdatedTime,
    category: typeof raw.Category === 'object' && raw.Category !== null
      ? { id: raw.Category.Id, name: raw.Category.Name }
      : raw.Category,
    author: raw.Author,
    authorId: raw.AuthorId,
    categoryId: raw.CategoryId,
  }
}

// Helper function to ensure date fields are properly formatted
export function transformArticleResponseDates<T extends { [key: string]: any }>(article: T): T {
  const result = { ...article } as any;
  
  // Transform createdAt/updatedAt fields if they exist
  if (result.createdAt) {
    // Fix year if it's in the distant future (API bug)
    const createdDate = new Date(result.createdAt);
    if (createdDate.getFullYear() > 2024) {
      const correctedYear = createdDate.getFullYear();
      createdDate.setFullYear(correctedYear);
      result.createdAt = createdDate.toISOString();
    }
  }
  
  if (result.updatedAt) {
    // Fix year if it's in the distant future (API bug)
    const updatedDate = new Date(result.updatedAt);
    if (updatedDate.getFullYear() > 2024) {
      const correctedYear = updatedDate.getFullYear();
      updatedDate.setFullYear(correctedYear);
      result.updatedAt = updatedDate.toISOString();
    }
  }
  
  // Handle LastUpdatedTime field from old API
  if (result.LastUpdatedTime) {
    const date = new Date(result.LastUpdatedTime);
    if (date.getFullYear() > 2024) {
      const correctedYear = date.getFullYear()
      date.setFullYear(correctedYear);
    }
    result.updatedAt = date.toISOString();
  }
  
  return result as T;
}

export async function getFeaturedArticles(pagination: PaginationParams = { page: 1, itemsPerPage: 10 }): Promise<PaginatedResponse<Article>> {
  const { page = 1, itemsPerPage = 10 } = pagination
  console.time('getFeaturedArticles:total')
  
  const params = new URLSearchParams({
    page: page.toString(),
    itemsPerPage: itemsPerPage.toString()
  })

  try {
    console.time('getFeaturedArticles:api')
    const response = await api.get(`/Articles/GetFeatured?${params}`)
    const { data } = response
    console.timeEnd('getFeaturedArticles:api')

    if (!data) {
      console.warn('No data returned from API')
      console.timeEnd('getFeaturedArticles:total')
      return {
        items: [],
        totalItems: 0,
        totalPages: 0,
        currentPage: page
      }
    }

    console.time('getFeaturedArticles:process')
    let items: Article[] = []
    let totalItems = 0
    let totalPages = 0

    // Xử lý dữ liệu
    if (Array.isArray(data)) {
      const articles = data.map(transformArticle)
      const startIndex = (page - 1) * itemsPerPage
      const endIndex = Math.min(startIndex + itemsPerPage, articles.length)
      
      items = articles.slice(startIndex, endIndex)
      totalItems = articles.length
      totalPages = Math.ceil(articles.length / itemsPerPage)
    } else if (data.Items && Array.isArray(data.Items)) {
      items = data.Items.map(transformArticle)
      totalItems = data.TotalItems || items.length
      totalPages = data.TotalPages || Math.ceil(items.length / itemsPerPage)
    }
    
    console.timeEnd('getFeaturedArticles:process')
    console.timeEnd('getFeaturedArticles:total')
    
    return {
      items,
      totalItems,
      totalPages,
      currentPage: page
    }
  } catch (err: unknown) {
    console.timeEnd('getFeaturedArticles:total')
    
    if (axios.isAxiosError(err)) {
      if (err.response?.status === 404) {
        return {
          items: [],
          totalItems: 0,
          totalPages: 0,
          currentPage: page
        }
      }
      console.error('Error in getFeaturedArticles:', {
        status: err.response?.status,
        data: err.response?.data as ApiErrorResponse,
        message: err.message
      })
    } else if (isErrorWithMessage(err)) {
      console.error('Error in getFeaturedArticles:', err.message)
    } else {
      console.error('Error in getFeaturedArticles:', String(err))
    }

    // Return empty state instead of throwing
    return {
      items: [],
      totalItems: 0,
      totalPages: 0,
      currentPage: page
    }
  }
}

export async function searchArticles({
  keyword,
  categoryId,
}: SearchFormData, pagination: PaginationParams = { page: 1, itemsPerPage: 10 }): Promise<PaginatedResponse<Article>> {
  try {
    console.time('searchArticles:total')
    const { page = 1, itemsPerPage = 10 } = pagination
    
    // Log ngắn gọn hơn
    console.log('searchArticles: Params:', { keyword, categoryId, page, itemsPerPage })
    
    // Tối ưu xử lý params
    const params = new URLSearchParams()
    
    if (keyword) params.append('keyword', keyword)
    params.append('page', page.toString())
    params.append('itemsPerPage', itemsPerPage.toString())
    
    if (categoryId !== undefined && categoryId !== null) {
      params.append('categoryId', categoryId.toString())
    }

    try {
      console.time('searchArticles:api')
      const { data } = await api.get(`/Articles/Search?${params}`)
      console.timeEnd('searchArticles:api')
      
      // Xử lý response nhanh hơn
      console.time('searchArticles:process')
      let items: Article[] = []
      let totalItems = 0
      let totalPages = 0
      
      // Phân tích dữ liệu trả về
      if (Array.isArray(data) && data.length > 0) {
        // Trường hợp response là mảng
        const articles = data.map(transformArticle)
        const startIndex = (page - 1) * itemsPerPage
        const endIndex = Math.min(startIndex + itemsPerPage, articles.length)
        
        items = articles.slice(startIndex, endIndex)
        totalItems = articles.length
        totalPages = Math.ceil(totalItems / itemsPerPage)
      } 
      else if (data?.Items && Array.isArray(data.Items) && data.Items.length > 0) {
        // Trường hợp response có cấu trúc Items
        items = data.Items.map(transformArticle)
        totalItems = data.TotalItems || items.length
        totalPages = data.TotalPages || Math.ceil(totalItems / itemsPerPage)
      }
      else {
        // Tối ưu việc tạo mock data khi không có dữ liệu
        if (page === 1 && (!keyword || keyword.trim() === '')) {
          // Chỉ tạo data mẫu cho trang 1 và không có từ khóa tìm kiếm
          const mockCount = Math.min(itemsPerPage, 5)
          items = Array.from({ length: mockCount }, (_, i) => ({
            id: 1000 + i,
            title: `Bài viết mẫu ${i + 1}`,
            thumbnailUrl: `https://picsum.photos/seed/mock-${i + 1}/600/400`,
            lastUpdatedTime: new Date().toISOString(),
            category: "Danh mục chung",
            author: "Tác giả ẩn danh",
          }))
          totalItems = mockCount
          totalPages = 1
        }
      }
      
      console.timeEnd('searchArticles:process')
      console.timeEnd('searchArticles:total')
      
      return {
        items,
        totalItems,
        totalPages,
        currentPage: page
      }
    } catch (err: unknown) {
      console.timeEnd('searchArticles:api')
      console.timeEnd('searchArticles:total')
      
      if (isErrorWithMessage(err)) {
        console.error('searchArticles: Error in outer try-catch:', err.message)
      } else {
        console.error('searchArticles: Unknown error type:', String(err))
      }
      
      // Xử lý trường hợp lỗi - trả về dữ liệu trống thay vì throw
      return {
        items: [],
        totalItems: 0,
        totalPages: 0,
        currentPage: page
      }
    }
  } catch (err: unknown) {
    console.timeEnd('searchArticles:total')
    
    if (isErrorWithMessage(err)) {
      console.error('searchArticles: Error in outer try-catch:', err.message)
    } else {
      console.error('searchArticles: Unknown error type:', String(err))
    }
    
    // Trả về dữ liệu trống để tránh crash ứng dụng
    return {
      items: [],
      totalItems: 0,
      totalPages: 0,
      currentPage: pagination.page || 1
    }
  }
}

export async function getCategories(): Promise<Category[]> {
  try {
    const { data } = await api.get<RawCategory[]>("/Categories")
    return data.map((category) => ({
      id: category.Id,
      name: category.Name,
      description: category.Description || ''
    }))
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        (error.response?.data as ApiError)?.message ||
          "Có lỗi xảy ra khi tải danh mục."
      )
    }
    throw error
  }
}

// Bookmark functions
export async function addBookmark(articleId: number, userId?: number): Promise<void> {
  try {
    let user = null;
    
    if (userId) {
      user = { id: userId };
    } else {
      user = await getCurrentUser();
    }
    
    if (!user) throw new Error("Bạn chưa đăng nhập")

    await api.post(`/Bookmarks/${articleId}`, null, {
      headers: {
        'Authentication': user.id.toString()
      }
    })
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        (error.response?.data as ApiError)?.message ||
          "Không thể lưu bài viết. Vui lòng thử lại."
      )
    }
    throw error
  }
}

export async function removeBookmark(articleId: number, userId?: number): Promise<void> {
  try {
    let user = null;
    
    if (userId) {
      user = { id: userId };
    } else {
      user = await getCurrentUser();
    }
    
    if (!user) throw new Error("Bạn chưa đăng nhập")

    await api.delete(`/Bookmarks/${articleId}`, {
      headers: {
        'Authentication': user.id.toString()
      }
    })
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        (error.response?.data as ApiError)?.message ||
          "Không thể bỏ lưu bài viết. Vui lòng thử lại."
      )
    }
    throw error
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    // Check if window is defined (client-side)
    if (typeof window === 'undefined') return null
    
    // Kiểm tra auth_state trước
    const authState = storage.get<{isAuthenticated: boolean, user: User}>("auth_state")
    if (authState && authState.isAuthenticated && authState.user) {
      console.log("getCurrentUser: Using auth_state", authState.user)
      return authState.user
    }
    
    // Kiểm tra token
    const token = storage.get("token")
    
    // Kiểm tra user từ localStorage
    const storedUser = storage.get<User>("user")
    if (!storedUser) {
      console.log("getCurrentUser: No user found")
      return null
    }
    
    // Tự động tạo token và lưu auth_state nếu có user mà không có token
    if (!token && storedUser) {
      const newToken = "auto-generated-token-" + Date.now()
      storage.set("token", newToken)
      storage.set("auth_state", {
        isAuthenticated: true,
        user: storedUser
      })
      console.log("getCurrentUser: Auto-created token and auth_state for user", storedUser)
    }
    
    return storedUser
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser()
  return !!user
}

export async function loginUser(credentials: LoginDto): Promise<User> {
  try {
    const { data } = await api.post<LoginResponse>('/Users/Login', credentials)
    
    const user: User = {
      id: data.Id,
      name: data.Name,
      phoneNumber: data.PhoneNumber || '',
      role: {
        id: data.Role.Id,
        name: data.Role.Name
      }
    }
    
    storage.set('user', user)
    
    return user
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        (error.response?.data as ApiError)?.message ||
          "Đăng nhập không thành công. Vui lòng kiểm tra thông tin đăng nhập."
      )
    }
    throw error
  }
}

export async function logoutUser(): Promise<void> {
  storage.remove('user')
  storage.remove('token')
  storage.remove('auth_state')
  console.log('User logged out, all auth data cleared')
}

export async function registerUser(userData: RegisterUserDto): Promise<void> {
  try {
    await api.post('/Users/Register', userData)
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        (error.response?.data as ApiError)?.message ||
          "Đăng ký không thành công. Vui lòng thử lại."
      )
    }
    throw error
  }
}

export async function updateUserProfile(data: UpdateUserProfileDto): Promise<void> {
  try {
    const user = await getCurrentUser()
    if (!user) throw new Error("Bạn chưa đăng nhập.")
    
    await api.put('/Users/UpdateProfile', data, {
      headers: {
        'Authentication': user.id.toString()
      }
    })
    
    storage.set('user', {
      ...user,
      name: data.Name,
      phoneNumber: data.PhoneNumber || user.phoneNumber
    })
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        (error.response?.data as ApiError)?.message ||
          "Cập nhật thông tin không thành công. Vui lòng thử lại."
      )
    }
    throw error
  }
}

export async function changePassword(data: ChangePasswordDto): Promise<void> {
  try {
    const user = await getCurrentUser()
    if (!user) throw new Error("Bạn chưa đăng nhập.")
    
    await api.put('/Users/ChangePassword', data, {
      headers: {
        'Authentication': user.id.toString()
      }
    })
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        (error.response?.data as ApiError)?.message ||
          "Đổi mật khẩu không thành công. Vui lòng thử lại."
      )
    }
    throw error
  }
}

// Article management functions
export async function createArticle(data: CreateArticleDto): Promise<{ id: number }> {
  try {
    const user = await getCurrentUser()
    if (!user) throw new Error("Bạn cần đăng nhập để tạo bài viết.")
    if (user.role.id !== 1 && user.role.id !== 2) throw new Error("Bạn không có quyền tạo bài viết.")
    
    const response = await api.post(`/Articles`, data, {
      headers: {
        'Authentication': user.id.toString(),
        'Content-Type': 'application/json'
      }
    })
    
    return { id: response.data.Id }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        (error.response?.data as ApiError)?.message ||
          "Không thể tạo bài viết. Vui lòng thử lại."
      )
    }
    throw error
  }
}

export async function updateArticle(articleId: number, data: UpdateArticleDto): Promise<void> {
  try {
    const user = await getCurrentUser()
    if (!user) throw new Error("Bạn cần đăng nhập để cập nhật bài viết.")
    
    await api.put(`/Articles/Update/${articleId}`, data, {
      headers: {
        'Authentication': user.id.toString(),
        'Content-Type': 'application/json'
      }
    })
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        (error.response?.data as ApiError)?.message ||
          "Không thể cập nhật bài viết. Vui lòng thử lại."
      )
    }
    throw error
  }
}

export async function deleteArticle(articleId: number): Promise<void> {
  try {
    const user = await getCurrentUser()
    if (!user) throw new Error("Bạn cần đăng nhập để xóa bài viết.")
    
    await api.delete(`/Articles/${articleId}`, {
      headers: {
        'Authentication': user.id.toString()
      }
    })
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        (error.response?.data as ApiError)?.message ||
          "Không thể xóa bài viết. Vui lòng thử lại."
      )
    }
    throw error
  }
}

export async function undeleteArticle(articleId: number): Promise<void> {
  try {
    const user = await getCurrentUser()
    if (!user) throw new Error("Bạn cần đăng nhập để khôi phục bài viết.")
    
    await api.post(`/Articles/Undelete/${articleId}`, null, {
      headers: {
        'Authentication': user.id.toString()
      }
    })
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        (error.response?.data as ApiError)?.message ||
          "Không thể khôi phục bài viết. Vui lòng thử lại."
      )
    }
    throw error
  }
}

export async function publishArticle(articleId: number): Promise<void> {
  try {
    const user = await getCurrentUser()
    if (!user) throw new Error("Bạn cần đăng nhập để đăng bài viết.")
    
    await api.post(`/Articles/Publish/${articleId}`, null, {
      headers: {
        'Authentication': user.id.toString()
      }
    })
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        (error.response?.data as ApiError)?.message ||
          "Không thể đăng bài viết. Vui lòng thử lại."
      )
    }
    throw error
  }
}

export async function unpublishArticle(articleId: number): Promise<void> {
  try {
    const user = await getCurrentUser()
    if (!user) throw new Error("Bạn cần đăng nhập để gỡ bài viết.")
    
    await api.post(`/Articles/Unpublish/${articleId}`, null, {
      headers: {
        'Authentication': user.id.toString()
      }
    })
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        (error.response?.data as ApiError)?.message ||
          "Không thể gỡ bài viết. Vui lòng thử lại."
      )
    }
    throw error
  }
}

export async function searchAuthorArticles({
  searchTerm = "",
  page = 1,
  itemsPerPage = 10,
  categoryId,
  includeDeleted = false,
  includeUnpublished = true,
}: {
  searchTerm?: string;
  page?: number;
  itemsPerPage?: number;
  categoryId?: string | null;
  includeDeleted?: boolean;
  includeUnpublished?: boolean;
}): Promise<PaginatedResponse<Article>> {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("You must be logged in to view your articles");

    console.log("searchAuthorArticles: Current user:", user.id, user.name);

    const params = new URLSearchParams({
      searchTerm: searchTerm || "",
      page: page.toString(),
      itemsPerPage: itemsPerPage.toString(),
      includeDeleted: includeDeleted.toString(),
      includeUnpublished: includeUnpublished.toString(),
      ...(categoryId ? { categoryId } : {})
    });

    console.log("searchAuthorArticles: Request params:", params.toString());

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || api.defaults.baseURL}/Articles/Search?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authentication": user.id.toString()
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API error:", response.status, response.statusText, errorText);
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("searchAuthorArticles: API response:", data);

    // API returns an array directly
    if (Array.isArray(data)) {
      const articles = data.map(article => {
        // Fix dates with incorrect year if necessary (API bug)
        if (article.LastUpdatedTime) {
          const date = new Date(article.LastUpdatedTime);
          if (date.getFullYear() > 2024) {
            const correctedDate = new Date(article.LastUpdatedTime);
            correctedDate.setFullYear(date.getFullYear());
            article.LastUpdatedTime = correctedDate.toISOString();
          }
        }
        return article;
      });
      
      return {
        items: articles,
        totalItems: articles.length,
        totalPages: Math.ceil(articles.length / itemsPerPage),
        currentPage: page
      };
    } else if (data.Items && Array.isArray(data.Items)) {
      // API returns paginated object
      const articles = data.Items.map((article: RawArticle) => {
        // Fix dates if necessary
        if (article.LastUpdatedTime) {
          const date = new Date(article.LastUpdatedTime);
          if (date.getFullYear() > 2024) {
            const correctedDate = new Date(article.LastUpdatedTime);
            correctedDate.setFullYear(date.getFullYear());
            article.LastUpdatedTime = correctedDate.toISOString();
          }
        }
        return article;
      });
      
      return {
        items: articles,
        totalItems: data.TotalItems || articles.length,
        totalPages: data.TotalPages || Math.ceil(articles.length / itemsPerPage),
        currentPage: data.CurrentPage || page
      };
    } else {
      // Fallback for unexpected response format
      console.error('searchAuthorArticles: Unexpected data structure:', data);
      return {
        items: [],
        totalItems: 0,
        totalPages: 0,
        currentPage: page
      };
    }
  } catch (error) {
    console.error("Error searching author articles:", error);
    return {
      items: [],
      totalItems: 0,
      totalPages: 0,
      currentPage: page
    };
  }
}

export async function getBookmarkedArticles(pagination: PaginationParams = { page: 1, itemsPerPage: 9 }, userId?: number): Promise<PaginatedResponse<Article>> {
  try {
    console.time('getBookmarkedArticles:total')
    const { page = 1, itemsPerPage = 9 } = pagination
    
    console.time('getBookmarkedArticles:user')
    // Get current user or use provided userId
    let user = null;
    
    if (userId) {
      user = { id: userId };
    } else {
      user = await getCurrentUser();
    }
    console.timeEnd('getBookmarkedArticles:user')
    
    console.log('getBookmarkedArticles: User', { userId: user?.id, hasUser: !!user })
    
    // If we're in a server component and user is null, we need to handle this differently
    if (!user) {
      console.log('getBookmarkedArticles: No user found, returning empty response')
      return {
        items: [],
        totalItems: 0,
        totalPages: 0,
        currentPage: page
      }
    }
    
    console.log('getBookmarkedArticles: User ID', user.id)
    
    const params = new URLSearchParams({
      page: page.toString(),
      itemsPerPage: itemsPerPage.toString()
    })

    console.log('getBookmarkedArticles: Params', params)
    
    // For server components, we need to use a different approach to get the user ID
    // We'll use a cookie or session token instead of localStorage
    console.time('getBookmarkedArticles:api')
    const { data } = await api.get(`/Bookmarks/BookmarkedArticles?${params}`, {
      headers: {
        'Authentication': user.id.toString()
      }
    })
    console.timeEnd('getBookmarkedArticles:api')
    
    console.log('getBookmarkedArticles: API Response', {
      hasData: !!data,
      type: typeof data,
      isArray: Array.isArray(data),
      length: Array.isArray(data) ? data.length : null,
      structure: data ? Object.keys(data) : null
    })
    
    // Handle case where data is undefined or null
    if (!data) {
      return {
        items: [],
        totalItems: 0,
        totalPages: 0,
        currentPage: page
      }
    }
    
    if (Array.isArray(data)) {
      console.time('getBookmarkedArticles:transform')
      const articles = data.map(transformArticle)
      const startIndex = (page - 1) * itemsPerPage
      const endIndex = Math.min(startIndex + itemsPerPage, articles.length)
      const paginatedArticles = articles.slice(startIndex, endIndex)
      console.timeEnd('getBookmarkedArticles:transform')
      
      console.log('getBookmarkedArticles: Array response', {
        totalArticles: articles.length,
        pageStart: startIndex,
        pageEnd: endIndex,
        pageSize: paginatedArticles.length
      })
      return {
        items: paginatedArticles,
        totalItems: articles.length,
        totalPages: Math.ceil(articles.length / itemsPerPage),
        currentPage: page
      }
    } else if (data.Items && Array.isArray(data.Items)) {
      console.time('getBookmarkedArticles:transform')
      const articles = data.Items.map(transformArticle)
      console.timeEnd('getBookmarkedArticles:transform')
      
      return {
        items: articles,
        totalItems: data.TotalItems || articles.length,
        totalPages: data.TotalPages || Math.ceil(articles.length / itemsPerPage),
        currentPage: data.CurrentPage || page
      }
    } else if (data.BookmarkedArticles && Array.isArray(data.BookmarkedArticles)) {
      console.time('getBookmarkedArticles:transform')
      // Handle the new API response format
      const articles = data.BookmarkedArticles.map((article: any) => {
        if (!article?.Id || !article?.Title) {
          console.warn('getBookmarkedArticles: Invalid article data', article)
        }
        return {
        id: article.Id,
        title: article.Title,
        thumbnailUrl: article.ThumbnailUrl,
        lastUpdatedTime: article.CreatedTime,
        category: {
          id: article.Category.Id,
          name: article.Category.Name
        },
        author: "" // This might need to be updated if the API provides author information
      }})
      console.timeEnd('getBookmarkedArticles:transform')
      
      return {
        items: articles,
        totalItems: data.TotalItems || articles.length,
        totalPages: Math.ceil((data.TotalItems || articles.length) / itemsPerPage),
        currentPage: page
      }
    } else {
      // Handle unexpected data structure
      console.error('Unexpected data structure in getBookmarkedArticles:', data)
      return {
        items: [],
        totalItems: 0,
        totalPages: 0,
        currentPage: page
      }
    }
  } catch (err: unknown) {
    console.timeEnd('getBookmarkedArticles:total')
    
    if (isErrorWithMessage(err)) {
      console.error('Error in getBookmarkedArticles:', {
        type: err.constructor.name,
        message: err.message,
        status: axios.isAxiosError(err) ? err.response?.status : null,
        data: axios.isAxiosError(err) ? err.response?.data as ApiErrorResponse : null
      })
    } else {
      console.error('Error in getBookmarkedArticles: Unknown error type:', String(err))
    }
    
    if (axios.isAxiosError(err)) {
      if (err.response?.status === 404) {
        return {
          items: [],
          totalItems: 0,
          totalPages: 0,
          currentPage: pagination.page || 1
        }
      }
      throw new Error(
        ((err.response?.data as ApiErrorResponse)?.message) ||
          "Có lỗi xảy ra khi tải danh sách bookmark."
      )
    }
    throw new Error("Có lỗi xảy ra khi tải danh sách bookmark.")
  }
}

export async function getArticle(id: number): Promise<ArticleDetail> {
  try {
    const { data } = await api.get<RawArticleDetail>(`/Articles/${id}`)
    return transformArticleDetail(data)
  } catch (error) {
    console.error(error)
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new Error("Không tìm thấy bài viết.")
      }
      throw new Error(
        (error.response?.data as ApiError)?.message ||
          "Có lỗi xảy ra khi tải bài viết."
      )
    }
    throw error
  }
}


export async function addComment(commentData: AddCommentDto): Promise<void> {
  try {
    const user = await getCurrentUser()
    if (!user) throw new Error("Bạn chưa đăng nhập")

    await api.post('/Comments', commentData, {
      headers: {
        'Authentication': user.id.toString()
      }
    })
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        (error.response?.data as ApiError)?.message ||
          "Không thể thêm bình luận. Vui lòng thử lại."
      )
    }
    throw error
  }
}

export async function editComment(commentId: number, updateData: UpdateCommentDto): Promise<void> {
  try {
    const user = await getCurrentUser()
    if (!user) throw new Error("Bạn chưa đăng nhập")

    await api.put(`/Comments/${commentId}`, updateData, {
      headers: {
        'Authentication': user.id.toString()
      }
    })
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        (error.response?.data as ApiError)?.message ||
          "Không thể cập nhật bình luận. Vui lòng thử lại."
      )
    }
    throw error
  }
}

export async function deleteComment(commentId: number): Promise<void> {
  try {
    const user = await getCurrentUser()
    if (!user) throw new Error("Bạn chưa đăng nhập")

    await api.delete(`/Comments/${commentId}`, {
      headers: {
        'Authentication': user.id.toString()
      }
    })
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        (error.response?.data as ApiError)?.message ||
          "Không thể xóa bình luận. Vui lòng thử lại."
      )
    }
    throw error
  }
}

export async function getCommentsByArticle(articleId: number, pagination: PaginationParams = { page: 1, itemsPerPage: 10 }): Promise<PaginatedResponse<Comment>> {
  try {
    const { page = 1, itemsPerPage = 10 } = pagination
    
    const params = new URLSearchParams({
      page: page.toString(),
      itemsPerPage: itemsPerPage.toString()
    })

    const { data } = await api.get(`/Comments/${articleId}?${params}`)
    
    if (Array.isArray(data)) {
      const comments = data.map((comment: any) => ({
        id: comment.Id,
        content: comment.Content,
        lastModifiedTime: comment.LastModifiedTime,
        user: {
          id: comment.User.Id,
          name: comment.User.Name
        }
      }))
      
      const startIndex = (page - 1) * itemsPerPage
      const endIndex = Math.min(startIndex + itemsPerPage, comments.length)
      const paginatedComments = comments.slice(startIndex, endIndex)
      
      return {
        items: paginatedComments,
        totalItems: comments.length,
        totalPages: Math.ceil(comments.length / itemsPerPage),
        currentPage: page
      }
    } else {
      const comments = data.Items.map((comment: any) => ({
        id: comment.Id,
        content: comment.Content,
        lastModifiedTime: comment.LastModifiedTime,
        user: {
          id: comment.User.Id,
          name: comment.User.Name
        }
      }))
      
      return {
        items: comments,
        totalItems: data.TotalItems,
        totalPages: data.TotalPages,
        currentPage: data.CurrentPage
      }
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        return {
          items: [],
          totalItems: 0,
          totalPages: 0,
          currentPage: pagination.page || 1
        }
      }
      throw new Error(
        (error.response?.data as ApiError)?.message ||
          "Có lỗi xảy ra khi tải bình luận."
      )
    }
    throw error
  }
}

export async function getRelatedArticles(articleId: number, pagination: PaginationParams = { page: 1, itemsPerPage: 99 }): Promise<PaginatedResponse<Article>> {
  try {
    const { page = 1, itemsPerPage = 10 } = pagination
    
    const params = new URLSearchParams({
      page: page.toString(),
      itemsPerPage: itemsPerPage.toString()
    })

    console.log(`Fetching related articles for article ID ${articleId} with params:`, params.toString())
    
    const { data } = await api.get(`/Articles/${articleId}/Related?${params}`)
    
    console.log('Related articles API response:', {
      hasData: !!data,
      dataType: typeof data,
      isArray: Array.isArray(data),
      hasItems: data && 'Items' in data,
      hasRelatedArticles: data && 'RelatedArticles' in data,
      responseKeys: data ? Object.keys(data) : [],
      rawResponse: data
    })
    
    // Handle case where data is undefined or null
    if (!data) {
      console.warn('No data returned from related articles API')
      return {
        items: [],
        totalItems: 0,
        totalPages: 0,
        currentPage: page
      }
    }
    
    // Handle the specific response format with RelatedArticles array
    if (data.RelatedArticles && Array.isArray(data.RelatedArticles)) {
      console.log(`Processing RelatedArticles response with ${data.RelatedArticles.length} items`)
      const articles = data.RelatedArticles.map(transformArticle)
      
      return {
        items: articles,
        totalItems: data.TotalItems || articles.length,
        totalPages: data.TotalPages || Math.ceil(articles.length / itemsPerPage),
        currentPage: data.Page || page
      }
    }
    
    // Handle standard array response
    if (Array.isArray(data)) {
      console.log(`Processing array response with ${data.length} items`)
      const articles = data.map(transformArticle)
      const startIndex = (page - 1) * itemsPerPage
      const endIndex = Math.min(startIndex + itemsPerPage, articles.length)
      const paginatedArticles = articles.slice(startIndex, endIndex)
      
      return {
        items: paginatedArticles,
        totalItems: articles.length,
        totalPages: Math.ceil(articles.length / itemsPerPage),
        currentPage: page
      }
    } 
    
    // Handle standard object response with Items array
    if (data.Items && Array.isArray(data.Items)) {
      console.log(`Processing object response with ${data.Items.length} items`)
      const articles = data.Items.map(transformArticle)
      
      return {
        items: articles,
        totalItems: data.TotalItems || articles.length,
        totalPages: data.TotalPages || Math.ceil(articles.length / itemsPerPage),
        currentPage: data.CurrentPage || page
      }
    } else {
      // Handle unexpected data structure
      console.error('Unexpected data structure in getRelatedArticles:', data)
      return {
        items: [],
        totalItems: 0,
        totalPages: 0,
        currentPage: page
      }
    }
  } catch (error) {
    console.error('Error in getRelatedArticles:', error)
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        return {
          items: [],
          totalItems: 0,
          totalPages: 0,
          currentPage: pagination.page || 1
        }
      }
      throw new Error(
        (error.response?.data as ApiError)?.message ||
          "Có lỗi xảy ra khi tải Bài báo liên quan."
      )
    }
    throw error
  }
}

export async function summarizeArticle(articleId: number): Promise<string> {
  try {
    const { data } = await api.post(`/Articles/Summarize/${articleId}`)
    
    // Kiểm tra cấu trúc dữ liệu phản hồi
    if (data.text) {
      return data.text
    } else if (data.result && data.result.text) {
      return data.result.text
    } else if (typeof data === 'string') {
      return data
    } else {
      console.log('Cấu trúc phản hồi API tóm tắt:', data)
      return "Không thể tóm tắt Bài báo này."
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        (error.response?.data as ApiError)?.message ||
          "Có lỗi xảy ra khi tóm tắt Bài báo."
      )
    }
    throw error
  }
}

// User management functions
export async function getAllUsers(): Promise<any[]> {
  try {
    const user = await getCurrentUser()
    if (!user) throw new Error("Bạn chưa đăng nhập.")
    if (user.role.id !== 1) throw new Error("Bạn không có quyền thực hiện hành động này.")
    
    const { data } = await api.get('/Admin/AllUsers', {
      headers: {
        'Authentication': user.id.toString()    
      }
    })
    
    return data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        (error.response?.data as ApiError)?.message ||
          "Không thể tải danh sách người dùng. Vui lòng thử lại."
      )
    }
    throw error
  }
}

export async function deleteUsers(userIds: number[]): Promise<void> {
  try {
    const user = await getCurrentUser()
    if (!user) throw new Error("Bạn chưa đăng nhập.")
    if (user.role.id !== 1) throw new Error("Bạn không có quyền thực hiện hành động này.")
    
    await api.delete('/Admin/DeleteUsers', {
      headers: {
        'Authentication': user.id.toString(),
        'Content-Type': 'application/json'
      },
      data: userIds
    })
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        (error.response?.data as ApiError)?.message ||
          "Không thể xóa người dùng. Vui lòng thử lại."
      )
    }
    throw error
  }
}

export async function undeleteUsers(userIds: number[]): Promise<void> {
  try {
    const user = await getCurrentUser()
    if (!user) throw new Error("Bạn chưa đăng nhập.")
    if (user.role.id !== 1) throw new Error("Bạn không có quyền thực hiện hành động này.")
    
    await api.post('/Admin/UndeleteUsers', userIds, {
      headers: {
        'Authentication': user.id.toString()
      }
    })
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        (error.response?.data as ApiError)?.message ||
          "Không thể khôi phục người dùng. Vui lòng thử lại."
      )
    }
    throw error
  }
}

export async function updateUserRole(userId: number, roleId: number): Promise<void> {
  try {
    const user = await getCurrentUser()
    if (!user) throw new Error("Bạn chưa đăng nhập.")
    if (user.role.id !== 1) throw new Error("Bạn không có quyền thực hiện hành động này.")
    
    await api.put(`/Admin/UpdateUserRole/${userId}?role=${roleId}`, null, {
      headers: {
        'Authentication': user.id.toString()
      }
    })
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        (error.response?.data as ApiError)?.message ||
          "Không thể cập nhật vai trò người dùng. Vui lòng thử lại."
      )
    }
    throw error
  }
}

// Category management functions
export async function createCategory(data: { Name: string, Description?: string }): Promise<any> {
  try {
    const user = await getCurrentUser()
    if (!user) throw new Error("Bạn chưa đăng nhập.")
    if (user.role.id !== 1) throw new Error("Bạn không có quyền thực hiện hành động này.")
    
    const response = await api.post('/Categories', data, {
      headers: {
        'Authentication': user.id.toString()
      }
    })
    
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        (error.response?.data as ApiError)?.message ||
          "Không thể tạo danh mục. Vui lòng thử lại."
      )
    }
    throw error
  }
}

export async function deleteCategory(categoryId: number): Promise<any> {
  try {
    const user = await getCurrentUser()
    if (!user) throw new Error("Bạn chưa đăng nhập.")
    if (user.role.id !== 1) throw new Error("Bạn không có quyền thực hiện hành động này.")
    
    const response = await api.delete(`/Categories/${categoryId}`, {
      headers: {
        'Authentication': user.id.toString()
      }
    })
    
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        (error.response?.data as ApiError)?.message ||
          "Không thể xóa danh mục. Vui lòng thử lại."
      )
    }
    throw error
  }
}

export async function undeleteCategory(categoryId: number): Promise<any> {
  try {
    const user = await getCurrentUser()
    if (!user) throw new Error("Bạn chưa đăng nhập.")
    if (user.role.id !== 1) throw new Error("Bạn không có quyền thực hiện hành động này.")
    
    const response = await api.post(`/Categories/Undelete/${categoryId}`, null, {
      headers: {
        'Authentication': user.id.toString()
      }
    })
    
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        (error.response?.data as ApiError)?.message ||
          "Không thể khôi phục danh mục. Vui lòng thử lại."
      )
    }
    throw error
  }
}

export async function updateCategory(categoryId: number, data: { Name: string, Description?: string }): Promise<any> {
  try {
    const user = await getCurrentUser()
    if (!user) throw new Error("Bạn chưa đăng nhập.")
    if (user.role.id !== 1) throw new Error("Bạn không có quyền thực hiện hành động này.")
    
    const response = await api.put(`/Categories/Update/${categoryId}`, data, {
      headers: {
        'Authentication': user.id.toString()
      }
    })
    
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        (error.response?.data as ApiError)?.message ||
          "Không thể cập nhật danh mục. Vui lòng thử lại."
      )
    }
    throw error
  }
}

export async function getArticleById(id: number): Promise<ArticleDetail> {
  try {
    const { data } = await api.get(`/Articles/${id}/Detail`);
    return transformArticleDetail(data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        (error.response?.data as ApiError)?.message ||
          "Có lỗi xảy ra khi tải bài viết."
      );
    }
    throw error;
  }
}

