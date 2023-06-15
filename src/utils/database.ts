import mysql, { RowDataPacket } from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

class DataBase {
  static db: mysql.Connection | false = false

  constructor() {
    this.connect()
  }

  private async connect() {
    if (!DataBase.db) {
      DataBase.db = await mysql.createConnection({
        host: 'localhost',
        user: process.env['DATABASE_USER'],
        password: process.env['DATABASE_PASSWORD'],
        database: 'lejdl'
      })

      try {
        await DataBase.db.connect()
        return DataBase.db
      } catch (error: any) {
        throw new Error(error)
      }
    } else {
      return DataBase.db
    }
  }

  /**
   * Make a query to the Database. **Use this function in a try/catch and with async/await!**
   * @param query The SQL query
   * @param values The values of the query
   * @returns The data or an error
   */
  async query<T>(query: string, values?: any | any[]): Promise<T & RowDataPacket[]> {
    if (!DataBase.db) {
      try {
        DataBase.db = await this.connect()
      } catch (error: any) {
        throw new Error(error)
      }
    }

    if (values) {
      try {
        return (await DataBase.db.query<T & RowDataPacket[]>(query, values))[0]
      } catch (error: any) {
        throw new Error(error)
      }
    } else {
      try {
        return (await DataBase.db.query<T & RowDataPacket[]>(query))[0]
      } catch (error: any) {
        throw new Error(error)
      }
    }
  }
}

export default new DataBase()
