import { RefObject, useEffect, useState } from "react";

// thanks robin; https://www.robinwieruch.de/react-custom-hook-check-if-overflow/

export const useIsOverflow = (ref: RefObject<HTMLDivElement>, trigger?: any) => {
    const [isOverflow, setIsOverflow] = useState(false);
  
    useEffect(() => {
      const { current } = ref;
  
      const update = () => {
        const hasOverflow = current === null ?
          false
          :
          current.scrollWidth > current.clientWidth;
  
        setIsOverflow(hasOverflow);
      };
  
      if (current) {
        update();
      }
    }, [trigger, ref]);
  
    return isOverflow;
  }