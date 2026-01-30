import Loading from "../components/Loading";
import { BACKEND_URL } from "../services/Api";
import { auth, db } from "../services/Firebase";
import { Input, Button, Card } from "@heroui/react";
import axios from "axios";
import Filter from "bad-words";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { motion } from "framer-motion";
import { UserPlus, Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { createToast } from "vercel-toast";

const checkForBadWords = (text) => {
  const filter = new Filter();
  return filter.isProfane(text);
};

const fetchBackdrop = async () => {
  try {
    const { data } = await axios.get(`${BACKEND_URL}/api/backdrop/movie/27205`);
    return `https://image.tmdb.org/t/p/w1280${data.backdrops[9].file_path}`;
  } catch (error) {
    console.error("Error fetching backdrop:", error);
    return "";
  }
};

const SignUp = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [backdrop, setBackdrop] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const toggleVisibility = () => setIsVisible((prev) => !prev);

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

    if (password.length < 6) {
      setFormLoading(false);
      return createToast("Password must be at least 6 characters.", {
        cancel: "Cancel",
        timeout: 3000,
        type: "error",
      });
    }

    try {
      const userCred = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
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

      setUsername("");
      setEmail("");
      setPassword("");
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
          className="relative flex items-center justify-center min-h-screen bg-bg-primary"
          style={{
            backgroundImage: backdrop ? `url(${backdrop})` : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {backdrop && (
            <div className="absolute inset-0 bg-bg-primary/80 backdrop-blur-md"></div>
          )}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 w-full max-w-md px-6"
          >
            <Card className="bg-bg-secondary border border-border-default rounded-2xl shadow-2xl p-8">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-olive-drab rounded-full flex items-center justify-center mb-3">
                  <UserPlus className="text-floral-white h-6 w-6" />
                </div>
                <h1 className="text-3xl font-bold text-floral-white mb-2">
                  Create Account
                </h1>
                <p className="text-text-tertiary">Join Netflyer today</p>
              </div>

              <form className="space-y-5 mt-6" onSubmit={handleSubmit}>
                <Input
                  type="text"
                  variant="bordered"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  classNames={{
                    input: "text-floral-white",
                    inputWrapper:
                      "bg-bg-tertiary border-border-default hover:border-border-hover",
                  }}
                  radius="lg"
                  isRequired
                />
                <Input
                  type="email"
                  variant="bordered"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  classNames={{
                    input: "text-floral-white",
                    inputWrapper:
                      "bg-bg-tertiary border-border-default hover:border-border-hover",
                  }}
                  radius="lg"
                  isRequired
                />
                <div className="relative">
                  <Input
                    type={isVisible ? "text" : "password"}
                    variant="bordered"
                    placeholder="Password (min 6 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    classNames={{
                      input: "text-floral-white",
                      inputWrapper:
                        "bg-bg-tertiary border-border-default hover:border-border-hover",
                    }}
                    radius="lg"
                    isRequired
                  />
                  <button
                    type="button"
                    onClick={toggleVisibility}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-floral-white transition-colors"
                  >
                    {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <Button
                  type="submit"
                  className="w-full rounded-xl text-md font-semibold bg-olive-drab text-floral-white hover:bg-olive-drab-hover"
                  isLoading={formLoading}
                >
                  {formLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>

              <p className="text-text-tertiary text-sm mt-6 text-center">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-bone hover:text-bone-hover underline-offset-2 hover:underline transition-all"
                >
                  Sign in
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
