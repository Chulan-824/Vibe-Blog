export interface Article {
  _id: string
  title: string
  content: string
  tag: string
  type?: string
  date: string
  surface?: string
  createTime: string
  updateTime: string
  views?: number
  likes?: number
  pv?: number
  comment?: { _id: string }[]
}

export interface ArticleInfo {
  tags: string[]
}

export interface ArticleListParams {
  skip: number
  limit: number
  tag?: string
}
