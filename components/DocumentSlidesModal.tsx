import { slides as defaultSlides } from "@/utiles/slides";
import { useEffect, useState } from "react";
import {
    Dimensions,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, {
    FadeIn,
    FadeOut,
    SlideInRight,
    SlideOutLeft,
} from "react-native-reanimated";

type Slide = { id: string; title: string; body: string };

export function DocumentSlidesModal({
  visible,
  onClose,
  items = defaultSlides,
}: {
  visible: boolean;
  onClose: () => void;
  items?: Slide[];
}) {
  const width = Dimensions.get("window").width;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (visible) setIndex(0);
  }, [visible]);

  const current = items[index];

  const progress = ((index + 1) / items.length) * 100;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>

        {/* CARD */}
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          style={[styles.card, { width: width * 0.92 }]}
        >
          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.title}>{current?.title}</Text>

            <TouchableOpacity onPress={onClose}>
              <Text style={styles.close}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* PROGRESS BAR */}
          <View style={styles.progressBg}>
            <View style={[styles.progress, { width: `${progress}%` }]} />
          </View>

          {/* BODY */}
          <View style={styles.body}>
            {current && (
              <Animated.View
                key={current.id}
                entering={SlideInRight.duration(250)}
                exiting={SlideOutLeft.duration(180)}
              >
                <Text style={styles.bodyText}>
                  {current.body}
                </Text>
              </Animated.View>
            )}
          </View>

          {/* DOTS */}
          <View style={styles.dots}>
            {items.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i === index && styles.dotActive,
                ]}
              />
            ))}
          </View>

          {/* FOOTER */}
          <View style={styles.footer}>
            <TouchableOpacity
              disabled={index === 0}
              onPress={() => setIndex((i) => i - 1)}
              style={[
                styles.btn,
                index === 0 && styles.disabled,
              ]}
            >
              <Text style={styles.btnText}>قبلی</Text>
            </TouchableOpacity>

            <Text style={styles.counter}>
              {index + 1} / {items.length}
            </Text>

            <TouchableOpacity
              disabled={index === items.length - 1}
              onPress={() => setIndex((i) => i + 1)}
              style={[
                styles.btn,
                index === items.length - 1 && styles.disabled,
              ]}
            >
              <Text style={styles.btnText}>بعدی</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

/* ================= STYLE ================= */

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    alignItems: "center",
    justifyContent: "center",
  },

  card: {
    borderRadius: 22,
    padding: 18,
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },

  close: {
    color: "#aaa",
    fontSize: 18,
    fontWeight: "700",
  },

  progressBg: {
    height: 4,
    backgroundColor: "#2a2a2a",
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 15,
  },

  progress: {
    height: 4,
    backgroundColor: "#22C55E",
  },

  body: {
    minHeight: 120,
    justifyContent: "center",
  },

  bodyText: {
    color: "#E5E7EB",
    fontSize: 15,
    lineHeight: 22,
  },

  dots: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 10,
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 6,
    backgroundColor: "#444",
    marginHorizontal: 4,
  },

  dotActive: {
    backgroundColor: "#22C55E",
    width: 18,
  },

  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  btn: {
    backgroundColor: "#22C55E",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
  },

  disabled: {
    backgroundColor: "#333",
  },

  btnText: {
    color: "#000",
    fontWeight: "700",
  },

  counter: {
    color: "#aaa",
    fontWeight: "600",
    alignSelf: "center",
  },
});