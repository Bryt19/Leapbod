import { Link } from "react-router-dom";
import {
  HiBookOpen as BookOpen,
  HiHome,
  HiBriefcase,
  HiUser,
  HiPlusCircle,
  HiLogin,
  HiMail,
} from "react-icons/hi";
import { useAuth } from "../contexts/AuthContext";

const Footer = () => {
  const { user } = useAuth();

  return (
    <footer className="bg-card text-muted-foreground border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand & Description */}
          <div className="space-y-4">
            <div className="flex items-center">
              <BookOpen className="w-8 h-8 text-primary mr-2" />
              <span className="text-xl font-bold text-foreground">Leapbod</span>
            </div>
            <p className="text-sm leading-relaxed">
              Connect with opportunities that matter. Discover internships, scholarships, 
              competitions, events, jobs, and research positions all in one place.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-foreground font-semibold mb-4 text-sm uppercase tracking-wide">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/"
                  className="flex items-center text-sm hover:text-primary transition-colors"
                >
                  <HiHome className="w-4 h-4 mr-2" />
                  Home
                </Link>
              </li>
              {user ? (
                <>
                  <li>
                    <Link
                      to="/opportunities"
                      className="flex items-center text-sm hover:text-primary transition-colors"
                    >
                      <HiBriefcase className="w-4 h-4 mr-2" />
                      Opportunities
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/dashboard"
                      className="flex items-center text-sm hover:text-primary transition-colors"
                    >
                      <HiUser className="w-4 h-4 mr-2" />
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/submit"
                      className="flex items-center text-sm hover:text-primary transition-colors"
                    >
                      <HiPlusCircle className="w-4 h-4 mr-2" />
                      Submit Opportunity
                    </Link>
                  </li>
                </>
              ) : (
                <li>
                  <Link
                    to="/auth/login"
                    className="flex items-center text-sm hover:text-primary transition-colors"
                  >
                    <HiLogin className="w-4 h-4 mr-2" />
                    Sign In
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-foreground font-semibold mb-4 text-sm uppercase tracking-wide">
              Categories
            </h3>
            <ul className="space-y-2">
              <li className="text-sm">Internships</li>
              <li className="text-sm">Scholarships</li>
              <li className="text-sm">Competitions</li>
              <li className="text-sm">Events</li>
              <li className="text-sm">Jobs</li>
              <li className="text-sm">Research</li>
            </ul>
          </div>

          {/* Contact & Info */}
          <div>
            <h3 className="text-foreground font-semibold mb-4 text-sm uppercase tracking-wide">
              Get in Touch
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start text-sm">
                <HiMail className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>
                  <a
                    href="mailto:leapboard5@gmail.com"
                    className="hover:text-primary transition-colors"
                  >
                    leapboard5@gmail.com
                  </a>
                </span>
              </li>
              <li className="text-sm">
                <p className="leading-relaxed">
                  Have questions or want to submit an opportunity? 
                  We'd love to hear from you.
                </p>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm mb-4 md:mb-0">
              © {new Date().getFullYear()} Leapbod. All rights reserved.
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">
                Empowering students with opportunities
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
