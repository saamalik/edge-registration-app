import { useEffect, useState } from "react";

export default function useSSR() {
  // https://github.com/vercel/next.js/discussions/35773#discussioncomment-2485078
  // the hydration fails for the image from the localStorage
  const [isSSR, setIsSSR] = useState(true);

  useEffect(() => {
    setIsSSR(false);
  }, []);

  return isSSR;
}
