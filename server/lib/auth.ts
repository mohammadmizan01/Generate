import 'dotenv/config'
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma.js";


const trustedOrgin = process.env.TRUSTED_ORIGINS?.split(',') || []
export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql", 
    }),
    emailAndPassword: { 
    enabled: true, 
  },
  trustedOrgin,
  baseURL:process.env.BETTER_AUTH_URL!,
  secret:process.env.BETTER_AUTH_SECRET!,
  advanced:{
    cookies:{
        session_token:{
            name:'auth_session',
            attributes:{
                httpOnly:true,
                secure:process.env.NODE_ENV === 'production',
                sameSite:'none',
                path:'/',
            }
        }
    }
  }
});