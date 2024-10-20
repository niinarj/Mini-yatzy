import { useState } from 'react';
import { Text, View, TextInput, Pressable, Keyboard, Alert } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Header from './Header';
import Footer from './Footer';
import {
    NBR_OF_DICES,
    NBR_OF_THROWS,
    MIN_SPOT,
    MAX_SPOT,
    BONUS_POINTS,
    BONUS_POINTS_LIMIT
} from '../constants/Game';
import styles from '../style/style';

export default Home = ({ navigation }) => {

    const [playerName, setPlayerName] = useState('');
    const [hasPlayerName, setHasPlayerName] = useState(false);
    const [errorMessage, setErrorMessage] = useState(''); 
    
    const handlePlayerName = (value) => {
        if (value.trim().length > 0) {
            setHasPlayerName(true);
            setErrorMessage(''); // Tyhjennetään virheviesti
            Keyboard.dismiss();
        } else {
            // Jos nimi on tyhjä, näytetään virheilmoitus
            setErrorMessage('Please enter your name.');
            Alert.alert("Error", "You must enter a name to continue.");
        }
    };

    return (
        <>
            <Header />
            <View style={styles.container}>
                <MaterialCommunityIcons name='information-outline' size={90} color="#6e3d8e" style={styles.icon} />
                
                {!hasPlayerName ? (
                    <>
                        <Text style={styles.instructions}>Enter your name for the scoreboard</Text>
                        <TextInput
                            style={styles.input}
                            onChangeText={setPlayerName}
                            value={playerName} 
                            autoFocus={true}
                            placeholder="Your name"
                        />
                        
                        {errorMessage ? <Text style={styles.endStatusText}>{errorMessage}</Text> : null} 

                        <Pressable
                            style={styles.button}
                            onPress={() => handlePlayerName(playerName)}
                        >
                            <Text style={styles.buttonText}>OK</Text>
                        </Pressable>
                    </>
                ) : (
                    <>
                        <Text style={styles.rulesTitle}>Rules of the Game</Text>
                        <Text style={styles.rulesText}>
                            THE GAME: Upper section of the classic Yahtzee dice game. You have {NBR_OF_DICES} dices and for each dice you have {NBR_OF_THROWS} throws. 
                            After each throw, you can keep dices in order to get the same dice spot counts as many as possible. In the end of the turn, you must select 
                            your points from {MIN_SPOT} to {MAX_SPOT}. The game ends when all points have been selected. The order of selecting is free.
                        </Text>
                        <Text style={styles.welcomeText}>Good luck, {playerName}!</Text>
                        
                        <Pressable
                            style={styles.button}
                            onPress={() => navigation.navigate('Gameboard', { player: playerName })}
                        >
                            <Text style={styles.buttonText}>PLAY</Text>
                        </Pressable>
                    </>
                )}
            </View>
            <Footer />
        </>
    );
};
