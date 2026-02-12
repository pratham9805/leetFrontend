import { useForm } from "react-hook-form"

function Signup(){

     const { register, handleSubmit,formState: { errors },
  } = useForm()
    return(
         <form onSubmit={handleSubmit((data)=>console.log(data))} className="flex flex-col min-h-screen h-100%">

            <input {...register('firstName')} placeholder="Enter Name: "></input>
            <input {...register('email')} placeholder="Enter Email"></input>
            <input {...register('password')} placeholder="Enter Password"></input>
            <button className="btn btn-lg" type="submit">Submit</button>
         </form>
    )
}

export default Signup;