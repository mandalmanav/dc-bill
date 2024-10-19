import Image from "next/image";
import styles from "./page.module.css";
import CreateBill from "./components/CreateBill";

export default function Home() {
  return (
    <div className={styles.page}>
    <CreateBill />
    </div>
  );
}
