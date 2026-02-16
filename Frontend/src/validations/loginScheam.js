import * as Yup from "yup";

export const loginSchema = Yup.object({
    email : Yup.string().required("Email is required...").email("Invalid Email..."),
    password : Yup.string().min(4 , "Minimum 4 characters required...").required("Password required...")
});