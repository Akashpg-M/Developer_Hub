// import Logo from "../../components/logo";
// import { Link, useNavigate } from "react-router-dom";

// const GoogleOAuthFailure = () => {
//   const navigate = useNavigate();

//   return (
//     <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
//       <div className="flex w-full max-w-sm flex-col gap-6">
//         <Link
//           to="/"
//           className="flex items-center gap-2 self-center font-medium"
//         >
//           <Logo />
//           Team Sync.
//         </Link>
//         <div className="flex flex-col gap-6"></div>
//       </div>
//       <Card>
//         <CardContent>
//           <div style={{ textAlign: "center", marginTop: "50px" }}>
//             <h1>Authentication Failed</h1>
//             <p>We couldn't sign you in with Google. Please try again.</p>

//             <Button onClick={() => navigate("/")} style={{ marginTop: "20px" }}>
//               Back to Login
//             </Button>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default GoogleOAuthFailure;


import { Link, useNavigate } from "react-router-dom";

const GoogleOAuthFailure = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gray-100 p-6">
      <div className="w-full max-w-md flex flex-col gap-6">
        <Link to="/" className="flex items-center gap-2 self-center font-medium text-xl">
          Team Sync
        </Link>
        <div className="bg-white shadow-md rounded-lg p-6 text-center mt-12">
          <h1 className="text-2xl font-bold">Authentication Failed</h1>
          <p className="text-gray-600 mt-2">We couldn't sign you in with Google. Please try again.</p>
          <button
            onClick={() => navigate("/")}
            className="mt-5 w-full bg-blue-600 text-white rounded-md py-2 px-4 hover:bg-blue-700"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoogleOAuthFailure;