import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from "react-native";

export default function DoctorDemoScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.pageTitle}>
        BEAUTY AI DEMO
      </Text>

      {/* Doctor Card */}
      <View style={styles.doctorCard}>
        <Image
          source={{
            uri: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2",
          }}
          style={styles.avatar}
        />

        <Text style={styles.doctorName}>
          Dr. Sarah Ahmadi
        </Text>

        <Text style={styles.specialty}>
          Rhinoplasty & Facial Aesthetics
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>4.9⭐</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statValue}>3200+</Text>
            <Text style={styles.statLabel}>Cases</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statValue}>12Y</Text>
            <Text style={styles.statLabel}>Experience</Text>
          </View>
        </View>
      </View>

      {/* AI Recommendation */}
      <View style={styles.aiCard}>
        <Text style={styles.aiTitle}>
          🤖 AI Recommendation
        </Text>

        <Text style={styles.aiText}>
          Based on facial analysis, the AI suggests a natural rhinoplasty
          and subtle lip enhancement to improve facial harmony.
        </Text>

        <View style={styles.scoreBox}>
          <Text style={styles.scoreText}>
            Confidence Score: 92%
          </Text>
        </View>
      </View>

      {/* Before After */}
      <View style={styles.beforeAfterCard}>
        <Text style={styles.sectionTitle}>
          Before / After Preview
        </Text>

        <View style={styles.imageRow}>
          <View style={styles.fakeImage}>
            <Text style={styles.imageLabel}>
              BEFORE
            </Text>
          </View>

          <View style={styles.fakeImage}>
            <Text style={styles.imageLabel}>
              AFTER
            </Text>
          </View>
        </View>
      </View>

      {/* Features */}
      <View style={styles.featuresCard}>
        <Text style={styles.sectionTitle}>
          AI Facial Analysis
        </Text>

        <FeatureRow label="Face Symmetry" value="91%" />
        <FeatureRow label="Skin Quality" value="87%" />
        <FeatureRow label="Jawline" value="82%" />
        <FeatureRow label="Cheekbones" value="89%" />
        <FeatureRow label="Nose Ratio" value="85%" />
        <FeatureRow label="Eye Balance" value="90%" />
      </View>

      {/* CTA */}
      <TouchableOpacity style={styles.bookBtn}>
        <Text style={styles.bookText}>
          Book Consultation
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryBtn}>
        <Text style={styles.secondaryText}>
          View Doctor Profile
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function FeatureRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.featureRow}>
      <Text style={styles.featureLabel}>{label}</Text>
      <Text style={styles.featureValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0F",
    padding: 16,
  },

  pageTitle: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "900",
    textAlign: "center",
    marginVertical: 20,
  },

  doctorCard: {
    backgroundColor: "#141420",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "#232332",
  },

  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignSelf: "center",
  },

  doctorName: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 12,
  },

  specialty: {
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 5,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },

  statBox: {
    alignItems: "center",
    flex: 1,
  },

  statValue: {
    color: "#22C55E",
    fontSize: 18,
    fontWeight: "900",
  },

  statLabel: {
    color: "#9CA3AF",
    marginTop: 5,
  },

  aiCard: {
    backgroundColor: "#0F172A",
    borderRadius: 24,
    padding: 18,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#22C55E",
  },

  aiTitle: {
    color: "#22C55E",
    fontSize: 18,
    fontWeight: "900",
  },

  aiText: {
    color: "#fff",
    marginTop: 12,
    lineHeight: 24,
  },

  scoreBox: {
    marginTop: 15,
    backgroundColor: "#111827",
    padding: 12,
    borderRadius: 14,
  },

  scoreText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "700",
  },

  beforeAfterCard: {
    backgroundColor: "#141420",
    borderRadius: 24,
    padding: 18,
    marginTop: 20,
  },

  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 15,
  },

  imageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  fakeImage: {
    width: "48%",
    height: 180,
    borderRadius: 18,
    backgroundColor: "#26263A",
    justifyContent: "center",
    alignItems: "center",
  },

  imageLabel: {
    color: "#fff",
    fontWeight: "900",
  },

  featuresCard: {
    backgroundColor: "#141420",
    borderRadius: 24,
    padding: 18,
    marginTop: 20,
  },

  featureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#232332",
  },

  featureLabel: {
    color: "#fff",
  },

  featureValue: {
    color: "#22C55E",
    fontWeight: "900",
  },

  bookBtn: {
    backgroundColor: "#22C55E",
    height: 58,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },

  bookText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "900",
  },

  secondaryBtn: {
    backgroundColor: "#1F2937",
    height: 58,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 40,
  },

  secondaryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});