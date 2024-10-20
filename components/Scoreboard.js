import { useState, useEffect } from 'react';
import { Text, View } from 'react-native';
import Header from './Header';
import Footer from './Footer';
import { SCOREBOARD_KEY } from '../constants/Game';
import styles from '../style/style';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default Scoreboard = ({ navigation }) => {

    const [scores, setScores] = useState([]);

    useEffect(()=>{
        const unsubscribe = navigation.addListener('focus', () => {
            getScoreboardData();
        })
        return unsubscribe;
    }, [navigation])

    const getScoreboardData = async() => {
        try{
            const jsonValue = await AsyncStorage.getItem(SCOREBOARD_KEY);
            if(jsonValue !== null){
                const tmpScores = JSON.parse(jsonValue);
            
            //lajittelu jää meille -> tässä välissä tehdään lajittelu opettajan versiossa 
            // stackoverflow Sorting an array of objects by property values
            //pisteiden perusteella laskevaan järjestykseen!
            setScores(tmpScores);
            console.log("Scoreboard: read successful");
            console.log("Scoreboard: number of scores:" + tmpScores.length);
            
            } 
        }
        catch(e){
            console.log("read error:"+ e);
        }
    }

    const clearScoreboard = async() => {
        try{
            await AsyncStorage.removeItem(SCOREBOARD_KEY);
            setScores([]);
        }
        catch(e) {
            console.log("clear error"+ e);
            
        }
    }

    return (
        <>
            <Header />
            <View>
                <Text>Scoreboard will be here...</Text>
            </View>
            <Footer />
        </>
    )
}