import React, { useState } from 'react';
import { ScrollView, View, Text, TextInput } from 'react-native';
import { BorderlessButton, RectButton } from 'react-native-gesture-handler';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNPickerSelect from "react-native-picker-select";

import api from '../../services/api';

import CoachItem, { Coach } from '../../components/CoachItem';
import PageHeader from '../../components/PageHeader';

import styles from './styles';
import { useFocusEffect } from '@react-navigation/native';


function CoachList() {
  const [coaches, setCoaches] = useState([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);

  const [subject, setSubject] = useState('');
  const [week_day, setWeekDay] = useState('');
  const [time, setTime] = useState('');

  function loadFavorites() {
    AsyncStorage.getItem('favorites').then(response => {
      if (response) {
        const favoritedCoaches = JSON.parse(response);
        const favoritedCoachesIds = favoritedCoaches.map((coach: Coach) => {
          return coach.id;
        });

        setFavorites(favoritedCoachesIds);
      }
    });
  }

  useFocusEffect(() => {
    loadFavorites();
  });

  function handleToggleFiltersVisible() {
    setIsFiltersVisible(!isFiltersVisible);
  }

  async function handleFiltersSubmit() {
    loadFavorites();

    api.get('classes', {
      params: {
        subject,
        week_day,
        time,
      }
    }).then(response => {

      setIsFiltersVisible(false);
      setCoaches(response.data);
    });

    
  }

  const weekDay = (day: string): string | undefined => {
    switch (day) {
      case '0':
        return 'Domingo'
      case '1':
        return 'Segunda-feira'
      case '2':
        return 'Terça-feira'
      case '3':
        return 'Quarta-feira'
      case '4':
        return 'Quinta-feira'
      case '5':
        return 'Sexta-feira'
      case '6':
        return 'Sábado'
      default:
        return undefined
    }
  }

  return (
    <View style={styles.container}>
      <PageHeader 
        title="Coaches disponíveis" 
        headerRight={(
          <BorderlessButton onPress={handleToggleFiltersVisible}>
            <Feather name="filter" size={20} color="#fff" />
          </BorderlessButton>
        )}
      >
        { isFiltersVisible && (
          <View style={styles.searchForm}>
            <Text style={styles.label}>Matéria</Text>
            {/* <TextInput
              style={styles.input}
              value={subject}
              onChangeText={text => setSubject(text)}
              placeholder="Qual a matéria?"
              placeholderTextColor="#c1bccc"
            /> */}

            <RNPickerSelect 
              onValueChange={(value) => setSubject(value)}
              items= {
                [
                  { value: 'Artes', label: 'Artes' },
                  { value: 'Biologia', label: 'Biologia' },
                  { value: 'Ciências', label: 'Ciências' },
                  { value: 'Educação física', label: 'Educação física' },
                  { value: 'Física', label: 'Física' },
                  { value: 'Geografia', label: 'Geografia' },
                  { value: 'História', label: 'História' },
                  { value: 'Matemática', label: 'Matemática' },
                  { value: 'Português', label: 'Português' },
                  { value: 'Química', label: 'Química' },
                ] 
              }
            >
              <TextInput
                style={styles.input}
                value={subject}
                onChangeText={text => setSubject(text)}
                placeholder="Qual a matéria?"
                placeholderTextColor="#c1bccc"
              />
            </RNPickerSelect>

            <View style={styles.inputGroup}>
              <View style={styles.inputBlock}>
                <Text style={styles.label}>Dia da semana</Text>
                <RNPickerSelect 
                  onValueChange={(value) => setWeekDay(value)}
                  items= {
                    [
                      { value: '0', label: 'Domingo' },
                      { value: '1', label: 'Segunda-feira' },
                      { value: '2', label: 'Terça-feira' },
                      { value: '3', label: 'Quarta-feira' },
                      { value: '4', label: 'Quinta-feira' },
                      { value: '5', label: 'Sexta-feira' },
                      { value: '6', label: 'Sábado' },
                    ] 
                  }
                >
                  <TextInput
                  style={styles.input}
                  value={weekDay(week_day)}
                  onChangeText={text => setWeekDay(text)}
                  placeholder="Qual o dia?"
                  placeholderTextColor="#c1bccc"
                />
                </RNPickerSelect>
              </View>

              <View style={styles.inputBlock}>
                <Text style={styles.label}>Horário</Text>
                <TextInput
                  style={styles.input}
                  value={time}
                  onChangeText={text => setTime(text)}
                  placeholder="Qual horário?"
                  placeholderTextColor="#c1bccc"
                />
              </View>
            </View>

            <RectButton onPress={handleFiltersSubmit} style={styles.submitButton}>
              <Text style={styles.submitButtonText}>Filtrar</Text>
            </RectButton>
          </View>
        )}
      </PageHeader>

      <ScrollView
        style={styles.coachList}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 16,
        }}
      >
        {coaches.map((coach: Coach) => {
          return (
            <CoachItem 
              key={coach.id} 
              coach={coach}
              favorited={favorites.includes(coach.id)} 
            />
          );
        })}        
      </ScrollView>
    </View>
  );
}

export default CoachList;