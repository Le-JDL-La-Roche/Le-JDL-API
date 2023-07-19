import swaggerJSDoc from 'swagger-jsdoc'

const options: swaggerJSDoc.OAS3Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Le JDL API',
      version: '2.0.0',
      description: 'API du Blog du JDL',
      license: {
        name: 'GPL-3.0-or-later'
      }
    },
    servers: [
      {
        url: '/',
        description: "Racine de l'API"
      }
    ],
    components: {
      securitySchemes: {
        basic: {
          type: 'http',
          scheme: 'basic'
        },
        bearer: {
          type: 'http',
          scheme: 'bearer'
        }
      }
    },
    tags: [{ name: 'Auth' }, { name: 'Environnement' }, { name: 'Webradio' }, { name: 'Videos' }, { name: 'Articles' }, { name: 'Authorizations' }]
  },
  apis: ['./src/routers/*.ts', './build/src/routers/*.js']
}

export default swaggerJSDoc(options)
