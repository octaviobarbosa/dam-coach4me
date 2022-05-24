import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import { View, Image, Text, Linking } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';

import heartOutlineIcon from '../../assets/images/icons/heart-outline.png'
import unfavoriteIcon from '../../assets/images/icons/unfavorite.png'
import whatsappIcon from '../../assets/images/icons/whatsapp.png'
import api from '../../services/api';

import styles from './styles';

export interface Schedule {
  week_day: number;
  from: number;
  to: number;
}
export interface Coach {
  id: number;
  avatar: string;
  bio: string;
  cost: number;
  name: string;
  subject: string;
  whatsapp: string;
  schedules: any[];
}

interface CoachItemProps {
  coach: Coach;
  favorited: boolean;
}

const CoachItem: React.FC<CoachItemProps> = ({ coach, favorited }) => {
  const [isFavorited, setIsFavorited] = useState(favorited);
  
  function handleLinkToWhatsapp() {
    api.post('connections', {
      coach_id: coach.id,
    });

    Linking.openURL(`whatsapp://send?phone=${coach.whatsapp}`);
  }

  async function handleToggleFavorite() {
    const favorites = await AsyncStorage.getItem('favorites');

    let favoritesArray = [];

    if (favorites) {
      favoritesArray = JSON.parse(favorites);
    }

    if (isFavorited) {
      const favoriteIndex = favoritesArray.findIndex((coachItem: Coach) => {
        return coachItem.id === coach.id;
      });

      favoritesArray.splice(favoriteIndex, 1);

      setIsFavorited(false);
    } else {
      favoritesArray.push(coach);

      setIsFavorited(true);
    }

    await AsyncStorage.setItem('favorites', JSON.stringify(favoritesArray));
  }

  const weekDay = (day: number): string => {
    switch (day) {
      case 0:
        return 'Domingo'
      case 1:
        return 'Segunda-feira'
      case 2:
        return 'Terça-feira'
      case 3:
        return 'Quarta-feira'
      case 4:
        return 'Quinta-feira'
      case 5:
        return 'Sexta-feira'
      case 6:
        return 'Sábado'
      default:
        return 'Dia inválido'
    }
  }

  const convertMinutesToHours = (totalMinutes: number): string => {

    const hours = Math.floor(totalMinutes / 60);          
    const minutes = totalMinutes % 60;

    return `${hours.toString().padStart(2,'0')}:${minutes.toString().padStart(2,'0')}`
  }

  return (
    <View style={styles.container}>
      <View style={styles.profile}>
        <Image 
          style={styles.avatar}
          source={{ uri: coach.avatar }}
        />

        <View style={styles.profileInfo}>
          <Text style={styles.name}>{coach.name}</Text>
          <Text style={styles.subject}>{coach.subject}</Text>
        </View>
      </View>

      <Text style={styles.bio}>
        {coach.bio}
      </Text>

      <View style={styles.footer}>
        <Text style={styles.price}>
          Preço/hora {' '}
          <Text style={styles.priceValue}>R$ {coach.cost}</Text>
        </Text>

        <Text style={styles.price}>
          Disponibilidade {' '}
        </Text>
        
        {coach.schedules.map((schedule, index) => {
          return (
            <View key={index}>
              <Text style={styles.priceValue}>
                {weekDay(schedule.week_day)}
                <Text style={styles.price}>{' de '}</Text>
                {convertMinutesToHours(schedule.from)}
                {''} <Text style={styles.price}>às</Text> {''}
                {convertMinutesToHours(schedule.to)}
                </Text>              
            </ View>
          )
        })}

        <View style={styles.buttonsContainer}>
          <RectButton 
            onPress={handleToggleFavorite}
            style={[
              styles.favoriteButton, 
              isFavorited ? styles.favorited : {}
            ]}
          >
            { isFavorited
              ? <Image source={unfavoriteIcon} />
              : <Image source={heartOutlineIcon} />
            }
          </RectButton>

          <RectButton onPress={handleLinkToWhatsapp} style={styles.contactButton}>
            <Image source={whatsappIcon} />
            <Text style={styles.contactButtonText}>Entrar em contato</Text>
          </RectButton>
        </View>
      </View>


    </View>
  );
}

export default CoachItem;