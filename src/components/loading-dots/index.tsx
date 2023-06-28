import styles from "./loading-dots.module.css"

const LoadingDots = ({
  color = "#fff",
  style = "small",
}: {
  color?: string
  style?: string
}) => {
  return (
    <span className={style == "small" ? styles.loading2 : styles.loading}>
      <span style={{ backgroundColor: color }} />
      <span style={{ backgroundColor: color }} />
      <span style={{ backgroundColor: color }} />
    </span>
  )
}

export default LoadingDots

LoadingDots.defaultProps = {
  style: "small",
}
