import axios from "axios";
import React from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthProvider";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function Login() {
  const [authUser, setAuthUser] = useAuth();
      const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    const userInfo = {
      identifier: data.identifier, // can be email or phone
      password: data.password,
    };

    try {
      const response = await axios.post(`http://localhost:7000/api/v1/users/login`, userInfo
        ,
         { withCredentials: true } 
      );

      if (response.data) {
        toast.success("Login successful");
        localStorage.setItem("ChatApp", JSON.stringify(response.data));
        //console.log("This is res:",response.data);
        setAuthUser(response.data);
        toast.success("User login done")
       // console.log("This is auth:",authUser);
        navigate("/chat-page")
        
        

      }
    } catch (error) {
      console.log(error);
      if (error.response) {
        toast.error("Error: " + error.response.data.error);
      } else {
        toast.error("Something went wrong. Try again!");
      }
    }
  };

  return (
    <div className="flex h-screen items-center justify-center">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="border border-black px-6 py-4 rounded-md space-y-4 w-96"
      >
        <h1 className="text-2xl text-blue-600 font-bold text-center">
          Messenger
        </h1>
        <h2 className="text-lg text-center">
          Login with your{" "}
          <span className="text-blue-600 font-semibold">Account</span>
        </h2>

        {/* Identifier (Email or Phone) */}
        <label className="input input-bordered flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="w-4 h-4 opacity-70"
          >
            <path d="M2 2h12v12H2z" />
          </svg>
          <input
            type="text"
            className="grow"
            placeholder="Email or Phone Number"
            {...register("identifier", { required: true })}
          />
        </label>
        {errors.identifier && (
          <span className="text-red-500 text-sm font-semibold">
            This field is required
          </span>
        )}

        {/* Password */}
        <label className="input input-bordered flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="w-4 h-4 opacity-70"
          >
            <path
              fillRule="evenodd"
              d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z"
              clipRule="evenodd"
            />
          </svg>
          <input
            type="password"
            className="grow"
            placeholder="Password"
            {...register("password", { required: true })}
          />
        </label>
        {errors.password && (
          <span className="text-red-500 text-sm font-semibold">
            This field is required
          </span>
        )}

        {/* Login Button */}
        <div className="flex justify-center">
          <input
            type="submit"
            value="Login"
            className="text-white bg-blue-600 cursor-pointer w-full rounded-lg py-2"
          />
        </div>

        <p className="text-center">
          Don't have an account?{" "}
          <Link
            to={"/"}
            className=" underline text-green-300 cursor-pointer ml-1"
          >
            Signup
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
