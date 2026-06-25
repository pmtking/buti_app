import { FancyBottomMenu } from '@/components/BottomMenu';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';


export default function HomeScreen() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0C' }}>
      
      {/* دکمه باز کردن منو در هدر صفحه خانه */}
      <TouchableOpacity onPress={() => setMenuOpen(true)} style={{ margin: 50, padding: 15, backgroundColor: '#16161F', borderRadius: 12, alignItems: 'center' }}>
        <Text style={{ color: '#FFF' }}>✨ باز کردن منوی فانتزی پایینی</Text>
      </TouchableOpacity>

      {/* تزریق منوی فانتزی */}
      <FancyBottomMenu 
        isOpen={menuOpen} 
        onClose={() => setMenuOpen(false)} 
        onNavigate={(route) => console.log(route)}
      />
    </View>
  );
}