import Loading from "../components/Loading";
import { auth, db } from "../services/Firebase";
import axios from "axios";
import Filter from "bad-words";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { createToast } from "vercel-toast";
import { BACKEND_URL } from "../services/Api";
import { Input, Button, Card } from "@heroui/react";
import { motion } from "framer-motion";
import { UserPlus } from "lucide-react";

const checkForBadWords = (text) => {
  const filter = new Filter();
  return filter.isProfane(text);
};

const fetchBackdrop = async () => {
  try {
    const { data } = await axios.get(
      `${BACKEND_URL}/api/backdrop/movie/27205`
    );
    return `https://image.tmdb.org/t/p/original${data.backdrops[9].file_path}`;
  } catch (error) {
    console.error("Error fetching backdrop:", error);
    return "";
  }
};

const SignUp = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [backdrop, setBackdrop] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [_, backdropUrl] = await Promise.all([
          new Promise((resolve) => {
            const unsubscribe = onAuthStateChanged(auth, (user) => {
              if (user) navigate("/");
              else setLoading(false);
              unsubscribe();
              resolve();
            });
          }),
          fetchBackdrop(),
        ]);
        setBackdrop(backdropUrl);
        const params = new URLSearchParams(location.search);
        if (params.get("verified") === "true") {
          createToast("Your email has been verified.", {
            cancel: "Cancel",
            timeout: 3000,
            type: "success",
          });
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };
    fetchInitialData();
  }, [navigate, location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    if (!username || !email || !password) {
      setFormLoading(false);
      return createToast("Please fill in all the fields.", {
        cancel: "Cancel",
        timeout: 3000,
        type: "error",
      });
    }

    if (checkForBadWords(username) || checkForBadWords(email)) {
      setFormLoading(false);
      return createToast(
        "Your username or email contains inappropriate words.",
        { cancel: "Cancel", timeout: 3000, type: "error" }
      );
    }

    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCred.user;

      const colRef = doc(db, "users", user.uid);
      await setDoc(colRef, {
        username: username,
        email: user.email,
        createdAt: new Date().toISOString(),
      });

      await sendEmailVerification(user, {
        url: `${import.meta.env.VITE_WEBSITE_URL}/signup?verified=true`,
      });

      createToast("We have sent you an email for verification.", {
        cancel: "Hide",
        timeout: 3000,
        type: "success",
      });
    } catch (error) {
      handleSignUpError(error);
    } finally {
      setFormLoading(false);
    }
  };


  const handleSignUpError = (error) => {
    if (error.message.includes("email-already-in-use")) {
      createToast("The email is already in use.", {
        action: {
          text: "Login",
          callback(toast) {
            navigate("/login");
            toast.destroy();
          },
        },
        timeout: 3000,
        cancel: "Cancel",
        type: "dark",
      });
    } else {
      createToast(error.message, {
        cancel: "Cancel",
        timeout: 3000,
        type: "error",
      });
    }
  };

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <div
          className="relative flex items-center justify-center min-h-screen bg-black"
          style={{
            backgroundImage: `url(${backdrop})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md"></div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 w-full max-w-md px-6"
          >
            <Card className="bg-zinc-900/80 border border-zinc-800 rounded-2xl shadow-2xl p-8">
              <div className="flex flex-col items-center text-center">
                <UserPlus className="text-blue-400 h-10 w-10 mb-3" />
                <h1 className="text-3xl font-bold text-white mb-6">Sign Up</h1>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <Input
                  type="text"
                  variant="flat"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="text-white"
                  radius="lg"
                  isRequired
                />
                <Input
                  type="email"
                  variant="flat"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="text-white"
                  radius="lg"
                  isRequired
                />
                <Input
                  type="password"
                  variant="flat"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="text-white"
                  radius="lg"
                  isRequired
                />
                <Button
                  type="submit"
                  color="primary"
                  className="w-full rounded-lg text-md font-semibold shadow-md"
                  isLoading={formLoading}
                >
                  {formLoading ? "Signing Up..." : "Sign Up"}
                </Button>
              </form>

              <p className="text-zinc-400 text-sm mt-6 text-center">
                Already have an account?{" "}
                <Link to="/login" className="text-blue-400 hover:underline">
                  Login
                </Link>
              </p>
            </Card>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default SignUp;
