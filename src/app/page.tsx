import Image from "next/image";
import styles from "./page.module.css";
import {
  useDynamicContext,
  DynamicWidget,
} from "@dynamic-labs/sdk-react-core";

import { MainPage } from "@/components/main-page/main-page";

export default function Home() {

  return (
    <div className={styles.page}>
     <main className={styles.main}>
     <MainPage />
      </main>
      <footer className={styles.footer}>
        <div className={styles.footer_content} >
        <p>&copy; 2024 Hack SF - EthGlobal.</p>

        </div>
      </footer>
    </div>
  );
}
