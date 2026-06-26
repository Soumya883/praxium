import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 35,
    fontFamily: "Helvetica",
    fontSize: 9,
    color: "#1f2937",
    lineHeight: 1.4,
  },
  header: {
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 10,
  },
  academyName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#312e81",
    letterSpacing: 0.5,
  },
  academyAddress: {
    fontSize: 7.5,
    color: "#6b7280",
    marginTop: 2,
  },
  titleContainer: {
    alignItems: "center",
    marginVertical: 10,
  },
  title: {
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 1,
    color: "#111827",
  },
  metaContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    backgroundColor: "#f9fafb",
    padding: 8,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: "#e5e7eb",
  },
  metaColumn: {
    flexDirection: "column",
  },
  metaItem: {
    marginBottom: 3,
  },
  metaLabel: {
    color: "#4b5563",
    fontSize: 8,
  },
  metaValue: {
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
    padding: 6,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#e5e7eb",
    padding: 6,
  },
  col1: { width: "60%" },
  col2: { width: "20%", textAlign: "right" },
  col3: { width: "20%", textAlign: "right" },
  footer: {
    marginTop: 25,
    borderTopWidth: 0.5,
    borderTopColor: "#e5e7eb",
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  signatureContainer: {
    alignItems: "center",
    width: 130,
  },
  signatureLine: {
    width: "100%",
    borderTopWidth: 0.5,
    borderTopColor: "#4b5563",
    marginTop: 25,
    marginBottom: 3,
  },
  thankYou: {
    fontSize: 8,
    fontStyle: "italic",
    color: "#4b5563",
  }
});

interface FeeReceiptProps {
  studentName: string;
  batchName: string;
  amount: number;
  paymentMode: string;
  date: string;
  receiptNumber: string;
}

export function FeeReceiptPDF({
  studentName,
  batchName,
  amount,
  paymentMode,
  date,
  receiptNumber,
}: FeeReceiptProps) {
  return (
    <Document>
      <Page size="A5" orientation="landscape" style={styles.page}>
        {/* Branding */}
        <View style={styles.header}>
          <Text style={styles.academyName}>SHARMA PHYSICS ACADEMY</Text>
          <Text style={styles.academyAddress}>
            Plot 256, EdTech Towers, Saheed Nagar, Bhubaneswar, Odisha — 751007
          </Text>
          <Text style={styles.academyAddress}>Email: billing@sharmaphysics.edu | Phone: +91 94390 12345</Text>
        </View>

        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>OFFICIAL PAYMENT RECEIPT</Text>
        </View>

        {/* Meta Info */}
        <View style={styles.metaContainer}>
          <View style={styles.metaColumn}>
            <Text style={styles.metaItem}>
              <Text style={styles.metaLabel}>Receipt No: </Text>
              <Text style={styles.metaValue}>{receiptNumber}</Text>
            </Text>
            <Text style={styles.metaItem}>
              <Text style={styles.metaLabel}>Date of Payment: </Text>
              <Text style={styles.metaValue}>{new Date(date).toLocaleDateString()}</Text>
            </Text>
          </View>
          <View style={styles.metaColumn}>
            <Text style={styles.metaItem}>
              <Text style={styles.metaLabel}>Student Name: </Text>
              <Text style={styles.metaValue}>{studentName}</Text>
            </Text>
            <Text style={styles.metaItem}>
              <Text style={styles.metaLabel}>Enrolled Class: </Text>
              <Text style={styles.metaValue}>{batchName}</Text>
            </Text>
          </View>
        </View>

        {/* Grid Ledger Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>Fee Item Description</Text>
            <Text style={styles.col2}>Payment Mode</Text>
            <Text style={styles.col3}>Amount Received</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.col1}>Tuition Fee Installment Settlement</Text>
            <Text style={styles.col2}>{paymentMode}</Text>
            <Text style={styles.col3}>INR {amount.toFixed(2)}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.thankYou}>Thank you for your payment. This document is system generated.</Text>
          <View style={styles.signatureContainer}>
            <View style={styles.signatureLine} />
            <Text style={{ fontSize: 6.5, color: "#6b7280" }}>Authorized Signature</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
