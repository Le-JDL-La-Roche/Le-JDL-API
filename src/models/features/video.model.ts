export interface Video {
  id?: number
  title: string
  description: string
  miniature: string
  videoId: string
  type: 'youtube' | 'instagram'
  category: 'news' | 'culture' | 'sport' | 'science' | 'tech' | 'laroche'
  date: string
}
