export interface Article {
  id?: number
  title: string
  article: string
  thumbnail: string
  thumbnailSrc: string
  category: 'france' | 'international' | 'culture' | 'sport' | 'science' | 'laroche' | ''
  author: string
  date: string
  views?: number
  status: -2 | 2
}

