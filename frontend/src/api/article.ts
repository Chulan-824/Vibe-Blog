import { request } from './index'
import type { Article, ArticleListParams, ArticleInfo } from '@/types/article'

export const getArticleInfo = () => {
  return request<ArticleInfo>('/article/getInfo', { method: 'POST' })
}

export const getArticleHot = (limit = 8) => {
  return request<Article[]>('/article/getHot', { method: 'POST', body: { limit } })
}

export const getArticleShow = (params: ArticleListParams) => {
  return request<Article[]>('/article/getShow', { method: 'POST', body: params })
}

export const getArticleById = (id: string) => {
  return request<Article>('/article', { method: 'POST', body: { _id: id } })
}

export const getArticleExtend = (tag: string) => {
  return request<Article[]>('/article/extend', { method: 'POST', body: { tag } })
}

export const searchArticle = (keywords: string) => {
  return request<Article[]>('/article/search', { method: 'POST', body: { keywords } })
}
