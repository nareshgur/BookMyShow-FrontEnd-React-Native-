import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

function Home() {
    return (
        <View style={styles.container}>
            <Text>
                
                Home Screen
            </Text>
        </View>
    )
}

export default Home


const styles = StyleSheet.create({
    container:{
        flex:1,
        backgroundColor:"#E71A63"
    }
})
