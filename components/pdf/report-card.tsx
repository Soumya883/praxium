import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 9,
    color: "#1f2937",
    lineHeight: 1.4,
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1.5,
    borderBottomColor: "#312e81",
    paddingBottom: 10,
  },
  academyName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#312e81",
    letterSpacing: 0.5,
  },
  academyAddress: {
    fontSize: 8,
    color: "#6b7280",
    marginTop: 2,
  },
  titleContainer: {
    alignItems: "center",
    marginVertical: 15,
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    letterSpacing: 1,
    color: "#111827",
    textTransform: "uppercase",
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    borderWidth: 0.5,
    borderColor: "#d1d5db",
    borderRadius: 4,
    padding: 10,
    marginBottom: 20,
    backgroundColor: "#f9fafb",
  },
  infoItem: {
    width: "50%",
    marginBottom: 6,
  },
  infoLabel: {
    color: "#4b5563",
    fontSize: 8,
  },
  infoValue: {
    fontWeight: "bold",
  },
  table: {
    width: "100%",
    borderWidth: 0.5,
    borderColor: "#d1d5db",
    borderRadius: 4,
    marginBottom: 25,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#312e81",
    color: "#ffffff",
    fontWeight: "bold",
    padding: 8,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#e5e7eb",
    padding: 8,
  },
  colSubject: { width: "50%" },
  colObtained: { width: "25%", textAlign: "center" },
  colAverage: { width: "25%", textAlign: "center" },
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#f3f4f6",
    padding: 10,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: "#d1d5db",
    marginBottom: 35,
  },
  summaryItem: {
    flexDirection: "column",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 8,
    color: "#4b5563",
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#111827",
  },
  footer: {
    marginTop: 40,
    borderTopWidth: 0.5,
    borderTopColor: "#e5e7eb",
    paddingTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  signatureBox: {
    alignItems: "center",
    width: 120,
  },
  signatureLine: {
    width: "100%",
    borderTopWidth: 0.5,
    borderTopColor: "#4b5563",
    marginTop: 35,
    marginBottom: 3,
  },
  remarksSection: {
    marginTop: 10,
    borderWidth: 0.5,
    borderColor: "#d1d5db",
    borderRadius: 4,
    padding: 8,
    backgroundColor: "#f9fafb",
  },
  remarksTitle: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#4b5563",
    marginBottom: 4,
  }
});

interface ExamScore {
  subject: string;
  studentScore: number;
  classAverage: number;
}

interface ReportCardProps {
  studentName: string;
  guardianName: string;
  batchName: string;
  collegeName: string;
  examScores: ExamScore[];
  attendancePercentage: number;
}

export function ReportCardPDF({
  studentName,
  guardianName,
  batchName,
  collegeName,
  examScores,
  attendancePercentage,
}: ReportCardProps) {
  // Compute overall average
  const totalObtained = examScores.reduce((sum, item) => sum + item.studentScore, 0);
  const averageObtained = examScores.length > 0 ? (totalObtained / examScores.length) : 0;
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header Branding */}
        <View style={styles.header}>
          <Text style={styles.academyName}>SHARMA PHYSICS ACADEMY</Text>
          <Text style={styles.academyAddress}>
            Plot 256, EdTech Towers, Saheed Nagar, Bhubaneswar, Odisha — 751007
          </Text>
          <Text style={styles.academyAddress}>Email: office@sharmaphysics.edu | Phone: +91 94390 12345</Text>
        </View>

        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Academic Performance Report Card</Text>
        </View>

        {/* Student Information */}
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Student Name:</Text>
            <Text style={styles.infoValue}>{studentName}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Guardian Name:</Text>
            <Text style={styles.infoValue}>{guardianName || "Not provided"}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Class Batch:</Text>
            <Text style={styles.infoValue}>{batchName}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Institution/College:</Text>
            <Text style={styles.infoValue}>{collegeName || "Not provided"}</Text>
          </View>
        </View>

        {/* Scores Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colSubject}>Subject / Monthly Examination</Text>
            <Text style={styles.colObtained}>Obtained Marks</Text>
            <Text style={styles.colAverage}>Batch Average</Text>
          </View>
          {examScores.map((item, idx) => (
            <View key={idx} style={styles.tableRow}>
              <Text style={styles.colSubject}>{item.subject}</Text>
              <Text style={styles.colObtained}>{item.studentScore.toFixed(1)}</Text>
              <Text style={styles.colAverage}>{item.classAverage.toFixed(1)}</Text>
            </View>
          ))}
        </View>

        {/* Performance Summary Metrics */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Overall Average</Text>
            <Text style={styles.summaryValue}>{averageObtained.toFixed(1)}%</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Lectures Attended</Text>
            <Text style={styles.summaryValue}>{attendancePercentage}%</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Performance Grade</Text>
            <Text style={[styles.summaryValue, { color: averageObtained >= 80 ? "#10b981" : "#f59e0b" }]}>
              {averageObtained >= 90 ? "A+" : averageObtained >= 80 ? "A" : averageObtained >= 70 ? "B" : "C"}
            </Text>
          </View>
        </View>

        {/* Remarks Box */}
        <View style={styles.remarksSection}>
          <Text style={styles.remarksTitle}>INSTRUCTOR'S GENERAL REMARKS</Text>
          <Text style={{ fontSize: 8.5, color: "#374151", fontStyle: "italic" }}>
            {averageObtained >= 80 
              ? "Exemplary academic understanding and proactive class participation. Demonstrates excellent analytical capability."
              : "Satisfactory performance. Regular revision of numerical assignments and focus on mechanics practice is recommended."}
          </Text>
        </View>

        {/* Signatures */}
        <View style={styles.footer}>
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine} />
            <Text style={{ fontSize: 7, color: "#6b7280" }}>Class Teacher</Text>
          </View>
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine} />
            <Text style={{ fontSize: 7, color: "#6b7280" }}>Academy Director</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
