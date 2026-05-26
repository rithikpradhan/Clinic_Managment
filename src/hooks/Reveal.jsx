import { useInView } from "react-intersection-observer";
// import useInView from "./UseInView";

export default function Reveal({ children, delay = 0, className = "" }) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.05,
  });
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.65s ease ${delay}s, transform 0.65s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}
