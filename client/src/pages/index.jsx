import styles from "@/styles/Home.module.css";
import { useRouter } from "next/router";
import UserLayout from "@/layout/userLayout";

export default function Home() {
  const router = useRouter();
  return (
    <UserLayout>
      <div className={styles.container}>
        <div className={styles.mainContainer}>
          <div>
            <h1 className={styles.heading}>Connect with Professionals</h1>
            <p className={styles.subtext}>
              Grow your network and unlock opportunities.
            </p>

            <button
              onClick={() => router.push("/login")}
              className={styles.buttonJoin}
            >
              Join Now
            </button>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
