import { StyleSheet, View } from 'react-native';
import { useState } from 'react';
import { NotificationToast } from '@/components/NotificationToast';
import FacialScanChatScreen from '@/components/FacialScanChatScreen';
// اگر فایل در پوشه دیگری است، مسیر را عوض کنید:
// import FacialScanChatScreen from '@/screens/FacialScanChatScreen';

export default function TabTwoScreen() {
  const [toastVisible, setToastVisible] = useState(true);

  return (
    <View style={styles.container}>
      <NotificationToast
        visible={toastVisible}
        title="موتور هوش مصنوعی MedLink فعال شد"
        message="اسکنر آناتومی صورت آماده پردازش لندمارک‌های زیبایی است."
        type="ai"
        onClose={() => setToastVisible(false)}
      />

      {/* صفحه اسکن و چت هوش مصنوعی */}
      <FacialScanChatScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,               // مهم: باید flex:1 باشد تا FacialScanChatScreen فضای کامل بگیرد
  },
});