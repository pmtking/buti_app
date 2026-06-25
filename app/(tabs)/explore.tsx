import { StyleSheet, Text, View } from 'react-native';


import { useState } from 'react';
import { NotificationToast } from '@/components/NotificationToast';

export default function TabTwoScreen() {
  const [toastVisible, setToastVisible] = useState(true);
  return (
    <View style={styles.constiner}>
      <NotificationToast 
        visible={toastVisible}
        title="موتور هوش مصنوعی MedLink فعال شد"
        message="اسکنر آناتومی صورت آماده پردازش لندمارک‌های زیبایی است."
        type="ai"
        onClose={() => setToastVisible(false)}
      />
      {/* <Text style={styles.textBox}>sds</Text> */}

    </View>
  );
}

const styles = StyleSheet.create({
  constiner: {
    marginTop: 30,
    marginInline: 10,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#fff',
    // backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    flexDirection: "row-reverse"
  },
  textBox:{
    backgroundColor:"#aaa" ,
    paddingInline:10 ,
    paddingBlock:5 ,
    borderRadius:5 ,
    fontWeight:700

  } , 
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});
