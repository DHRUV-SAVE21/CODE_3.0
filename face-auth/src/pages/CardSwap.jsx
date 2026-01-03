import React, { Children, cloneElement, forwardRef, isValidElement, useEffect, useMemo, useRef } from 'react';
import './CardSwap.css';

// Card Component
export const Card = forwardRef(({ className = '', children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`card ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

// CardSwap Component
const CardSwap = ({
  width = 400,
  height = 300,
  cardDistance = 50,
  verticalDistance = 60,
  delay = 4000,
  pauseOnHover = true,
  onCardClick,
  onSwap,
  onSwapStart,
  skewAmount = 6,
  easing = 'elastic',
  children
}) => {
  const childArr = useMemo(() => Children.toArray(children), [children]);
  const refs = useMemo(() => 
    childArr.map(() => React.createRef()),
    [childArr.length]
  );
  
  const order = useRef(Array.from({ length: childArr.length }, (_, i) => i));
  const animationRef = useRef(null);
  const intervalRef = useRef(null);
  const containerRef = useRef(null);

  // Create slot positions
  const makeSlot = (i, distX, distY, total) => ({
    x: i * distX,
    y: -i * distY,
    z: -i * distX * 1.5,
    zIndex: total - i
  });

  // Set initial positions using CSS transforms
  const placeNow = (el, slot, skew) => {
    if (!el) return;
    
    el.style.transform = `
      translate(-50%, -50%) 
      translate3d(${slot.x}px, ${slot.y}px, ${slot.z}px) 
      skewY(${skew}deg)
    `;
    el.style.zIndex = slot.zIndex;
    el.style.willChange = 'transform';
    el.style.backfaceVisibility = 'hidden';
    el.style.transformStyle = 'preserve-3d';
  };

  // Animate element to new position
  const animateTo = (el, slot, duration, onComplete) => {
    if (!el) return;
    
    el.style.transition = `all ${duration}s cubic-bezier(0.4, 0, 0.2, 1)`;
    el.style.transform = `
      translate(-50%, -50%) 
      translate3d(${slot.x}px, ${slot.y}px, ${slot.z}px) 
      skewY(${skewAmount}deg)
    `;
    el.style.zIndex = slot.zIndex;
    
    if (onComplete) {
      setTimeout(onComplete, duration * 1000);
    }
  };

  // Swap cards animation
  const swapCards = () => {
    if (order.current.length < 2) return;

    const [front, ...rest] = order.current;
    const elFront = refs[front].current;
    
    // Notify parent that swap is starting (old card leaving)
    if (onSwapStart) {
      onSwapStart();
    }

    // Move front card down
    elFront.style.transition = `all 0.8s cubic-bezier(0.4, 0, 0.2, 1)`;
    elFront.style.transform = `
      translate(-50%, -50%) 
      translate3d(${order.current[0] * cardDistance}px, ${500}px, ${-order.current[0] * cardDistance * 1.5}px) 
      skewY(${skewAmount}deg)
    `;

    // Move other cards forward
    setTimeout(() => {
      // Notify parent about the new active card (which is rest[0])
      if (onSwap) {
        onSwap(rest[0]);
      }

      rest.forEach((idx, i) => {
        const el = refs[idx].current;
        const slot = makeSlot(i, cardDistance, verticalDistance, refs.length);
        animateTo(el, slot, 0.8);
      });

      // Move front card to back
      setTimeout(() => {
        const backSlot = makeSlot(refs.length - 1, cardDistance, verticalDistance, refs.length);
        elFront.style.zIndex = backSlot.zIndex;
        animateTo(elFront, backSlot, 0.8, () => {
          // Update order
          order.current = [...rest, front];
        });
      }, 300);
    }, 500);
  };

  // Initialize
  useEffect(() => {
    const total = refs.length;
    
    // Set initial positions
    refs.forEach((r, i) => {
      if (r.current) {
        placeNow(r.current, makeSlot(i, cardDistance, verticalDistance, total), skewAmount);
      }
    });

    // Start animation
    setTimeout(() => {
      swapCards();
    }, 1000);

    // Set up interval
    intervalRef.current = setInterval(swapCards, delay);

    // Pause on hover
    if (pauseOnHover && containerRef.current) {
      const container = containerRef.current;
      const pause = () => {
        clearInterval(intervalRef.current);
        // Pause all transitions
        refs.forEach(r => {
          if (r.current) {
            r.current.style.transition = 'none';
          }
        });
      };
      
      const resume = () => {
        // Resume transitions
        refs.forEach(r => {
          if (r.current) {
            r.current.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
          }
        });
        swapCards();
        intervalRef.current = setInterval(swapCards, delay);
      };
      
      container.addEventListener('mouseenter', pause);
      container.addEventListener('mouseleave', resume);
      
      return () => {
        container.removeEventListener('mouseenter', pause);
        container.removeEventListener('mouseleave', resume);
        clearInterval(intervalRef.current);
      };
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [cardDistance, verticalDistance, delay, pauseOnHover, skewAmount]);

  // Clone children with refs
  const rendered = childArr.map((child, i) => {
    if (isValidElement(child)) {
      return cloneElement(child, {
        key: i,
        ref: refs[i],
        style: {
          width: `${width}px`,
          height: `${height}px`,
          position: 'absolute',
          top: '50%',
          left: '50%',
          ...child.props.style
        },
        onClick: (e) => {
          child.props.onClick?.(e);
          onCardClick?.(i);
        }
      });
    }
    return child;
  });

  return (
    <div
      ref={containerRef}
      className="card-swap"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        position: 'relative',
        perspective: '1000px'
      }}
    >
      {rendered}
    </div>
  );
};

export default CardSwap;