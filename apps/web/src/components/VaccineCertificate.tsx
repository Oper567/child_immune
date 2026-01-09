import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica' },
  header: { fontSize: 24, marginBottom: 20, textAlign: 'center', color: '#0284c7' },
  section: { marginBottom: 15 },
  label: { fontSize: 10, color: '#64748b', textTransform: 'uppercase' },
  value: { fontSize: 14, marginBottom: 5, fontWeight: 'bold' },
  table: { display: 'flex', width: 'auto', borderStyle: 'solid', borderWidth: 1, borderColor: '#e2e8f0', marginTop: 20 },
  tableRow: { flexDirection: 'row', backgroundColor: '#f8fafc' },
  tableCol: { width: '25%', borderStyle: 'solid', borderWidth: 1, borderColor: '#e2e8f0', padding: 5 },
  tableCell: { fontSize: 10 }
});

export const VaccineCertificate = ({ child, records }: any) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>Official Immunization Record</Text>
      
      <View style={styles.section}>
        <Text style={styles.label}>Universal Health ID (UHID)</Text>
        <Text style={styles.value}>{child.uhid}</Text>
        <Text style={styles.label}>Child Name</Text>
        <Text style={styles.value}>{child.firstName} {child.lastName}</Text>
      </View>

      <View style={styles.table}>
        <View style={[styles.tableRow, { backgroundColor: '#0284c7' }]}>
          <Text style={[styles.tableCol, { color: 'white' }]}>Vaccine</Text>
          <Text style={[styles.tableCol, { color: 'white' }]}>Date</Text>
          <Text style={[styles.tableCol, { color: 'white' }]}>Clinic</Text>
          <Text style={[styles.tableCol, { color: 'white' }]}>Status</Text>
        </View>
        {records.map((rec: any, i: number) => (
          <View key={i} style={styles.tableRow}>
            <Text style={styles.tableCol}>{rec.vaccineName}</Text>
            <Text style={styles.tableCol}>{new Date(rec.administeredAt).toLocaleDateString()}</Text>
            <Text style={styles.tableCol}>{rec.clinicName}</Text>
            <Text style={styles.tableCol}>{rec.status}</Text>
          </View>
        ))}
      </View>
      
      <Text style={{ marginTop: 40, fontSize: 9, textAlign: 'center', color: '#94a3b8' }}>
        This document is digitally verified. Scan the QR code on the portal to verify authenticity.
      </Text>
    </Page>
  </Document>
);