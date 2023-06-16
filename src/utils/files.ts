import multer from 'multer'

class Files {
  webradio = multer.diskStorage({
    destination: (req, file, next) => {
      next(null, './public/images/posters/')
    },
    filename: async (req, file, next) => {
      if (!file) {
        next (new Error('No file'), '')
      }
      next(null, 'webradio' + this.generateFileName(file))
    }
  })

  private generateFileName(file: Express.Multer.File): string {
    const uniqueSuffix = Date.now().toString(16)    
    const fileExtension = file.originalname.split('.').pop()
    return `-${uniqueSuffix}.${fileExtension}`
  }
}

export default new Files()
