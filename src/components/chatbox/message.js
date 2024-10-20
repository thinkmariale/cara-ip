import styles from "./chatbox.module.css"

export default function Message({
  sender,
  shouldFillWidth = false,
  isSameSender = false,
  children,
}) {
  return (
    <div className={styles.messageContainer}>
      <div className={ styles.messageInfo}>
        {children}
      </div>
    </div>
  );
}
