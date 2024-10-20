import { useState, useEffect } from 'react';
import { ScrollView, Text, View, Pressable } from 'react-native';
import Header from './Header';
import Footer from './Footer';
import {
    NBR_OF_DICES,
    NBR_OF_THROWS,
    MIN_SPOT,
    MAX_SPOT,
    BONUS_POINTS,
    BONUS_POINTS_LIMIT,
    SCOREBOARD_KEY
} from '../constants/Game';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Container, Row, Col } from 'react-native-flex-grid';
import styles from '../style/style';
import AsyncStorage from '@react-native-async-storage/async-storage';

let board = [];

export default Gameboard = ({ navigation, route }) => {
    const [nbrOfThrowsLeft, setNbrOfThrowsLeft] = useState(NBR_OF_THROWS);
    const [status, setStatus] = useState('Throw dices.');
    const [gameEndStatus, setGameEndStatus] = useState(false);
    const [selectedDices, setSelectedDices] = useState(new Array(NBR_OF_DICES).fill(false));
    const [diceSpots, setDicesSpot] = useState(new Array(NBR_OF_DICES).fill(0));
    const [dicePointsTotal, setDicePointsTotal] = useState(new Array(MAX_SPOT).fill(0));
    const [playerName, setPlayerName] = useState('');
    const [scores, setScores] = useState([]);
    const [selectedDicePoints, setSelectedDicePoints] = useState(new Array(MAX_SPOT).fill(0));
    const [currentRound, setCurrentRound] = useState(0); // nykyinen kierros

    useEffect(() => {
        if (playerName === '' && route.params?.player) {
            setPlayerName(route.params.player);
        }
    }, []);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            getScoreboardData();
        });
        return unsubscribe;
    }, [navigation]);

    const getScoreboardData = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem(SCOREBOARD_KEY);
            if (jsonValue !== null) {
                const tmpScores = JSON.parse(jsonValue);
                setScores(tmpScores);
                console.log("Gameboard: read successful");
                console.log("Gameboard: number of scores:" + tmpScores.length);
            }
        } catch (e) {
            console.log("Gameboard: read error:" + e);
        }
    };

    const savePlayerPoints = async () => {
        const newKey = scores.length + 1;
        const playerPoints = {
            key: newKey,
            name: playerName,
            date: new Date().toLocaleDateString(), // Haetaan nykyinen päivämäärä
            time: new Date().toLocaleTimeString(), // Haetaan nykyinen kellonaika
            points: dicePointsTotal.reduce((a, b) => a + b, 0) // Lasketaan pelaajan kokonaispisteet
        };
        try {
            const newScore = [...scores, playerPoints];
            const jsonValue = JSON.stringify(newScore);
            await AsyncStorage.setItem(SCOREBOARD_KEY, jsonValue);
            console.log("Gameboard: Save successful:" + jsonValue);
        } catch (e) {
            console.log("Gameboard: Save error:" + e);
        }
    };

    const dicesrow = [];
    for (let dice = 0; dice < NBR_OF_DICES; dice++) {
        dicesrow.push(
            <Col key={"dice" + dice}>
                <Pressable
                    key={"row" + dice}
                    onPress={() => chooseDice(dice)}>
                    <MaterialCommunityIcons
                        name={board[dice]}
                        key={"row" + dice}
                        size={50}
                        color={getDiceColor(dice)}>
                    </MaterialCommunityIcons>
                </Pressable>
            </Col>
        );
    }

    const pointsRow = [];
    for (let spot = 0; spot < MAX_SPOT; spot++) {
        pointsRow.push(
            <Col key={"pointsRow" + spot}>
                <Text key={"pointsRow" + spot}>{getSpotTotal(spot)}</Text>
            </Col>
        )
    }

    const pointsToSelectRow = [];
    for (let diceButton = 0; diceButton < MAX_SPOT; diceButton++) {
        pointsToSelectRow.push(
            <Col key={"buttonsRow" + diceButton}>
                <Pressable
                    key={"buttonsRow" + diceButton}
                    onPress={() => chooseDicePoints(diceButton)}>
                    <MaterialCommunityIcons
                        name={"numeric-" + (diceButton + 1) + "-circle"}
                        key={"buttonsRow" + diceButton}
                        size={35}
                        color={getDicePointsColor(diceButton)} >
                    </MaterialCommunityIcons>
                </Pressable>
            </Col>
        )
    }

    const chooseDice = (i) => {
        // Voidaan valita noppia, kunhan peli ei ole päättynyt
        if (!gameEndStatus) {
            let dices = [...selectedDices];
            dices[i] = selectedDices[i] ? false : true;
            setSelectedDices(dices);
        } else {
            setStatus('Game has ended. You cannot select dice now.');
        }
    }

    const chooseDicePoints = (i) => {
        // Pisteiden valinta vain, kun kaikki heitot on käytetty
        if (nbrOfThrowsLeft === 0 && currentRound < 6) {
            let selectedPoints = [...selectedDicePoints];
            let points = [...dicePointsTotal];
            if (!selectedPoints[i]) {
                selectedPoints[i] = true;
                let nbrOfDices = diceSpots.reduce((total, x) => (x === (i + 1) ? total + 1 : total), 0);
                points[i] = nbrOfDices * (i + 1);
                setDicePointsTotal(points);
                setSelectedDicePoints(selectedPoints);
                // Tarkistetaan onko kaikki pisteet valittu
                if (selectedPoints.every(Boolean)) {
                    setGameEndStatus(true);
                    setStatus("Game Over! All points selected.");
                } else {
                    setStatus("Select points for the next round.");
                    if (currentRound < 5) {
                        setCurrentRound(currentRound + 1); // Siirrytään seuraavaan kierrokseen
                        setNbrOfThrowsLeft(NBR_OF_THROWS); // Nollataan heitot seuraavaa kierrosta varten
                        setSelectedDices(new Array(NBR_OF_DICES).fill(false)); // Nollataan valinnat
                        setDicesSpot(new Array(NBR_OF_DICES).fill(0)); // Nollataan nopan arvot
                    }
                }
            } else {
                setStatus("You already selected points for " + (i + 1));
            }
        } else {
            setStatus("Throw " + NBR_OF_THROWS + " times before setting points.");
        }
    }

    function getDiceColor(i) {
        return selectedDices[i] ? "black" : "purple";
    }

    function getDicePointsColor(i) {
        return (selectedDicePoints[i] && !gameEndStatus) ? "black" : "purple";
    }

    function getSpotTotal(i) {
        return dicePointsTotal[i];
    }

    const throwDices = () => {
        if (nbrOfThrowsLeft > 0) {
            let spots = [...diceSpots];
            for (let i = 0; i < NBR_OF_DICES; i++) {
                if (!selectedDices[i]) {
                    let randomNumber = Math.floor(Math.random() * 6 + 1);
                    board[i] = 'dice-' + randomNumber;
                    spots[i] = randomNumber;
                }
            }
            setNbrOfThrowsLeft(nbrOfThrowsLeft - 1);
            setDicesSpot(spots);
            setStatus('Select points and throw dices again');
        } else {
            setStatus("No throws left for this round. Please select points.");
        }
    }

    // Lasketaan ja näytetään pelaajan kokonaispisteet
    const calculateTotalPoints = () => {
        return dicePointsTotal.reduce((a, b) => a + b, 0);
    };

    const resetGame = () => {
        // Nollaa kaikki tarvittavat tilamuuttujat
        setNbrOfThrowsLeft(NBR_OF_THROWS);
        setStatus('Throw dices.');
        setGameEndStatus(false);
        setSelectedDices(new Array(NBR_OF_DICES).fill(false));
        setDicesSpot(new Array(NBR_OF_DICES).fill(0));
        setDicePointsTotal(new Array(MAX_SPOT).fill(0));
        setSelectedDicePoints(new Array(MAX_SPOT).fill(0));
        setCurrentRound(0);
    };

    useEffect(() => {
        console.log("Status has changed:", status);
    }, [status]);

    return (
        <>
            <Header />
            <ScrollView>
                <View>
                    <Container>
                        <Row>{dicesrow}</Row>
                    </Container>
                    <Text style={styles.playerNameText}>Throws left: {nbrOfThrowsLeft}</Text>
                    <Text style={styles.playerNameText}>{status}</Text>
                    <Text style={styles.endStatusText}>{gameEndStatus ? "Game Over" : ""}</Text>
                    <Pressable onPress={() => throwDices()}>
                        <Text style={styles.gameButton}>THROW DICES</Text>
                    </Pressable>
                    <Container>
                        <Row>{pointsRow}</Row>
                    </Container>
                    <Container>
                        <Row>{pointsToSelectRow}</Row>
                    </Container>
                    <Text style={styles.playerNameText}> Player: {playerName}</Text>
                    <Text style={styles.pointsText}> Current Round: {currentRound + 1}</Text>
                    <Text style={styles.pointsText}> Current Points: {calculateTotalPoints()} </Text>
                    <Pressable onPress={() => savePlayerPoints()}>
                        <Text style={styles.gameButton}>SAVE POINTS</Text>
                    </Pressable>
                    {gameEndStatus && (
                        <View>
                            <Text style={styles.pointsText}>Game has ended. Total points: {calculateTotalPoints()}</Text>
                            <Pressable onPress={resetGame}>
                                <Text style={styles.newGameButton}>Start a new game</Text>
                            </Pressable>
                        </View>
                    )}

                </View>
            </ScrollView>
            <Footer />
        </>
    );
}
