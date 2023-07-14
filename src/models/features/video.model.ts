export interface Video {
  id?: number
  title: string
  description: string
  thumbnail: string
  videoId: string
  type: 'youtube' | 'instagram' | ''
  category: 'news' | 'culture' | 'sport' | 'science' | 'tech' | 'laroche' | ''
  author: string
  date: string
  status: -1 | 2
}
