import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();
export async function POST(req : Request){
    try {
        const body = await req.json();
        const {username,email,password} = body;
        
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
        
    }
}