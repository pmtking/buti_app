import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

interface AnalysisResult {
  beautyScore: number;
  symmetry: number;
  skinQuality: number;
  jawline: number;
  cheekbones: number;
  noseRatio: number;
  eyeBalance: number;
  estimatedAge: number;
}

export default function AIImageAnalyzer() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    if (!res.canceled) {
      setImage(res.assets[0].uri);
      setResult(null);
      setStage("");
    }
  };

  const analyzeImage = async () => {
    if (!image) return;

    setLoading(true);

    // 🔥 fake AI stages (feels real)
    setStage("Detecting facial structure...");
    setTimeout(() => setStage("Analyzing symmetry..."), 800);
    setTimeout(() => setStage("Evaluating skin quality..."), 1600);
    setTimeout(() => setStage("Generating beauty profile..."), 2400);

    setTimeout(() => {
      setResult({
        beautyScore: 88,
        symmetry: 91,
        skinQuality: 87,
        jawline: 82,
        cheekbones: 89,
        noseRatio: 85,
        eyeBalance: 90,
        estimatedAge: 27,
      });

      setLoading(false);
      setStage("");
    }, 3200);
  };

  return (
    <ScrollView style={styles.container}>

      {/* HEADER */}
      <Text style={styles.title}>
        AI Beauty Intelligence
      </Text>

      <Text style={styles.subtitle}>
        Analyze your face & preview aesthetic potential
      </Text>

      {/* UPLOAD */}
      <TouchableOpacity style={styles.button} onPress={pickImage}>
        <Text style={styles.buttonText}>Upload Face Photo</Text>
      </TouchableOpacity>

      {/* IMAGE */}
      {image && (
        <Image source={{ uri: image }} style={styles.image} />
      )}

      {/* ANALYZE */}
      {image && (
        <TouchableOpacity
          style={styles.analyzeButton}
          onPress={analyzeImage}
        >
          <Text style={styles.buttonText}>
            Start AI Analysis
          </Text>
        </TouchableOpacity>
      )}

      {/* LOADING AI */}
      {loading && (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#22C55E" />

          <Text style={styles.loadingText}>
            {stage || "Processing..."}
          </Text>
        </View>
      )}

      {/* RESULT */}
      {result && (
        <View style={styles.card}>

          <Text style={styles.cardTitle}>
            AI Beauty Profile
          </Text>

          {/* MAIN SCORE */}
          <View style={styles.mainScore}>
            <Text style={styles.mainScoreText}>
              {result.beautyScore}
            </Text>
            <Text style={styles.mainScoreLabel}>
              Beauty Score
            </Text>
          </View>

          {/* INSIGHTS */}
          <Insight title="Face Symmetry" value={result.symmetry} />
          <Insight title="Skin Quality" value={result.skinQuality} />
          <Insight title="Jawline Definition" value={result.jawline} />
          <Insight title="Cheekbone Structure" value={result.cheekbones} />
          <Insight title="Nose Ratio" value={result.noseRatio} />
          <Insight title="Eye Balance" value={result.eyeBalance} />

          {/* AGE */}
          <View style={styles.ageBox}>
            <Text style={styles.ageText}>
              Estimated Age: {result.estimatedAge}
            </Text>
          </View>

          {/* CTA */}
          <TouchableOpacity style={styles.cta}>
            <Text style={styles.ctaText}>
              See Recommended Doctors →
            </Text>
          </TouchableOpacity>
        </View>
      )}

    </ScrollView>
  );
}

/* ================= COMPONENT ================= */

function Insight({ title, value }: { title: string; value: number }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{title}</Text>

      <View style={styles.barBg}>
        <View style={[styles.barFill, { width: `${value}%` }]} />
      </View>

      <Text style={styles.value}>{value}%</Text>
    </View>
  );
}

/* ================= STYLE ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0F",
    padding: 20,
  },

  title: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "900",
    textAlign: "center",
  },

  subtitle: {
    color: "#888",
    textAlign: "center",
    marginBottom: 20,
  },

  button: {
    height: 58,
    borderRadius: 16,
    backgroundColor: "#C4A882",
    justifyContent: "center",
    alignItems: "center",
  },

  analyzeButton: {
    height: 58,
    borderRadius: 16,
    backgroundColor: "#22C55E",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
  },

  buttonText: {
    color: "#000",
    fontWeight: "900",
  },

  image: {
    width: "100%",
    height: 340,
    borderRadius: 20,
    marginTop: 20,
  },

  loadingBox: {
    marginTop: 30,
    alignItems: "center",
  },

  loadingText: {
    color: "#fff",
    marginTop: 12,
  },

  card: {
    marginTop: 25,
    backgroundColor: "#141420",
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#2A2A3A",
  },

  cardTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 20,
  },

  mainScore: {
    alignItems: "center",
    marginBottom: 20,
  },

  mainScoreText: {
    fontSize: 48,
    color: "#22C55E",
    fontWeight: "900",
  },

  mainScoreLabel: {
    color: "#aaa",
  },

  row: {
    marginVertical: 10,
  },

  label: {
    color: "#fff",
    marginBottom: 4,
  },

  barBg: {
    height: 6,
    backgroundColor: "#222",
    borderRadius: 10,
    overflow: "hidden",
  },

  barFill: {
    height: 6,
    backgroundColor: "#22C55E",
  },

  value: {
    color: "#aaa",
    marginTop: 4,
    fontSize: 12,
  },

  ageBox: {
    marginTop: 15,
    alignItems: "center",
  },

  ageText: {
    color: "#aaa",
  },

  cta: {
    marginTop: 20,
    backgroundColor: "#22C55E",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
  },

  ctaText: {
    fontWeight: "900",
    color: "#000",
  },
}); 