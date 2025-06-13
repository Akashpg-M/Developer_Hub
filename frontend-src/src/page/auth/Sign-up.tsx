import { Link, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { loginMutationFn } from "../../lib/api";
import { Loader } from "lucide-react";

const SignUp = () => {
  const navigate = useNavigate();

  const { mutate, isPending } = useMutation({
    mutationFn: loginMutationFn,
  });

  const formSchema = z.object({
    name: z.string().trim().min(1, {
      message: "Name is required",
    }),
    email: z.string().trim().email("Invalid email address").min(1, {
      message: "Email is required",
    }),
    password: z.string().trim().min(1, {
      message: "Password is required",
    }),
  });

  type FormValues = z.infer<typeof formSchema>;

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: FormValues) => {
    if (isPending) return;

    mutate(values, {
      onSuccess: () => {
        navigate("/");
      },
      onError: (error: Error) => {
        console.error("Sign up error:", error.message);
      },
    });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gray-100 p-6">
      <div className="w-full max-w-md flex flex-col gap-6">
        <Link to="/" className="flex items-center gap-2 self-center font-medium text-xl">
          Team Sync
        </Link>
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold">Create an account</h2>
            <p className="text-gray-600 mt-2">Sign up with your Email or Google account</p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <button
                type="button"
                className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-md py-2 px-4 hover:bg-gray-50"
              >
                Sign up with Google
              </button>
            </div>
            <div className="relative text-center">
              <span className="relative z-10 bg-white px-2 text-gray-500 text-sm">
                Or continue with
              </span>
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  {...register("name")}
                  className="mt-1 w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="John Doe"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  {...register("email")}
                  className="mt-1 w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="m@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  {...register("password")}
                  className="mt-1 w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-blue-600 text-white rounded-md py-2 px-4 hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isPending && <Loader className="animate-spin h-5 w-5" />}
                Sign up
              </button>
            </div>
            <div className="text-center text-sm">
              Already have an account?{" "}
              <Link to="/" className="text-blue-600 hover:underline">
                Sign in
              </Link>
            </div>
          </form>
          <div className="text-center text-xs text-gray-500 mt-4">
            By clicking continue, you agree to our{" "}
            <a href="#" className="underline hover:text-blue-600">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="underline hover:text-blue-600">
              Privacy Policy
            </a>.
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
