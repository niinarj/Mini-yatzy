import {Text, View} from 'react-native';
import styles from '../style/style';

export default Header = () => {
    return(
        <View style={styles.header}>
            <Text style={styles.title}>Mini-Yatzy</Text>
        </View>
    )
}