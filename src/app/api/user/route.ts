import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";
import { NextResponse } from "next/server";
import z from "zod"

//Defining the schema for the input validation.

const userSchema = z
  .object({
    username: z.string().min(1, 'Username is required').max(100),
    email: z.string().min(1, 'Email is required').email('Invalid email'),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must have than 8 characters'),
  })

const prisma = new PrismaClient();

export async function POST(req : Request){
    try {
        const body = await req.json();
        const {username,email,password} = userSchema.parse(body);
        
        //checking if email already exists
        const existingUserByEmail= await prisma.user.findUnique({
            where: {email:email}
        });
        if(existingUserByEmail){
            return NextResponse.json({user:null, message:"User with this email already exists"},{status:409})
        }

        //checking if username already exists
        const existingUserByUsername = await prisma.user.findUnique({
            where: {username : username}
        });
        if(existingUserByUsername){
            return NextResponse.json({user:null , message:"User with this username already exists"}, {status: 409})
        }

        const hasedPassword = await hash(password,10)
        const newUser = await prisma.user.create({
            data:{
                username,
                email,
                password: hasedPassword  
            }
        });

        const {password: newUserPassword, ...rest} = newUser
        return NextResponse.json({user: rest , message: "User created successfully"},{status:201});
    } catch (error) {
        return NextResponse.json({message: "something went wrong!"},{status:500});
        
    }
}