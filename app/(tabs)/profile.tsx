import { View, Text, StyleSheet } from 'react-native';

export default function ProfileScreen() {
    return (
        <View >
            <Text style={styles.container , styles} >sdsd</Text>
        </View>
    )
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  test:{
    color:'#ffff'
  }
});
