import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 12, lineHeight: 1.5 },
  section: { marginBottom: 10 },
});

const TK01PDF = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={{ textAlign: "center", fontSize: 14, marginBottom: 10 }}>
        CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM{"\n"}Độc lập - Tự do - Hạnh phúc
      </Text>
      <Text style={{ textAlign: "center", marginBottom: 10 }}>
        TỜ KHAI CẤP HỘ CHIẾU PHỔ THÔNG
      </Text>

      <View style={styles.section}>
        <Text>Họ tên: {data.fullName} | Giới tính: {data.gender}</Text>
        <Text>Ngày sinh: {data.dob} | Nơi sinh: {data.birthPlace}</Text>
        <Text>Số CCCD: {data.cccd} | Ngày cấp: {data.issueDate}</Text>
        <Text>Dân tộc: {data.ethnicity} | Tôn giáo: {data.religion}</Text>
        <Text>SĐT: {data.phone}</Text>
        <Text>Thường trú: {data.permanent}</Text>
        <Text>Tạm trú: {data.temporary}</Text>
        <Text>Nghề nghiệp: {data.job} | Cơ quan: {data.workplace}</Text>
        <Text>Cha: {data.fatherName} – {data.fatherDob}</Text>
        <Text>Mẹ: {data.motherName} – {data.motherDob}</Text>
        {data.spouseName && (
          <Text>Vợ/Chồng: {data.spouseName} – {data.spouseDob}</Text>
        )}
        <Text>Đề nghị: {data.request}</Text>
      </View>

      <View style={{ marginTop: 30 }}>
        <Text>Ngày ……… tháng …… năm ……</Text>
        <Text>Người đề nghị: {data.fullName}</Text>
      </View>
    </Page>
  </Document>
);

export default TK01PDF;
