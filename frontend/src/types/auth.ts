export interface User {
  _id: string
  user: string
  avatar?: string
}

export interface LoginParams {
  user: string
  pwd: string
}

export interface RegisterParams {
  user: string
  pwd: string
  svgCode: string
}
