import { Button, Card, CardBody } from "@heroui/react";
import { motion } from "framer-motion";
import { Home, Search, ArrowLeft, Film, Tv, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      rotate: [0, 5, -5, 0],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex items-center justify-center px-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="text-center max-w-2xl mx-auto"
      >
        {/* Floating Icons Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            variants={floatingVariants}
            animate="animate"
            className="absolute top-1/4 left-1/4 text-bg-tertiary"
          >
            <Film className="w-16 h-16" />
          </motion.div>
          <motion.div
            variants={floatingVariants}
            animate="animate"
            style={{ animationDelay: "2s" }}
            className="absolute top-1/3 right-1/4 text-bg-tertiary"
          >
            <Tv className="w-20 h-20" />
          </motion.div>
          <motion.div
            variants={floatingVariants}
            animate="animate"
            style={{ animationDelay: "4s" }}
            className="absolute bottom-1/4 left-1/3 text-bg-tertiary"
          >
            <Search className="w-12 h-12" />
          </motion.div>
        </div>

        {/* Error Icon */}
        <motion.div variants={itemVariants} className="relative z-10 mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-olive-drab rounded-full mb-6">
            <AlertTriangle className="w-12 h-12 text-floral-white" />
          </div>
        </motion.div>

        {/* Error Message */}
        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="text-6xl md:text-8xl font-bold mb-4 text-floral-white">
            404
          </h1>
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-text-secondary">
            Content Not Found
          </h2>
          <p className="text-lg text-text-tertiary mb-2">
            Oops! The page you're looking for seems to have wandered off into
            the digital void.
          </p>
          <p className="text-text-muted">
            Maybe it's binge-watching something else right now.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div variants={itemVariants}>
          <Card className="bg-bg-secondary border border-border-default rounded-2xl shadow-xl">
            <CardBody className="p-8">
              <h3 className="text-xl font-semibold mb-6 text-floral-white">
                What would you like to do?
              </h3>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  className="bg-olive-drab text-floral-white rounded-xl font-semibold shadow-lg hover:bg-olive-drab-hover w-full sm:w-auto"
                  size="lg"
                  startContent={<Home className="w-5 h-5" />}
                  onPress={() => navigate("/")}
                >
                  Go Home
                </Button>

                <Button
                  variant="bordered"
                  className="rounded-xl font-semibold w-full sm:w-auto border-border-default text-text-secondary hover:text-floral-white hover:border-border-hover"
                  size="lg"
                  startContent={<Search className="w-5 h-5" />}
                  onPress={() => navigate("/search")}
                >
                  Search Content
                </Button>

                <Button
                  variant="light"
                  size="lg"
                  startContent={<ArrowLeft className="w-5 h-5" />}
                  className="rounded-xl font-semibold text-text-tertiary hover:text-floral-white w-full sm:w-auto"
                  onPress={() => navigate(-1)}
                >
                  Go Back
                </Button>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Popular Suggestions */}
        <motion.div variants={itemVariants} className="mt-12 text-center">
          <p className="text-sm text-text-muted mb-4">
            Or explore these popular sections:
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              size="sm"
              variant="flat"
              className="rounded-lg text-text-tertiary hover:text-floral-white"
              onPress={() => navigate("/discover")}
            >
              Discover
            </Button>
            <Button
              size="sm"
              variant="flat"
              className="rounded-lg text-text-tertiary hover:text-floral-white"
              onPress={() => navigate("/watchlist")}
            >
              Watchlist
            </Button>
            <Button
              size="sm"
              variant="flat"
              className="rounded-lg text-text-tertiary hover:text-floral-white"
              onPress={() => navigate("/about")}
            >
              About
            </Button>
          </div>
        </motion.div>

        {/* Bottom Text */}
        <motion.div variants={itemVariants} className="mt-16 text-center">
          <p className="text-xs text-text-muted">
            Error Code: 404 • Page Not Found • Netflyer
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFound;
