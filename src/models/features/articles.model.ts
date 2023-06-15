interface Article {
  id?: number
  title: string
  article: string
  background: string
  backgroundSrc: string
  category: 'news' | 'culture' | 'sport' | 'sciences' | 'tech' | 'laroche'
  author: string
  date: string
  views: number
}
