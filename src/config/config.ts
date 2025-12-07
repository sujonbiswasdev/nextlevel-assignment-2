import dotenv from 'dotenv'
import path from 'path'
dotenv.config({path:path.join(process.cwd(),'.env')})
const config={
    port:process.env.PORT,
    db_url:process.env.DATABASE_URL,
    jwt_secret:process.env.JWT_SECRET
}
export default config