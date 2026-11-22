import React, { useEffect, useRef, useState } from 'react';

interface WordRevealProps {
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  className?: string;
  staggerMs?: number;
}

/**
 * Reveals editorial text in small word groups as it enters the viewport.
 * Keeps full text immediately accessible in the DOM for screen readers and snapshots.
 */
export const WordReveal: React.FC<WordRevealProps> = ({
  text,
  as: Tag = 'h2',
  className = '',
  staggerMs = 45,
}) => {
  const ref = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Group words into pairs/triplets for calm editorial reveal
  const words = text.split(' ');
  const groups: string[] = [];
  for (let i = 0; i < words.length; i += 2) {
    groups.push(words.slice(i, i + 2).join(' '));
  }

  return (
    <Tag
      ref={ref as React.RefObject<any>}
      aria-label={text}
      className={`${className} [text-wrap:balance]`}
    >
      {groups.map((group, idx) => (
        <span
          key={idx}
          className="inline-block overflow-hidden align-bottom mr-[0.28em] last:mr-0"
        >
          <span
            style={{ transitionDelay: `${idx * staggerMs}ms` }}
            className={`inline-block transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isVisible
                ? 'translate-y-0 opacity-100'
                : 'translate-y-[18%] opacity-85'
            }`}
          >
            {group}
          </span>
        </span>
      ))}
    </Tag>
  );
};
