import mysql, { RowDataPacket } from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config({ path: `${__dirname}/../../.env` })

class DataBase {
  static db: mysql.Pool = mysql.createPool({
    host: 'localhost',
    user: process.env['DATABASE_USER'],
    password: process.env['DATABASE_PASSWORD'],
    database: 'lejdl'
  })

  /**
   * Make a query to the Database. **Use this function in a try/catch and with async/await!**
   * @param query The SQL query
   * @param values The values of the query
   * @returns The data or an error
   */
  async query<T>(query: string, values?: any | any[]): Promise<T & RowDataPacket[]> {
    if (values) {
      try {
        return this.keysToCamel((await DataBase.db.query<T & RowDataPacket[]>(query, values))[0])
      } catch (error: any) {
        throw new Error(error)
      }
    } else {
      try {
        return this.keysToCamel((await DataBase.db.query<T & RowDataPacket[]>(query))[0])
      } catch (error: any) {
        throw new Error(error)
      }
    }
  }

  private keysToCamel(o: any) {
    if (this.isObject(o)) {
      const n: any = {}

      Object.keys(o).forEach((k) => {
        n[this.toCamel(k)] = this.keysToCamel(o[k])
      })

      return n
    } else if (this.isArray(o)) {
      return o.map((i: any) => {
        return this.keysToCamel(i)
      })
    }

    return o
  }

  private toCamel(s: any) {
    return s.replace(/([-_][a-z])/gi, ($1: string) => {
      return $1.toUpperCase().replace('-', '').replace('_', '')
    })
  }

  private isObject(o: any) {
    return o === Object(o) && !this.isArray(o) && typeof o !== 'function'
  }

  private isArray(a: any) {
    return Array.isArray(a)
  }
}

export default new DataBase()
