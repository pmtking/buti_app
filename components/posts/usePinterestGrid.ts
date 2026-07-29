import { MedicalPost } from "@/types/post";
import { useCallback, useMemo } from "react";
import { COLUMN_WIDTH } from "./constants";

export const usePinterestGrid = (
  posts: MedicalPost[] = [],
  onSelectPost?: (post: MedicalPost) => void,
) => {
  const columns = useMemo(() => {
    const col1: MedicalPost[] = [];
    const col2: MedicalPost[] = [];
    const col3: MedicalPost[] = [];

    let h1 = 0;
    let h2 = 0;
    let h3 = 0;

    posts.forEach((post) => {
      const cardHeight = COLUMN_WIDTH / (post.aspectRatio || 0.75);
      if (h1 <= h2 && h1 <= h3) {
        col1.push(post);
        h1 += cardHeight + 10;
      } else if (h2 <= h1 && h2 <= h3) {
        col2.push(post);
        h2 += cardHeight + 10;
      } else {
        col3.push(post);
        h3 += cardHeight + 10;
      }
    });
    return [col1, col2, col3];
  }, [posts]);

  const handlePostPress = useCallback(
    (post: MedicalPost) => {
      onSelectPost?.(post);
    },
    [onSelectPost],
  );
  return {
    columns,
    handlePostPress,
  };
};
