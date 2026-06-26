import { StoryBox_type } from "@/types/globalTypes";
import { StyleSheet, View } from "react-native";

export  default function StoryBox ({data , user  , txt}:StoryBox_type) {
    return (
        <View style={styles.StoryBox}>
            <text style={styles.StoryBox_Text}>{txt}</text>
        </View>
    )
}

// styles 

const styles = StyleSheet.create({
    StoryBox:{
        flexDirection:"row" ,
        justifyContent:"flex-start" ,
        paddingBlock:8 ,
        width:55 , 
        height:75 ,
        paddingInline:5,
        borderColor:"#aaa" ,
        borderWidth:2, 
        borderRadius:8
    } ,
    StoryBox_Text : {
        color:"#fff"
    }
})