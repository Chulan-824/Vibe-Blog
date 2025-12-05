import { request } from './index'
import type { Article, ArticleListParams, ArticleInfo } from '@/types/article'
import type { ApiResponse, ListResponse } from '@/types/api'

export const getArticleInfo = () => {
  return request<ApiResponse<ArticleInfo>>('/articles/info', { method: 'GET' })
}

export const getArticleHot = (limit = 8) => {
  return request<ListResponse<Article>>('/articles/hot', {
    method: 'GET',
    query: { limit },
  })
}

export const getArticleShow = (params: ArticleListParams) => {
  return request<ListResponse<Article>>('/articles', {
    method: 'GET',
    query: params,
  })
}

export const getArticleById = (id: string) => {
  return request<ApiResponse<Article>>(`/articles/${id}`, { method: 'GET' })
}

export const getArticleExtend = (tag: string) => {
  return request<ListResponse<Article>>('/articles/extend', {
    method: 'GET',
    query: { tag },
  })
}

export const searchArticle = (keywords: string) => {
  return request<ListResponse<Article>>('/articles/search', {
    method: 'GET',
    query: { q: keywords },
  })
}
