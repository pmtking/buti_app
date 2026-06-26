import { StyleSheet, View } from "react-native";
import { storyBar_data } from '@/utiles/test_data'
import StoryBox from "./StoryBox";
export default function StoryBar() {


    return (
        <View style={styles.main}>
            {storyBar_data.map((i, item) => {
                return (
                    <StoryBox txt={i.name} />
                )
            })}
        </View>
    )
}


const styles = StyleSheet.create({
    main: {
        flexDirection: "row",
        justifyContent: "center",
        borderColor: "#aaa",
        gap: 8,
        paddingInline: 8,
        paddingBlock: 8
    }
})