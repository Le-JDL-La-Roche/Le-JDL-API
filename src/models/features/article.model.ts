export interface Article {
  id?: number
  title: string
  article: string
  thumbnail: string
  thumbnailSrc: string
  category: 'news' | 'culture' | 'sport' | 'sciences' | 'tech' | 'laroche' | ''
  author: string
  date: string
  views?: number
  status: -1 | 2
}
