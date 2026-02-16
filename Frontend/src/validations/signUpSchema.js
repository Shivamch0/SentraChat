import * as Yup from "yup";

export const signUpSchema = Yup.object({
    fullName : Yup.string().required("Full Name required..."),
    userName : Yup.string().required("User Name required...").min(3 , "Minimum 3 characters required..."),
    email : Yup.string().required("Email is required...").email("Invalid Email..."),
    password : Yup.string().min(4 , "Minimum 4 characters required...").required("Password required...")
})