"use client";
import { useState } from "react";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "@/config/redux/reducer/authReducer";
import styles from "./style.module.css"; // Import CSS module

export default function NavbarComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();

  // Redux auth state
  const authState = useSelector((state) => state?.auth || {});
  const user = authState?.user || null;
  const loggedIn = authState?.loggedIn || false;

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarContainer}>
        
        {/* Logo */}
        <div className={styles.logo}>
          <Link href="/" style={{ color: "blue"}}>Connectly</Link>
        </div>

        {/* User Authentication Section */}
        <div className={styles.userSection}>
          {loggedIn && user ? (
            <div className={styles.userInfo}>
              <span className={styles.greeting}>
                Hey{" "}
                {user.userId?.name ||
                  user.userId?.username ||
                  user.name ||
                  user.username ||
                  "User"}
                !
              </span>
              <Link href="/login">
                <button
                  onClick={handleLogout}
                  className={styles.logoutButton}
                >
                  Logout
                </button>
              </Link>
            </div>
          ) : (
            <div className={styles.loginSection}>
              <Link href="/login" className={styles.loginLink}>
                Login
              </Link>
            </div>
          )}
        </div>

        {/* Hamburger Button */}
        <div
          className={`${styles.hamburger} ${isOpen ? styles.active : ""}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>

        {/* Menu */}
        <ul className={`${styles.menu} ${isOpen ? styles.active : ""}`}>
          {loggedIn && user && (
            <li>
              <Link
                href={`/view_profile/${user.userId?.username || user.username}`}
              >
                Profile
              </Link>
            </li>
          )}
          {/* <li>
            <Link href="/contact">Contact</Link>
          </li> */}
        </ul>
      </div>
    </nav>
  );
}
