"use server"

import { getFeaturedArticles } from "@/lib/api"

export async function fetchFeaturedArticles(page: number) {
  try {
    console.log('Fetching featured articles:', { page })
    const result = await getFeaturedArticles({ page, itemsPerPage: 9 })
    
    console.log('Featured articles response:', {
      hasData: !!result,
      itemCount: result?.items?.length || 0
    })
    
    return {
      items: result.items || [],
      totalItems: result.totalItems || 0,
      totalPages: result.totalPages || 1,
      currentPage: page
    }
  } catch (err) {
    const error = err as Error
    console.error('Error fetching featured articles:', {
      message: error?.message || 'Unknown error',
      stack: error?.stack
    })
    
    // Return empty state on error
    return {
      items: [],
      totalItems: 0,
      totalPages: 1,
      currentPage: page
    }
  }
} 