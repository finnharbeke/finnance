import { RefObject, useLayoutEffect, useState } from "react";

// thanks robin; https://www.robinwieruch.de/react-custom-hook-check-if-overflow/

export const useIsOverflow = (ref: RefObject<HTMLDivElement>, callback?: (isOverflow: boolean) => void) => {
    const [isOverflow, setIsOverflow] = useState(undefined);
  
    useLayoutEffect(() => {
      const { current } = ref;
  
      const trigger = () => {
        const hasOverflow = current.scrollWidth > current.clientWidth;
  
        setIsOverflow(hasOverflow);
  
        if (callback) callback(hasOverflow);
      };
  
      if (current) {
        trigger();
      }
    }, [callback, ref]);
  
    return isOverflow;
  }