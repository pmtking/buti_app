import { FancyBottomMenu } from '@/components/BottomMenu';
import DoctorDemoScreen from '@/components/DoctorDemoScreen';
import { DocumentSlidesModal } from '@/components/DocumentSlidesModal';
import StoryBar from '@/components/StoryBar';

import React, { useState } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';


export default function HomeScreen() {
  const [menuOpen, setMenuOpen] = useState(false);
const [open , setOpen ] = useState(false)
  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0C' }}>
      
      {/* دکمه باز کردن منو در هدر صفحه خانه */}
      {/* <TouchableOpacity onPress={() => setMenuOpen(true)} style={{ margin: 50, padding: 15, backgroundColor: '#16161F', borderRadius: 12, alignItems: 'center' }}>
        
      </TouchableOpacity> */}
      <View style={styles.storyBar}>
          <StoryBar />
      </View>

      {/* تزریق منوی فانتزی */}
      <FancyBottomMenu 
        isOpen={menuOpen} 
        onClose={() => setMenuOpen(false)} 
        onNavigate={(route) => console.log(route)}
      />
      <View style={styles.boxModuleDucument}>
        <Button title='نمایش  ' onPress={ ()=> setOpen(true)} />
          <DocumentSlidesModal visible={open} onClose={()=>setOpen(false)}  />
      </View>
      <View>
        <DoctorDemoScreen />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  boxModuleDucument:{
    paddingInline:10 ,
  } ,
  storyBar:{
    marginTop:20
  }
})